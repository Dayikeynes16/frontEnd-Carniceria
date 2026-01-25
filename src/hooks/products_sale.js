import { supabase } from "../connection";

export const productos_venta = async (producto, peso, venta) => {

  console.log(producto, peso, "probandi las coaS", venta);
  const { data, error } = await supabase.from('producto_ventas')
    .insert({
      producto_id: producto.id,
      venta_id: venta.id,
      precio: producto.precio_de_venta,
      peso: peso,
      total: producto.precio_de_venta * peso,
    }).select().single();
  console.log(data);
  if (data) {
    return data;
  }
  if (error) {
    console.error("Error creating product sale:", error);
    return null;
  }

}