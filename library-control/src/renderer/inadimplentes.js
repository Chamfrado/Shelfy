document.getElementById("app").innerHTML = getLayout(
  "inadimplentes",
  `
    <div class="page-header">
      <div>
        <h1>Inadimplentes</h1>
        <p>Acompanhe usuários com empréstimos em atraso.</p>
      </div>

      <button id="btnAtualizarInadimplentes" class="btn-primary">
        Atualizar
      </button>
    </div>

    <section class="stats-grid">
      <div class="stat-card danger">
        <span>Total em atraso</span>
        <strong id="totalAtrasados">0</strong>
        <small>Empréstimos vencidos</small>
      </div>

      <div class="stat-card">
        <span>Maior atraso</span>
        <strong id="maiorAtraso">0</strong>
        <small>dias</small>
      </div>
    </section>

    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>Lista de inadimplências</h2>
          <p>Itens não devolvidos após a data limite.</p>
        </div>
      </div>

      <div id="resultadoInadimplentes"></div>
    </div>
  `,
);

const totalAtrasados = document.getElementById("totalAtrasados");
const maiorAtraso = document.getElementById("maiorAtraso");
const resultadoInadimplentes = document.getElementById(
  "resultadoInadimplentes",
);
const btnAtualizarInadimplentes = document.getElementById(
  "btnAtualizarInadimplentes",
);

function formatarDataPtBr(data) {
  if (!data) return "-";

  const [ano, mes, dia] = String(data).split("-");
  if (!ano || !mes || !dia) return data;

  return `${dia}/${mes}/${ano}`;
}

function calcularDiasAtraso(dataDevolucao) {
  if (!dataDevolucao) return 0;

  const hoje = new Date();
  const hojeLocal = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
  );

  const [ano, mes, dia] = String(dataDevolucao).split("-").map(Number);
  const devolucao = new Date(ano, mes - 1, dia);

  const diff = hojeLocal - devolucao;

  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function renderInadimplentes(lista) {
  const maior = lista.reduce((max, item) => {
    const dias = calcularDiasAtraso(item.data_devolucao);
    return dias > max ? dias : max;
  }, 0);

  totalAtrasados.textContent = lista.length;
  maiorAtraso.textContent = maior;

  if (!lista.length) {
    resultadoInadimplentes.innerHTML = `
      <div class="empty-state">
        Nenhuma inadimplência encontrada.
      </div>
    `;
    return;
  }

  resultadoInadimplentes.innerHTML = `
    <div class="table-wrapper">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Livro</th>
            <th>Empréstimo</th>
            <th>Data limite</th>
            <th>Atraso</th>
            <th>Ação</th>
          </tr>
        </thead>

        <tbody>
          ${lista
            .map((item) => {
              const dias = calcularDiasAtraso(item.data_devolucao);

              return `
                <tr>
                  <td>${item.usuario ?? ""}</td>
                  <td>${item.livro ?? ""}</td>
                  <td>${formatarDataPtBr(item.data_atual)}</td>
                  <td>${formatarDataPtBr(item.data_devolucao)}</td>
                  <td>
                    <span class="badge-status badge-atrasado">
                      ${dias} dia${dias === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="btn-light btn-devolver-inadimplente" data-id="${item.id}">
                        Registrar devolução
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  document.querySelectorAll(".btn-devolver-inadimplente").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        const item = lista.find((e) => String(e.id) === String(btn.dataset.id));

        const confirmado = await confirmModal({
          title: "Registrar devolução",
          message: item
            ? `Deseja registrar a devolução do livro "${item.livro}" para o usuário "${item.usuario}"?`
            : "Deseja registrar esta devolução?",
        });

        if (!confirmado) return;

        showLoadingModal("Registrando devolução...");

        await window.api.devolverEmprestimo(btn.dataset.id);

        hideLoadingModal();

        await carregarInadimplentes();

        await alertModal({
          title: "Sucesso",
          message: "Devolução registrada com sucesso.",
        });
      } catch (error) {
        hideLoadingModal();

        await alertModal({
          title: "Erro",
          message: error.message,
        });
      }
    });
  });
}

async function carregarInadimplentes() {
  const lista = await window.api.listarEmprestimosAtrasados();
  renderInadimplentes(lista ?? []);
}

btnAtualizarInadimplentes.addEventListener("click", async () => {
  try {
    await carregarInadimplentes();
  } catch (error) {
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

(async function init() {
  try {
    await carregarInadimplentes();
  } catch (error) {
    await alertModal({
      title: "Erro ao carregar inadimplentes",
      message: error.message,
    });
  }
})();
