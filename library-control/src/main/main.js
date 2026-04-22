const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { listarAcervo, buscarAcervo } = require('./db/acervo.repo');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(() => {
  console.log('MAIN carregado');
  console.log('Registrando handler: acervo:listar');
  ipcMain.handle('acervo:listar', () => {
    console.log('IPC chamado: acervo:listar');
    return listarAcervo();
  });

  console.log('Registrando handler: acervo:buscar');
  ipcMain.handle('acervo:buscar', (_, termo) => {
    console.log('IPC chamado: acervo:buscar', termo);
    return buscarAcervo(termo);
  });

  createWindow();
});