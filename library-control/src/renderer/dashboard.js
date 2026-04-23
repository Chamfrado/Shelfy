document.getElementById("app").innerHTML = getLayout(
  "dashboard",
  `
    <h2>Dashboard</h2>

    <section class="dashboard">
      <div class="card">
        <h3>Total de livros</h3>
        <p id="cardTotalLivros">0</p>
      </div>

      <div class="card">
        <h3>Total de usuários</h3>
        <p id="cardTotalUsuarios">0</p>
      </div>

      <div class="card">
        <h3>Empréstimos ativos</h3>
        <p id="cardEmprestimosAtivos">0</p>
      </div>

      <div class="card card-alerta">
        <h3>Empréstimos atrasados</h3>
        <p id="cardEmprestimosAtrasados">0</p>
      </div>
    </section>

    <h3>Empréstimos atrasados</h3>
    <button id="btnCarregarAtrasados">Carregar atrasados</button>
    <div id="resultadoAtrasados"></div>
  `,
);

async function carregarDashboard() {
  const totalLivros = await window.api.contarAcervo();
  const totalUsuarios = await window.api.contarUsuarios();
  const totalAtivos = await window.api.contarEmprestimosAtivos();
  const totalAtrasados = await window.api.contarEmprestimosAtrasados();

  document.getElementById("cardTotalLivros").textContent =
    totalLivros?.total ?? 0;
  document.getElementById("cardTotalUsuarios").textContent =
    totalUsuarios?.total ?? 0;
  document.getElementById("cardEmprestimosAtivos").textContent =
    totalAtivos?.total ?? 0;
  document.getElementById("cardEmprestimosAtrasados").textContent =
    totalAtrasados?.total ?? 0;
}

function renderAtrasados(lista) {
  document.getElementById("resultadoAtrasados").innerHTML = `
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

document
  .getElementById("btnCarregarAtrasados")
  .addEventListener("click", async () => {
    try {
      await carregarAtrasados();
    } catch (error) {
      setStatus(`Erro ao carregar atrasados: ${error.message}`);
    }
  });

(async function init() {
  try {
    setStatus("Carregando dados...");
    await carregarDashboard();
    await carregarAtrasados();
    setStatus("");
  } catch (error) {
    setStatus(`Erro ao carregar dashboard: ${error.message}`);
  }
})();
