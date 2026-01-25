const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onWeightUpdate: (callback) => ipcRenderer.on('weight-update', (_event, value) => callback(value)),
  onScaleStatus: (callback) => ipcRenderer.on('scale-status', (_event, value) => callback(value)),
});
