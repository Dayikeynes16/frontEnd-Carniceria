
export const OutputDetails = ({ note }) => {



  return (
    <div className="outputDetailsBody">
        <div className="outputDetails output">
            <h2>Detalles</h2>
            <div className="">
              <p>Producto: <span> { note.nombre } </span> </p>
              <p>Descuento: <span> { note.des } </span> </p>
              <p>Costo por kg: <span> { note.price } </span> </p>
            </div>
        </div>
        <hr />
    </div>
  )
}
