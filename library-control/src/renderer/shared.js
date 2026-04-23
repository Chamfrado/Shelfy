function getLayout(activePage, contentHtml) {
  const isActive = (page) => (page === activePage ? "active" : "");

  return `
    <div class="layout">
      <aside class="sidebar">
        <h1>Bibliotecário</h1>
        <a class="nav-link ${isActive("dashboard")}" href="./index.html">Dashboard</a>
        <a class="nav-link ${isActive("acervo")}" href="./acervo.html">Acervo</a>
        <a class="nav-link ${isActive("usuarios")}" href="./usuarios.html">Usuários</a>
        <a class="nav-link ${isActive("emprestimos")}" href="./emprestimos.html">Empréstimos</a>
      </aside>

      <main class="content">
        <p id="status" class="status-box"></p>
        ${contentHtml}
      </main>
    </div>
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
          <div class="modal-body">${message}</div>
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

function hideLoadingModal() {
  closeModal();
}
