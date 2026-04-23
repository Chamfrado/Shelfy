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
      capa,
      categoria,
      tipo
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
      capa,
      categoria,
      tipo
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
function excluirLivro(id) {
  const db = getDatabase();

  const temEmprestimo = db
    .prepare(
      `
    SELECT 1
    FROM emprestimos
    WHERE acervo_id = ?
    LIMIT 1
  `,
    )
    .get(id);

  if (temEmprestimo) {
    throw new Error(
      "Não é possível excluir livro com empréstimos registrados.",
    );
  }

  return db
    .prepare(
      `
    DELETE FROM cad_acervo
    WHERE id = ?
  `,
    )
    .run(id);
}

function listarCategoriasAcervo() {
  const db = getDatabase();

  return db
    .prepare(
      `
    SELECT id, titulo, cor
    FROM cad_categoria
    ORDER BY titulo
  `,
    )
    .all();
}

function listarTiposAcervo() {
  const db = getDatabase();

  return db
    .prepare(
      `
    SELECT id, descricao
    FROM cad_tipo
    ORDER BY descricao
  `,
    )
    .all();
}

function buscarLivroPorId(id) {
  const db = getDatabase();

  return db
    .prepare(
      `
    SELECT id, capa
    FROM cad_acervo
    WHERE id = ?
  `,
    )
    .get(id);
}

function listarAcervoComResumo() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      a.id,
      a.titulo,
      a.autor,
      a.editora,
      a.isbn,
      a.quantidade,
      a.capa,
      a.categoria,
      a.tipo,
      COUNT(e.id) AS total_emprestimos,
      SUM(
        CASE
          WHEN lower(COALESCE(e.devolvido, '')) NOT LIKE '%sim%' THEN 1
          ELSE 0
        END
      ) AS emprestimos_ativos
    FROM cad_acervo a
    LEFT JOIN emprestimos e ON e.acervo_id = a.id
    GROUP BY
      a.id, a.titulo, a.autor, a.editora, a.isbn, a.quantidade, a.capa, a.categoria, a.tipo
    ORDER BY a.titulo
  `);

  return stmt.all();
}

function buscarLivroPorTitulo(titulo) {
  const db = getDatabase();

  return db
    .prepare(
      `
    SELECT id
    FROM cad_acervo
    WHERE lower(titulo) = lower(?)
    LIMIT 1
  `,
    )
    .get(titulo);
}

function upsertLivroPorTitulo(dados) {
  const existente = buscarLivroPorTitulo(dados.titulo);

  if (existente) {
    return atualizarLivro(existente.id, dados);
  }

  return criarLivro(dados);
}

module.exports = {
  listarAcervo,
  buscarAcervo,
  contarAcervo,
  criarLivro,
  atualizarLivro,
  excluirLivro,
  listarCategoriasAcervo,
  listarTiposAcervo,
  buscarLivroPorId,
  listarAcervoComResumo,
  buscarLivroPorTitulo,
  upsertLivroPorTitulo,
};
