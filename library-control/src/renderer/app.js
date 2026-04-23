const statusEl = document.getElementById("status");

const resultadoEl = document.getElementById("resultado");
const inputBusca = document.getElementById("busca");
const btnBuscar = document.getElementById("btnBuscar");

const resultadoUsuariosEl = document.getElementById("resultadoUsuarios");
const inputBuscaUsuario = document.getElementById("buscaUsuario");
const btnBuscarUsuario = document.getElementById("btnBuscarUsuario");

const resultadoEmprestimosEl = document.getElementById("resultadoEmprestimos");
const btnEmprestimos = document.getElementById("btnCarregarEmprestimos");

const selectUsuario = document.getElementById("selectUsuario");
const selectLivro = document.getElementById("selectLivro");
const inputDias = document.getElementById("inputDias");
const btnCriarEmprestimo = document.getElementById("btnCriarEmprestimo");
const statusEmprestimo = document.getElementById("statusEmprestimo");
const btnCarregarAtrasados = document.getElementById("btnCarregarAtrasados");
const resultadoAtrasadosEl = document.getElementById("resultadoAtrasados");

const cardTotalLivros = document.getElementById("cardTotalLivros");
const cardTotalUsuarios = document.getElementById("cardTotalUsuarios");
const cardEmprestimosAtivos = document.getElementById("cardEmprestimosAtivos");
const cardEmprestimosAtrasados = document.getElementById(
  "cardEmprestimosAtrasados",
);

const livroTitulo = document.getElementById("livroTitulo");
const livroAutor = document.getElementById("livroAutor");
const livroEditora = document.getElementById("livroEditora");
const livroIsbn = document.getElementById("livroIsbn");
const livroQuantidade = document.getElementById("livroQuantidade");
const livroCapa = document.getElementById("livroCapa");
const btnCriarLivro = document.getElementById("btnCriarLivro");
const statusLivro = document.getElementById("statusLivro");
const livroCategoria = document.getElementById("livroCategoria");
const livroTipo = document.getElementById("livroTipo");

const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

const btnSelecionarImagem = document.getElementById("btnSelecionarImagem");
const nomeImagemSelecionada = document.getElementById("nomeImagemSelecionada");

const usuarioNome = document.getElementById("usuarioNome");
const usuarioLogin = document.getElementById("usuarioLogin");
const usuarioNivel = document.getElementById("usuarioNivel");
const usuarioTurma = document.getElementById("usuarioTurma");
const usuarioFone = document.getElementById("usuarioFone");
const usuarioEmail = document.getElementById("usuarioEmail");
const btnSalvarUsuario = document.getElementById("btnSalvarUsuario");
const statusUsuario = document.getElementById("statusUsuario");

let usuarioEmEdicaoId = null;

let caminhoImagemSelecionada = null;

let livroEmEdicaoId = null;

function setStatus(message) {
  if (statusEl) {
    statusEl.textContent = message;
  }
}

function renderAcervo(lista) {
  resultadoEl.innerHTML = `
    <h2>Acervo - Total: ${lista.length}</h2>
    <table>
      <tr>
        <th>Capa</th>
        <th>Título</th>
        <th>Autor</th>
        <th>Editora</th>
        <th>Qtd</th>
        <th>Status</th>
        <th>Ações</th>
      </tr>
      ${lista
        .map((l) => {
          const qtd = Number(l.quantidade ?? 0);
          const status = qtd > 0 ? "Disponível" : "Indisponível";

          return `
          <tr>
            <td>
              ${
                l.capa
                  ? `<img src="./assets/livros/${encodeURIComponent(l.capa)}" alt="Capa de ${l.titulo ?? "livro"}" class="capa-livro" />`
                  : "-"
              }
            </td>
            <td>${l.titulo ?? ""}</td>
            <td>${l.autor ?? ""}</td>
            <td>${l.editora ?? ""}</td>
            <td>${qtd}</td>
            <td>${status}</td>
            <td>
                <button class="btn-editar" data-id="${l.id}">Editar</button>
            </td>
          </tr>
        `;
        })
        .join("")}
    </table>
  `;
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const livro = lista.find((l) => String(l.id) === String(id));

      if (!livro) return;

      livroEmEdicaoId = livro.id;

      livroTitulo.value = livro.titulo ?? "";
      livroAutor.value = livro.autor ?? "";
      livroEditora.value = livro.editora ?? "";
      livroIsbn.value = livro.isbn ?? "";
      livroQuantidade.value = livro.quantidade ?? "";
      livroCategoria.value = livro.categoria ?? "";

      nomeImagemSelecionada.textContent = livro.capa || "Nenhuma imagem";

      btnCriarLivro.textContent = "Atualizar livro";
      statusLivro.textContent = "Modo edição ativado";
    });
  });
}

function renderUsuarios(lista) {
  resultadoUsuariosEl.innerHTML = `
    <h2>Usuários - Total: ${lista.length}</h2>
    <table>
      <tr>
        <th>Nome</th>
        <th>Login</th>
        <th>Nível</th>
        <th>Turma</th>
        <th>Telefone</th>
        <th>E-mail</th>
        <th>Ações</th>
      </tr>
      ${lista
        .map(
          (usuario) => `
        <tr>
          <td>${usuario.nome ?? ""}</td>
          <td>${usuario.login ?? ""}</td>
          <td>${usuario.nivel ?? ""}</td>
          <td>${usuario.turma ?? ""}</td>
          <td>${usuario.fone ?? ""}</td>
          <td>${usuario.email ?? ""}</td>
          <td>
            <button class="btn-editar-usuario" data-id="${usuario.id}">Editar</button>
          </td>
        </tr>
      `,
        )
        .join("")}
    </table>
  `;

  document.querySelectorAll(".btn-editar-usuario").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const usuario = lista.find((u) => String(u.id) === String(id));

      if (!usuario) return;

      usuarioEmEdicaoId = usuario.id;

      usuarioNome.value = usuario.nome ?? "";
      usuarioLogin.value = usuario.login ?? "";
      usuarioNivel.value = usuario.nivel ?? "";
      usuarioTurma.value = usuario.turma ?? "";
      usuarioFone.value = usuario.fone ?? "";
      usuarioEmail.value = usuario.email ?? "";

      btnSalvarUsuario.textContent = "Atualizar usuário";
      statusUsuario.textContent = "Modo edição ativado.";
    });
  });
}

function renderEmprestimos(lista) {
  resultadoEmprestimosEl.innerHTML = `
    <h2>Empréstimos - Total: ${lista.length}</h2>
    <table>
      <tr>
        <th>Usuário</th>
        <th>Livro</th>
        <th>Data</th>
        <th>Devolução</th>
        <th>Status</th>
        <th>Ação</th>
      </tr>
      ${lista
        .map((e) => {
          const jaDevolvido = normalizarTexto(e.devolvido).includes("sim");
          const status = jaDevolvido ? "Devolvido" : "Ativo";

          return `
          <tr>
            <td>${e.usuario ?? ""}</td>
            <td>${e.livro ?? ""}</td>
            <td>${e.data_atual ?? ""}</td>
            <td>${e.data_devolucao ?? ""}</td>
            <td>${status}</td>
            <td>
              ${
                jaDevolvido
                  ? "-"
                  : `<button class="btn-devolver" data-id="${e.id}">Devolver</button>`
              }
            </td>
          </tr>
        `;
        })
        .join("")}
    </table>
  `;

  document.querySelectorAll(".btn-devolver").forEach((botao) => {
    botao.addEventListener("click", async () => {
      try {
        const id = botao.dataset.id;
        await window.api.devolverEmprestimo(id);
        await carregarAcervo();
        await carregarEmprestimos();
        await carregarAtrasados();
        await carregarDashboard();
      } catch (error) {
        console.error(error);
        setStatus(`Erro ao devolver empréstimo: ${error.message}`);
      }
    });
  });
}
function preencherSelectUsuarios(lista) {
  selectUsuario.innerHTML = `
    <option value="">Selecione um usuário</option>
    ${lista
      .map(
        (usuario) => `
      <option value="${usuario.id}">
        ${usuario.nome ?? `Usuário ${usuario.id}`}
      </option>
    `,
      )
      .join("")}
  `;
}

function preencherSelectLivros(lista) {
  selectLivro.innerHTML = `
    <option value="">Selecione um livro</option>
    ${lista
      .map((livro) => {
        const qtd = Number(livro.quantidade ?? 0);
        const indisponivel = qtd <= 0 ? "disabled" : "";
        return `
        <option value="${livro.id}" ${indisponivel}>
          ${livro.titulo ?? `Livro ${livro.id}`} (${qtd} disponível)
        </option>
      `;
      })
      .join("")}
  `;
}

async function carregarEmprestimos() {
  const lista = await window.api.listarEmprestimos();
  renderEmprestimos(lista);
}

async function carregarInicial() {
  try {
    setStatus("Carregando dados...");

    await carregarDashboard();
    await carregarAcervo();
    await carregarUsuarios();
    await carregarEmprestimos();
    await carregarAtrasados();

    setStatus("");
  } catch (error) {
    console.error(error);
    setStatus(`Erro ao carregar dados: ${error.message}`);
  }
}

async function carregarUsuarios() {
  const usuarios = await window.api.listarUsuarios();
  renderUsuarios(usuarios);
  preencherSelectUsuarios(usuarios);
}

btnBuscar.addEventListener("click", async () => {
  try {
    const termo = inputBusca.value.trim();
    const livros = termo
      ? await window.api.buscarAcervo(termo)
      : await window.api.listarAcervo();

    renderAcervo(livros);
    preencherSelectLivros(livros);
  } catch (error) {
    console.error(error);
    setStatus(`Erro ao buscar acervo: ${error.message}`);
  }
});

btnCarregarAtrasados.addEventListener("click", async () => {
  try {
    await carregarAtrasados();
  } catch (error) {
    console.error(error);
    setStatus(`Erro ao carregar atrasados: ${error.message}`);
  }
});

btnBuscarUsuario.addEventListener("click", async () => {
  try {
    const termo = inputBuscaUsuario.value.trim();
    const usuarios = termo
      ? await window.api.buscarUsuarios(termo)
      : await window.api.listarUsuarios();

    renderUsuarios(usuarios);
    preencherSelectUsuarios(usuarios);
  } catch (error) {
    console.error(error);
    setStatus(`Erro ao buscar usuários: ${error.message}`);
  }
});

btnEmprestimos.addEventListener("click", async () => {
  try {
    await carregarEmprestimos();
  } catch (error) {
    console.error(error);
    setStatus(`Erro ao carregar empréstimos: ${error.message}`);
  }
});

btnCriarEmprestimo.addEventListener("click", async () => {
  try {
    const userId = selectUsuario.value;
    const acervoId = selectLivro.value;
    const totalDias = inputDias.value;

    if (!userId) {
      statusEmprestimo.textContent = "Selecione um usuário.";
      return;
    }

    if (!acervoId) {
      statusEmprestimo.textContent = "Selecione um livro.";
      return;
    }

    if (!totalDias || Number(totalDias) < 1) {
      statusEmprestimo.textContent = "Informe uma quantidade de dias válida.";
      return;
    }

    statusEmprestimo.textContent = "Criando empréstimo...";

    await window.api.criarEmprestimo({
      userId,
      acervoId,
      totalDias,
    });

    statusEmprestimo.textContent = "Empréstimo criado com sucesso.";
    inputDias.value = 7;

    await carregarAcervo();
    await carregarEmprestimos();
    await carregarAtrasados();
    await carregarDashboard();

    statusEmprestimo.textContent = "Empréstimo criado com sucesso.";
    inputDias.value = 7;
  } catch (error) {
    console.error(error);
    statusEmprestimo.textContent = `Erro ao criar empréstimo: ${error.message}`;
  }
});

inputBusca.addEventListener("keydown", (event) => {
  if (event.key === "Enter") btnBuscar.click();
});

inputBuscaUsuario.addEventListener("keydown", (event) => {
  if (event.key === "Enter") btnBuscarUsuario.click();
});

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function renderAtrasados(lista) {
  resultadoAtrasadosEl.innerHTML = `
    <h2>Atrasados - Total: ${lista.length}</h2>
    <table>
      <tr>
        <th>Usuário</th>
        <th>Livro</th>
        <th>Data do empréstimo</th>
        <th>Data limite</th>
      </tr>
      ${lista
        .map(
          (item) => `
        <tr class="atrasado">
          <td>${item.usuario ?? ""}</td>
          <td>${item.livro ?? ""}</td>
          <td>${item.data_atual ?? ""}</td>
          <td>${item.data_devolucao ?? ""}</td>
        </tr>
      `,
        )
        .join("")}
    </table>
  `;
}

async function carregarAtrasados() {
  const lista = await window.api.listarEmprestimosAtrasados();
  renderAtrasados(lista);
}

async function carregarAcervo() {
  const livros = await window.api.listarAcervo();
  renderAcervo(livros);
  preencherSelectLivros(livros);
}

async function carregarDashboard() {
  const totalLivros = await window.api.contarAcervo();
  const totalUsuarios = await window.api.contarUsuarios();
  const totalAtivos = await window.api.contarEmprestimosAtivos();
  const totalAtrasados = await window.api.contarEmprestimosAtrasados();

  if (cardTotalLivros) {
    cardTotalLivros.textContent = totalLivros?.total ?? 0;
  }

  if (cardTotalUsuarios) {
    cardTotalUsuarios.textContent = totalUsuarios?.total ?? 0;
  }

  if (cardEmprestimosAtivos) {
    cardEmprestimosAtivos.textContent = totalAtivos?.total ?? 0;
  }

  if (cardEmprestimosAtrasados) {
    cardEmprestimosAtrasados.textContent = totalAtrasados?.total ?? 0;
  }
}

function abrirPagina(nome) {
  pages.forEach((page) => {
    page.classList.remove("active");
  });

  navButtons.forEach((button) => {
    button.classList.remove("active");
  });

  const pagina = document.getElementById(`page-${nome}`);
  if (pagina) {
    pagina.classList.add("active");
  }

  const botaoAtivo = document.querySelector(`.nav-btn[data-page="${nome}"]`);
  if (botaoAtivo) {
    botaoAtivo.classList.add("active");
  }
}

function bindNavegacao() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      abrirPagina(button.dataset.page);
    });
  });
}

btnCriarLivro.addEventListener("click", async () => {
  try {
    const titulo = livroTitulo.value.trim();
    const autor = livroAutor.value.trim();
    const editora = livroEditora.value.trim();
    const isbn = livroIsbn.value.trim();
    const quantidade = livroQuantidade.value;
    const categoria = livroCategoria.value;

    if (!titulo) {
      statusLivro.textContent = "Informe o título.";
      return;
    }

    if (!categoria || Number(categoria) < 1) {
      statusLivro.textContent = "Informe uma categoria válida.";
      return;
    }

    if (quantidade === "" || Number(quantidade) < 0) {
      statusLivro.textContent = "Quantidade inválida.";
      return;
    }

    statusLivro.textContent = "Processando...";

    let nomeImagem = null;

    // upload
    if (caminhoImagemSelecionada) {
      nomeImagem = await window.api.uploadImagemLivro(caminhoImagemSelecionada);
    }

    if (livroEmEdicaoId) {
      await window.api.atualizarLivro({
        id: livroEmEdicaoId,
        titulo,
        autor,
        editora,
        isbn,
        quantidade,
        capa: nomeImagem,
        categoria,
      });

      statusLivro.textContent = "Livro atualizado com sucesso.";
    } else {
      await window.api.criarLivro({
        titulo,
        autor,
        editora,
        isbn,
        quantidade,
        capa: nomeImagem,
        categoria,
      });

      statusLivro.textContent = "Livro cadastrado com sucesso.";
    }

    statusLivro.textContent = "Livro cadastrado com sucesso.";

    // limpar
    livroTitulo.value = "";
    livroAutor.value = "";
    livroEditora.value = "";
    livroIsbn.value = "";
    livroQuantidade.value = "";
    livroCategoria.value = "";
    caminhoImagemSelecionada = null;
    nomeImagemSelecionada.textContent = "Nenhuma imagem";
    livroEmEdicaoId = null;
    btnCriarLivro.textContent = "Salvar livro";

    await carregarAcervo();
    await carregarDashboard();
  } catch (error) {
    console.error(error);
    statusLivro.textContent = `Erro: ${error.message}`;
  }
});

btnSelecionarImagem.addEventListener("click", async () => {
  try {
    const caminho = await window.api.selecionarImagemLivro();

    if (!caminho) return;

    caminhoImagemSelecionada = caminho;

    const partes = caminho.split(/[/\\]/);
    nomeImagemSelecionada.textContent = partes[partes.length - 1];
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
});
btnSalvarUsuario.addEventListener("click", async () => {
  try {
    const nome = usuarioNome.value.trim();
    const login = usuarioLogin.value.trim();
    const nivel = usuarioNivel.value;
    const turma = usuarioTurma.value.trim();
    const fone = usuarioFone.value.trim();
    const email = usuarioEmail.value.trim();

    if (!nome) {
      statusUsuario.textContent = "Informe o nome.";
      return;
    }

    if (!login) {
      statusUsuario.textContent = "Informe o login.";
      return;
    }

    if (nivel === "") {
      statusUsuario.textContent = "Informe o nível.";
      return;
    }

    if (usuarioEmEdicaoId) {
      await window.api.atualizarUsuario({
        id: usuarioEmEdicaoId,
        nome,
        login,
        nivel,
        turma,
        fone,
        email,
      });

      statusUsuario.textContent = "Usuário atualizado com sucesso.";
    } else {
      await window.api.criarUsuario({
        nome,
        login,
        nivel,
        turma,
        fone,
        email,
      });

      statusUsuario.textContent = "Usuário cadastrado com sucesso.";
    }

    usuarioNome.value = "";
    usuarioLogin.value = "";
    usuarioNivel.value = "";
    usuarioTurma.value = "";
    usuarioFone.value = "";
    usuarioEmail.value = "";

    usuarioEmEdicaoId = null;
    btnSalvarUsuario.textContent = "Salvar usuário";

    await carregarUsuarios();
    await carregarDashboard();
  } catch (error) {
    console.error(error);
    statusUsuario.textContent = `Erro ao salvar usuário: ${error.message}`;
  }
});
bindNavegacao();
carregarInicial();
