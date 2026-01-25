## Goals

- refactor into an desktop app using electron
- add more features
- add more security

## features

- stop using python to get the weight from the scale and use serial port instead to make it just pure javascript

- add more steps to reconnet to the scale, it could find the ports available and try to connect to the scale, if it fails it could try to connect to the scale using the ports found or show a message to the user to try to connect to the scale manually

- add more filters to the products, it could filter by name, category, piece

- and ofline mode to the app, it could use the local storage to store the products and the orders if the connection to the backend fails or the internet connection is lost, it could sync the data when the connection is restored
