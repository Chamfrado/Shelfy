const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const {
  listarAcervo,
  buscarAcervo,
  contarAcervo,
  criarLivro,
  atualizarLivro,
  excluirLivro,
  listarCategoriasAcervo,
  listarTiposAcervo,
  buscarLivroPorId,
} = require("./db/acervo.repo");
const {
  listarUsuarios,
  buscarUsuarios,
  contarUsuarios,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario,
} = require("./db/usuarios.repo");
const {
  listarEmprestimos,
  listarEmprestimosAtrasados,
  contarEmprestimosAtivos,
  contarEmprestimosAtrasados,
  criarEmprestimo,
  registrarDevolucao,
  buscarEmprestimos,
} = require("./db/emprestimos.repo");

const fs = require("fs");
const { getDatabasePath } = require("./db/connection");

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
    const tipo = Number(payload.tipo);

    if (!payload.titulo?.trim()) {
      throw new Error("Título obrigatório");
    }

    if (!Number.isFinite(categoria) || categoria < 1) {
      throw new Error("Categoria inválida");
    }

    if (!Number.isFinite(tipo) || tipo < 1) {
      throw new Error("Tipo inválido");
    }

    return criarLivro({
      titulo: payload.titulo.trim(),
      autor: payload.autor?.trim() || null,
      editora: payload.editora?.trim() || null,
      isbn: payload.isbn?.trim() || null,
      quantidade,
      capa: payload.capa || null,
      categoria,
      tipo,
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
    const livroAtual = buscarLivroPorId(payload.id);

    const resultado = atualizarLivro(payload.id, {
      titulo: payload.titulo,
      autor: payload.autor,
      editora: payload.editora,
      isbn: payload.isbn,
      quantidade: payload.quantidade,
      capa: payload.capa,
      categoria: payload.categoria,
      tipo: payload.tipo,
    });

    const capaAntiga = livroAtual?.capa;
    const capaNova = payload.capa;

    if (capaAntiga && capaNova && capaAntiga !== capaNova) {
      const caminhoAntigo = path.join(
        __dirname,
        "../renderer/assets/livros",
        capaAntiga,
      );

      if (fs.existsSync(caminhoAntigo)) {
        fs.unlinkSync(caminhoAntigo);
      }
    }

    return resultado;
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

  ipcMain.handle("acervo:excluir", (_, id) => {
    return excluirLivro(Number(id));
  });

  ipcMain.handle("usuario:excluir", (_, id) => {
    return excluirUsuario(Number(id));
  });

  ipcMain.handle("emprestimo:buscar", (_, payload) => {
    return buscarEmprestimos(payload?.termo || "", payload?.status || "todos");
  });

  ipcMain.handle("acervo:listar-categorias", () => {
    return listarCategoriasAcervo();
  });

  ipcMain.handle("acervo:listar-tipos", () => {
    return listarTiposAcervo();
  });

  ipcMain.handle("sistema:fazer-backup", async () => {
    const origem = getDatabasePath();

    if (!fs.existsSync(origem)) {
      throw new Error("Banco de dados não encontrado.");
    }

    const agora = new Date();
    const pad = (n) => String(n).padStart(2, "0");

    const nomeArquivo = `bibliotecario-backup-${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}_${pad(agora.getHours())}-${pad(agora.getMinutes())}-${pad(agora.getSeconds())}.db`;

    const result = await dialog.showSaveDialog({
      title: "Salvar backup do banco",
      defaultPath: nomeArquivo,
      filters: [{ name: "Banco SQLite", extensions: ["db"] }],
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    fs.copyFileSync(origem, result.filePath);

    return {
      canceled: false,
      path: result.filePath,
    };
  });

  ipcMain.handle("sistema:restaurar-backup", async () => {
    const destino = getDatabasePath();

    const result = await dialog.showOpenDialog({
      title: "Selecionar backup do banco",
      properties: ["openFile"],
      filters: [{ name: "Banco SQLite", extensions: ["db"] }],
    });

    if (result.canceled || !result.filePaths.length) {
      return { canceled: true };
    }

    const origem = result.filePaths[0];

    if (!fs.existsSync(origem)) {
      throw new Error("Arquivo de backup não encontrado.");
    }

    // fecha conexão atual com o banco, se necessário
    // como seu connection.js mantém singleton, vamos sobrescrever o arquivo diretamente
    fs.copyFileSync(origem, destino);

    return {
      canceled: false,
      path: origem,
    };
  });

  function escapeCsv(value) {
    if (value === null || value === undefined) return "";
    const str = String(value).replace(/"/g, '""');
    return /[",\n;]/.test(str) ? `"${str}"` : str;
  }

  function toCsv(rows) {
    if (!rows || !rows.length) {
      return "";
    }

    const headers = Object.keys(rows[0]);
    const lines = [
      headers.join(";"),
      ...rows.map((row) =>
        headers.map((header) => escapeCsv(row[header])).join(";"),
      ),
    ];

    return lines.join("\n");
  }

  ipcMain.handle("relatorio:exportar-acervo", async () => {
    const dados = listarAcervo();

    const agora = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const nomeArquivo = `acervo-${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}_${pad(agora.getHours())}-${pad(agora.getMinutes())}-${pad(agora.getSeconds())}.csv`;

    const result = await dialog.showSaveDialog({
      title: "Salvar relatório de acervo",
      defaultPath: nomeArquivo,
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    const csv = toCsv(dados);
    fs.writeFileSync(result.filePath, csv, "utf8");

    return {
      canceled: false,
      path: result.filePath,
    };
  });

  ipcMain.handle("relatorio:exportar-usuarios", async () => {
    const dados = listarUsuarios();

    const agora = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const nomeArquivo = `usuarios-${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}_${pad(agora.getHours())}-${pad(agora.getMinutes())}-${pad(agora.getSeconds())}.csv`;

    const result = await dialog.showSaveDialog({
      title: "Salvar relatório de usuários",
      defaultPath: nomeArquivo,
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    const csv = toCsv(dados);
    fs.writeFileSync(result.filePath, csv, "utf8");

    return {
      canceled: false,
      path: result.filePath,
    };
  });

  ipcMain.handle("relatorio:exportar-emprestimos", async () => {
    const dados = listarEmprestimos();

    const agora = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const nomeArquivo = `emprestimos-${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}_${pad(agora.getHours())}-${pad(agora.getMinutes())}-${pad(agora.getSeconds())}.csv`;

    const result = await dialog.showSaveDialog({
      title: "Salvar relatório de empréstimos",
      defaultPath: nomeArquivo,
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    const csv = toCsv(dados);
    fs.writeFileSync(result.filePath, csv, "utf8");

    return {
      canceled: false,
      path: result.filePath,
    };
  });

  createWindow();
});
