# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Porpouse

This project is a front-end for a carniceria, it is a web application that allows the user to sell products and manage the stock of the carniceria. it takes a weight from a scale and makes the order to the backend.

## Tech Stack

its built with React and Vite, it uses a scale to get the weight of the product, it uses a supabase database to store the orders and the stock of the products, uses a python script to get the weight from the scale using a serial port, the script uses pyserial to get the weight from the scale and the ch340 driver to connect to the scale.

## How to run it

1. Clone the repository
2. Install the dependencies
3. Run the python script
4. Run the react app

## database sample

INSERT INTO "public"."productos" ("id", "created\*at", "updated_at", "nombre", "precio_de_venta", "precio_produccion", "piezas", "for_public", "stock", "imagen", "archivado", "categoria", "predefinido") VALUES ('1', '2024-12-05 20:10:58', '2024-12-12 17:15:35', 'pulpa de res', '190.00', '120.00', 'false', 'true', null, 'https://ebuifmauncgfjplsrmfb.supabase.co/storage/v1/object/products/1733429456_d07adc_86aab62a935042fbb78dc7795d754bac_mv2-removebg-preview.png', null, 'res', ''), ('2', '2024-12-05 20:14:01', '2024-12-05 20:14:01', 'carne con hueso', '140.00', '80.00', 'false', 'true', null, 'https://ebuifmauncgfjplsrmfb.supabase.co/storage/v1/object/products/1733429640_CarneHueso.png', null, 'res', null), ('3', '2024-12-05 20:16:11', '2024-12-05 20:16:11', 'molida especial', '190.00', '120.00', 'false', 'false', null, 'https://ebuifmauncgfjplsrmfb.supabase.co/storage/v1/object/products/1733429769_Molida.png', null, 'res', null), ('4', '2024-12-05 20:16:44', '2024-12-05 20:16:44', 'molida comercial ', '150.00', '100.00', 'false', 'false', null, 'https://ebuifmauncgfjplsrmfb.supabase.co/storage/v1/object/products/1733429801_MolidaComercial.png', null, 'res', null), ('5', '2024-12-05 20:17:24', '2024-12-05 20:17:24', 'chuletas de cerdo', '190.00', '120.00', 'false', 'false', null, 'https://ebuifmauncgfjplsrmfb.supabase.co/storage/v1/object/products/1733429841_Chuleta de res.png', null, 'res', null), ('6', '2024-12-05 20:18:19', '2024-12-05 20:18:19', 'filete', '210.00', '120.00', 'false', 'false', null, 'https://ebuifmauncgfjplsrmfb.supabase.co/storage/v1/object/products/1733429897_pngwing.com.png', null, 'res', null), ('7', '2024-12-06 12:08:00', '2024-12-06 12:08:00', 'Pulpa de cerdo', '120.00', '75.00', 'false', 'false', null, 'https://ebuifmauncgfjplsrmfb.supabase.co/storage/v1/object/products/1733486878_images-removebg-preview(2).png', null, 'res', null), ('8', '2024-12-06 12:10:07', '2024-12-06 12:10:07', 'chuletas', '120.00', '70.00', 'false', 'false', null);
