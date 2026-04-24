document.getElementById("app").innerHTML = getLayout(
  "creditos",
  `
    <div class="page-header">
      <div>
        <h1>Créditos</h1>
        <p>Informações sobre o desenvolvimento do sistema.</p>
      </div>
    </div>

    <section class="creditos-grid">
      <div class="panel creditos-panel">
        <div class="creditos-header">
          <div class="creditos-avatar">LC</div>

          <div>
            <h2>Lohran Cintra da Silva</h2>
            <span class="creditos-role">Desenvolvedor</span>
          </div>
        </div>

        <div class="creditos-info">
          <div>
            <span>Apelido</span>
            <strong>chamfrado</strong>
          </div>

          <div>
            <span>Empresa</span>
            <strong>Chamfrado's Solutions</strong>
          </div>
        </div>

        <div class="creditos-links">
          <button id="linkLinkedin" class="btn-primary">
            LinkedIn
          </button>

          <button id="linkGithub" class="btn-light">
            GitHub
          </button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2>Sobre o sistema</h2>
            <p>Aplicação desktop para gerenciamento de biblioteca.</p>
          </div>
        </div>

        <div class="creditos-about">
          <p>
            O <strong>Bibliotecário Desktop</strong> foi desenvolvido para facilitar o controle de acervo,
            empréstimos e usuários em ambientes escolares.
          </p>

          <p>
            O sistema foi projetado com foco em simplicidade, velocidade e operação offline,
            utilizando tecnologias modernas como Electron e SQLite.
          </p>
        </div>
      </div>
    </section>
  `,
);

document.getElementById("linkLinkedin").addEventListener("click", (e) => {
  e.preventDefault();
  window.api.abrirLinkExterno("https://www.linkedin.com/in/lohrancintra");
});

document.getElementById("linkGithub").addEventListener("click", (e) => {
  e.preventDefault();
  window.api.abrirLinkExterno("https://github.com/Chamfrado");
});
