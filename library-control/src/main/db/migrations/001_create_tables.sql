-- =========================
-- TABELA DE USUÁRIOS
-- =========================
CREATE TABLE IF NOT EXISTS cad_usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    login TEXT NOT NULL,
    nivel INTEGER NOT NULL,
    turma TEXT,
    fone TEXT,
    email TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuario_login
ON cad_usuario(login);

-- =========================
-- TABELA DE TIPOS
-- =========================
CREATE TABLE IF NOT EXISTS cad_tipo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL
);

-- =========================
-- TABELA DE CATEGORIAS
-- =========================
CREATE TABLE IF NOT EXISTS cad_categoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    id_escola INTEGER,
    cor TEXT
);

-- =========================
-- TABELA DE ACERVO
-- =========================
CREATE TABLE IF NOT EXISTS cad_acervo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    categoria INTEGER NOT NULL,
    tipo INTEGER NOT NULL,
    isbn TEXT,
    autor TEXT,
    editora TEXT,
    setor TEXT,
    quantidade INTEGER DEFAULT 0,
    estante TEXT,
    prateleira TEXT,
    sinopse TEXT,
    capa TEXT,
    codigo TEXT,

    FOREIGN KEY (categoria) REFERENCES cad_categoria(id),
    FOREIGN KEY (tipo) REFERENCES cad_tipo(id)
);

CREATE INDEX IF NOT EXISTS idx_acervo_titulo
ON cad_acervo(titulo);

-- =========================
-- TABELA DE EMPRÉSTIMOS
-- =========================
CREATE TABLE IF NOT EXISTS emprestimos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    acervo_id INTEGER NOT NULL,
    total_dias INTEGER NOT NULL,
    data_atual DATE NOT NULL,
    data_devolucao DATE NOT NULL,
    dia_semana TEXT NOT NULL,
    devolvido TEXT NOT NULL DEFAULT 'Não',
    data_entregue DATE,

    FOREIGN KEY (user_id) REFERENCES cad_usuario(id),
    FOREIGN KEY (acervo_id) REFERENCES cad_acervo(id)
);

CREATE INDEX IF NOT EXISTS idx_emprestimo_user
ON emprestimos(user_id);

CREATE INDEX IF NOT EXISTS idx_emprestimo_acervo
ON emprestimos(acervo_id);