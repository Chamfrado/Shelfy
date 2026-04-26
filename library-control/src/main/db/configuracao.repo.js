const { getDatabase } = require("./connection");

function obterConfiguracao() {
  const db = getDatabase();

  return db
    .prepare(`SELECT * FROM configuracao_instituicao WHERE id = 1`)
    .get();
}

function salvarConfiguracao(payload) {
  const db = getDatabase();

  db.prepare(
    `
    UPDATE configuracao_instituicao
    SET nome = ?,
        cidade = ?,
        uf = ?,
        nome_sistema = ?,
        logo = ?
    WHERE id = 1
  `,
  ).run(
    payload.nome,
    payload.cidade,
    payload.uf,
    payload.nome_sistema,
    payload.logo,
  );

  return obterConfiguracao();
}

module.exports = {
  obterConfiguracao,
  salvarConfiguracao,
};
