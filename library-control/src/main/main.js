const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const {
  listarAcervo,
  buscarAcervo,
  contarAcervo,
  criarLivro,
  atualizarLivro,
} = require("./db/acervo.repo");
const {
  listarUsuarios,
  buscarUsuarios,
  contarUsuarios,
  criarUsuario,
  atualizarUsuario,
} = require("./db/usuarios.repo");
const {
  listarEmprestimos,
  listarEmprestimosAtrasados,
  contarEmprestimosAtivos,
  contarEmprestimosAtrasados,
  criarEmprestimo,
  registrarDevolucao,
} = require("./db/emprestimos.repo");

const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(() => {
  ipcMain.handle("acervo:listar", () => {
    return listarAcervo();
  });

  ipcMain.handle("acervo:buscar", (_, termo) => {
    return buscarAcervo(termo);
  });

  ipcMain.handle("usuario:listar", () => {
    return listarUsuarios();
  });

  ipcMain.handle("usuario:buscar", (_, termo) => {
    return buscarUsuarios(termo);
  });

  ipcMain.handle("emprestimo:listar", () => {
    return listarEmprestimos();
  });

  ipcMain.handle("emprestimo:criar", (_, payload) => {
    const userId = Number(payload.userId);
    const acervoId = Number(payload.acervoId);
    const totalDias = Number(payload.totalDias);

    if (!userId || !acervoId || !totalDias || totalDias < 1) {
      throw new Error("Dados inválidos para criar empréstimo.");
    }

    return criarEmprestimo(userId, acervoId, totalDias);
  });

  ipcMain.handle("emprestimo:devolver", (_, id) => {
    const emprestimoId = Number(id);

    if (!emprestimoId) {
      throw new Error("ID de empréstimo inválido.");
    }

    return registrarDevolucao(emprestimoId);
  });

  ipcMain.handle("emprestimo:listar-atrasados", () => {
    return listarEmprestimosAtrasados();
  });

  ipcMain.handle("dashboard:contar-acervo", () => {
    return contarAcervo();
  });

  ipcMain.handle("dashboard:contar-usuarios", () => {
    return contarUsuarios();
  });

  ipcMain.handle("dashboard:contar-emprestimos-ativos", () => {
    return contarEmprestimosAtivos();
  });

  ipcMain.handle("dashboard:contar-emprestimos-atrasados", () => {
    return contarEmprestimosAtrasados();
  });

  ipcMain.handle("acervo:criar", (_, payload) => {
    const quantidade = Number(payload.quantidade);
    const categoria = Number(payload.categoria);

    if (!payload.titulo?.trim()) {
      throw new Error("Título obrigatório");
    }

    if (!Number.isFinite(categoria) || categoria < 1) {
      throw new Error("Categoria inválida");
    }

    return criarLivro({
      titulo: payload.titulo.trim(),
      autor: payload.autor?.trim() || null,
      editora: payload.editora?.trim() || null,
      isbn: payload.isbn?.trim() || null,
      quantidade,
      capa: payload.capa || null,
      categoria,
      tipo: 1, // 🔥 fixo
    });
  });

  ipcMain.handle("imagem:selecionar", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Imagens", extensions: ["jpg", "jpeg", "png"] }],
    });

    if (result.canceled || !result.filePaths.length) {
      return null;
    }

    return result.filePaths[0];
  });

  ipcMain.handle("imagem:upload", async (_, filePath) => {
    if (!filePath) {
      throw new Error("Arquivo não informado.");
    }

    const ext = path.extname(filePath).toLowerCase();

    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      throw new Error("Formato inválido. Use JPG, JPEG ou PNG.");
    }

    const prefixo = Date.now().toString(16);
    const nomeOriginal = path.basename(filePath, ext);
    const nomeSeguro = nomeOriginal.replace(/[^\w\s()-]/g, "").trim();
    const nomeFinal = `${prefixo}_${nomeSeguro}${ext}`;

    const destino = path.join(
      __dirname,
      "../renderer/assets/livros",
      nomeFinal,
    );

    fs.copyFileSync(filePath, destino);

    return nomeFinal;
  });

  ipcMain.handle("acervo:atualizar", (_, payload) => {
    return atualizarLivro(payload.id, {
      titulo: payload.titulo,
      autor: payload.autor,
      editora: payload.editora,
      isbn: payload.isbn,
      quantidade: payload.quantidade,
      capa: payload.capa,
      categoria: payload.categoria,
      tipo: 1,
    });
  });

  ipcMain.handle("usuario:criar", (_, payload) => {
    if (!payload?.nome?.trim()) {
      throw new Error("Nome é obrigatório.");
    }

    if (!payload?.login?.trim()) {
      throw new Error("Login é obrigatório.");
    }

    const nivel = Number(payload.nivel);
    if (!Number.isFinite(nivel)) {
      throw new Error("Nível inválido.");
    }

    return criarUsuario({
      nome: payload.nome.trim(),
      login: payload.login.trim(),
      nivel,
      turma: payload.turma?.trim() || null,
      fone: payload.fone?.trim() || null,
      email: payload.email?.trim() || null,
    });
  });

  ipcMain.handle("usuario:atualizar", (_, payload) => {
    const id = Number(payload.id);

    if (!id) {
      throw new Error("ID do usuário inválido.");
    }

    if (!payload?.nome?.trim()) {
      throw new Error("Nome é obrigatório.");
    }

    if (!payload?.login?.trim()) {
      throw new Error("Login é obrigatório.");
    }

    const nivel = Number(payload.nivel);
    if (!Number.isFinite(nivel)) {
      throw new Error("Nível inválido.");
    }

    return atualizarUsuario(id, {
      nome: payload.nome.trim(),
      login: payload.login.trim(),
      nivel,
      turma: payload.turma?.trim() || null,
      fone: payload.fone?.trim() || null,
      email: payload.email?.trim() || null,
    });
  });

  createWindow();
});
