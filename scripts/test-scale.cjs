const { SerialPort } = require("serialport");

async function test() {
    console.log("Listing ports...");
    try {
        const ports = await SerialPort.list();
        console.log("Ports found:");
        ports.forEach(p => console.log(JSON.stringify(p, null, 2)));

        const scalePort = ports.find(p =>
            (p.path && (p.path.toLowerCase().includes('usb') || p.path.includes('USB') || p.path.match(/^COM\d+/))) ||
            (p.friendlyName && p.friendlyName.toLowerCase().includes('usb')) ||
            (p.vendorId === '1A86' && p.productId === '7523')
        );

        if (!scalePort) {
            console.log("No likely scale port found based on heuristics.");
            return;
        }

        console.log("---------------------------------------------------");
        console.log("Targeting port:", scalePort.path);
        console.log("---------------------------------------------------");

        const port = new SerialPort({
            path: scalePort.path,
            baudRate: 9600,
            autoOpen: false,
        });

        port.open((err) => {
            if (err) {
                console.error("Error opening port:", err.message);
            } else {
                console.log("Successfully opened port! Connection logic is valid.");

                // Listen for data for a few seconds
                port.on('data', (data) => {
                    console.log('Data received:', data.toString());
                });

                setTimeout(() => {
                    console.log("Closing port...");
                    port.close();
                }, 3000);
            }
        });
    } catch (err) {
        console.error("Error listing ports:", err);
    }
}

test();
