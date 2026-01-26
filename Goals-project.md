## Goals

- add a settings page to the app
- add a dark mode to the app
- add a light mode to the app
- add a history page to the app
- add a ofline or online status indicator to the app
- make a copy of the products in the database

## features

- in the settings page add a section, i want to save locally, 1 values, is the balanza number (in the database, one of the fields of the file is called "balanza" and it is a number postive)

- the history page should show a list of all the sales, and the total of each sale, and the date of each sale (teh relative time too, to see how long ago was the sale and the hour it was made) and the products of each sale (the name of the product and the quantity of the product), this porject is supose to have a database, but i want to save locally the sales and the products of each sale, so i can show them in the history page, remeber, save locally and send to supabase, i want just to save up to 500 sales locally, and the rest should be sent to supabase, this number can be configurable in the settings page

- the history page should have a search bar to search for a sale by the name of the product

- make the more efficent as we can the insert of the sale in backend, i mean, now we insert the sale ad make a insert for each product, but i think we can make a insert for the sale and a insert for the products in the same query

- make a copy of the products (products and their images) in the database, because, what if i lost the connection to the internet, i want to be able to sell without the internet, but i want to be able to display the images of the products in the selector

- when selecting and product, the modal appers, but i want to make it more efficent, and when we switch between kg and pieces mode, if i close the modal, it keep in the state i left, i want to always appear in th kg mode, and want to make it more efficent
