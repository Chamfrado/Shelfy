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
      <div class="acoes-formulario">
        <button id="btnSalvarUsuario">Salvar usuário</button>
        <button id="btnCancelarEdicaoUsuario" type="button" class="hidden">Cancelar edição</button>
        <button id="btnLimparUsuario" type="button">Limpar formulário</button>
      </div>
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

const btnCancelarEdicaoUsuario = document.getElementById(
  "btnCancelarEdicaoUsuario",
);
const btnLimparUsuario = document.getElementById("btnLimparUsuario");

let listaUsuariosAtual = [];

let usuarioEmEdicaoId = null;

function limparFormulario() {
  usuarioNome.value = "";
  usuarioLogin.value = "";
  usuarioNivel.value = "";
  usuarioTurma.value = "";
  usuarioFone.value = "";
  usuarioEmail.value = "";
  usuarioEmEdicaoId = null;
  atualizarEstadoEdicaoUsuario();
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
      atualizarEstadoEdicaoUsuario();
      setBoxStatus(statusUsuario, "Modo edição ativado.", "info");

      renderUsuarios([usuario]);
    });
  });

  document.querySelectorAll(".btn-excluir-usuario").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        const confirmado = await confirmModal({
          title: "Excluir usuário",
          message: "Deseja realmente excluir este usuário?",
        });

        if (!confirmado) return;

        await window.api.excluirUsuario(btn.dataset.id);

        await carregarUsuarios();
        await alertModal({
          title: "Sucesso",
          message: "Usuário excluído com sucesso.",
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

function atualizarEstadoEdicaoUsuario() {
  if (usuarioEmEdicaoId) {
    btnCancelarEdicaoUsuario.classList.remove("hidden");
    btnSalvarUsuario.textContent = "Atualizar usuário";
  } else {
    btnCancelarEdicaoUsuario.classList.add("hidden");
    btnSalvarUsuario.textContent = "Salvar usuário";
  }
}

async function cancelarEdicaoUsuario() {
  limparFormulario();
  await carregarUsuarios();
  await alertModal({
    title: "Aviso",
    message: "Edição cancelada.",
  });
}

btnCancelarEdicaoUsuario.addEventListener("click", async () => {
  await cancelarEdicaoUsuario();
});

async function carregarUsuarios() {
  const usuarios = await window.api.listarUsuarios();
  listaUsuariosAtual = usuarios;
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
      await alertModal({
        title: "Validação",
        message: "Informe o nome.",
      });
      return;
    }

    if (!login) {
      await alertModal({
        title: "Validação",
        message: "Informe o login.",
      });
      return;
    }

    if (nivel === "") {
      await alertModal({
        title: "Validação",
        message: "Informe o nível.",
      });
      return;
    }

    showLoadingModal("Salvando usuário...");

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

      hideLoadingModal();
      await alertModal({
        title: "Sucesso",
        message: "Usuário atualizado com sucesso.",
      });
    } else {
      await window.api.criarUsuario({
        nome,
        login,
        nivel,
        turma,
        fone,
        email,
      });

      hideLoadingModal();
      await alertModal({
        title: "Sucesso",
        message: "Usuário cadastrado com sucesso.",
      });
    }

    limparFormulario();
    await carregarUsuarios();
  } catch (error) {
    hideLoadingModal();
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
});

btnBuscarUsuario.addEventListener("click", async () => {
  try {
    const termo = inputBuscaUsuario.value.trim();
    const usuarios = termo
      ? await window.api.buscarUsuarios(termo)
      : await window.api.listarUsuarios();

    listaUsuariosAtual = usuarios;
    renderUsuarios(usuarios);
  } catch (error) {
    setStatus(`Erro ao buscar usuários: ${error.message}`, "error");
  }
});

inputBuscaUsuario.addEventListener("keydown", (event) => {
  if (event.key === "Enter") btnBuscarUsuario.click();
});

btnCancelarEdicaoUsuario.addEventListener("click", async () => {
  await cancelarEdicaoUsuario();
});

btnLimparUsuario.addEventListener("click", async () => {
  limparFormulario();
  await alertModal({
    title: "Aviso",
    message: "Formulário limpo.",
  });
});
(async function init() {
  try {
    setStatus("Carregando usuários...");
    await carregarUsuarios();
    atualizarEstadoEdicaoUsuario();
    setStatus("");
  } catch (error) {
    setStatus(`Erro ao carregar usuários: ${error.message}`);
  }
})();
