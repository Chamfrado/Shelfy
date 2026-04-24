-- Evita logins duplicados, sem quebrar se já existir
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuario_login_unique
ON cad_usuario(login);

-- Melhora busca por nome
CREATE INDEX IF NOT EXISTS idx_usuario_nome
ON cad_usuario(nome);

-- Melhora busca por título
CREATE INDEX IF NOT EXISTS idx_acervo_titulo
ON cad_acervo(titulo);

-- Melhora busca por autor
CREATE INDEX IF NOT EXISTS idx_acervo_autor
ON cad_acervo(autor);

-- Melhora consultas de empréstimos ativos/atrasados
CREATE INDEX IF NOT EXISTS idx_emprestimos_devolvido
ON emprestimos(devolvido);

CREATE INDEX IF NOT EXISTS idx_emprestimos_data_devolucao
ON emprestimos(data_devolucao);

CREATE INDEX IF NOT EXISTS idx_emprestimos_user_id
ON emprestimos(user_id);

CREATE INDEX IF NOT EXISTS idx_emprestimos_acervo_id
ON emprestimos(acervo_id);