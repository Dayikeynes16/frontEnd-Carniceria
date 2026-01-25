import { useEffect } from "react";
import { separatePoint } from "../helpers"
import { useNewSeparate } from "../hooks";

export const OutputCost = ({ cost }) => {


    const { first, second } = separatePoint(cost);

    const { firstState, secondState, onNewValue } = useNewSeparate(first, second);

    useEffect(() => {
        onNewValue(cost);
        
    }, [cost])
    

    return (
        <div className="outputCostBody outputBody">
            <div className="outputCost output">
                <h2>Costo</h2>
                <div className="">
                    <h1 className="outputCostSpan"> <span>$</span>{ firstState } </h1>
                    <h3> . <span> { secondState } </span></h3>
                </div>
            </div>
            <hr />
        </div>
    )
}