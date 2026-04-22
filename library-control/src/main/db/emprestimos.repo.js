const { getDatabase } = require("./connection");

function listarEmprestimos() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      e.id,
      u.nome AS usuario,
      a.titulo AS livro,
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

function criarEmprestimo(userId, acervoId, totalDias) {
  const db = getDatabase();

  const diasSemana = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  const hoje = new Date();
  const diaSemana = diasSemana[hoje.getDay()];

  const stmt = db.prepare(`
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
  `);

  return stmt.run(userId, acervoId, totalDias, `+${totalDias} day`, diaSemana);
}

function registrarDevolucao(id) {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE emprestimos
    SET
      devolvido = 'Sim',
      data_entregue = date('now', 'localtime')
    WHERE id = ?
  `);

  return stmt.run(id);
}

module.exports = { listarEmprestimos, criarEmprestimo, registrarDevolucao };
