import { useEffect, useContext } from "react";
import { separatePoint } from "../helpers"
import { useNewSeparate } from "../hooks";
import { MetContext } from "./context/metContext";

export const OutputWeight = ({ num }) => {
    const { first, second } = separatePoint( num );
    const { firstState, secondState, onNewValue } = useNewSeparate( first, second );
    const { scaleStatus } = useContext( MetContext );
    
    useEffect(() => {
        onNewValue(num);
    }, [num]);

    const isConnected = scaleStatus && scaleStatus.status === 'connected';
    
    // If disconnected/error, override display
    const displayFirst = isConnected ? firstState : "0";
    const displaySecond = isConnected ? secondState : "00";
    const isError = !isConnected;

    return (
        <div className="outputWeightBody outputBody">
            <div className="outputWeight output">
                <h2>Peso</h2>
                <div className="" style={{ color: isError ? 'red' : 'inherit' }}>
                    <h1> { displayFirst } </h1>
                    <h3> . <span> { displaySecond } </span> kg </h3>
                </div>
                {isError && <p style={{ color: 'red', fontSize: '1rem', fontWeight: 'bold' }}>{scaleStatus?.status === 'connecting' ? 'Conectando...' : 'Balanza Desconectada'}</p>}
            </div>
            <hr />
        </div>
    )
}
