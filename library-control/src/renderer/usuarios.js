document.getElementById("app").innerHTML = getLayout(
  "usuarios",
  `
    <h2>Usuários</h2>

    <h3>Cadastrar usuário</h3>

    <div class="form-box">
    <label for="usuarioNome">Nome</label>
      <input id="usuarioNome" placeholder="Nome" />
      <label for="usuarioLogin">Login</label>
      <input id="usuarioLogin" placeholder="Login" />
      <label for="usuarioNivel">Nível do usuário</label>
<select id="usuarioNivel">
  <option value="">Selecione o nível</option>
  <option value="1">1 - Administrador</option>
  <option value="2">2 - Aluno</option>
  <option value="3">3 - Operador</option>
</select>
<small class="hint">
  Se você ainda não souber o significado exato, use o mesmo padrão do sistema antigo.
</small>
      <label for="usuarioTurma">Turma</label>
      <input id="usuarioTurma" placeholder="Turma" />
      <label for="usuarioFone">Telefone</label>
      <input id="usuarioFone" placeholder="Telefone" />
      <label for="usuarioEmail">E-mail</label>
      <input id="usuarioEmail" placeholder="E-mail" />
      <button id="btnSalvarUsuario">Salvar usuário</button>
    </div>

    <div id="statusUsuario" class="status-box"></div>

    <hr />

    <div class="toolbar">
      <input id="buscaUsuario" placeholder="Buscar usuário por nome..." />
      <button id="btnBuscarUsuario">Buscar usuário</button>
    </div>

    <div id="resultadoUsuarios"></div>
  `,
);

const usuarioNome = document.getElementById("usuarioNome");
const usuarioLogin = document.getElementById("usuarioLogin");
const usuarioNivel = document.getElementById("usuarioNivel");
const usuarioTurma = document.getElementById("usuarioTurma");
const usuarioFone = document.getElementById("usuarioFone");
const usuarioEmail = document.getElementById("usuarioEmail");
const btnSalvarUsuario = document.getElementById("btnSalvarUsuario");
const statusUsuario = document.getElementById("statusUsuario");
const inputBuscaUsuario = document.getElementById("buscaUsuario");
const btnBuscarUsuario = document.getElementById("btnBuscarUsuario");
const resultadoUsuariosEl = document.getElementById("resultadoUsuarios");

let usuarioEmEdicaoId = null;

function limparFormulario() {
  usuarioNome.value = "";
  usuarioLogin.value = "";
  usuarioNivel.value = "";
  usuarioTurma.value = "";
  usuarioFone.value = "";
  usuarioEmail.value = "";
  usuarioEmEdicaoId = null;
  btnSalvarUsuario.textContent = "Salvar usuário";
}

function renderUsuarios(lista) {
  resultadoUsuariosEl.innerHTML = `
    <h2>Usuários - Total: ${lista.length}</h2>
    <table>
      <tr>
        <th>Nome</th>
        <th>Login</th>
        <th>Nível</th>
        <th>Turma</th>
        <th>Telefone</th>
        <th>E-mail</th>
        <th>Ações</th>
      </tr>
      ${lista
        .map(
          (usuario) => `
        <tr>
          <td>${usuario.nome ?? ""}</td>
          <td>${usuario.login ?? ""}</td>
          <td>${usuario.nivel ?? ""}</td>
          <td>${usuario.turma ?? ""}</td>
          <td>${usuario.fone ?? ""}</td>
          <td>${usuario.email ?? ""}</td>
          <td>
            <button class="btn-editar-usuario" data-id="${usuario.id}">Editar</button>
            <button class="btn-excluir-usuario" data-id="${usuario.id}">Excluir</button>
          </td>
        </tr>
      `,
        )
        .join("")}
    </table>
  `;

  document.querySelectorAll(".btn-editar-usuario").forEach((btn) => {
    btn.addEventListener("click", () => {
      const usuario = lista.find(
        (u) => String(u.id) === String(btn.dataset.id),
      );
      if (!usuario) return;

      usuarioEmEdicaoId = usuario.id;
      usuarioNome.value = usuario.nome ?? "";
      usuarioLogin.value = usuario.login ?? "";
      usuarioNivel.value = usuario.nivel ?? "";
      usuarioTurma.value = usuario.turma ?? "";
      usuarioFone.value = usuario.fone ?? "";
      usuarioEmail.value = usuario.email ?? "";
      btnSalvarUsuario.textContent = "Atualizar usuário";
      statusUsuario.textContent = "Modo edição ativado.";
    });
  });

  document.querySelectorAll(".btn-excluir-usuario").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        if (!confirm("Deseja excluir este usuário?")) return;
        await window.api.excluirUsuario(btn.dataset.id);
        await carregarUsuarios();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

async function carregarUsuarios() {
  const usuarios = await window.api.listarUsuarios();
  renderUsuarios(usuarios);
}

btnSalvarUsuario.addEventListener("click", async () => {
  try {
    const nome = usuarioNome.value.trim();
    const login = usuarioLogin.value.trim();
    const nivel = usuarioNivel.value;
    const turma = usuarioTurma.value.trim();
    const fone = usuarioFone.value.trim();
    const email = usuarioEmail.value.trim();

    if (!nome) {
      statusUsuario.textContent = "Informe o nome.";
      return;
    }

    if (!login) {
      statusUsuario.textContent = "Informe o login.";
      return;
    }

    if (nivel === "") {
      statusUsuario.textContent = "Informe o nível.";
      return;
    }

    if (usuarioEmEdicaoId) {
      await window.api.atualizarUsuario({
        id: usuarioEmEdicaoId,
        nome,
        login,
        nivel,
        turma,
        fone,
        email,
      });
      statusUsuario.textContent = "Usuário atualizado com sucesso.";
    } else {
      await window.api.criarUsuario({
        nome,
        login,
        nivel,
        turma,
        fone,
        email,
      });
      statusUsuario.textContent = "Usuário cadastrado com sucesso.";
    }

    limparFormulario();
    await carregarUsuarios();
  } catch (error) {
    statusUsuario.textContent = `Erro ao salvar usuário: ${error.message}`;
  }
});

btnBuscarUsuario.addEventListener("click", async () => {
  try {
    const termo = inputBuscaUsuario.value.trim();
    const usuarios = termo
      ? await window.api.buscarUsuarios(termo)
      : await window.api.listarUsuarios();

    renderUsuarios(usuarios);
  } catch (error) {
    setStatus(`Erro ao buscar usuários: ${error.message}`);
  }
});

inputBuscaUsuario.addEventListener("keydown", (event) => {
  if (event.key === "Enter") btnBuscarUsuario.click();
});

(async function init() {
  try {
    setStatus("Carregando usuários...");
    await carregarUsuarios();
    setStatus("");
  } catch (error) {
    setStatus(`Erro ao carregar usuários: ${error.message}`);
  }
})();
