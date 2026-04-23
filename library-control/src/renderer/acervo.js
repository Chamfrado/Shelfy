document.getElementById("app").innerHTML = getLayout(
  "acervo",
  `
    <h2>Acervo</h2>

    <h3>Cadastrar livro</h3>

<div class="form-box">
  <label for="livroTitulo">Título</label>
  <input id="livroTitulo" placeholder="Título" />
  <label for="livroAutor">Autor</label>
  <input id="livroAutor" placeholder="Autor" />
  <label for="livroEditora">Editora</label>
  <input id="livroEditora" placeholder="Editora" />
  <label for="livroIsbn">ISBN</label>
  <input id="livroIsbn" placeholder="ISBN" />
  <label for="livroQuantidade">Quantidade</label>
  <input id="livroQuantidade" type="number" placeholder="Quantidade" min="0" />

  <label for="livroCategoria">Categoria</label>
  <select id="livroCategoria">
    <option value="">Selecione uma categoria</option>
  </select>
  <small class="hint">Escolha a categoria do acervo.</small>

  <label for="livroTipo">Tipo de acervo</label>
  <select id="livroTipo">
    <option value="">Selecione um tipo</option>
  </select>
  <small class="hint">Ex.: Livro, Apostila, Revista, Jornal, Gibi.</small>

   <button id="btnSelecionarImagem" type="button">Selecionar imagem</button>
  <span id="nomeImagemSelecionada">Nenhuma imagem</span>
  <div id="previewImagemWrapper" class="hidden">
  <p><strong>Pré-visualização da capa</strong></p>
  <img id="previewImagemLivro" class="capa-preview" alt="Pré-visualização da capa" />
</div>
  <div class="acoes-formulario">
 
    <button id="btnCriarLivro">Salvar livro</button>
  <button id="btnCancelarEdicaoLivro" type="button" class="hidden">Cancelar edição</button>
  <button id="btnLimparLivro" type="button">Limpar formulário</button>
</div>

</div>

<div id="statusLivro" class="status-box"></div>
    <hr />

    <div class="toolbar">
      <input id="busca" placeholder="Buscar por título ou autor..." />
      <button id="btnBuscar">Buscar</button>
    </div>

    <div id="resultado"></div>
  `,
);

const resultadoEl = document.getElementById("resultado");
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
  if (livro.capa) {
    mostrarPreviewImagem(`./assets/livros/${encodeURIComponent(livro.capa)}`);
  } else {
    esconderPreviewImagem();
  }
  livroEmEdicaoId = null;
  atualizarEstadoEdicaoLivro();
  esconderPreviewImagem();
}

function renderAcervo(lista) {
  resultadoEl.innerHTML = `
    <h2>Acervo - Total: ${lista.length}</h2>
    <table>
      <tr>
        <th>Capa</th>
        <th>Título</th>
        <th>Autor</th>
        <th>Editora</th>
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
                  ? `<img src="./assets/livros/${encodeURIComponent(l.capa)}" alt="Capa" class="capa-livro" />`
                  : "-"
              }
            </td>
            <td>${l.titulo ?? ""}</td>
            <td>${l.autor ?? ""}</td>
            <td>${l.editora ?? ""}</td>
            <td>${qtd}</td>
            <td>${status}</td>
            <td>
              <button class="btn-editar" data-id="${l.id}">Editar</button>
              <button class="btn-excluir" data-id="${l.id}">Excluir</button>
            </td>
          </tr>
        `;
        })
        .join("")}
    </table>
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
      atualizarEstadoEdicaoLivro();
      setBoxStatus(statusLivro, "Modo edição ativado.", "info");

      renderAcervo([livro]);
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
      await alertModal({
        title: "Sucesso",
        message: "Livro cadastrado com sucesso.",
      });
    }

    limparFormulario();
    await carregarAcervo();
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
  } else {
    btnCancelarEdicaoLivro.classList.add("hidden");
    btnCriarLivro.textContent = "Salvar livro";
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
