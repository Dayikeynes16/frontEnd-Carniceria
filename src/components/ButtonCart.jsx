import { useContext } from "react"
import { MetContext } from "./context/metContext"

export const ButtonCart = ({label}) => {

  const { setscreenMet, setViewMode } = useContext( MetContext );

  return (
    <button className={ `btn buttonCart ${label && 'btn-text'}`} onClick={ () => { setscreenMet(true); setViewMode && setViewMode('one'); } }>
        <i className='bx bx-cart-add'></i>
        { label && (<p> {label} </p>) }
    </button>
  )
}
