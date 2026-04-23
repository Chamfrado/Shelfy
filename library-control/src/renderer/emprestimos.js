document.getElementById("app").innerHTML = getLayout(
  "emprestimos",
  `
    <h2>Criar empréstimo</h2>

    <div class="form-box">
      <label>Usuário</label>
      <div class="acoes-formulario">
        <button id="btnSelecionarUsuario" type="button">Pesquisar usuário</button>
      </div>
      <div id="usuarioSelecionadoCard" class="selecionado-card vazio">
        Nenhum usuário selecionado
      </div>

      <label>Livro</label>
      <div class="acoes-formulario">
        <button id="btnSelecionarLivro" type="button">Pesquisar livro</button>
      </div>
      <div id="livroSelecionadoCard" class="selecionado-card vazio">
        Nenhum livro selecionado
      </div>

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

    <div id="resultadoEmprestimos"></div>
  `,
);

const inputDias = document.getElementById("inputDias");
const btnCriarEmprestimo = document.getElementById("btnCriarEmprestimo");
const statusEmprestimo = document.getElementById("statusEmprestimo");
const resultadoEmprestimosEl = document.getElementById("resultadoEmprestimos");
const inputBuscaEmprestimo = document.getElementById("buscaEmprestimo");
const filtroStatusEmprestimo = document.getElementById(
  "filtroStatusEmprestimo",
);
const btnBuscarEmprestimos = document.getElementById("btnBuscarEmprestimos");

const btnSelecionarUsuario = document.getElementById("btnSelecionarUsuario");
const btnSelecionarLivro = document.getElementById("btnSelecionarLivro");
const usuarioSelecionadoCard = document.getElementById(
  "usuarioSelecionadoCard",
);
const livroSelecionadoCard = document.getElementById("livroSelecionadoCard");

let usuarioSelecionado = null;
let livroSelecionado = null;

function formatarDataPtBr(data) {
  if (!data) return "";

  const [ano, mes, dia] = String(data).split("-");
  if (!ano || !mes || !dia) return data;

  return `${dia}/${mes}/${ano}`;
}

function diferencaDias(dataAlvo) {
  if (!dataAlvo) return null;

  const hoje = new Date();
  const hojeLocal = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
  );

  const [ano, mes, dia] = String(dataAlvo).split("-").map(Number);
  const alvoLocal = new Date(ano, mes - 1, dia);

  const diffMs = alvoLocal - hojeLocal;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function getInfoEmprestimo(e) {
  const jaDevolvido = normalizarTexto(e.devolvido).includes("sim");

  if (jaDevolvido) {
    return {
      status: "Devolvido",
      prazoTexto: "devolvido",
      classeLinha: "status-devolvido",
      classeBadge: "badge-devolvido",
      jaDevolvido: true,
    };
  }

  const dias = diferencaDias(e.data_devolucao);

  if (dias === null) {
    return {
      status: "Ativo",
      prazoTexto: "-",
      classeLinha: "status-ativo",
      classeBadge: "badge-ativo",
      jaDevolvido: false,
    };
  }

  if (dias < 0) {
    const atraso = Math.abs(dias);
    return {
      status: "Atrasado",
      prazoTexto: `${atraso} dia${atraso === 1 ? "" : "s"} de atraso`,
      classeLinha: "status-atrasado",
      classeBadge: "badge-atrasado",
      jaDevolvido: false,
    };
  }

  if (dias === 0) {
    return {
      status: "Vence hoje",
      prazoTexto: "vence hoje",
      classeLinha: "status-vencendo",
      classeBadge: "badge-vencendo",
      jaDevolvido: false,
    };
  }

  if (dias === 1) {
    return {
      status: "Vence amanhã",
      prazoTexto: "vence amanhã",
      classeLinha: "status-vencendo",
      classeBadge: "badge-vencendo",
      jaDevolvido: false,
    };
  }

  return {
    status: "Ativo",
    prazoTexto: `${dias} dia${dias === 1 ? "" : "s"} restante${dias === 1 ? "" : "s"}`,
    classeLinha: "status-ativo",
    classeBadge: "badge-ativo",
    jaDevolvido: false,
  };
}

function renderUsuarioSelecionado() {
  if (!usuarioSelecionado) {
    usuarioSelecionadoCard.className = "selecionado-card vazio";
    usuarioSelecionadoCard.innerHTML = "Nenhum usuário selecionado";
    return;
  }

  const comAtraso = Number(usuarioSelecionado.emprestimos_atrasados ?? 0) > 0;

  usuarioSelecionadoCard.className = `selecionado-card ${comAtraso ? "atrasado" : ""}`;
  usuarioSelecionadoCard.innerHTML = `
    <div>
      <strong>${usuarioSelecionado.nome ?? ""}</strong>
      ${comAtraso ? `<span class="badge-alerta">Com atraso</span>` : ""}
    </div>
    <div>Login: ${usuarioSelecionado.login ?? "-"}</div>
    <div>Nível: ${usuarioSelecionado.nivel ?? "-"}</div>
    <div>Turma: ${usuarioSelecionado.turma ?? "-"}</div>
    <div>Histórico: ${usuarioSelecionado.total_emprestimos ?? 0} empréstimo(s)</div>
    <div>Ativos: ${usuarioSelecionado.emprestimos_ativos ?? 0}</div>
    <div>Atrasados: ${usuarioSelecionado.emprestimos_atrasados ?? 0}</div>
  `;
}

function renderLivroSelecionado() {
  if (!livroSelecionado) {
    livroSelecionadoCard.className = "selecionado-card vazio";
    livroSelecionadoCard.innerHTML = "Nenhum livro selecionado";
    return;
  }

  livroSelecionadoCard.className = "selecionado-card";
  livroSelecionadoCard.innerHTML = `
    <div class="selecionado-card-livro">
      <div>
        ${
          livroSelecionado.capa
            ? `<img src="./assets/livros/${encodeURIComponent(livroSelecionado.capa)}" alt="Capa" class="selecionado-capa" />`
            : `<div class="selecionado-capa sem-capa">Sem capa</div>`
        }
      </div>
      <div>
        <div><strong>${livroSelecionado.titulo ?? ""}</strong></div>
        <div>Autor: ${livroSelecionado.autor ?? "-"}</div>
        <div>Disponível: ${livroSelecionado.quantidade ?? 0}</div>
        <div>Total emprestado: ${livroSelecionado.total_emprestimos ?? 0}</div>
        <div>Ativos agora: ${livroSelecionado.emprestimos_ativos ?? 0}</div>
      </div>
    </div>
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
        <th>Prazo</th>
        <th>Ação</th>
      </tr>
      ${lista
        .map((e) => {
          const info = getInfoEmprestimo(e);

          return `
          <tr class="${info.classeLinha}">
            <td>${e.usuario ?? ""}</td>
            <td>${e.livro ?? ""}</td>
            <td>${formatarDataPtBr(e.data_atual)}</td>
            <td>${formatarDataPtBr(e.data_devolucao)}</td>
            <td>
              <span class="badge-status ${info.classeBadge}">
                ${info.status}
              </span>
            </td>
            <td>${info.prazoTexto}</td>
            <td>
              ${
                info.jaDevolvido
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
        const emprestimoId = botao.dataset.id;
        const emprestimo = lista.find(
          (item) => String(item.id) === String(emprestimoId),
        );

        const confirmado = await confirmModal({
          title: "Registrar devolução",
          message: emprestimo
            ? `Deseja registrar a devolução do livro "${emprestimo.livro ?? ""}" para o usuário "${emprestimo.usuario ?? ""}"?`
            : "Deseja registrar esta devolução?",
        });

        if (!confirmado) return;

        showLoadingModal("Registrando devolução...");

        await window.api.devolverEmprestimo(emprestimoId);

        hideLoadingModal();

        await buscarEmprestimosTela();

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

async function selecionarUsuario() {
  const usuarios = await window.api.listarUsuariosComResumo();

  const escolhido = await escolherItemModal({
    title: "Selecionar usuário",
    placeholder: "Buscar por nome ou login...",
    items: usuarios,
    getLabel: (u) => `${u.nome ?? ""} ${u.login ?? ""}`,
    renderItem: (u) => `
  <div class="modal-item-card ${Number(u.emprestimos_atrasados ?? 0) > 0 ? "atrasado" : ""}">
    <div class="modal-item-title">
      ${u.nome ?? ""}
      ${
        Number(u.emprestimos_atrasados ?? 0) > 0
          ? `<span class="badge-alerta">Com atraso</span>`
          : ""
      }
    </div>
      <div class="modal-item-sub">Login: ${u.login ?? "-"}</div>
      <div class="modal-item-sub">Nível: ${u.nivel ?? "-"}</div>
      <div class="modal-item-sub">Turma: ${u.turma ?? "-"}</div>
      <div class="modal-item-sub">Histórico: ${u.total_emprestimos ?? 0} empréstimo(s)</div>
      <div class="modal-item-sub">Ativos: ${u.emprestimos_ativos ?? 0}</div>
      <div class="modal-item-sub">Atrasados: ${u.emprestimos_atrasados ?? 0}</div>
    </div>
`,
  });

  if (!escolhido) return;

  usuarioSelecionado = escolhido;
  renderUsuarioSelecionado();
}
async function selecionarLivro() {
  const livros = await window.api.listarAcervoComResumo();

  const disponiveis = livros.filter(
    (livro) => Number(livro.quantidade ?? 0) > 0,
  );

  const escolhido = await escolherItemModal({
    title: "Selecionar livro",
    placeholder: "Buscar por título ou autor...",
    items: disponiveis,
    getLabel: (l) => `${l.titulo ?? ""} ${l.autor ?? ""}`,
    renderItem: (l) => `
      <div class="modal-item-livro">
        <div>
          ${
            l.capa
              ? `<img src="./assets/livros/${encodeURIComponent(l.capa)}" alt="Capa" class="modal-item-capa" />`
              : `<div class="modal-item-capa sem-capa">Sem capa</div>`
          }
        </div>
        <div class="modal-item-card">
          <div class="modal-item-title">${l.titulo ?? ""}</div>
          <div class="modal-item-sub">Autor: ${l.autor ?? "-"}</div>
          <div class="modal-item-sub">Disponível: ${l.quantidade ?? 0}</div>
          <div class="modal-item-sub">Total emprestado: ${l.total_emprestimos ?? 0}</div>
          <div class="modal-item-sub">Ativos agora: ${l.emprestimos_ativos ?? 0}</div>
        </div>
      </div>
    `,
  });

  if (!escolhido) return;

  livroSelecionado = escolhido;
  renderLivroSelecionado();
}

btnSelecionarUsuario.addEventListener("click", async () => {
  try {
    await selecionarUsuario();
  } catch (error) {
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnSelecionarLivro.addEventListener("click", async () => {
  try {
    await selecionarLivro();
  } catch (error) {
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnCriarEmprestimo.addEventListener("click", async () => {
  try {
    const userId = usuarioSelecionado?.id;
    const acervoId = livroSelecionado?.id;
    const totalDias = inputDias.value;

    if (!userId) {
      await alertModal({
        title: "Validação",
        message: "Selecione um usuário.",
      });
      return;
    }

    if (!acervoId) {
      await alertModal({
        title: "Validação",
        message: "Selecione um livro.",
      });
      return;
    }

    if (!totalDias || Number(totalDias) < 1) {
      await alertModal({
        title: "Validação",
        message: "Informe uma quantidade de dias válida.",
      });
      return;
    }

    if (Number(usuarioSelecionado?.emprestimos_atrasados ?? 0) > 0) {
      await alertModal({
        title: "Empréstimo bloqueado",
        message:
          "Este usuário possui empréstimo(s) em atraso. Regularize a pendência antes de criar um novo empréstimo.",
      });
      return;
    }
    const confirmado = await confirmModal({
      title: "Criar empréstimo",
      message: `Deseja criar o empréstimo do livro "${livroSelecionado?.titulo ?? ""}" para o usuário "${usuarioSelecionado?.nome ?? ""}" por ${totalDias} dia(s)?`,
    });

    if (!confirmado) return;

    showLoadingModal("Criando empréstimo...");

    await window.api.criarEmprestimo({
      userId,
      acervoId,
      totalDias,
    });

    hideLoadingModal();

    usuarioSelecionado = null;
    livroSelecionado = null;
    renderUsuarioSelecionado();
    renderLivroSelecionado();
    inputDias.value = 7;

    await buscarEmprestimosTela();

    await alertModal({
      title: "Sucesso",
      message: "Empréstimo criado com sucesso.",
    });
  } catch (error) {
    hideLoadingModal();

    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnBuscarEmprestimos.addEventListener("click", async () => {
  try {
    await buscarEmprestimosTela();
  } catch (error) {
    await alertModal({
      title: "Erro",
      message: error.message,
    });
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
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

(async function init() {
  try {
    setStatus("Carregando empréstimos...");
    await buscarEmprestimosTela();
    renderUsuarioSelecionado();
    renderLivroSelecionado();
    setStatus("");
  } catch (error) {
    setStatus(`Erro ao carregar empréstimos: ${error.message}`, "error");
  }
})();
