import { useContext, useEffect } from "react"
import {  MinBoxProductAdded, NoteMet } from "./"
import { MetContext } from "./context/metContext"

export const BoxMain = () => {

    const { products } = useContext( MetContext );

    useEffect(() => {

        localStorage.setItem('products', JSON.stringify(products));

    }, [products]);
    

    return (
        <div className="boxMain">

            <NoteMet />
            
            <div className="boxMainNotes">
                { 
                    products.map( (product,index) => <MinBoxProductAdded key={ `${product.id}-${index}`} data={product} /> ) 
                }
            </div>
        </div>
    )
}
