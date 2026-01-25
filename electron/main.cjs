const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

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
  const isDev = !app.isPackaged;
  const startUrl = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "../dist/index.html")}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

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
const connectToScale = async () => {
  try {
    const ports = await SerialPort.list();
    console.log('Available ports:', ports);

    // Filter for likely scale ports (e.g., USB-Serial)
    const scalePortInfo = ports.find(p => 
      p.path.includes('usb') || 
      p.path.includes('USB') || 
      p.path === '/dev/ttyUSB0'
    );

    if (scalePortInfo) {
      if (port && port.isOpen) {
        // console.log('Port already open');
        return;
      }

      console.log(`Connecting to ${scalePortInfo.path}...`);
      if (mainWindow) mainWindow.webContents.send('scale-status', { status: 'connecting' });

      port = new SerialPort({
        path: scalePortInfo.path,
        baudRate: 9600,
        autoOpen: false,
      });

      const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      port.open((err) => {
        if (err) {
          console.log('Error opening port: ', err.message);
          if (mainWindow) mainWindow.webContents.send('scale-status', { status: 'disconnected', message: err.message });
          return;
        }
        console.log('Port open');
        if (mainWindow) mainWindow.webContents.send('scale-status', { status: 'connected', port: scalePortInfo.path });
      });

      parser.on('data', (data) => {
        const weightStr = data.trim().split(/\s+/)[0];
        const weight = parseFloat(weightStr);
        
        if (!isNaN(weight) && mainWindow) {
           mainWindow.webContents.send('weight-update', { weight });
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
        if (mainWindow) mainWindow.webContents.send('scale-status', { status: 'disconnected' });
        setTimeout(connectToScale, 3000);
      });

      port.on('error', (err) => {
        console.log('Serial port error: ', err.message);
        if (port.isOpen) port.close();
        if (mainWindow) mainWindow.webContents.send('scale-status', { status: 'error', message: err.message });
      });

    } else {
      console.log('No scale found. Retrying in 5s...');
      if (mainWindow) mainWindow.webContents.send('scale-status', { status: 'disconnected', message: 'No scale found' });
      setTimeout(connectToScale, 5000);
    }
  } catch (err) {
    console.error('Error scanning ports:', err);
    if (mainWindow) mainWindow.webContents.send('scale-status', { status: 'error', message: err.message });
    setTimeout(connectToScale, 5000);
  }
};

app.on('ready', () => {
    // connectToScale is called after window creation to ensure we have a window to send data to? 
    // Actually better to start it and check for mainWindow existence before sending.
    connectToScale();
});

