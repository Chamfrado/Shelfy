const { getDatabase } = require("./connection");

function listarUsuarios() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      id,
      nome,
      login,
      nivel,
      turma,
      fone,
      email
    FROM cad_usuario
    ORDER BY nome
  `);

  return stmt.all();
}

function buscarUsuarios(termo) {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      id,
      nome,
      login,
      nivel,
      turma,
      fone,
      email
    FROM cad_usuario
    WHERE nome LIKE ? OR login LIKE ?
    ORDER BY nome
  `);

  return stmt.all(`%${termo}%`, `%${termo}%`);
}

function contarUsuarios() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COUNT(*) AS total
    FROM cad_usuario
  `);

  return stmt.get();
}

function criarUsuario(dados) {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO cad_usuario (
      nome,
      login,
      nivel,
      turma,
      fone,
      email
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    dados.nome,
    dados.login,
    Number(dados.nivel),
    dados.turma || null,
    dados.fone || null,
    dados.email || null,
  );
}

function atualizarUsuario(id, dados) {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE cad_usuario
    SET
      nome = ?,
      login = ?,
      nivel = ?,
      turma = ?,
      fone = ?,
      email = ?
    WHERE id = ?
  `);

  return stmt.run(
    dados.nome,
    dados.login,
    Number(dados.nivel),
    dados.turma || null,
    dados.fone || null,
    dados.email || null,
    id,
  );
}

function excluirUsuario(id) {
  const db = getDatabase();

  const temEmprestimo = db
    .prepare(
      `
    SELECT 1
    FROM emprestimos
    WHERE user_id = ?
    LIMIT 1
  `,
    )
    .get(id);

  if (temEmprestimo) {
    throw new Error("Não é possível excluir usuário com empréstimos.");
  }

  return db
    .prepare(
      `
    DELETE FROM cad_usuario
    WHERE id = ?
  `,
    )
    .run(id);
}

function listarUsuariosComResumo() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      u.id,
      u.nome,
      u.login,
      u.nivel,
      u.turma,
      u.fone,
      u.email,
      COUNT(e.id) AS total_emprestimos,
      SUM(
        CASE
          WHEN lower(COALESCE(e.devolvido, '')) NOT LIKE '%sim%' THEN 1
          ELSE 0
        END
      ) AS emprestimos_ativos,
      SUM(
        CASE
          WHEN lower(COALESCE(e.devolvido, '')) NOT LIKE '%sim%'
           AND date(e.data_devolucao) < date('now', 'localtime') THEN 1
          ELSE 0
        END
      ) AS emprestimos_atrasados
    FROM cad_usuario u
    LEFT JOIN emprestimos e ON e.user_id = u.id
    GROUP BY
      u.id, u.nome, u.login, u.nivel, u.turma, u.fone, u.email
    ORDER BY u.nome
  `);

  return stmt.all();
}

module.exports = {
  listarUsuarios,
  buscarUsuarios,
  contarUsuarios,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario,
  listarUsuariosComResumo,
};
