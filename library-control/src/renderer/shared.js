function getLayout(active, content) {
  return `
    <div class="app">
      
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>📚 Library</h2>
        </div>

        <nav class="sidebar-nav">
          ${navLink("dashboard", "Dashboard", "dashboard")}
          ${navLink("usuarios", "Users", "users")}
          ${navLink("acervo", "Acervo", "books")}
          ${navLink("emprestimos", "Loans", "loans")}
          ${navLink("inadimplentes", "Inadimplentes", "alert")}
          ${navLink("configuracoes", "Settings", "settings")}
          ${navLink("creditos", "Credits", "user")}
        </nav>
      </aside>

      <!-- MAIN -->
      <main class="main">

        <!-- TOPBAR -->
        <header class="topbar">
          <input class="search" placeholder="Search users, books or loans..." />
          <div class="user">Admin</div>
        </header>

        <!-- CONTENT -->
        <section class="content">
          ${content}
        </section>

      </main>
    </div>
  `;
}

function navLink(page, label, icon) {
  const isDashboard = page === "dashboard";
  const href = isDashboard ? "./index.html" : `./${page}.html`;

  const path = location.pathname;
  const isActive = isDashboard
    ? path.includes("index.html") || path.endsWith("/")
    : path.includes(`${page}.html`);

  return `
    <a class="nav-item ${isActive ? "active" : ""}" href="${href}">
      <span>${label}</span>
    </a>
  `;
}

function setStatus(message, type = "") {
  const el = document.getElementById("status");
  if (!el) return;

  el.className = "status-box";
  if (type) {
    el.classList.add(`status-${type}`);
  }

  el.textContent = message;
}

function setBoxStatus(element, message, type = "") {
  if (!element) return;

  element.className = "status-box";
  if (type) {
    element.classList.add(`status-${type}`);
  }

  element.textContent = message;
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function ensureModalRoot() {
  let root = document.getElementById("modal-root");

  if (!root) {
    root = document.createElement("div");
    root.id = "modal-root";
    document.body.appendChild(root);
  }

  return root;
}

function closeModal() {
  const root = document.getElementById("modal-root");
  if (root) {
    root.innerHTML = "";
  }
}

function confirmModal({ title = "Confirmar", message = "Deseja continuar?" }) {
  return new Promise((resolve) => {
    const root = ensureModalRoot();

    root.innerHTML = `
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">${title}</div>
          <div class="modal-body modal-message">${message}</div>
          <div class="modal-actions">
            <button id="modal-cancelar" class="btn-secondary">Cancelar</button>
            <button id="modal-confirmar" class="btn-danger">Confirmar</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("modal-cancelar").addEventListener("click", () => {
      closeModal();
      resolve(false);
    });

    document.getElementById("modal-confirmar").addEventListener("click", () => {
      closeModal();
      resolve(true);
    });
  });
}

function alertModal({ title = "Aviso", message = "" }) {
  return new Promise((resolve) => {
    const root = ensureModalRoot();

    root.innerHTML = `
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">${title}</div>
          <div class="modal-body">${message}</div>
          <div class="modal-actions">
            <button id="modal-ok" class="btn-secondary">OK</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("modal-ok").addEventListener("click", () => {
      closeModal();
      resolve();
    });
  });
}

function showLoadingModal(message = "Processando...") {
  const root = ensureModalRoot();

  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal modal-loading">
        <div class="modal-body loading-body">
          <div class="spinner"></div>
          <div class="loading-text">${message}</div>
        </div>
      </div>
    </div>
  `;
}

function escolherItemModal({
  title = "Selecionar item",
  placeholder = "Buscar...",
  items = [],
  getLabel = (item) => String(item),
  renderItem = null,
}) {
  return new Promise((resolve) => {
    const root = ensureModalRoot();

    const renderItems = (lista) => `
      <div class="modal-lista">
        ${
          lista.length
            ? lista
                .map(
                  (item, index) => `
              <button class="modal-lista-item" data-index="${index}">
                ${
                  renderItem ? renderItem(item) : `<div>${getLabel(item)}</div>`
                }
              </button>
            `,
                )
                .join("")
            : `<div class="modal-lista-vazia">Nenhum resultado encontrado.</div>`
        }
      </div>
    `;

    root.innerHTML = `
      <div class="modal-overlay">
        <div class="modal modal-selecao">
          <div class="modal-header">${title}</div>
          <div class="modal-body">
            <input id="modalBuscaItem" placeholder="${placeholder}" />
            <div id="modalListaContainer">
              ${renderItems(items)}
            </div>
          </div>
          <div class="modal-actions">
            <button id="modal-cancelar-selecao" class="btn-secondary">Cancelar</button>
          </div>
        </div>
      </div>
    `;

    const input = document.getElementById("modalBuscaItem");
    const listaContainer = document.getElementById("modalListaContainer");
    let listaAtual = [...items];

    function bindLista() {
      listaContainer.querySelectorAll(".modal-lista-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = listaAtual[Number(btn.dataset.index)];
          closeModal();
          resolve(item);
        });
      });
    }

    input.addEventListener("input", () => {
      const termo = input.value.trim().toLowerCase();

      listaAtual = items.filter((item) =>
        getLabel(item).toLowerCase().includes(termo),
      );

      listaContainer.innerHTML = renderItems(listaAtual);
      bindLista();
    });

    document
      .getElementById("modal-cancelar-selecao")
      .addEventListener("click", () => {
        closeModal();
        resolve(null);
      });

    bindLista();
    input.focus();
  });
}

function detalhesModal({ title = "Detalhes", content = "" }) {
  return new Promise((resolve) => {
    const root = ensureModalRoot();

    root.innerHTML = `
      <div class="modal-overlay">
        <div class="modal modal-detalhes">
          <div class="modal-header">${title}</div>
          <div class="modal-body">
            ${content}
          </div>
          <div class="modal-actions">
            <button id="modal-fechar-detalhes" class="btn-secondary">Fechar</button>
          </div>
        </div>
      </div>
    `;

    document
      .getElementById("modal-fechar-detalhes")
      .addEventListener("click", () => {
        closeModal();
        resolve();
      });
  });
}

function formatarDataPtBr(data) {
  if (!data) return "-";

  const partes = String(data).split("-");
  if (partes.length !== 3) return data;

  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

function getStatusHistorico(item) {
  const devolvido = normalizarTexto(item.devolvido).includes("sim");

  if (devolvido) {
    return "Devolvido";
  }

  const hoje = new Date();
  const hojeLocal = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
  );

  const [ano, mes, dia] = String(item.data_devolucao).split("-").map(Number);
  const devolucao = new Date(ano, mes - 1, dia);

  if (devolucao < hojeLocal) {
    return "Atrasado";
  }

  return "Ativo";
}

function renderHistoricoTabela(lista, tipo = "usuario") {
  if (!lista.length) {
    return `<p class="detalhes-sub">Nenhum empréstimo encontrado.</p>`;
  }

  return `
    <table>
      <tr>
        <th>${tipo === "usuario" ? "Livro" : "Usuário"}</th>
        <th>Empréstimo</th>
        <th>Prevista</th>
        <th>Status</th>
        <th>Entregue</th>
      </tr>
      ${lista
        .map((item) => {
          const status = getStatusHistorico(item);

          return `
            <tr>
              <td>${tipo === "usuario" ? (item.livro ?? "") : (item.usuario ?? "")}</td>
              <td>${formatarDataPtBr(item.data_atual)}</td>
              <td>${formatarDataPtBr(item.data_devolucao)}</td>
              <td>${status}</td>
              <td>${formatarDataPtBr(item.data_entregue)}</td>
            </tr>
          `;
        })
        .join("")}
    </table>
  `;
}
function updateLoadingModal(message = "Processando...") {
  const el = document.querySelector(".loading-text");
  if (el) {
    el.textContent = message;
  }
}

function getCapaLivroUrl(nomeArquivo) {
  if (!nomeArquivo) return "";
  return `livro-img://livros/${encodeURIComponent(nomeArquivo)}`;
}

function hideLoadingModal() {
  closeModal();
}
