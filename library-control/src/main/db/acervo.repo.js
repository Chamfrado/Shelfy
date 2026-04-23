const { getDatabase } = require("./connection");

function listarAcervo() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      id,
      titulo,
      autor,
      editora,
      isbn,
      quantidade,
      capa
    FROM cad_acervo
    ORDER BY titulo
  `);

  return stmt.all();
}

function buscarAcervo(termo) {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      id,
      titulo,
      autor,
      editora,
      isbn,
      quantidade,
      capa
    FROM cad_acervo
    WHERE titulo LIKE ? OR autor LIKE ?
    ORDER BY titulo
  `);

  return stmt.all(`%${termo}%`, `%${termo}%`);
}

function contarAcervo() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COUNT(*) AS total
    FROM cad_acervo
  `);

  return stmt.get();
}

function criarLivro(dados) {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO cad_acervo (
      titulo,
      categoria,
      tipo,
      isbn,
      autor,
      editora,
      quantidade,
      capa
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    dados.titulo,
    Number(dados.categoria),
    Number(dados.tipo),
    dados.isbn || null,
    dados.autor || null,
    dados.editora || null,
    Number(dados.quantidade),
    dados.capa || null,
  );
}

function atualizarLivro(id, dados) {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE cad_acervo
    SET
      titulo = ?,
      categoria = ?,
      tipo = ?,
      isbn = ?,
      autor = ?,
      editora = ?,
      quantidade = ?,
      capa = COALESCE(?, capa)
    WHERE id = ?
  `);

  return stmt.run(
    dados.titulo,
    Number(dados.categoria),
    Number(dados.tipo),
    dados.isbn || null,
    dados.autor || null,
    dados.editora || null,
    Number(dados.quantidade),
    dados.capa || null,
    id,
  );
}
module.exports = {
  listarAcervo,
  buscarAcervo,
  contarAcervo,
  criarLivro,
  atualizarLivro,
};
