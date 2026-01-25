import { useContext } from "react"
import { MetContext } from "./context/metContext";

export const MinBoxProductAdded = ({ data, product_id }) => {

  const { setProducts, products, setTotal, total } = useContext( MetContext );

  const onDelete = () => {
    const res = products.filter( product => product?.producto_id_cesta  !== data?.producto_id_cesta );
    localStorage.setItem('products', JSON.stringify(res));
    
    const newTotal = (( total - parseFloat(data?.cost) ) >= 0 ) ? total - parseFloat(data?.cost) : 0.00;

    setTotal( newTotal );
    setProducts( res );
  }

  return (
    <div className="minBoxProductAdded">
        <div>
            <h3> { data?.name} </h3>
            <button type="button" onClick={ () => onDelete()} >
                <i className='bx bx-trash' ></i>
            </button>
        </div>
        <div>
            <p> { data?.amount }kg </p>
            <p> ${ data?.cost} </p>
        </div>
    </div>
  )
}
