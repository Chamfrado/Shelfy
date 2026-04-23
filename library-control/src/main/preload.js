const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  listarAcervo: () => ipcRenderer.invoke("acervo:listar"),
  buscarAcervo: (termo) => ipcRenderer.invoke("acervo:buscar", termo),

  listarUsuarios: () => ipcRenderer.invoke("usuario:listar"),
  buscarUsuarios: (termo) => ipcRenderer.invoke("usuario:buscar", termo),

  listarEmprestimos: () => ipcRenderer.invoke("emprestimo:listar"),
  criarEmprestimo: (payload) => ipcRenderer.invoke("emprestimo:criar", payload),
  devolverEmprestimo: (id) => ipcRenderer.invoke("emprestimo:devolver", id),
  listarEmprestimosAtrasados: () =>
    ipcRenderer.invoke("emprestimo:listar-atrasados"),

  contarAcervo: () => ipcRenderer.invoke("dashboard:contar-acervo"),
  contarUsuarios: () => ipcRenderer.invoke("dashboard:contar-usuarios"),
  contarEmprestimosAtivos: () =>
    ipcRenderer.invoke("dashboard:contar-emprestimos-ativos"),
  contarEmprestimosAtrasados: () =>
    ipcRenderer.invoke("dashboard:contar-emprestimos-atrasados"),
});
