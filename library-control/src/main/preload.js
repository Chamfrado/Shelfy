const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  onImportProgress: (callback) => {
    ipcRenderer.removeAllListeners("import-progress");

    ipcRenderer.on("import-progress", (_, data) => {
      callback(data);
    });
  },

  listarAcervo: () => ipcRenderer.invoke("acervo:listar"),
  buscarAcervo: (termo) => ipcRenderer.invoke("acervo:buscar", termo),
  criarLivro: (payload) => ipcRenderer.invoke("acervo:criar", payload),
  selecionarImagemLivro: () => ipcRenderer.invoke("imagem:selecionar"),
  uploadImagemLivro: (filePath) =>
    ipcRenderer.invoke("imagem:upload", filePath),
  atualizarLivro: (payload) => ipcRenderer.invoke("acervo:atualizar", payload),

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

  criarUsuario: (payload) => ipcRenderer.invoke("usuario:criar", payload),
  atualizarUsuario: (payload) =>
    ipcRenderer.invoke("usuario:atualizar", payload),
  excluirLivro: (id) => ipcRenderer.invoke("acervo:excluir", id),
  excluirUsuario: (id) => ipcRenderer.invoke("usuario:excluir", id),
  buscarEmprestimos: (payload) =>
    ipcRenderer.invoke("emprestimo:buscar", payload),
  listarCategoriasAcervo: () => ipcRenderer.invoke("acervo:listar-categorias"),
  listarTiposAcervo: () => ipcRenderer.invoke("acervo:listar-tipos"),
  fazerBackup: () => ipcRenderer.invoke("sistema:fazer-backup"),
  restaurarBackup: () => ipcRenderer.invoke("sistema:restaurar-backup"),
  exportarAcervoCsv: () => ipcRenderer.invoke("relatorio:exportar-acervo"),
  exportarUsuariosCsv: () => ipcRenderer.invoke("relatorio:exportar-usuarios"),
  exportarEmprestimosCsv: () =>
    ipcRenderer.invoke("relatorio:exportar-emprestimos"),
  reiniciarAplicacao: () => ipcRenderer.invoke("sistema:reiniciar"),
  exportarEmprestimosPdf: () =>
    ipcRenderer.invoke("relatorio:exportar-emprestimos-pdf"),
  listarAcervoComResumo: () => ipcRenderer.invoke("acervo:listar-com-resumo"),
  listarUsuariosComResumo: () =>
    ipcRenderer.invoke("usuario:listar-com-resumo"),
  listarHistoricoUsuario: (userId) =>
    ipcRenderer.invoke("historico:usuario", userId),

  listarHistoricoLivro: (acervoId) =>
    ipcRenderer.invoke("historico:livro", acervoId),

  baixarModeloAcervo: () => ipcRenderer.invoke("modelo:baixar-acervo"),
  baixarModeloUsuarios: () => ipcRenderer.invoke("modelo:baixar-usuarios"),

  importarUsuariosCsv: () => ipcRenderer.invoke("importar:usuarios"),

  importarAcervoCsv: () => ipcRenderer.invoke("importar:acervo"),

  previewImportarUsuariosCsv: () =>
    ipcRenderer.invoke("importar:usuarios-preview"),

  confirmarImportarUsuariosCsv: () =>
    ipcRenderer.invoke("importar:usuarios-confirmar"),

  previewImportarAcervoCsv: () => ipcRenderer.invoke("importar:acervo-preview"),

  confirmarImportarAcervoCsv: () =>
    ipcRenderer.invoke("importar:acervo-confirmar"),

  exportarErrosImportacao: (erros) =>
    ipcRenderer.invoke("importar:exportar-erros", erros),
});
