-- Tabela Instituicao
CREATE TABLE IF NOT EXISTS Instituicao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razao_social TEXT UNIQUE NOT NULL,
    nome_fantasia TEXT UNIQUE NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    cep TEXT NOT NULL
);

-- Tabela InstituicaoUnidade
CREATE TABLE IF NOT EXISTS InstituicaoUnidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instituicao_id INTEGER NOT NULL,
    razao_social TEXT UNIQUE NOT NULL,
    nome_fantasia TEXT UNIQUE NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    cep TEXT NOT NULL,
    FOREIGN KEY (instituicao_id) REFERENCES Instituicao(id)
);

-- Tabela SetorSuper
CREATE TABLE IF NOT EXISTS SetorSuper (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL
);

-- Tabela Setor
CREATE TABLE IF NOT EXISTS Setor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    super_setor_id INTEGER NOT NULL,
    nome TEXT UNIQUE NOT NULL,
    FOREIGN KEY (super_setor_id) REFERENCES SetorSuper(id)
);

-- Tabela SetorSub
CREATE TABLE IF NOT EXISTS SetorSub (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setor_id INTEGER NOT NULL,
    nome TEXT UNIQUE NOT NULL,
    FOREIGN KEY (setor_id) REFERENCES Setor(id)
);

-- Tabela Categoria
CREATE TABLE IF NOT EXISTS Categoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL
);

-- Tabela CategoriaSub
CREATE TABLE IF NOT EXISTS CategoriaSub (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES Categoria(id)
);

-- Tabela Transacao
CREATE TABLE IF NOT EXISTS Transacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transacao TEXT NOT NULL
);

-- Tabela UnidadeMedida
CREATE TABLE IF NOT EXISTS UnidadeMedida (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    sigla TEXT NOT NULL
);

-- Tabela Tipo
CREATE TABLE IF NOT EXISTS Tipo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT UNIQUE NOT NULL
);

-- Tabela TipoSub
CREATE TABLE IF NOT EXISTS TipoSub (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    FOREIGN KEY (tipo_id) REFERENCES Tipo(id)
);

-- Tabela Fabricante
CREATE TABLE IF NOT EXISTS Fabricante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL
);

-- Tabela Modelo
CREATE TABLE IF NOT EXISTS Modelo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL
);

-- Tabela Marca
CREATE TABLE IF NOT EXISTS Marca (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL
);

-- Tabela Produto
CREATE TABLE IF NOT EXISTS Produto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    marca_id INTEGER NOT NULL,
    modelo_id INTEGER NOT NULL,
    fabricante_id INTEGER NOT NULL,
    FOREIGN KEY (marca_id) REFERENCES Marca(id),
    FOREIGN KEY (modelo_id) REFERENCES Modelo(id),
    FOREIGN KEY (fabricante_id) REFERENCES Fabricante(id)
);

-- Tabela TipoEmbalagem
CREATE TABLE IF NOT EXISTS TipoEmbalagem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL
);

-- Tabela DetalheProduto
CREATE TABLE IF NOT EXISTS DetalheProduto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    quantidade_unidades INTEGER DEFAULT 0,
    cor TEXT NOT NULL,
    sabor TEXT NOT NULL,
    quantidade_embalagem INTEGER DEFAULT 0,
    tipo_embalagem_id INTEGER NOT NULL,
    preco_custo REAL NOT NULL,
    preco_venda REAL NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES Produto(id),
    FOREIGN KEY (tipo_embalagem_id) REFERENCES TipoEmbalagem(id)
);

-- Tabela DetalheProdutoEstoque
CREATE TABLE IF NOT EXISTS DetalheProdutoEstoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    subsetor_id INTEGER NOT NULL,
    quantidade INTEGER DEFAULT 0,
    FOREIGN KEY (produto_id) REFERENCES DetalheProduto(id),
    FOREIGN KEY (subsetor_id) REFERENCES SetorSub(id)
);

-- Tabela DetalheProdutoFoto
CREATE TABLE IF NOT EXISTS DetalheProdutoFoto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES DetalheProduto(id)
);

-- Tabela MovimentacaoProduto
CREATE TABLE IF NOT EXISTS MovimentacaoProduto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_hora_movimentacao TEXT NOT NULL,
    subsetor_origem_id INTEGER NOT NULL,
    subsetor_destino_id INTEGER NOT NULL,
    transacao_id INTEGER NOT NULL,
    FOREIGN KEY (subsetor_origem_id) REFERENCES SetorSub(id),
    FOREIGN KEY (subsetor_destino_id) REFERENCES SetorSub(id),
    FOREIGN KEY (transacao_id) REFERENCES Transacao(id)
);

-- Tabela ProdutoMovimentoItem
CREATE TABLE IF NOT EXISTS ProdutoMovimentoItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movimentacao_produto_id INTEGER NOT NULL,
    produto_saida_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    qtde INTEGER NOT NULL,
    preco_saida REAL NOT NULL,
    valor_desconto REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    observacao_recusa TEXT,
    FOREIGN KEY (movimentacao_produto_id) REFERENCES MovimentacaoProduto(id),
    FOREIGN KEY (produto_saida_id) REFERENCES DetalheProduto(id),
    FOREIGN KEY (produto_id) REFERENCES DetalheProduto(id)
);

