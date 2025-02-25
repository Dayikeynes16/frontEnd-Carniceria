import { useContext } from "react";
import { MetContext } from "./context/metContext";
import { useAlerts } from "../hooks/useAlerts";
import { supabase } from "../connection";
import { productos_venta } from "../hooks/products_sale";

export const ButtonConfirmV2 = ({ label }) => {
  const { setProducts, products, noteProduct, setLoading, setTotal } = useContext(MetContext);
  const { addAlert } = useAlerts();

  // Función para obtener la fecha en la zona horaria de Ciudad de México
  const getMexicoTime = () => {
    return new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }).replace(",", "").replace("/", "-").replace("/", "-");
  };

  const sendOrder = async () => {
    let total_venta = 0;
    let venta = {};

    if (products.length === 0 || noteProduct?.id) {
      addAlert("Agrega productos para poder enviarlos", "alert-yellow");
      return;
    }

    setLoading(true);

    // Crear lista de productos con peso
    const productos = products.map((item) => ({
      id: item.id,
      peso: item.amount,
    }));

    try {
      // 1️⃣ Insertar la venta
      const { data: ventaData, error: ventaError } = await supabase
        .from("ventas")
        .insert({
          created_at: getMexicoTime(),
          total: 0,
          balanza: 2,
          pagado: false,
          estatus: "activo",
        })
        .select()
        .single();

      if (ventaError) throw ventaError;
      venta = ventaData;

      // 2️⃣ Insertar los productos en la venta
      for (const producto of productos) {
        const { data: productoData, error: productoError } = await supabase
          .from("productos")
          .select("*")
          .eq("id", producto.id)
          .single();

        if (productoError) throw productoError;

        const productoVenta = await productos_venta(productoData, producto.peso, venta);

        if (productoVenta) {
          total_venta += productoVenta.total; // Acumular total
        }
      }

      // 3️⃣ Insertar el pago asociado a la venta
      const { error: pagoError } = await supabase
        .from("pagos")
        .insert({
          created_at: getMexicoTime(),
          venta_id: venta.id,
          total: total_venta, // Se actualizará después si es necesario
          pendiente: total_venta,
          metodo: "" // Puede cambiar dependiendo del pago
        });

      if (pagoError) throw pagoError;

      // 4️⃣ Actualizar el total de la venta
      const { error: updateVentaError } = await supabase
        .from("ventas")
        .update({ total: total_venta })
        .eq("id", venta.id);

      if (updateVentaError) throw updateVentaError;

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
