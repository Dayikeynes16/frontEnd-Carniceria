import { useContext, useEffect, useState } from "react";
import { ButtonConfirm, ButtonDeleteV2, OutputCost, OutputDetails, OutputTotal, OutputWeight } from './';
import { MetContext } from "./context/metContext";





const cal = (amount, price) => {
    return (amount * price).toFixed(2);
}

export const NoteMet = () => {
    
    const { noteProduct, total, amount, cost, setCost,new_product } = useContext(MetContext);

    useEffect(() => {
        console.log("noteProduct.price:", noteProduct.price, "amount:", amount);
        if (noteProduct?.price && amount) {
            setCost(cal(amount, noteProduct.price));
        } else {
            setCost(0); 
        }
    }, [noteProduct, amount]);
    
    

    return (
        <div className="noteMet">

            <OutputWeight num={amount} />
            <OutputCost cost={parseFloat(cost)} />
            <OutputDetails note={noteProduct} />
            <OutputTotal total={parseFloat(total)} />
            <div className="noteMetOrder">
                <p> Orden: { 'order' } </p>
            </div>
            <div className="noteMetButtons">
                <ButtonDeleteV2 label={'Limpiar'} />
                <ButtonConfirm label={'Confirmar'} />
            </div>
        </div>
    );
};