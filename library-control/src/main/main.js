const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { listarAcervo, buscarAcervo } = require('./db/acervo.repo');
const { buscarUsuarios, listarUsuarios } = require('./db/usuarios.repo');
const { listarEmprestimos } = require('./db/emprestimos.repo');

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
  ipcMain.handle('acervo:listar', () => {
    return listarAcervo();
  });

  ipcMain.handle('acervo:buscar', (_, termo) => {
    return buscarAcervo(termo);
  });

  ipcMain.handle('usuario:listar', () => {
  return listarUsuarios();
});

ipcMain.handle('usuario:buscar', (_, termo) => {
  return buscarUsuarios(termo);
});

ipcMain.handle('emprestimo:listar', () => {
  return listarEmprestimos();
});

  createWindow();
});