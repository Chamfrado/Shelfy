document.getElementById("app").innerHTML = getLayout(
  "emprestimos",
  `
    <h2>Criar empréstimo</h2>

    <div class="form-box">
      <label for="selectUsuario">Usuário</label>
      <select id="selectUsuario">
        <option value="">Selecione um usuário</option>
      </select>

      <label for="selectLivro">Livro</label>
      <select id="selectLivro">
        <option value="">Selecione um livro</option>
      </select>

      <label for="inputDias">Quantidade de dias</label>
      <input type="number" id="inputDias" min="1" value="7" />

      <button id="btnCriarEmprestimo">Criar empréstimo</button>
    </div>

    <div id="statusEmprestimo" class="status-box"></div>

    

    <hr />

    <h2>Empréstimos</h2>
    <div class="toolbar">
      <input
        id="buscaEmprestimo"
        placeholder="Buscar por usuário ou livro..."
      />

      <select id="filtroStatusEmprestimo">
        <option value="todos">Todos</option>
        <option value="ativos">Ativos</option>
        <option value="devolvidos">Devolvidos</option>
        <option value="atrasados">Atrasados</option>
      </select>

      <button id="btnBuscarEmprestimos">Buscar</button>
    </div>
    <button id="btnCarregarEmprestimos">Carregar empréstimos</button>
    <div id="resultadoEmprestimos"></div>
  `,
);

const selectUsuario = document.getElementById("selectUsuario");
const selectLivro = document.getElementById("selectLivro");
const inputDias = document.getElementById("inputDias");
const btnCriarEmprestimo = document.getElementById("btnCriarEmprestimo");
const statusEmprestimo = document.getElementById("statusEmprestimo");
const btnCarregarAtrasados = document.getElementById("btnCarregarAtrasados");
const resultadoAtrasadosEl = document.getElementById("resultadoAtrasados");
const btnEmprestimos = document.getElementById("btnCarregarEmprestimos");
const resultadoEmprestimosEl = document.getElementById("resultadoEmprestimos");
const inputBuscaEmprestimo = document.getElementById("buscaEmprestimo");
const filtroStatusEmprestimo = document.getElementById(
  "filtroStatusEmprestimo",
);
const btnBuscarEmprestimos = document.getElementById("btnBuscarEmprestimos");

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
          const status = getStatusEmprestimo(e);

          const classeLinha =
            status === "Atrasado"
              ? "status-atrasado"
              : status === "Devolvido"
                ? "status-devolvido"
                : "status-ativo";

          const jaDevolvido = status === "Devolvido";

          return `
          <tr class="${classeLinha}">
            <td>${e.usuario ?? ""}</td>
            <td>${e.livro ?? ""}</td>
            <td>${e.data_atual ?? ""}</td>
            <td>${e.data_devolucao ?? ""}</td>
            <td>${status}</td>
            <td>
              ${jaDevolvido ? "-" : `<button class="btn-devolver" data-id="${e.id}">Devolver</button>`}
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
        await window.api.devolverEmprestimo(botao.dataset.id);
        await carregarTudo();
      } catch (error) {
        setStatus(`Erro ao devolver empréstimo: ${error.message}`);
      }
    });
  });
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

async function carregarEmprestimos() {
  const lista = await window.api.listarEmprestimos();
  renderEmprestimos(lista);
}

async function buscarEmprestimosTela() {
  const termo = inputBuscaEmprestimo.value.trim();
  const status = filtroStatusEmprestimo.value;

  const lista = await window.api.buscarEmprestimos({
    termo,
    status,
  });

  renderEmprestimos(lista);
}

async function carregarAtrasados() {
  const lista = await window.api.listarEmprestimosAtrasados();
  renderAtrasados(lista);
}

async function carregarTudo() {
  const usuarios = await window.api.listarUsuarios();
  const livros = await window.api.listarAcervo();
  preencherSelectUsuarios(usuarios);
  preencherSelectLivros(livros);
  await carregarEmprestimos();
  await carregarAtrasados();
}

btnBuscarEmprestimos.addEventListener("click", async () => {
  try {
    await buscarEmprestimosTela();
  } catch (error) {
    setStatus(`Erro ao buscar empréstimos: ${error.message}`);
  }
});

inputBuscaEmprestimo.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    btnBuscarEmprestimos.click();
  }
});

filtroStatusEmprestimo.addEventListener("change", async () => {
  try {
    await buscarEmprestimosTela();
  } catch (error) {
    setStatus(`Erro ao filtrar empréstimos: ${error.message}`);
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

    await window.api.criarEmprestimo({ userId, acervoId, totalDias });

    statusEmprestimo.textContent = "Empréstimo criado com sucesso.";
    inputDias.value = 7;

    await carregarTudo();
  } catch (error) {
    statusEmprestimo.textContent = `Erro ao criar empréstimo: ${error.message}`;
  }
});

btnCarregarAtrasados.addEventListener("click", async () => {
  try {
    await carregarAtrasados();
  } catch (error) {
    setStatus(`Erro ao carregar atrasados: ${error.message}`);
  }
});

btnEmprestimos.addEventListener("click", async () => {
  try {
    await carregarEmprestimos();
  } catch (error) {
    setStatus(`Erro ao carregar empréstimos: ${error.message}`);
  }
});

(async function init() {
  try {
    setStatus("Carregando empréstimos...");
    await carregarTudo();
    setStatus("");
  } catch (error) {
    setStatus(`Erro ao carregar empréstimos: ${error.message}`);
  }
})();

function getStatusEmprestimo(e) {
  const jaDevolvido = normalizarTexto(e.devolvido).includes("sim");
  const atrasado =
    !jaDevolvido &&
    e.data_devolucao &&
    new Date(e.data_devolucao) <
      new Date(new Date().toISOString().slice(0, 10));

  if (jaDevolvido) return "Devolvido";
  if (atrasado) return "Atrasado";
  return "Ativo";
}
