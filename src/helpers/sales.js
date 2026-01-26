import { supabase } from "../connection";
import { db } from "../db";  // Import Dexie DB
import { getBalanzaId, getMaxLocalSales } from "./settings";

// Función para obtener la fecha en una zona horaria específica (ISO format preferred for sorting)
const getMexicoTime = () => {
  // ISO string is UTC. Subtract 6 hours (in ms) to align.
  const now = new Date();
  const mexicoOffset = 6 * 60 * 60 * 1000; 
  // We want the string to READ as Mexico time but in ISO format.
  // Example: if UTC is 18:00 (12:00 Mexico), we want stored string to effectively be 12:00
  // Note: timestamps without timezone in standard ISO will be treated as UTC by many parsers
  // But this specific fix requested is to shift expected time.
  const localTime = new Date(now.getTime() - mexicoOffset);
  return localTime.toISOString();
};

export const processSale = async (products) => {
  let total_venta = 0;
  
  // Calculate total locally
  products.forEach(p => {
      total_venta += (p.amount * p.price || p.amount * (p.cost/p.amount)); // Fallback if price struct varies
      // Actually existing logic in component calculates cost. 
      // products array likely has { amount, cost }
  });
  
  // Re-calculate total from costs to be safe
  total_venta = products.reduce((acc, curr) => acc + curr.cost, 0);

  const balanzaId = await getBalanzaId();

  // Sale object for Local DB
  const saleLocal = {
      timestamp: getMexicoTime(),
      balanza: balanzaId,
      total: total_venta,
      is_synced: false,
      items: products // Store items snapshot
  };

  let saleIdLocal = null;

  try {
    // 1️⃣ Save Locally First
    saleIdLocal = await db.sales.add(saleLocal);
    
    // 2️⃣ Enforce Local Limit
    const maxSales = await getMaxLocalSales();
    const count = await db.sales.count();
    if (count > maxSales) {
        // Delete oldest SYNCED sales
        // We find synced sales, order by id/timestamp asc, and delete excess
        const syncedSales = await db.sales.where('is_synced').equals(1).limit(count - maxSales).toArray();
        if (syncedSales.length > 0) {
            await db.sales.bulkDelete(syncedSales.map(s => s.id));
        }
    }

    // 3️⃣ Attempt Sync to Supabase
    if (navigator.onLine) {
        await syncSaleToSupabase(saleIdLocal, saleLocal, products);
    }

    return { success: true, total: total_venta };

  } catch (error) {
    console.error("Error al procesar la venta:", error);
    // Even if sync fails, local save might have succeeded (if check was after).
    // But if local save failed, we throw.
    if (!saleIdLocal) throw error; 
    
    // If local succeeded but sync failed, we just return success (offline mode works)
    return { success: true, total: total_venta, offline: true };
  }
};

const syncSaleToSupabase = async (localId, saleData, products) => {
    try {
        // A. Insert Sale
        const { data: ventaData, error: ventaError } = await supabase
        .from("ventas")
        .insert({
            created_at: saleData.timestamp,
            total: saleData.total,
            balanza: saleData.balanza,
            pagado: false,
            estatus: "activo",
        })
        .select()
        .single(); // Ensure we get the ID

        if (ventaError) throw ventaError;
        const ventaId = ventaData.id;

        // B. Prepare Items for Bulk Insert
        const itemsToInsert = products.map(p => {
            const realId = String(p.id).split('-')[0]; // Handle composite IDs
            return {
                venta_id: ventaId,
                producto_id: realId,
                peso: p.amount,
                precio: p.price || (p.cost / p.amount), // Approximate if price not explicit
                total: p.cost
            };
        });

        // C. Bulk Insert Items
        const { error: itemsError } = await supabase
            .from("producto_ventas")
            .insert(itemsToInsert);

        if (itemsError) {
            // If items fail, consider rolling back sale? Or just log.
            // For now throw to keep local marked as unsynced
            console.error("Error inserting items:", itemsError);
            // Optional: delete orphan sale?
            // await supabase.from('ventas').delete().eq('id', ventaId);
            throw itemsError;
        }

        // D. Update Local Status
        await db.sales.update(localId, { is_synced: true });
        return true;

    } catch (err) {
        console.error("Sync failed:", err);
        throw err;
    }
}

// Background Sync Function (can be called periodically)
export const syncSales = async () => {
    if (!navigator.onLine) {
        console.log("Sync skipped: Offline");
        return;
    }

    try {
        console.log("Starting background sync check...");
        const pending = await db.sales.filter(s => s.is_synced === false).toArray();
        console.log(`Found ${pending.length} pending sales to sync.`);

        for (const sale of pending) {
            console.log(`Syncing sale ${sale.id}...`);
            await syncSaleToSupabase(sale.id, sale, sale.items);
            console.log(`Sale ${sale.id} synced successfully.`);
        }
        
    } catch (err) {
        console.error("Background sync error:", err);
    }
}
