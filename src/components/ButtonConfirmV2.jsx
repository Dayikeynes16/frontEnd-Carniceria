import { useContext } from "react";
import { MetContext } from "./context/metContext";
import { useAlerts } from "../hooks/useAlerts";
import { db } from "../db";
import { processSale } from "../helpers/sales";

export const ButtonConfirmV2 = ({ label }) => {
  const { setProducts, products, noteProduct, setLoading, setTotal } = useContext(MetContext);
  const { addAlert } = useAlerts();



  const sendOrder = async () => {
    if (products.length === 0 || noteProduct?.id) {
      addAlert("Agrega productos para poder enviarlos", "alert-yellow");
      return;
    }

    setLoading(true);

    const saleData = {
      products: products,
      timestamp: new Date().toISOString(),
    };

    if (!navigator.onLine) {
       // Offline Mode: Queue sale
       try {
           await db.salesQueue.add({
               data: saleData,
               status: 'pending',
               timestamp: new Date().toISOString()
           });
           addAlert("Venta guardada Offline. Se sincronizará al conectar.", "alert-blue");
           setProducts([]);
           setTotal(0);
       } catch (error) {
           console.error("Error queueing offline sale:", error);
           addAlert("Error al guardar venta offline", "alert-red");
       } finally {
           setLoading(false);
       }
       return;
    }

    // Online Mode: Process normally
    try {
        await processSale(products);
        addAlert("Venta realizada con éxito", "alert-green");
        setProducts([]);
        setTotal(0);
    } catch (error) {
        console.error("Error al procesar la venta:", error);
        addAlert("Error al enviar la orden", "alert-red");
    } finally {
        setLoading(false);
    }
  };

  return (
    <button className={`buttonConfirm btn ${label && "btn-text"}`} onClick={sendOrder}>
      <i className="bx bx-check-circle"></i>
      {label && <p>{label}</p>}
    </button>
  );
};
