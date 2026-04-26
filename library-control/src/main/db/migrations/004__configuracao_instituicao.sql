CREATE TABLE IF NOT EXISTS configuracao_instituicao (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  nome TEXT,
  logo TEXT,
  cidade TEXT,
  uf TEXT,
  nome_sistema TEXT
);

INSERT OR IGNORE INTO configuracao_instituicao (id, nome)
VALUES (1, 'Minha Escola');