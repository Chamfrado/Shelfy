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

function renderAcervo(lista) {
  resultadoEl.innerHTML = `
    <h2>Acervo - Total: ${lista.length}</h2>
    <table>
      <tr>
        <th>Título</th>
        <th>Autor</th>
        <th>Editora</th>
        <th>Qtd</th>
      </tr>
      ${lista
        .map(
          (l) => `
        <tr>
          <td>${l.titulo ?? ""}</td>
          <td>${l.autor ?? ""}</td>
          <td>${l.editora ?? ""}</td>
          <td>${l.quantidade ?? ""}</td>
        </tr>
      `,
        )
        .join("")}
    </table>
  `;
}

function renderUsuarios(lista) {
  resultadoUsuariosEl.innerHTML = `
    <h2>Usuários - Total: ${lista.length}</h2>
    <table>
      <tr>
        ${
          lista.length > 0
            ? Object.keys(lista[0])
                .map((col) => `<th>${col}</th>`)
                .join("")
            : "<th>Sem dados</th>"
        }
      </tr>
      ${lista
        .map(
          (usuario) => `
        <tr>
          ${Object.values(usuario)
            .map((valor) => `<td>${valor ?? ""}</td>`)
            .join("")}
        </tr>
      `,
        )
        .join("")}
    </table>
  `;
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
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
        await carregarEmprestimos();
      } catch (error) {
        console.error(error);
        statusEl.textContent = `Erro ao devolver empréstimo: ${error.message}`;
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
      .map(
        (livro) => `
      <option value="${livro.id}">
        ${livro.titulo ?? `Livro ${livro.id}`}
      </option>
    `,
      )
      .join("")}
  `;
}

async function carregarEmprestimos() {
  const lista = await window.api.listarEmprestimos();
  renderEmprestimos(lista);
}

async function carregarInicial() {
  try {
    statusEl.textContent = "Carregando dados...";

    const livros = await window.api.listarAcervo();
    renderAcervo(livros);
    preencherSelectLivros(livros);

    const usuarios = await window.api.listarUsuarios();
    renderUsuarios(usuarios);
    preencherSelectUsuarios(usuarios);

    await carregarEmprestimos();

    statusEl.textContent = "";
  } catch (error) {
    console.error(error);
    statusEl.textContent = `Erro ao carregar dados: ${error.message}`;
  }
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
    statusEl.textContent = `Erro ao buscar acervo: ${error.message}`;
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
    statusEl.textContent = `Erro ao buscar usuários: ${error.message}`;
  }
});

btnEmprestimos.addEventListener("click", async () => {
  try {
    await carregarEmprestimos();
  } catch (error) {
    console.error(error);
    statusEl.textContent = `Erro ao carregar empréstimos: ${error.message}`;
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

    await carregarEmprestimos();
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

carregarInicial();
