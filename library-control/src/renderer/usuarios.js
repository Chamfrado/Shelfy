document.getElementById("app").innerHTML = getLayout(
  "usuarios",
  `
  <div class="page-header">
    <div>
      <h1>Usuários</h1>
      <p>Cadastre, edite e acompanhe o histórico dos usuários.</p>
    </div>
  </div>

  <section class="page-grid">
    <div class="panel">
      <div class="panel-header">
        <div>
          <h2 id="tituloFormularioUsuario">Cadastrar usuário</h2>
          <p>Preencha os dados básicos do usuário.</p>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label for="usuarioNome">Nome</label>
          <input id="usuarioNome" placeholder="Nome completo" />
        </div>

        <div class="form-field">
          <label for="usuarioLogin">Login</label>
          <input id="usuarioLogin" placeholder="login.usuario" />
        </div>

        <div class="form-field">
          <label for="usuarioNivel">Nível</label>
          <select id="usuarioNivel">
            <option value="">Selecione o nível</option>
            <option value="1">Administrador</option>
            <option value="2">Aluno</option>
            <option value="3">Operador</option>
          </select>
        </div>

        <div class="form-field">
          <label for="usuarioTurma">Turma</label>
          <input id="usuarioTurma" placeholder="Ex.: 1A" />
        </div>

        <div class="form-field">
          <label for="usuarioFone">Telefone</label>
          <input id="usuarioFone" placeholder="(35) 99999-9999" />
        </div>

        <div class="form-field">
          <label for="usuarioEmail">E-mail</label>
          <input id="usuarioEmail" placeholder="usuario@email.com" />
        </div>
      </div>

      <div class="actions-row">
        <button id="btnSalvarUsuario" class="btn-primary">Salvar usuário</button>
        <button id="btnCancelarEdicaoUsuario" type="button" class="btn-secondary hidden">Cancelar edição</button>
        <button id="btnLimparUsuario" type="button" class="btn-light">Limpar</button>
      </div>

      <div id="statusUsuario" class="status-box"></div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>Buscar usuários</h2>
          <p>Pesquise por nome ou login.</p>
        </div>
      </div>

      <div class="toolbar modern-toolbar">
        <input id="buscaUsuario" placeholder="Buscar usuário..." />
        <button id="btnBuscarUsuario" class="btn-primary">Buscar</button>
      </div>

      <div id="resultadoUsuarios"></div>
    </div>
  </section>
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
const tituloFormularioUsuario = document.getElementById(
  "tituloFormularioUsuario",
);

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

  statusUsuario.className = "status-box";
  statusUsuario.textContent = "";
}
function atualizarEstadoEdicaoUsuario() {
  if (usuarioEmEdicaoId) {
    btnCancelarEdicaoUsuario.classList.remove("hidden");
    btnSalvarUsuario.textContent = "Atualizar usuário";
    tituloFormularioUsuario.textContent = "Editar usuário";
  } else {
    btnCancelarEdicaoUsuario.classList.add("hidden");
    btnSalvarUsuario.textContent = "Salvar usuário";
    tituloFormularioUsuario.textContent = "Cadastrar usuário";
  }
}

async function abrirHistoricoUsuario(usuarioId) {
  try {
    const usuarios = await window.api.listarUsuariosComResumo();

    const usuario = usuarios.find((u) => String(u.id) === String(usuarioId));

    if (!usuario) {
      await alertModal({
        title: "Erro",
        message: "Usuário não encontrado.",
      });
      return;
    }

    const historico = await window.api.listarHistoricoUsuario(usuario.id);

    await detalhesModal({
      title: "Histórico do usuário",
      content: `
        <div class="detalhes-bloco">
          <div class="detalhes-titulo">${usuario.nome ?? ""}</div>
          <div class="detalhes-sub">Login: ${usuario.login ?? "-"}</div>
          <div class="detalhes-sub">Nível: ${usuario.nivel ?? "-"}</div>
          <div class="detalhes-sub">Turma: ${usuario.turma ?? "-"}</div>
          <div class="detalhes-sub">Telefone: ${usuario.fone ?? "-"}</div>
          <div class="detalhes-sub">E-mail: ${usuario.email ?? "-"}</div>

          <hr />

          <div class="detalhes-sub">Total de empréstimos: ${usuario.total_emprestimos ?? 0}</div>
          <div class="detalhes-sub">Empréstimos ativos: ${usuario.emprestimos_ativos ?? 0}</div>
          <div class="detalhes-sub">Empréstimos atrasados: ${usuario.emprestimos_atrasados ?? 0}</div>

          <hr />

          <h3>Últimos empréstimos</h3>

          <div class="toolbar">
            <select id="filtroHistoricoUsuario">
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="atrasados">Atrasados</option>
              <option value="devolvidos">Devolvidos</option>
            </select>
          </div>

          <div id="historicoUsuarioTabela">
            ${renderHistoricoTabela(historico, "usuario")}
          </div>
        </div>
      `,
    });

    const filtro = document.getElementById("filtroHistoricoUsuario");
    const container = document.getElementById("historicoUsuarioTabela");

    if (!filtro || !container) return;

    filtro.addEventListener("change", () => {
      const status = filtro.value;

      const filtrado = historico.filter((item) => {
        const itemStatus = getStatusHistorico(item).toLowerCase();

        if (status === "todos") return true;
        if (status === "ativos") return itemStatus === "ativo";
        if (status === "atrasados") return itemStatus === "atrasado";
        if (status === "devolvidos") return itemStatus === "devolvido";

        return true;
      });

      container.innerHTML = renderHistoricoTabela(filtrado, "usuario");
    });
  } catch (error) {
    await alertModal({
      title: "Erro",
      message: error.message,
    });
  }
}

function renderUsuarios(lista) {
  resultadoUsuariosEl.innerHTML = `
    <h2>Usuários - Total: ${lista.length}</h2>
   <div class="table-wrapper">
      <table class="modern-table">
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
              <td>${renderNivelUsuario(usuario.nivel)}</td>
              <td>${usuario.turma ?? ""}</td>
              <td>${usuario.fone ?? ""}</td>
              <td>${usuario.email ?? ""}</td>
              <td>
                <button class="btn-light btn-historico-usuario" data-id="${usuario.id}">Histórico</button>
                <button class="btn-light btn-editar-usuario" data-id="${usuario.id}">Editar</button>
                <button class="btn-danger btn-excluir-usuario" data-id="${usuario.id}">Excluir</button>
              </td>
            </tr>
          `,
        )
        .join("")}
    </table>
  </div>
  `;

  document.querySelectorAll(".btn-historico-usuario").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await abrirHistoricoUsuario(btn.dataset.id);
    });
  });

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

async function cancelarEdicaoUsuario() {
  limparFormulario();

  await carregarUsuarios();

  await alertModal({
    title: "Aviso",
    message: "Edição cancelada.",
  });
}

async function carregarUsuarios() {
  const usuarios = await window.api.listarUsuarios();

  listaUsuariosAtual = usuarios;

  renderUsuarios(usuarios);
}

function renderNivelUsuario(nivel) {
  const n = Number(nivel);

  if (n === 1) return `<span class="badge-status badge-admin">Admin</span>`;
  if (n === 2) return `<span class="badge-status badge-aluno">Aluno</span>`;
  if (n === 3)
    return `<span class="badge-status badge-operador">Operador</span>`;

  return `<span class="badge-status badge-suave">-</span>`;
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

      limparFormulario();
      await carregarUsuarios();

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

      limparFormulario();
      await carregarUsuarios();

      await alertModal({
        title: "Sucesso",
        message: "Usuário cadastrado com sucesso.",
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
  if (event.key === "Enter") {
    btnBuscarUsuario.click();
  }
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
    setStatus(`Erro ao carregar usuários: ${error.message}`, "error");
  }
})();
