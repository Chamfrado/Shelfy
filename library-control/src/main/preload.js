const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listarAcervo: () => ipcRenderer.invoke('acervo:listar'),
  buscarAcervo: (termo) => ipcRenderer.invoke('acervo:buscar', termo),

  listarUsuarios: () => ipcRenderer.invoke('usuario:listar'),
  buscarUsuarios: (termo) => ipcRenderer.invoke('usuario:buscar', termo)
});