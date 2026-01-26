    // saleData no longer needed here as processSale generates it internally
    // const saleData = ... removed
import { useContext } from "react";
import { MetContext } from "./context/metContext";
import { useAlerts } from "../hooks/useAlerts";
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

    // Unified Processing (Online & Offline handled by helper)
    try {
        const result = await processSale(products);
        
        if (result.offline) {
             addAlert("Venta guardada Offline. Se sincronizará al conectar.", "alert-blue");
        } else {
             addAlert("Venta realizada con éxito", "alert-green");
        }
        
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
