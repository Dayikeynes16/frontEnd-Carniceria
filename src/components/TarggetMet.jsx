import { useContext, useState } from "react"
import { MetContext } from "./context/metContext";

export const TarggetMet = ({ met }) => {
    
    // Destructure properties from the met object
    const { id, imagen, nombre, precio_de_venta, peso, predefinido } = met;
    
    const [clase, setClase] = useState(['targgetMet']);
    const onSelect = () => {
        setClase([...clase, 'targgetMetSelect'])
    }
    
    const { setscreenMet, setNoteProduct, new_product, setNewProduct, setProducts, products, setTotal, total } = useContext( MetContext );

    const hanldeSelect = (overrideAmount = null) => {
        onSelect();
        setscreenMet(false);
        
        const amountToAdd = overrideAmount || peso;

        if (!amountToAdd) {
            // No weight specified (standard weighing flow)
            setNoteProduct({
                nombre,
                price: precio_de_venta,
                des: 0,
                id,
            })
            setNewProduct(new_product + 1)
        } else {
            // Weight/Amount specified (either predefined or fixed peso)
            
            // If it's a predefined string (like "0.3"), parse it.
            const finalAmount = parseFloat(amountToAdd);
            
            setProducts([...products,{
                name: nombre,
                cost: precio_de_venta * finalAmount,
                amount: finalAmount,
                id,
                producto_id_cesta: new Date().getTime()
            } ])
            const newTotal = total + (precio_de_venta * finalAmount)
            setTotal( newTotal );
        }
    }

    // Parse predefinido: "1, 0.3, 0.5" -> [1, 0.3, 0.5]
    const predefinedOptions = predefinido 
        ? predefinido.split(',').map(s => s.trim()).filter(s => s) 
        : [];

    return (
        <div key={nombre} className={`${clase[0]} ${clase[1]} `} 
             onClick={ () => hanldeSelect(null) } >
            <img src={imagen} alt={nombre} />
            <h2> { nombre } </h2>
            <p> ${ parseFloat(peso ? precio_de_venta * peso : precio_de_venta) } { peso && (<span> <br /> <strong> {peso} kg </strong>  </span>)} </p>
            
            {/* Predefined Options */}
            {predefinedOptions.length > 0 && (
                <div className="predefined-chips" style={{ marginTop: '5px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {predefinedOptions.map((opt, idx) => (
                        <span key={idx} 
                              onClick={(e) => {
                                e.stopPropagation(); // prevent triggering main card click
                                hanldeSelect(opt);
                              }}
                              style={{ 
                                background: '#e0e0e0', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                border: '1px solid #ccc'
                              }}>
                            {opt} kg
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
