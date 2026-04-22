const statusEl = document.getElementById('status');
const resultadoEl = document.getElementById('resultado');
const inputBusca = document.getElementById('busca');
const btnBuscar = document.getElementById('btnBuscar');

function render(lista) {
  statusEl.textContent = '';
  resultadoEl.innerHTML = `
    <h2>Total: ${lista.length}</h2>
    <table border="1" cellpadding="8">
      <tr>
        <th>Título</th>
        <th>Autor</th>
        <th>Editora</th>
        <th>Qtd</th>
      </tr>
      ${lista.map(l => `
        <tr>
          <td>${l.titulo ?? ''}</td>
          <td>${l.autor ?? ''}</td>
          <td>${l.editora ?? ''}</td>
          <td>${l.quantidade ?? ''}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

async function carregarInicial() {
  try {
    statusEl.textContent = 'Carregando acervo...';
    const livros = await window.api.listarAcervo();
    render(livros);
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Erro ao carregar o acervo.';
  }
}

btnBuscar.addEventListener('click', async () => {
  try {
    const termo = inputBusca.value.trim();
    statusEl.textContent = 'Buscando...';

    const livros = termo
      ? await window.api.buscarAcervo(termo)
      : await window.api.listarAcervo();

    render(livros);
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Erro ao buscar no acervo.';
  }
});

inputBusca.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    btnBuscar.click();
  }
});

carregarInicial();