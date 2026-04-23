const { getDatabase } = require("./connection");

function listarEmprestimos() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      e.id,
      e.user_id,
      e.acervo_id,
      u.nome AS usuario,
      a.titulo AS livro,
      e.total_dias,
      e.data_atual,
      e.data_devolucao,
      e.dia_semana,
      e.devolvido,
      e.data_entregue
    FROM emprestimos e
    JOIN cad_usuario u ON u.id = e.user_id
    JOIN cad_acervo a ON a.id = e.acervo_id
    ORDER BY e.id DESC
  `);

  return stmt.all();
}

function listarEmprestimosAtrasados() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      e.id,
      e.user_id,
      e.acervo_id,
      u.nome AS usuario,
      a.titulo AS livro,
      e.total_dias,
      e.data_atual,
      e.data_devolucao,
      e.dia_semana,
      e.devolvido,
      e.data_entregue
    FROM emprestimos e
    JOIN cad_usuario u ON u.id = e.user_id
    JOIN cad_acervo a ON a.id = e.acervo_id
    WHERE lower(e.devolvido) NOT LIKE '%sim%'
      AND date(e.data_devolucao) < date('now', 'localtime')
    ORDER BY e.data_devolucao ASC
  `);

  return stmt.all();
}

function criarEmprestimo(userId, acervoId, totalDias) {
  const db = getDatabase();

  const diasSemana = [
    "Domingo",
    "Segunda",
    "Terca",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sabado",
  ];

  const hoje = new Date();
  const diaSemana = diasSemana[hoje.getDay()];

  const criarEmprestimoTx = db.transaction(() => {
    const livro = db
      .prepare(
        `
      SELECT id, titulo, quantidade
      FROM cad_acervo
      WHERE id = ?
    `,
      )
      .get(acervoId);

    if (!livro) {
      throw new Error("Livro não encontrado.");
    }

    if (Number(livro.quantidade) <= 0) {
      throw new Error("Livro sem quantidade disponível para empréstimo.");
    }

    db.prepare(
      `
      UPDATE cad_acervo
      SET quantidade = quantidade - 1
      WHERE id = ?
    `,
    ).run(acervoId);

    const result = db
      .prepare(
        `
      INSERT INTO emprestimos (
        user_id,
        acervo_id,
        total_dias,
        data_atual,
        data_devolucao,
        dia_semana
      )
      VALUES (
        ?,
        ?,
        ?,
        date('now', 'localtime'),
        date('now', 'localtime', ?),
        ?
      )
    `,
      )
      .run(userId, acervoId, totalDias, `+${totalDias} day`, diaSemana);

    return result;
  });

  return criarEmprestimoTx();
}

function registrarDevolucao(id) {
  const db = getDatabase();

  const registrarDevolucaoTx = db.transaction(() => {
    const emprestimo = db
      .prepare(
        `
      SELECT id, acervo_id, devolvido
      FROM emprestimos
      WHERE id = ?
    `,
      )
      .get(id);

    if (!emprestimo) {
      throw new Error("Empréstimo não encontrado.");
    }

    const devolvidoTexto = String(emprestimo.devolvido ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (devolvidoTexto.includes("sim")) {
      throw new Error("Esse empréstimo já foi devolvido.");
    }

    db.prepare(
      `
      UPDATE emprestimos
      SET
        devolvido = 'Sim',
        data_entregue = date('now', 'localtime')
      WHERE id = ?
    `,
    ).run(id);

    db.prepare(
      `
      UPDATE cad_acervo
      SET quantidade = quantidade + 1
      WHERE id = ?
    `,
    ).run(emprestimo.acervo_id);

    return { success: true };
  });

  return registrarDevolucaoTx();
}

function contarEmprestimosAtivos() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COUNT(*) AS total
    FROM emprestimos
    WHERE lower(devolvido) NOT LIKE '%sim%'
  `);

  return stmt.get();
}

function contarEmprestimosAtrasados() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COUNT(*) AS total
    FROM emprestimos
    WHERE lower(devolvido) NOT LIKE '%sim%'
      AND date(data_devolucao) < date('now', 'localtime')
  `);

  return stmt.get();
}

function buscarEmprestimos(termo, status) {
  const db = getDatabase();

  let sql = `
    SELECT
      e.id,
      e.user_id,
      e.acervo_id,
      u.nome AS usuario,
      a.titulo AS livro,
      e.total_dias,
      e.data_atual,
      e.data_devolucao,
      e.dia_semana,
      e.devolvido,
      e.data_entregue
    FROM emprestimos e
    JOIN cad_usuario u ON u.id = e.user_id
    JOIN cad_acervo a ON a.id = e.acervo_id
    WHERE 1=1
  `;

  const params = [];

  if (termo) {
    sql += ` AND (u.nome LIKE ? OR a.titulo LIKE ?)`;
    params.push(`%${termo}%`, `%${termo}%`);
  }

  if (status === "ativos") {
    sql += ` AND lower(e.devolvido) NOT LIKE '%sim%'`;
  } else if (status === "devolvidos") {
    sql += ` AND lower(e.devolvido) LIKE '%sim%'`;
  } else if (status === "atrasados") {
    sql += ` AND lower(e.devolvido) NOT LIKE '%sim%'
             AND date(e.data_devolucao) < date('now', 'localtime')`;
  }

  sql += ` ORDER BY e.id DESC`;

  return db.prepare(sql).all(...params);
}

module.exports = {
  listarEmprestimos,
  criarEmprestimo,
  registrarDevolucao,
  listarEmprestimosAtrasados,
  contarEmprestimosAtivos,
  contarEmprestimosAtrasados,
  buscarEmprestimos,
};
