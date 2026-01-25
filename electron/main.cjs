const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { SerialPort } = require("serialport");
// const { ReadlineParser } = require("@serialport/parser-readline");

let mainWindow;
let port;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In production, load the index.html. In dev, load localhost.
  if (!app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.webContents.on('did-finish-load', () => {
    // Send the last known status when the page loads
    if (typeof lastStatus !== 'undefined') {
      mainWindow.webContents.send('scale-status', lastStatus);
    }
  });

  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Serial Port Logic
let lastStatus = { status: 'disconnected', message: 'Initializing...' };

const sendStatus = (statusData) => {
  lastStatus = statusData;
  if (mainWindow && !mainWindow.webContents.isLoading()) {
    mainWindow.webContents.send('scale-status', statusData);
  }
};

const connectToScale = async () => {
  try {
    const ports = await SerialPort.list();
    console.log('Available ports:', ports);

    // Filter for likely scale ports (e.g., USB-Serial)
    const scalePortInfo = ports.find(p =>
      (p.vendorId === '1A86' && p.productId === '7523') || // Match specific hardware
      (p.path && (p.path.toLowerCase().includes('usb') || p.path.includes('USB') || p.path.match(/^COM\d+/))) ||
      (p.friendlyName && p.friendlyName.toLowerCase().includes('usb'))
    );

    if (scalePortInfo) {
      if (port && port.isOpen) {
        return;
      }

      console.log(`Connecting to ${scalePortInfo.path}...`);
      sendStatus({ status: 'connecting' });

      port = new SerialPort({
        path: scalePortInfo.path,
        baudRate: 9600,
        autoOpen: false,
      });

      let dataBuffer = '';

      port.open((err) => {
        if (err) {
          console.log('Error opening port: ', err.message);
          sendStatus({ status: 'disconnected', message: err.message });
          return;
        }
        console.log('Port open');
        sendStatus({ status: 'connected', port: scalePortInfo.path });
      });

      // Manual buffering to handle variable delimiters
      port.on('data', (chunk) => {
        const chunkStr = chunk.toString();
        // console.log('RAW CHUNK:', JSON.stringify(chunkStr));
        dataBuffer += chunkStr;

        let lines = dataBuffer.split(/[\r\n]+/);
        dataBuffer = lines.pop(); // Keep incomplete fragment

        for (const line of lines) {
          let trimmed = line.trim();
          if (!trimmed) continue;
          console.log('PROCESSING LINE (RAW):', JSON.stringify(trimmed));

          // FIX: The scale seemingly inserts a space for >10kg values, e.g. "1 0.850 kg"
          // We must merge these digits.
          // Regex: Look for a digit, followed by whitespace, followed by another digit.
          trimmed = trimmed.replace(/(\d)\s+(\d)/g, '$1$2');

          console.log('PROCESSING LINE (FIXED):', JSON.stringify(trimmed));

          // Extract number: look for digits possibly with decimal
          // Strategy: Find ALL numbers, prefer the one with a decimal point.
          // This avoids picking up status codes like "1" in "ST 1 12.50kg"

          const matches = [...trimmed.matchAll(/([0-9]+\.?[0-9]*)/g)];
          let weight = null;

          // First pass: look for a number WITH a decimal point
          for (const m of matches) {
            if (m[1].includes('.')) {
              const w = parseFloat(m[1]);
              if (!isNaN(w)) {
                weight = w;
                break; // Found a decimal value, assume it's the weight
              }
            }
          }

          // Second pass: if no decimal found, take the last number (often weight is at the end)
          // or just the first valid number if we want to be simple, but the issue is >10 being 1.
          if (weight === null && matches.length > 0) {
            // Fallback to first match if no decimal exists
            weight = parseFloat(matches[0][1]);
          }

          if (weight !== null && !isNaN(weight) && mainWindow) {
            mainWindow.webContents.send('weight-update', { weight });
          }
        }
      });

      const pollInterval = setInterval(() => {
        if (port && port.isOpen) {
          port.write('P\r\n', (err) => {
            if (err) console.log('Error writing to port:', err.message);
          });
        } else {
          clearInterval(pollInterval);
        }
      }, 500);

      port.on('close', () => {
        console.log('Port closed. Attempting to reconnect...');
        sendStatus({ status: 'disconnected' });
        setTimeout(connectToScale, 3000);
      });

      port.on('error', (err) => {
        console.log('Serial port error: ', err.message);
        if (port.isOpen) port.close();
        sendStatus({ status: 'error', message: err.message });
      });

    } else {
      console.log('No scale found. Retrying in 5s...');
      sendStatus({ status: 'disconnected', message: 'No scale found' });
      setTimeout(connectToScale, 5000);
    }
  } catch (err) {
    console.error('Error scanning ports:', err);
    sendStatus({ status: 'error', message: err.message });
    setTimeout(connectToScale, 5000);
  }
};

app.on('ready', () => {
  // connectToScale is called after window creation to ensure we have a window to send data to? 
  // Actually better to start it and check for mainWindow existence before sending.
  connectToScale();
});

