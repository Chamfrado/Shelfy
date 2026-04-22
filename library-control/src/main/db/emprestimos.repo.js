const { getDatabase } = require('./connection');

function listarEmprestimos() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      e.id,
      u.nome AS usuario,
      a.titulo AS livro,
      e.data_atual,
      e.data_devolucao,
      e.devolvido
    FROM emprestimos e
    JOIN cad_usuario u ON u.id = e.user_id
    JOIN cad_acervo a ON a.id = e.acervo_id
    ORDER BY e.id DESC
  `);

  return stmt.all();
}

module.exports = { listarEmprestimos };