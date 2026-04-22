const { getDatabase } = require('./connection');

function listarUsuarios() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT *
    FROM cad_usuario
    ORDER BY nome
  `);

  return stmt.all();
}

function buscarUsuarios(termo) {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT *
    FROM cad_usuario
    WHERE nome LIKE ?
    ORDER BY nome
  `);

  return stmt.all(`%${termo}%`);
}

module.exports = { listarUsuarios, buscarUsuarios };