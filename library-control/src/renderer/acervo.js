document.getElementById("app").innerHTML = getLayout(
  "acervo",
  `
  <div class="page-header">
    <div>
      <h1>Acervo</h1>
      <p>Cadastre, edite e acompanhe os itens da biblioteca.</p>
    </div>
  </div>

  <section class="page-grid">
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2 id="tituloFormularioLivro">Cadastrar livro</h2>
          <p>Preencha as informações do item do acervo.</p>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label for="livroTitulo">Título</label>
          <input id="livroTitulo" placeholder="Título do livro" />
        </div>

        <div class="form-field">
          <label for="livroAutor">Autor</label>
          <input id="livroAutor" placeholder="Autor" />
        </div>

        <div class="form-field">
          <label for="livroEditora">Editora</label>
          <input id="livroEditora" placeholder="Editora" />
        </div>

        <div class="form-field">
          <label for="livroIsbn">ISBN</label>
          <input id="livroIsbn" placeholder="ISBN" />
        </div>

        <div class="form-field">
          <label for="livroQuantidade">Quantidade</label>
          <input id="livroQuantidade" type="number" placeholder="Quantidade" min="0" />
        </div>

        <div class="form-field">
          <label for="livroCategoria">Categoria</label>
          <select id="livroCategoria">
            <option value="">Selecione uma categoria</option>
          </select>
        </div>

        <div class="form-field">
          <label for="livroTipo">Tipo de acervo</label>
          <select id="livroTipo">
            <option value="">Selecione um tipo</option>
          </select>
        </div>
      </div>

      <div class="cover-upload-card">
        <div>
          <h3>Capa do livro</h3>
          <p>Selecione uma imagem JPG, JPEG ou PNG para representar o item.</p>

          <div class="actions-row">
            <button id="btnSelecionarImagem" type="button" class="btn-light">
              Selecionar imagem
            </button>
            <span id="nomeImagemSelecionada" class="muted-text">Nenhuma imagem</span>
          </div>
        </div>

        <div id="previewImagemWrapper" class="cover-preview-box hidden">
          <img id="previewImagemLivro" class="capa-preview" alt="Pré-visualização da capa" />
        </div>
      </div>

      <div class="actions-row">
        <button id="btnCriarLivro" class="btn-primary">Salvar livro</button>
        <button id="btnCancelarEdicaoLivro" type="button" class="btn-secondary hidden">Cancelar edição</button>
        <button id="btnLimparLivro" type="button" class="btn-light">Limpar</button>
      </div>

      <div id="statusLivro" class="status-box"></div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>Buscar no acervo</h2>
          <p>Pesquise por título ou autor.</p>
        </div>
      </div>

      <div class="toolbar modern-toolbar">
        <input id="busca" placeholder="Buscar por título ou autor..." />
        <button id="btnBuscar" class="btn-primary">Buscar</button>
      </div>

      <div id="resultado"></div>
    </div>
  </section>
`,
);

const resultadoEl = document.getElementById("resultado");
const tituloFormularioLivro = document.getElementById("tituloFormularioLivro");
const inputBusca = document.getElementById("busca");
const btnBuscar = document.getElementById("btnBuscar");

const livroTitulo = document.getElementById("livroTitulo");
const livroAutor = document.getElementById("livroAutor");
const livroEditora = document.getElementById("livroEditora");
const livroIsbn = document.getElementById("livroIsbn");
const livroQuantidade = document.getElementById("livroQuantidade");
const livroCategoria = document.getElementById("livroCategoria");
const btnSelecionarImagem = document.getElementById("btnSelecionarImagem");
const nomeImagemSelecionada = document.getElementById("nomeImagemSelecionada");
const btnCriarLivro = document.getElementById("btnCriarLivro");
const statusLivro = document.getElementById("statusLivro");

const livroTipo = document.getElementById("livroTipo");

const btnCancelarEdicaoLivro = document.getElementById(
  "btnCancelarEdicaoLivro",
);
const btnLimparLivro = document.getElementById("btnLimparLivro");

let listaAcervoAtual = [];

let caminhoImagemSelecionada = null;
let livroEmEdicaoId = null;

const previewImagemWrapper = document.getElementById("previewImagemWrapper");
const previewImagemLivro = document.getElementById("previewImagemLivro");

function limparFormulario() {
  livroTitulo.value = "";
  livroAutor.value = "";
  livroEditora.value = "";
  livroIsbn.value = "";
  livroQuantidade.value = "";
  livroCategoria.value = "";
  livroTipo.value = "";
  caminhoImagemSelecionada = null;
  nomeImagemSelecionada.textContent = "Nenhuma imagem";
  livroEmEdicaoId = null;

  esconderPreviewImagem();

  atualizarEstadoEdicaoLivro();

  statusLivro.className = "status-box";
  statusLivro.textContent = "";
}

function renderStatusAcervo(qtd) {
  if (qtd <= 0) {
    return `<span class="badge-status badge-atrasado">Indisponível</span>`;
  }

  if (qtd === 1) {
    return `<span class="badge-status badge-vencendo">Última unidade</span>`;
  }

  return `<span class="badge-status badge-devolvido">Disponível</span>`;
}

function renderAcervo(lista) {
  resultadoEl.innerHTML = `
    <h2>Acervo - Total: ${lista.length}</h2>
   <div class="table-wrapper">
<table class="modern-table">
      <tr>
        <th>Capa</th>
        <th>Título</th>
        <th>Autor</th>
        <th>Editora</th>
        <th>Categoria</th>
        <th>Tipo</th>
        <th>Qtd</th>
        <th>Status</th>
        <th>Ações</th>
      </tr>
      ${lista
        .map((l) => {
          const qtd = Number(l.quantidade ?? 0);
          const status = qtd > 0 ? "Disponível" : "Indisponível";

          return `
          <tr>
            <td>
              ${
                l.capa
                  ? `<img src="${getCapaLivroUrl(l.capa)}" alt="Capa" class="capa-livro" />`
                  : "-"
              }
            </td>
            <td>${l.titulo ?? ""}</td>
            <td>${l.autor ?? ""}</td>
            <td>${l.editora ?? ""}</td>
            <td>${l.categoria_nome ?? l.categoria ?? "-"}</td>
            <td>${l.tipo_nome ?? l.tipo ?? "-"}</td>
            <td>${qtd}</td>
            <td>${renderStatusAcervo(qtd)}</td>
            <td>
              <div class="table-actions">
                <button class="btn-light btn-historico-livro" data-id="${l.id}">Histórico</button>
                <button class="btn-light btn-editar" data-id="${l.id}">Editar</button>
                <button class="btn-danger btn-excluir" data-id="${l.id}">Excluir</button>
              </div>
            </td>
          </tr>
        `;
        })
        .join("")}
    </table>
</div>
  `;

  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const livro = lista.find((l) => String(l.id) === String(btn.dataset.id));
      if (!livro) return;

      livroEmEdicaoId = livro.id;
      livroTitulo.value = livro.titulo ?? "";
      livroAutor.value = livro.autor ?? "";
      livroEditora.value = livro.editora ?? "";
      livroIsbn.value = livro.isbn ?? "";
      livroQuantidade.value = livro.quantidade ?? "";
      livroCategoria.value = livro.categoria ?? "";
      livroTipo.value = livro.tipo ?? "";
      nomeImagemSelecionada.textContent = livro.capa || "Nenhuma imagem";
      if (livro.capa) {
        mostrarPreviewImagem(getCapaLivroUrl(livro.capa));
      } else {
        esconderPreviewImagem();
      }
      atualizarEstadoEdicaoLivro();
      setBoxStatus(statusLivro, "Modo edição ativado.", "info");

      renderAcervo([livro]);
    });
  });

  document.querySelectorAll(".btn-historico-livro").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        const livros = await window.api.listarAcervoComResumo();
        const livro = livros.find(
          (l) => String(l.id) === String(btn.dataset.id),
        );

        if (!livro) {
          await alertModal({
            title: "Erro",
            message: "Livro não encontrado.",
          });
          return;
        }
        const historico = await window.api.listarHistoricoLivro(livro.id);
        await detalhesModal({
          title: "Histórico do item do acervo",
          content: `
                  <div class="detalhes-grid">
                    <div>
                      ${
                        livro.capa
                          ? `<img src="./assets/livros/${encodeURIComponent(livro.capa)}" alt="Capa" class="detalhes-capa" />`
                          : `<div class="detalhes-capa sem-capa">Sem capa</div>`
                      }
                    </div>
                    <div class="detalhes-bloco">
                      <div class="detalhes-titulo">${livro.titulo ?? ""}</div>
                      <div class="detalhes-sub">Autor: ${livro.autor ?? "-"}</div>
                      <div class="detalhes-sub">Editora: ${livro.editora ?? "-"}</div>
                      <div class="detalhes-sub">ISBN: ${livro.isbn ?? "-"}</div>
                      <div class="detalhes-sub">Quantidade disponível: ${livro.quantidade ?? 0}</div>
                      <div class="detalhes-sub">Categoria: ${livro.categoria_nome ?? livro.categoria ?? "-"}</div>
                      <div class="detalhes-sub">Tipo: ${livro.tipo_nome ?? livro.tipo ?? "-"}</div>
                      <hr />
                      <div class="detalhes-sub">Total de empréstimos: ${livro.total_emprestimos ?? 0}</div>
                      <div class="detalhes-sub">Empréstimos ativos: ${livro.emprestimos_ativos ?? 0}</div>
                    </div>
                  </div>
                    
                  <hr />
                    
                  <h3>Histórico de empréstimos</h3>
                  ${renderHistoricoTabela(historico, "livro")}
                `,
        });
      } catch (error) {
        await alertModal({
          title: "Erro",
          message: error.message,
        });
      }
    });
  });

  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        const confirmado = await confirmModal({
          title: "Excluir livro",
          message: "Deseja realmente excluir este livro?",
        });

        if (!confirmado) return;

        await window.api.excluirLivro(btn.dataset.id);

        await carregarAcervo();
        await alertModal({
          title: "Sucesso",
          message: "Livro excluído com sucesso.",
        });
      } catch (error) {
        await alertModal({
          title: "Erro",
          message: error.message,
        });
      }
    });
  });
}

async function cancelarEdicaoLivro() {
  limparFormulario();
  await carregarAcervo();
  await alertModal({
    title: "Aviso",
    message: "Edição cancelada.",
  });
}

async function carregarAcervo() {
  const livros = await window.api.listarAcervo();
  listaAcervoAtual = livros;
  renderAcervo(livros);
}

btnSelecionarImagem.addEventListener("click", async () => {
  try {
    const caminho = await window.api.selecionarImagemLivro();
    if (!caminho) return;

    caminhoImagemSelecionada = caminho;
    const partes = caminho.split(/[/\\]/);
    nomeImagemSelecionada.textContent = partes[partes.length - 1];
    const srcPreview = `file://${caminho}`;
    mostrarPreviewImagem(srcPreview);
  } catch (error) {
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnCriarLivro.addEventListener("click", async () => {
  try {
    const titulo = livroTitulo.value.trim();
    const autor = livroAutor.value.trim();
    const editora = livroEditora.value.trim();
    const isbn = livroIsbn.value.trim();
    const quantidade = livroQuantidade.value;
    const tipo = livroTipo.value;
    const categoria = livroCategoria.value;

    if (!titulo) {
      await alertModal({
        title: "Validação",
        message: "Informe o título.",
      });
      return;
    }

    if (!categoria || Number(categoria) < 1) {
      await alertModal({
        title: "Validação",
        message: "Informe uma categoria válida.",
      });
      return;
    }

    if (quantidade === "" || Number(quantidade) < 0) {
      await alertModal({
        title: "Validação",
        message: "Quantidade inválida.",
      });
      return;
    }

    if (!tipo || Number(tipo) < 1) {
      await alertModal({
        title: "Validação",
        message: "Informe um tipo válido.",
      });
      return;
    }

    showLoadingModal("Salvando livro...");

    let nomeImagem = null;
    if (caminhoImagemSelecionada) {
      nomeImagem = await window.api.uploadImagemLivro(caminhoImagemSelecionada);
    }

    if (livroEmEdicaoId) {
      await window.api.atualizarLivro({
        id: livroEmEdicaoId,
        titulo,
        autor,
        editora,
        isbn,
        quantidade,
        categoria,
        tipo,
        capa: nomeImagem,
      });

      hideLoadingModal();
      limparFormulario();
      await carregarAcervo();

      await alertModal({
        title: "Sucesso",
        message: "Livro atualizado com sucesso.",
      });
    } else {
      await window.api.criarLivro({
        titulo,
        autor,
        editora,
        isbn,
        quantidade,
        categoria,
        tipo,
        capa: nomeImagem,
      });

      hideLoadingModal();
      limparFormulario();
      await carregarAcervo();

      await alertModal({
        title: "Sucesso",
        message: "Livro cadastrado com sucesso.",
      });
    }
  } catch (error) {
    hideLoadingModal();
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

function atualizarEstadoEdicaoLivro() {
  if (livroEmEdicaoId) {
    btnCancelarEdicaoLivro.classList.remove("hidden");
    btnCriarLivro.textContent = "Atualizar livro";
    tituloFormularioLivro.textContent = "Editar livro";
  } else {
    btnCancelarEdicaoLivro.classList.add("hidden");
    btnCriarLivro.textContent = "Salvar livro";
    tituloFormularioLivro.textContent = "Cadastrar livro";
  }
}

btnBuscar.addEventListener("click", async () => {
  try {
    const termo = inputBusca.value.trim();
    const livros = termo
      ? await window.api.buscarAcervo(termo)
      : await window.api.listarAcervo();

    listaAcervoAtual = livros;
    renderAcervo(livros);
  } catch (error) {
    setStatus(`Erro ao buscar acervo: ${error.message}`, "error");
  }
});

inputBusca.addEventListener("keydown", (event) => {
  if (event.key === "Enter") btnBuscar.click();
});

async function carregarCategoriasETipos() {
  const categorias = await window.api.listarCategoriasAcervo();
  const tipos = await window.api.listarTiposAcervo();

  livroCategoria.innerHTML = `
    <option value="">Selecione uma categoria</option>
    ${categorias
      .map(
        (c) => `
      <option value="${c.id}">
        ${c.id} - ${c.titulo}
      </option>
    `,
      )
      .join("")}
  `;

  livroTipo.innerHTML = `
    <option value="">Selecione um tipo</option>
    ${tipos
      .map(
        (t) => `
      <option value="${t.id}">
        ${t.id} - ${t.descricao}
      </option>
    `,
      )
      .join("")}
  `;
}

btnCancelarEdicaoLivro.addEventListener("click", async () => {
  await cancelarEdicaoLivro();
});

btnLimparLivro.addEventListener("click", async () => {
  limparFormulario();
  await alertModal({
    title: "Aviso",
    message: "Formulário limpo.",
  });
});

function mostrarPreviewImagem(src) {
  previewImagemLivro.src = src;
  previewImagemWrapper.classList.remove("hidden");
}

function esconderPreviewImagem() {
  previewImagemLivro.src = "";
  previewImagemWrapper.classList.add("hidden");
}

(async function init() {
  try {
    setStatus("Carregando acervo...");

    await carregarCategoriasETipos();
    await carregarAcervo();
    atualizarEstadoEdicaoLivro();
    setStatus("");
  } catch (error) {
    setStatus(`Erro ao carregar acervo: ${error.message}`);
  }
})();
