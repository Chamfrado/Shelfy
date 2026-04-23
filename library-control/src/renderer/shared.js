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

function setStatus(message) {
  const el = document.getElementById("status");
  if (el) el.textContent = message;
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
