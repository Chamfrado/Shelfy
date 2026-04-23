document.getElementById("app").innerHTML = getLayout(
  "configuracoes",
  `
    <h2>Configurações</h2>
    <hr />



<h3>Modelos e Importação</h3>

<h4>Modelos para importação</h4>
<div class="form-box">
  <button id="btnBaixarModeloAcervo">Baixar modelo de Acervo (CSV)</button>
  <button id="btnBaixarModeloUsuarios">Baixar modelo de Usuários (CSV)</button>
</div>

<h4>Importar usuários</h4>
<div class="form-box">
  <button id="btnImportarUsuariosCsv">Importar Usuários (CSV)</button>
  <button id="btnImportarAcervoCsv">Importar Acervo (CSV)</button>
</div>




<hr />

<h3>Relatórios</h3>

<div class="form-box">
  <button id="btnExportarAcervoCsv">Exportar Acervo (CSV)</button>
  <button id="btnExportarUsuariosCsv">Exportar Usuários (CSV)</button>
  <button id="btnExportarEmprestimosCsv">Exportar Empréstimos (CSV)</button>
  <button id="btnExportarEmprestimosPdf">Exportar Empréstimos (PDF)</button>
</div>
  <hr />
    <h3>Backup do banco de dados</h3>
    <div class="form-box">
      <button id="btnFazerBackup">Fazer backup do banco</button>
      <button id="btnRestaurarBackup">Restaurar backup</button>
    </div>

    <div class="status-box">
      <p>
        Use <strong>Fazer backup</strong> para salvar uma cópia do banco atual.
      </p>
      <p>
        Use <strong>Restaurar backup</strong> para substituir o banco atual por um arquivo de backup.
      </p>
    </div>
  `,
);

const btnFazerBackup = document.getElementById("btnFazerBackup");
const btnRestaurarBackup = document.getElementById("btnRestaurarBackup");

const btnExportarAcervoCsv = document.getElementById("btnExportarAcervoCsv");
const btnExportarUsuariosCsv = document.getElementById(
  "btnExportarUsuariosCsv",
);
const btnExportarEmprestimosCsv = document.getElementById(
  "btnExportarEmprestimosCsv",
);
const btnExportarEmprestimosPdf = document.getElementById(
  "btnExportarEmprestimosPdf",
);

const btnBaixarModeloAcervo = document.getElementById("btnBaixarModeloAcervo");
const btnBaixarModeloUsuarios = document.getElementById(
  "btnBaixarModeloUsuarios",
);

const btnImportarUsuariosCsv = document.getElementById(
  "btnImportarUsuariosCsv",
);

const btnImportarAcervoCsv = document.getElementById("btnImportarAcervoCsv");

btnImportarAcervoCsv.addEventListener("click", async () => {
  try {
    const confirmado = await confirmModal({
      title: "Importar acervo",
      message:
        "Selecione um arquivo CSV no modelo correto. Itens com o mesmo título serão atualizados. Deseja continuar?",
    });

    if (!confirmado) return;

    showLoadingModal("Importando acervo...");

    const resultado = await window.api.importarAcervoCsv();

    hideLoadingModal();

    if (resultado?.canceled) return;

    await alertModal({
      title: "Importação concluída",
      message:
        `Registros identificados: ${resultado.total}\n\n` +
        `Criados: ${resultado.criados}\n` +
        `Atualizados: ${resultado.atualizados}\n` +
        `Ignorados: ${resultado.ignorados}`,
    });
  } catch (error) {
    hideLoadingModal();

    await alertModal({
      title: "Erro na importação",
      message: error.message,
    });
  }
});

btnImportarUsuariosCsv.addEventListener("click", async () => {
  try {
    const confirmado = await confirmModal({
      title: "Importar usuários",
      message:
        "Selecione um arquivo CSV no modelo correto. Usuários com o mesmo login serão atualizados. Deseja continuar?",
    });

    if (!confirmado) return;

    showLoadingModal("Importando usuários...");

    const resultado = await window.api.importarUsuariosCsv();

    hideLoadingModal();

    if (resultado?.canceled) return;

    await alertModal({
      title: "Importação concluída",
      message:
        `Registros identificados: ${resultado.total}\n\n` +
        `Criados: ${resultado.criados}\n` +
        `Atualizados: ${resultado.atualizados}\n` +
        `Ignorados: ${resultado.ignorados}`,
    });
  } catch (error) {
    hideLoadingModal();

    await alertModal({
      title: "Erro na importação",
      message: error.message,
    });
  }
});

btnBaixarModeloAcervo.addEventListener("click", async () => {
  try {
    showLoadingModal("Gerando modelo de acervo...");

    const resultado = await window.api.baixarModeloAcervo();

    hideLoadingModal();

    if (resultado?.canceled) return;

    await alertModal({
      title: "Sucesso",
      message: `Modelo de acervo salvo com sucesso.\n\nArquivo salvo em:\n${resultado.path}`,
    });
  } catch (error) {
    hideLoadingModal();

    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnBaixarModeloUsuarios.addEventListener("click", async () => {
  try {
    showLoadingModal("Gerando modelo de usuários...");

    const resultado = await window.api.baixarModeloUsuarios();

    hideLoadingModal();

    if (resultado?.canceled) return;

    await alertModal({
      title: "Sucesso",
      message: `Modelo de usuários salvo com sucesso.\n\nArquivo salvo em:\n${resultado.path}`,
    });
  } catch (error) {
    hideLoadingModal();

    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnFazerBackup.addEventListener("click", async () => {
  try {
    showLoadingModal("Gerando backup...");

    const resultado = await window.api.fazerBackup();

    hideLoadingModal();

    if (resultado?.canceled) {
      return;
    }

    await alertModal({
      title: "Sucesso",
      message: `Backup criado com sucesso.\n\nArquivo salvo em:\n${resultado.path}`,
    });
  } catch (error) {
    hideLoadingModal();

    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnRestaurarBackup.addEventListener("click", async () => {
  try {
    const confirmado = await confirmModal({
      title: "Restaurar backup",
      message:
        "Isso vai substituir o banco atual pelos dados do backup selecionado. Deseja continuar?",
    });

    if (!confirmado) return;

    showLoadingModal("Restaurando backup...");

    const resultado = await window.api.restaurarBackup();

    hideLoadingModal();

    if (resultado?.canceled) return;

    await alertModal({
      title: "Sucesso",
      message:
        "Backup restaurado com sucesso.\n\nA aplicação será reiniciada automaticamente.",
    });

    await window.api.reiniciarAplicacao();
  } catch (error) {
    hideLoadingModal();

    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnExportarAcervoCsv.addEventListener("click", async () => {
  try {
    showLoadingModal("Exportando acervo...");

    const resultado = await window.api.exportarAcervoCsv();

    hideLoadingModal();

    if (resultado?.canceled) return;

    await alertModal({
      title: "Sucesso",
      message: `Relatório de acervo exportado com sucesso.\n\nArquivo salvo em:\n${resultado.path}`,
    });
  } catch (error) {
    hideLoadingModal();
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnExportarUsuariosCsv.addEventListener("click", async () => {
  try {
    showLoadingModal("Exportando usuários...");

    const resultado = await window.api.exportarUsuariosCsv();

    hideLoadingModal();

    if (resultado?.canceled) return;

    await alertModal({
      title: "Sucesso",
      message: `Relatório de usuários exportado com sucesso.\n\nArquivo salvo em:\n${resultado.path}`,
    });
  } catch (error) {
    hideLoadingModal();
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnExportarEmprestimosCsv.addEventListener("click", async () => {
  try {
    showLoadingModal("Exportando empréstimos...");

    const resultado = await window.api.exportarEmprestimosCsv();

    hideLoadingModal();

    if (resultado?.canceled) return;

    await alertModal({
      title: "Sucesso",
      message: `Relatório de empréstimos exportado com sucesso.\n\nArquivo salvo em:\n${resultado.path}`,
    });
  } catch (error) {
    hideLoadingModal();
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnExportarEmprestimosPdf.addEventListener("click", async () => {
  try {
    showLoadingModal("Exportando empréstimos em PDF...");

    const resultado = await window.api.exportarEmprestimosPdf();

    hideLoadingModal();

    if (resultado?.canceled) return;

    await alertModal({
      title: "Sucesso",
      message: `Relatório em PDF exportado com sucesso.\n\nArquivo salvo em:\n${resultado.path}`,
    });
  } catch (error) {
    hideLoadingModal();

    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});
