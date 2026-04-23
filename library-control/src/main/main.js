const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const PDFDocument = require("pdfkit");

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
  listarAcervoComResumo,
  upsertLivroPorTitulo,
  buscarLivroPorTitulo,
} = require("./db/acervo.repo");
const {
  listarUsuarios,
  buscarUsuarios,
  contarUsuarios,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario,
  listarUsuariosComResumo,
  upsertUsuarioPorLogin,
} = require("./db/usuarios.repo");
const {
  listarEmprestimos,
  listarEmprestimosAtrasados,
  contarEmprestimosAtivos,
  contarEmprestimosAtrasados,
  criarEmprestimo,
  registrarDevolucao,
  buscarEmprestimos,
  listarHistoricoPorUsuario,
  listarHistoricoPorLivro,
} = require("./db/emprestimos.repo");

const fs = require("fs");
const { getDatabasePath, closeDatabase } = require("./db/connection");

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

function gerarPdfEmprestimos(dados, destino) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const stream = fs.createWriteStream(destino);

    doc.pipe(stream);

    doc.fontSize(18).text("Relatório de Empréstimos", { align: "center" });
    doc.moveDown();

    const agora = new Date();
    doc
      .fontSize(10)
      .text(`Gerado em: ${agora.toLocaleString("pt-BR")}`, { align: "right" });

    doc.moveDown();

    let y = doc.y;

    function escreverLinha(col1, col2, col3, col4, col5, isHeader = false) {
      const fontSize = isHeader ? 10 : 9;
      if (y > 760) {
        doc.addPage();
        y = 50;
      }

      doc.fontSize(fontSize).font(isHeader ? "Helvetica-Bold" : "Helvetica");

      doc.text(col1, 40, y, { width: 120 });
      doc.text(col2, 165, y, { width: 140 });
      doc.text(col3, 310, y, { width: 70 });
      doc.text(col4, 385, y, { width: 70 });
      doc.text(col5, 460, y, { width: 90 });

      y += isHeader ? 22 : 20;
    }

    escreverLinha(
      "Usuário",
      "Livro",
      "Empréstimo",
      "Devolução",
      "Status",
      true,
    );

    dados.forEach((item) => {
      const devolvido = String(item.devolvido ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes("sim");

      const hoje = new Date().toISOString().slice(0, 10);
      const atrasado =
        !devolvido && item.data_devolucao && item.data_devolucao < hoje;

      const status = devolvido ? "Devolvido" : atrasado ? "Atrasado" : "Ativo";

      escreverLinha(
        item.usuario ?? "",
        item.livro ?? "",
        item.data_atual ?? "",
        item.data_devolucao ?? "",
        status,
      );
    });

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

function parseCsvConteudo(conteudo) {
  const linhas = conteudo
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter((linha) => linha && !linha.startsWith("#"));

  if (linhas.length < 2) {
    throw new Error("O arquivo não possui registros para importação.");
  }

  const cabecalho = linhas[0].split(";").map((c) => c.trim());
  const registros = linhas.slice(1).map((linha) => {
    const valores = linha.split(";").map((v) => v.trim());

    return cabecalho.reduce((obj, campo, index) => {
      obj[campo] = valores[index] ?? "";
      return obj;
    }, {});
  });

  return { cabecalho, registros };
}

function validarCabecalho(cabecalho, esperado) {
  const atual = cabecalho.join(";");
  const ideal = esperado.join(";");

  if (atual !== ideal) {
    throw new Error(
      `Cabeçalho inválido.\n\nEsperado:\n${ideal}\n\nEncontrado:\n${atual}`,
    );
  }
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

    closeDatabase();

    fs.copyFileSync(origem, destino);

    return {
      canceled: false,
      path: origem,
      restartRequired: true,
    };
  });
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

  ipcMain.handle("sistema:reiniciar", () => {
    app.relaunch();
    app.exit(0);
  });

  ipcMain.handle("relatorio:exportar-emprestimos-pdf", async () => {
    const dados = listarEmprestimos();

    const agora = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const nomeArquivo = `emprestimos-${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}_${pad(agora.getHours())}-${pad(agora.getMinutes())}-${pad(agora.getSeconds())}.pdf`;

    const result = await dialog.showSaveDialog({
      title: "Salvar relatório de empréstimos em PDF",
      defaultPath: nomeArquivo,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    await gerarPdfEmprestimos(dados, result.filePath);

    return {
      canceled: false,
      path: result.filePath,
    };
  });

  ipcMain.handle("acervo:listar-com-resumo", () => {
    return listarAcervoComResumo();
  });

  ipcMain.handle("usuario:listar-com-resumo", () => {
    return listarUsuariosComResumo();
  });

  ipcMain.handle("historico:usuario", (_, userId) => {
    return listarHistoricoPorUsuario(Number(userId));
  });

  ipcMain.handle("historico:livro", (_, acervoId) => {
    return listarHistoricoPorLivro(Number(acervoId));
  });

  ipcMain.handle("modelo:baixar-acervo", async () => {
    const conteudo = [
      "# MODELO DE IMPORTACAO - ACERVO",
      "# Preencha os dados abaixo mantendo o cabecalho exatamente igual.",
      "#",
      "# Campos obrigatorios: titulo, quantidade, categoria, tipo",
      "#",
      "# TIPO DO ACERVO:",
      "# 1 = LIVRO",
      "# 3 = APOSTILA",
      "# 4 = COLECAO",
      "# 5 = ENCICLOPEDIA E DICIONARIOS",
      "# 6 = REVISTA",
      "# 7 = JORNAL",
      "# 8 = GIBI",
      "#",
      "# CATEGORIA:",
      "# Use o número correspondente à categoria cadastrada no sistema.",
      "# Exemplo: 1 = LINGUA PORTUGUESA, 2 = GEOGRAFIA, etc. (Consulte as opções no sistema Acervo -> cadastrar livro)",
      ,
      "#",
      "titulo;autor;editora;isbn;quantidade;categoria;tipo",
      "Exemplo de Livro;Autor Exemplo;Editora Exemplo;9780000000000;3;1;1",
    ].join("\n");

    const result = await dialog.showSaveDialog({
      title: "Salvar modelo de importação do acervo",
      defaultPath: "modelo-importacao-acervo.csv",
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    fs.writeFileSync(result.filePath, conteudo, "utf8");

    return {
      canceled: false,
      path: result.filePath,
    };
  });

  ipcMain.handle("modelo:baixar-usuarios", async () => {
    const conteudo = [
      "# MODELO DE IMPORTACAO - USUARIOS",
      "# Preencha os dados abaixo mantendo o cabecalho exatamente igual.",
      "#",
      "# Campos obrigatórios: nome, login, nivel",
      "#",
      "# NIVEL DO USUARIO:",
      "# 1 = Administrador",
      "# 2 = Aluno",
      "# 3 = Operador",
      "#",
      "nome;login;nivel;turma;fone;email",
      "Maria Silva;maria.silva;2;1A;(35) 99999-9999;maria@email.com",
    ].join("\n");

    const result = await dialog.showSaveDialog({
      title: "Salvar modelo de importação de usuários",
      defaultPath: "modelo-importacao-usuarios.csv",
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    fs.writeFileSync(result.filePath, conteudo, "utf8");

    return {
      canceled: false,
      path: result.filePath,
    };
  });

  ipcMain.handle("importar:usuarios", async () => {
    const result = await dialog.showOpenDialog({
      title: "Selecionar CSV de usuários",
      properties: ["openFile"],
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });

    if (result.canceled || !result.filePaths.length) {
      return { canceled: true };
    }

    const arquivo = result.filePaths[0];
    const conteudo = fs.readFileSync(arquivo, "utf8");

    const { cabecalho, registros } = parseCsvConteudo(conteudo);

    validarCabecalho(cabecalho, [
      "nome",
      "login",
      "nivel",
      "turma",
      "fone",
      "email",
    ]);

    let criados = 0;
    let atualizados = 0;
    let ignorados = 0;

    registros.forEach((r) => {
      if (!r.nome || !r.login || !r.nivel) {
        ignorados++;
        return;
      }

      const existente = buscarUsuarios(r.login).find(
        (u) => String(u.login).toLowerCase() === String(r.login).toLowerCase(),
      );

      upsertUsuarioPorLogin({
        nome: r.nome,
        login: r.login,
        nivel: Number(r.nivel),
        turma: r.turma || null,
        fone: r.fone || null,
        email: r.email || null,
      });

      if (existente) {
        atualizados++;
      } else {
        criados++;
      }
    });

    return {
      canceled: false,
      total: registros.length,
      criados,
      atualizados,
      ignorados,
    };
  });

  ipcMain.handle("importar:acervo", async () => {
    const result = await dialog.showOpenDialog({
      title: "Selecionar CSV do acervo",
      properties: ["openFile"],
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });

    if (result.canceled || !result.filePaths.length) {
      return { canceled: true };
    }

    const arquivo = result.filePaths[0];
    const conteudo = fs.readFileSync(arquivo, "utf8");

    const { cabecalho, registros } = parseCsvConteudo(conteudo);

    validarCabecalho(cabecalho, [
      "titulo",
      "autor",
      "editora",
      "isbn",
      "quantidade",
      "categoria",
      "tipo",
    ]);

    let criados = 0;
    let atualizados = 0;
    let ignorados = 0;

    registros.forEach((r) => {
      if (!r.titulo || !r.quantidade || !r.categoria || !r.tipo) {
        ignorados++;
        return;
      }

      const existente = buscarLivroPorTitulo(r.titulo);

      upsertLivroPorTitulo({
        titulo: r.titulo,
        autor: r.autor || null,
        editora: r.editora || null,
        isbn: r.isbn || null,
        quantidade: Number(r.quantidade),
        categoria: Number(r.categoria),
        tipo: Number(r.tipo),
        capa: null,
      });

      if (existente) {
        atualizados++;
      } else {
        criados++;
      }
    });

    return {
      canceled: false,
      total: registros.length,
      criados,
      atualizados,
      ignorados,
    };
  });

  createWindow();
});
