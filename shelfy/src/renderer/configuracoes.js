document.getElementById("app").innerHTML = getLayout(
  "configuracoes",
  `
  <div class="page-header">
    <div>
      <h1>Configurações</h1>
      <p>Gerencie importações, relatórios e backups do sistema.</p>
    </div>
  </div>

  <section class="config-grid">

      <div class="panel">
      <div class="panel-header">
        <div>
          <h2>Instituição</h2>
          <p>Personalize o sistema com os dados da escola ou biblioteca.</p>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label for="configNome">Nome da instituição</label>
          <input id="configNome" placeholder="Ex.: Escola Estadual..." />
        </div>

        <div class="form-field">
          <label for="configCidade">Cidade</label>
          <input id="configCidade" placeholder="Cidade" />
        </div>

        <div class="form-field">
          <label for="configUf">UF</label>
          <input id="configUf" placeholder="MG" maxlength="2" />
        </div>

        <div class="cover-upload-card">
          <div>
            <h3>Logo da instituição</h3>
            <p>Selecione uma imagem PNG, JPG ou JPEG.</p>

            <div class="actions-row">
              <button id="btnSelecionarLogoInstituicao" type="button" class="btn-light">
                Selecionar logo
              </button>
              <span id="nomeLogoInstituicao" class="muted-text">Nenhuma logo</span>
            </div>
          </div>

          <div id="previewLogoInstituicaoWrapper" class="cover-preview-box hidden">
            <img id="previewLogoInstituicao" class="logo-preview" alt="Logo da instituição" />
          </div>
        </div>
        
      </div>

      <div class="actions-row">
        <button id="btnSalvarConfigInstituicao" class="btn-primary">
          Salvar personalização
        </button>
      </div>
    </div>

    <!-- IMPORTAÇÃO -->
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>Importação de dados</h2>
          <p>Importe usuários e acervo via CSV.</p>
        </div>
      </div>

      <div class="actions-grid">
        <button id="btnImportarUsuarios" class="btn-primary">
          Importar usuários
        </button>

        <button id="btnImportarAcervo" class="btn-primary">
          Importar acervo
        </button>

        <button id="btnModeloUsuarios" class="btn-light">
          Baixar modelo usuários
        </button>

        <button id="btnModeloAcervo" class="btn-light">
          Baixar modelo acervo
        </button>
      </div>
    </div>

    <!-- RELATÓRIOS -->
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>Relatórios</h2>
          <p>Exporte dados do sistema.</p>
        </div>
      </div>

      <div class="actions-grid">
        <button id="btnExportarAcervo" class="btn-light">
          Exportar acervo (CSV)
        </button>

        <button id="btnExportarUsuarios" class="btn-light">
          Exportar usuários (CSV)
        </button>

        <button id="btnExportarEmprestimos" class="btn-light">
          Exportar empréstimos (CSV)
        </button>

        <button id="btnExportarEmprestimosPdf" class="btn-primary">
          Gerar PDF de empréstimos
        </button>
      </div>
    </div>

    <!-- BACKUP -->
    <div class="panel danger-panel">
      <div class="panel-header">
        <div>
          <h2>Backup e restauração</h2>
          <p>Proteja e recupere seus dados.</p>
        </div>
      </div>

      <div class="actions-grid">
        <button id="btnBackup" class="btn-primary">
          Fazer backup manual
        </button>

        <button id="btnRestaurarBackup" class="btn-danger">
          Restaurar backup
        </button>

        <button id="btnAbrirBackups" class="btn-light">
          Abrir pasta de backups
        </button>
      </div>
    </div>

  </section>
`,
);

aplicarConfiguracaoInstituicao();

const btnFazerBackup = document.getElementById("btnBackup");
const btnRestaurarBackup = document.getElementById("btnRestaurarBackup");

const btnExportarAcervoCsv = document.getElementById("btnExportarAcervo");
const btnExportarUsuariosCsv = document.getElementById("btnExportarUsuarios");
const btnExportarEmprestimosCsv = document.getElementById(
  "btnExportarEmprestimos",
);
const btnExportarEmprestimosPdf = document.getElementById(
  "btnExportarEmprestimosPdf",
);

const btnBaixarModeloAcervo = document.getElementById("btnModeloAcervo");
const btnBaixarModeloUsuarios = document.getElementById("btnModeloUsuarios");

const btnImportarUsuariosCsv = document.getElementById("btnImportarUsuarios");
const btnImportarAcervoCsv = document.getElementById("btnImportarAcervo");

const btnAbrirBackups = document.getElementById("btnAbrirBackups");

const configNome = document.getElementById("configNome");
const configCidade = document.getElementById("configCidade");
const configUf = document.getElementById("configUf");
const btnSalvarConfigInstituicao = document.getElementById(
  "btnSalvarConfigInstituicao",
);

const btnSelecionarLogoInstituicao = document.getElementById(
  "btnSelecionarLogoInstituicao",
);
const nomeLogoInstituicao = document.getElementById("nomeLogoInstituicao");
const previewLogoInstituicaoWrapper = document.getElementById(
  "previewLogoInstituicaoWrapper",
);
const previewLogoInstituicao = document.getElementById(
  "previewLogoInstituicao",
);

let logoInstituicaoSelecionada = null;
let logoInstituicaoAtual = null;

async function carregarConfigInstituicao() {
  try {
    const config = await window.api.obterConfiguracao();

    configNome.value = config?.nome || "";
    configCidade.value = config?.cidade || "";
    configUf.value = config?.uf || "";

    logoInstituicaoAtual = config?.logo || null;
    logoInstituicaoSelecionada = null;

    if (logoInstituicaoAtual) {
      nomeLogoInstituicao.textContent = logoInstituicaoAtual;
      previewLogoInstituicao.src = getLogoInstituicaoUrl(logoInstituicaoAtual);
      previewLogoInstituicaoWrapper.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Erro ao carregar configuração:", error);
  }
}

btnSelecionarLogoInstituicao.addEventListener("click", async () => {
  try {
    const caminho = await window.api.selecionarLogoInstituicao();

    if (!caminho) return;

    const nomeArquivo = await window.api.uploadLogoInstituicao(caminho);

    logoInstituicaoSelecionada = nomeArquivo;
    nomeLogoInstituicao.textContent = nomeArquivo;

    previewLogoInstituicao.src = getLogoInstituicaoUrl(nomeArquivo);
    previewLogoInstituicaoWrapper.classList.remove("hidden");
  } catch (error) {
    await alertModal({
      title: "Erro ao selecionar logo",
      message: error.message,
    });
  }
});

btnSalvarConfigInstituicao.addEventListener("click", async () => {
  try {
    showLoadingModal("Salvando personalização...");

    await window.api.salvarConfiguracao({
      nome: configNome.value.trim(),
      cidade: configCidade.value.trim(),
      uf: configUf.value.trim().toUpperCase(),
      nome_sistema: "Shelfy",
      logo: logoInstituicaoSelecionada || logoInstituicaoAtual || null,
    });

    hideLoadingModal();

    await aplicarConfiguracaoInstituicao();

    await alertModal({
      title: "Personalização salva",
      message: "Os dados da instituição foram atualizados com sucesso.",
    });
  } catch (error) {
    hideLoadingModal();

    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

carregarConfigInstituicao();

window.api.onImportProgress(({ tipo, atual, total }) => {
  const percentual = total > 0 ? Math.round((atual / total) * 100) : 0;

  const nome = tipo === "acervo" ? "acervo" : "usuários";

  updateLoadingModal(
    `Importando ${nome}...\n${percentual}% — ${atual} de ${total}`,
  );
});

btnAbrirBackups.addEventListener("click", async () => {
  try {
    await window.api.abrirPastaBackups();
  } catch (error) {
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnImportarAcervoCsv.addEventListener("click", async () => {
  try {
    showLoadingModal("Importando acervo...\n0% — 0 de 0");

    const preview = await window.api.previewImportarAcervoCsv();

    hideLoadingModal();

    if (preview?.canceled) return;

    const confirmado = await confirmModal({
      title: "Confirmar importação de acervo",
      message: `Registros identificados: ${preview.total}

                Serão criados: ${preview.criados}
                Serão atualizados: ${preview.atualizados}
                Serão ignorados: ${preview.ignorados}

                Deseja continuar?`,
    });

    if (!confirmado) return;

    showLoadingModal("Importando acervo...");

    const resultado = await window.api.confirmarImportarAcervoCsv();

    hideLoadingModal();

    if (resultado.erros?.length) {
      const exportar = await confirmModal({
        title: "Importação concluída com erros",
        message:
          `Registros identificados: ${resultado.total}\n\n` +
          `Criados: ${resultado.criados}\n` +
          `Atualizados: ${resultado.atualizados}\n` +
          `Ignorados: ${resultado.ignorados}\n\n` +
          `Foram encontrados ${resultado.erros.length} erros.\n\n` +
          `Deseja exportar os erros para CSV?`,
      });

      if (exportar) {
        const res = await window.api.exportarErrosImportacao(resultado.erros);

        if (!res?.canceled) {
          await alertModal({
            title: "Arquivo gerado",
            message: `Erros exportados com sucesso em:\n${res.path}`,
          });
        }
      }
    } else {
      await alertModal({
        title: "Importação concluída",
        message:
          `Registros identificados: ${resultado.total}\n\n` +
          `Criados: ${resultado.criados}\n` +
          `Atualizados: ${resultado.atualizados}\n` +
          `Ignorados: ${resultado.ignorados}`,
      });
    }
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
    showLoadingModal("Importando usuários...\n0% — 0 de 0");

    const preview = await window.api.previewImportarUsuariosCsv();

    hideLoadingModal();

    if (preview?.canceled) return;

    const confirmado = await confirmModal({
      title: "Confirmar importação de usuários",
      message:
        `Registros identificados: ${preview.total}\n\n` +
        `Serão criados: ${preview.criados}\n` +
        `Serão atualizados: ${preview.atualizados}\n` +
        `Serão ignorados: ${preview.ignorados}\n\n` +
        `Deseja continuar?`,
    });

    if (!confirmado) return;

    showLoadingModal("Importando usuários...");

    const resultado = await window.api.confirmarImportarUsuariosCsv();

    hideLoadingModal();

    if (resultado.erros?.length) {
      const exportar = await confirmModal({
        title: "Importação concluída com erros",
        message:
          `Registros identificados: ${resultado.total}\n\n` +
          `Criados: ${resultado.criados}\n` +
          `Atualizados: ${resultado.atualizados}\n` +
          `Ignorados: ${resultado.ignorados}\n\n` +
          `Foram encontrados ${resultado.erros.length} erros.\n\n` +
          `Deseja exportar os erros para CSV?`,
      });

      if (exportar) {
        const res = await window.api.exportarErrosImportacao(resultado.erros);

        if (!res?.canceled) {
          await alertModal({
            title: "Arquivo gerado",
            message: `Erros exportados com sucesso em:\n${res.path}`,
          });
        }
      }
    } else {
      await alertModal({
        title: "Importação concluída",
        message:
          `Registros identificados: ${resultado.total}\n\n` +
          `Criados: ${resultado.criados}\n` +
          `Atualizados: ${resultado.atualizados}\n` +
          `Ignorados: ${resultado.ignorados}`,
      });
    }
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
