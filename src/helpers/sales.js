import { supabase } from "../connection";
import { productos_venta } from "../hooks/products_sale";

// Función para obtener la fecha en la zona horaria de Ciudad de México
const getMexicoTime = () => {
  return new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }).replace(",", "").replace("/", "-").replace("/", "-");
};

export const processSale = async (products) => {
  let total_venta = 0;
  let venta = {};

  // Crear lista de productos con peso
  const items = products.map((item) => ({
    id: item.id,
    peso: item.amount,
  }));

  try {
    // 1️⃣ Insertar la venta
    const { data: ventaData, error: ventaError } = await supabase
      .from("ventas")
      .insert({
        created_at: getMexicoTime(),
        total: 0,
        balanza: 2,
        pagado: false,
        estatus: "activo",
      })
      .select()
      .single();

    if (ventaError) throw ventaError;
    venta = ventaData;

    // 2️⃣ Insertar los productos en la venta
    for (const producto of items) {

      // FIX: Handle composite IDs (e.g., "12-p-2") for piece/predefined items
      // We need to extract the base numeric ID for the database lookup.
      const realId = String(producto.id).split('-')[0];

      const { data: productoData, error: productoError } = await supabase
        .from("productos")
        .select("*")
        .eq("id", realId) // Use parsed ID
        .single();

      if (productoError) throw productoError;

      const productoVenta = await productos_venta(productoData, producto.peso, venta);

      if (productoVenta) {
        total_venta += productoVenta.total; // Acumular total
      }
    }

    // 3️⃣ Insertar el pago asociado a la venta
    const { error: pagoError } = await supabase
      .from("pagos")
      .insert({
        created_at: getMexicoTime(),
        venta_id: venta.id,
        total: total_venta, // Se actualizará después si es necesario
        metodo: "" // Puede cambiar dependiendo del pago
      });

    if (pagoError) throw pagoError;

    // 4️⃣ Actualizar el total de la venta
    const { error: updateVentaError } = await supabase
      .from("ventas")
      .update({ total: total_venta })
      .eq("id", venta.id);

    if (updateVentaError) throw updateVentaError;

    return { success: true, total: total_venta };

  } catch (error) {
    console.error("Error al procesar la venta:", error);
    alert(`Error al procesar venta: ${error.message || JSON.stringify(error)}`);
    throw error;
  }
};
