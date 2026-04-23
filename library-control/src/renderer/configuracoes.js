document.getElementById("app").innerHTML = getLayout(
  "configuracoes",
  `
    <h2>Configurações</h2>
    <hr />

<h3>Relatórios</h3>

<div class="form-box">
  <button id="btnExportarAcervoCsv">Exportar Acervo (CSV)</button>
  <button id="btnExportarUsuariosCsv">Exportar Usuários (CSV)</button>
  <button id="btnExportarEmprestimosCsv">Exportar Empréstimos (CSV)</button>
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

    if (!confirmado) {
      return;
    }

    showLoadingModal("Restaurando backup...");

    const resultado = await window.api.restaurarBackup();

    hideLoadingModal();

    if (resultado?.canceled) {
      return;
    }

    await alertModal({
      title: "Sucesso",
      message:
        "Backup restaurado com sucesso.\n\nFeche e abra novamente a aplicação para recarregar os dados.",
    });
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
