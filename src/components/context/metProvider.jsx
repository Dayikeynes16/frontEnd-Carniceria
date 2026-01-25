import { useState, useEffect } from "react"
import { MetContext } from "./metContext";
import { db } from "../../db";
import { useLiveQuery } from "dexie-react-hooks";
import { supabase } from "../../connection";

export const MetProvider = ({ children }) => {





    // useLiveQuery automagically updates 'products' when the DB changes
    const allProducts = useLiveQuery(() => db.products.toArray(), []) || [];
    
    // Derived categories
    const categories = [...new Set(allProducts.map(p => p.categoria || 'Sin Categoría'))];

    const [screenMet, setscreenMet] = useState(false);

    // Cart items (formerly 'products' in legacy context, now clearer if we split them? 
    // Wait, the legacy code used 'products' for the CART (items added). 
    // BUT 'kg' and 'piece' were the CATALOG.
    // I need to be careful not to break existing cart logic.
    // Let's keep 'products' as the CART (state).
    // And use 'allProducts' for the CATALOG.
    
    const [cart, setCart] = useState(localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')) : []);
    
    // Sync cart to localstorage
    useEffect(() => {
        localStorage.setItem('products', JSON.stringify(cart));
    }, [cart]);

    const [noteProduct, setNoteProduct] = useState({ id: '', nombre: '', des: 0, price: 0.00 });
    const [amount, setAmount] = useState(0.00); // Start at 0
    const [cost, setCost] = useState(0.00);
    const [total, setTotal] = useState(localStorage.getItem('total') ? parseFloat(localStorage.getItem('total')) : 0.00);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('all'); // category: all, res, cerdo...
    const [viewMode, setViewMode] = useState('one'); // viewMode: 'one' (kg), 'two' (piece)
    const [show, setShow] = useState([]); // displayed products
    const [new_product, setNewProduct] = useState(0);

    // Update 'show' when filters or allProducts change
    useEffect(() => {
        let filtered = allProducts;

        // 1. Filter by Category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.categoria === categoryFilter);
        }

        // 2. Filter by View Mode (Kg vs Piece)
        let finalShow = [];

        if (viewMode === 'one') {
            // Kg View: Show items sold by weight (piezas=false) 
            // AND items that are pieces but have variable weight options (hybrid like cheese)
            // ACTION: Strip 'predefinido' so chips don't show (pure weighing)
            finalShow = filtered.filter(p => {
                const isKg = p.piezas === 'false' || p.piezas === false;
                const hasPredefined = !!p.predefinido;
                return isKg || hasPredefined;
            }).map(p => ({ ...p, predefinido: null })); // Hide chips in Kg mode

        } else if (viewMode === 'two') {
            // Piece View: Show items sold by piece OR predefined weight presentations
            
            filtered.forEach(p => {
                let optionsRaw = p.predefinido;
                
                // User Request: If product is piece but missing predefined, default to units: 1, 0.5
                // This covers Manteca, Chicharron, etc.
                // We exclude likely "service" items if possible, but for now we follow the "if pieces" rule.
                // Note: 'envio' might get exploded, but we can refine later.
                if (!optionsRaw && (p.piezas === 'true' || p.piezas === true)) {
                    // Check for obvious non-divisibles if needed, e.g. names. 
                    // For now, apply broadly as requested.
                    optionsRaw = '1, 0.5';
                }

                // Explosion logic for predefined options
                if (optionsRaw) {
                    const options = optionsRaw.split(',').map(s => s.trim()).filter(s => s);
                    options.forEach(opt => {
                        const weight = parseFloat(opt);
                        if (!isNaN(weight)) {
                            // Create a virtual product for this presentation
                            finalShow.push({
                                ...p,
                                id: `${p.id}-opt-${weight}`, 
                                originalId: p.id,
                                nombre: `${p.nombre} ${weight}kg`, 
                                peso: weight, 
                                isVirtual: true,
                                predefinido: null // Don't show chips on the exploded item itself
                            });
                        }
                    });
                    // DO NOT add the parent 'p' here if it was exploded. 
                } else {
                    // Normal piece item without predefined options (and fell through default logic? unlikely now)
                    if (p.piezas === 'true' || p.piezas === true) {
                        finalShow.push(p);
                    }
                }
            });
        }

        setShow(finalShow);
    }, [categoryFilter, viewMode, allProducts]);


    // Sync Products from Supabase on mount (and periodically if needed)
    useEffect(() => {
        const syncProducts = async () => {
            if (navigator.onLine) {
                try {
                    const { data, error } = await supabase.from('productos').select('*');
                    if (error) throw error;
                    if (data) {
                        // Bulk put to update/insert products
                        await db.products.bulkPut(data);
                        console.log('Products synced from Supabase');
                    }
                } catch (err) {
                    console.error('Error syncing products:', err);
                }
            }
        };

        syncProducts();
        
        // Optional: Sync every 5 minutes?
        // const interval = setInterval(syncProducts, 5 * 60 * 1000);
        // return () => clearInterval(interval);
    }, []);

    // Sync Sales Queue when online
    useEffect(() => {
        const syncSales = async () => {
            if (navigator.onLine) {
                const pendingSales = await db.salesQueue.filter(s => s.status === 'pending').toArray();
                if (pendingSales.length === 0) return;

                console.log(`Intentando sincronizar ${pendingSales.length} ventas offline...`);
                
                // Import dynamically to avoid circular dependencies if any, or just trust the helper
                const { processSale } = await import("../../helpers/sales");

                for (const sale of pendingSales) {
                    try {
                        await processSale(sale.data.products);
                        await db.salesQueue.delete(sale.id);
                        console.log(`Venta offline ${sale.id} sincronizada.`);
                    } catch (err) {
                        console.error(`Error sincronizando venta ${sale.id}:`, err);
                        // Optional: update status to 'failed' or retry later
                    }
                }
            }
        };

        const onOnline = () => {
            console.log("App is Online. Syncing...");
            syncSales();
        };

        window.addEventListener('online', onOnline);
        
        // Initial check
        syncSales();

        return () => window.removeEventListener('online', onOnline);
    }, []);

    const [scaleStatus, setScaleStatus] = useState({ status: 'unknown', message: '' });

    useEffect(() => {
        if (window.electronAPI) {
             // Listener for Connection Status
            if (window.electronAPI.onScaleStatus) {
                window.electronAPI.onScaleStatus((data) => {
                    console.log('Scale status update:', data);
                    setScaleStatus(data);
                });
            }

            // Listener for Weight Updates
            if (window.electronAPI.onWeightUpdate) {
                window.electronAPI.onWeightUpdate(({ weight }) => {
                    // console.log('Weight update:', weight);
                    setAmount(weight);
                });
            }
        }
    }, []);

    return (
        <MetContext.Provider value={{
            new_product, setNewProduct,
            filter: categoryFilter, setFilter: setCategoryFilter, // mapped for Seeker compatibility
            categoryFilter, setCategoryFilter,
            viewMode, setViewMode, // exposed for ButtonDouble
            categories,
            show, setShow, 
            alert, setAlert, 
            loading, setLoading, 
            screenMet, setscreenMet, 
            products: cart, setProducts: setCart, 
            noteProduct, setNoteProduct, 
            total, setTotal, 
            amount, setAmount, 
            cost, setCost,
            scaleStatus // Exposed
        }}>
            { children }
        </MetContext.Provider>
    )
}
