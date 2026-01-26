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
    const [currentView, setCurrentView] = useState('POS'); // POS, SETTINGS, HISTORY
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Online status listener & Theme Loader
    useEffect(() => {
        const handleStatusChange = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);

        // Load Theme
        import("../../helpers/settings").then(({ getTheme }) => {
            getTheme().then(theme => {
                if (theme === 'dark') {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            });
        });

        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
        };
    }, []);

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
                        // Cache images
                        const productsWithImages = await Promise.all(data.map(async (p) => {
                            // If imagen is a URL, try to fetch and convert to Base64
                            if (p.imagen && p.imagen.startsWith('http')) {
                                try {
                                    const response = await fetch(p.imagen);
                                    if (response.ok) {
                                        const blob = await response.blob();
                                        return new Promise((resolve) => {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                resolve({ ...p, imagen: reader.result }); // Save Base64
                                            };
                                            reader.readAsDataURL(blob);
                                        });
                                    }
                                } catch (e) {
                                    console.warn(`Failed to cache image for ${p.nombre}`, e);
                                }
                            }
                            return p;
                        }));

                        // Bulk put to update/insert products
                        await db.products.bulkPut(productsWithImages);
                        console.log('Products synced from Supabase (with images)');
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
    // Sync Sales when online (New Logic using 'sales' table is_synced flag)
    useEffect(() => {
        const checkConnectivityAndSync = async () => {
             // Basic navigator check first
             if (!navigator.onLine) return;

             // Real connectivity check: Ping a reliable endpoint (e.g., Supabase or Google)
             try {
                // Using Supabase URL or just a fast endpoint if available. 
                // Since we use Supabase anyway, let's just try to import and run syncSales
                // If the import fails or syncSales fails due to network, it will catch.
                // But to be SURE we are "really" online, a small fetch helps.
                // We'll skip the fetch for now to save bandwidth/latency and just rely on the try/catch in syncSales 
                // BUT we will add a small random delay to prevent thundering herd if many devices come online instantly
                
                // Wait 3 seconds to let network stack settle
                await new Promise(r => setTimeout(r, 3000));
                
                const { syncSales } = await import("../../helpers/sales");
                console.log("Network online. Attempting synchronization...");
                await syncSales();

             } catch (e) {
                 console.error("Connectivity check or Sync failed:", e);
             }
        };

        const onOnline = () => {
            console.log("Detected 'online' event. Initiating sync sequence...");
            checkConnectivityAndSync();
        };

        window.addEventListener('online', onOnline);
        
        // Initial check on mount
        checkConnectivityAndSync();

        // Periodic safety check every 30s
        const interval = setInterval(() => {
            if (navigator.onLine) checkConnectivityAndSync();
        }, 30000);

        return () => {
             window.removeEventListener('online', onOnline);
             clearInterval(interval);
        };
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
            scaleStatus, // Exposed
            currentView, setCurrentView,
            isOnline
        }}>
            { children }
        </MetContext.Provider>
    )
}
