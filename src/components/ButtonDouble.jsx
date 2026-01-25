import { useContext, useRef, useState } from "react"
import { MetContext } from "./context/metContext";

export const ButtonDouble = () => {

    const { setViewMode, viewMode } = useContext( MetContext )

    // const [activeSpan, setActiveSpan] = useState('one'); // Derived from context now

    const handleClick = (span) => {
        // setActiveSpan(span);
        setViewMode(span);
    };

    return (
        <button className="btn btn-text buttonDouble" type="button">
            <span onClick={ () => handleClick('one') } className={`buttonDoubleBtn buttonDoubleOne ${ viewMode === 'one' ? 'buttonDoubleActive' : '' }`}>
                Kg
            </span>
            <span onClick={ () => handleClick('two') } className={`buttonDoubleBtn buttonDoubleOne ${ viewMode === 'two' ? 'buttonDoubleActive' : '' }`}>
                Pieza
            </span>
        </button>
    )
}
