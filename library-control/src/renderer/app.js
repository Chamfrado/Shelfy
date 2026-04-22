const statusEl = document.getElementById('status');

const resultadoEl = document.getElementById('resultado');
const inputBusca = document.getElementById('busca');
const btnBuscar = document.getElementById('btnBuscar');

const resultadoUsuariosEl = document.getElementById('resultadoUsuarios');
const inputBuscaUsuario = document.getElementById('buscaUsuario');
const btnBuscarUsuario = document.getElementById('btnBuscarUsuario');

const resultadoEmprestimosEl = document.getElementById('resultadoEmprestimos');
const btnEmprestimos = document.getElementById('btnCarregarEmprestimos');

function renderAcervo(lista) {
  resultadoEl.innerHTML = `
    <h2>Acervo - Total: ${lista.length}</h2>
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

function renderEmprestimos(lista) {
  resultadoEmprestimosEl.innerHTML = `
    <h2>Empréstimos - Total: ${lista.length}</h2>
    <table border="1" cellpadding="8">
      <tr>
        <th>Usuário</th>
        <th>Livro</th>
        <th>Data</th>
        <th>Devolução</th>
        <th>Status</th>
      </tr>
      ${lista.map(e => {
        const status = e.devolvido ? 'Devolvido' : 'Ativo';

        return `
          <tr>
            <td>${e.usuario}</td>
            <td>${e.livro}</td>
            <td>${e.data_atual}</td>
            <td>${e.data_devolucao}</td>
            <td>${status}</td>
          </tr>
        `;
      }).join('')}
    </table>
  `;
}

function renderUsuarios(lista) {
  resultadoUsuariosEl.innerHTML = `
    <h2>Usuários - Total: ${lista.length}</h2>
    <table border="1" cellpadding="8">
      <tr>
        ${lista.length > 0 ? Object.keys(lista[0]).map(col => `<th>${col}</th>`).join('') : '<th>Sem dados</th>'}
      </tr>
      ${lista.map(usuario => `
        <tr>
          ${Object.values(usuario).map(valor => `<td>${valor ?? ''}</td>`).join('')}
        </tr>
      `).join('')}
    </table>
  `;
}

async function carregarInicial() {
  try {
    statusEl.textContent = 'Carregando dados...';

    const livros = await window.api.listarAcervo();
    renderAcervo(livros);

    const usuarios = await window.api.listarUsuarios();
    renderUsuarios(usuarios);

    statusEl.textContent = '';
  } catch (error) {
    console.error(error);
    statusEl.textContent = `Erro ao carregar dados: ${error.message}`;
  }
}

btnBuscar.addEventListener('click', async () => {
  try {
    const termo = inputBusca.value.trim();
    const livros = termo
      ? await window.api.buscarAcervo(termo)
      : await window.api.listarAcervo();

    renderAcervo(livros);
  } catch (error) {
    console.error(error);
    statusEl.textContent = `Erro ao buscar acervo: ${error.message}`;
  }
});

btnBuscarUsuario.addEventListener('click', async () => {
  try {
    const termo = inputBuscaUsuario.value.trim();
    const usuarios = termo
      ? await window.api.buscarUsuarios(termo)
      : await window.api.listarUsuarios();

    renderUsuarios(usuarios);
  } catch (error) {
    console.error(error);
    statusEl.textContent = `Erro ao buscar usuários: ${error.message}`;
  }
});

inputBusca.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') btnBuscar.click();
});

inputBuscaUsuario.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') btnBuscarUsuario.click();
});

btnEmprestimos.addEventListener('click', async () => {
  try {
    const lista = await window.api.listarEmprestimos();
    renderEmprestimos(lista);
  } catch (error) {
    console.error(error);
  }
});

carregarInicial();