document.getElementById("app").innerHTML = getLayout(
  "acervo",
  `
    <h2>Acervo</h2>

    <h3>Cadastrar livro</h3>

    <div class="form-box">
      <input id="livroTitulo" placeholder="Título" />
      <input id="livroAutor" placeholder="Autor" />
      <input id="livroEditora" placeholder="Editora" />
      <input id="livroIsbn" placeholder="ISBN" />
      <input id="livroQuantidade" type="number" placeholder="Quantidade" min="0" />
      <input id="livroCategoria" type="number" placeholder="Categoria (id)" />

      <button id="btnSelecionarImagem" type="button">Selecionar imagem</button>
      <span id="nomeImagemSelecionada">Nenhuma imagem</span>

      <button id="btnCriarLivro">Salvar livro</button>
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

let caminhoImagemSelecionada = null;
let livroEmEdicaoId = null;

function limparFormulario() {
  livroTitulo.value = "";
  livroAutor.value = "";
  livroEditora.value = "";
  livroIsbn.value = "";
  livroQuantidade.value = "";
  livroCategoria.value = "";
  caminhoImagemSelecionada = null;
  nomeImagemSelecionada.textContent = "Nenhuma imagem";
  livroEmEdicaoId = null;
  btnCriarLivro.textContent = "Salvar livro";
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
      nomeImagemSelecionada.textContent = livro.capa || "Nenhuma imagem";
      btnCriarLivro.textContent = "Atualizar livro";
      statusLivro.textContent = "Modo edição ativado.";
    });
  });

  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        if (!confirm("Deseja realmente excluir este livro?")) return;
        await window.api.excluirLivro(btn.dataset.id);
        await carregarAcervo();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

async function carregarAcervo() {
  const livros = await window.api.listarAcervo();
  renderAcervo(livros);
}

btnSelecionarImagem.addEventListener("click", async () => {
  try {
    const caminho = await window.api.selecionarImagemLivro();
    if (!caminho) return;

    caminhoImagemSelecionada = caminho;
    const partes = caminho.split(/[/\\]/);
    nomeImagemSelecionada.textContent = partes[partes.length - 1];
  } catch (error) {
    setStatus(error.message);
  }
});

btnCriarLivro.addEventListener("click", async () => {
  try {
    const titulo = livroTitulo.value.trim();
    const autor = livroAutor.value.trim();
    const editora = livroEditora.value.trim();
    const isbn = livroIsbn.value.trim();
    const quantidade = livroQuantidade.value;
    const categoria = livroCategoria.value;

    if (!titulo) {
      statusLivro.textContent = "Informe o título.";
      return;
    }

    if (!categoria || Number(categoria) < 1) {
      statusLivro.textContent = "Informe uma categoria válida.";
      return;
    }

    if (quantidade === "" || Number(quantidade) < 0) {
      statusLivro.textContent = "Quantidade inválida.";
      return;
    }

    statusLivro.textContent = "Processando...";

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
        capa: nomeImagem,
      });
      statusLivro.textContent = "Livro atualizado com sucesso.";
    } else {
      await window.api.criarLivro({
        titulo,
        autor,
        editora,
        isbn,
        quantidade,
        categoria,
        capa: nomeImagem,
      });
      statusLivro.textContent = "Livro cadastrado com sucesso.";
    }

    limparFormulario();
    await carregarAcervo();
  } catch (error) {
    statusLivro.textContent = `Erro: ${error.message}`;
  }
});

btnBuscar.addEventListener("click", async () => {
  try {
    const termo = inputBusca.value.trim();
    const livros = termo
      ? await window.api.buscarAcervo(termo)
      : await window.api.listarAcervo();

    renderAcervo(livros);
  } catch (error) {
    setStatus(`Erro ao buscar acervo: ${error.message}`);
  }
});

inputBusca.addEventListener("keydown", (event) => {
  if (event.key === "Enter") btnBuscar.click();
});

(async function init() {
  try {
    setStatus("Carregando acervo...");
    await carregarAcervo();
    setStatus("");
  } catch (error) {
    setStatus(`Erro ao carregar acervo: ${error.message}`);
  }
})();
