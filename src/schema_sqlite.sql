CREATE TABLE empresa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(50),
    endereco_completo TEXT,
    telefone_comercial VARCHAR(20),
    telefone_emergencial VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    data_fundacao DATE
);

CREATE TABLE regulamentacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    tipo_regulamentacao VARCHAR(100) NOT NULL,
    numero_registro VARCHAR(100),
    data_emissao DATE,
    data_validade DATE,
    orgao_emissor VARCHAR(100),
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE certificacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    nome_certificacao VARCHAR(100) NOT NULL,
    numero_certificacao VARCHAR(100),
    data_emissao DATE,
    data_validade DATE,
    orgao_certificador VARCHAR(100),
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE modalidade_transporte (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    modalidade VARCHAR(50) NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE tipo_carga (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    tipo_carga VARCHAR(100) NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE abrangencia_geografica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    tipo_abrangencia VARCHAR(50) NOT NULL,
    detalhes TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE frota (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    tipo_frota VARCHAR(100) NOT NULL,
    quantidade INTEGER,
    tipo_veiculo VARCHAR(100),
    tipo_carroceria VARCHAR(100),
    capacidade REAL,
    ano_medio INTEGER,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE armazenagem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    possui_armazem BOOLEAN NOT NULL,
    localizacao TEXT,
    capacidade_m2 DECIMAL(10,2),
    capacidade_m3 DECIMAL(10,2),
    tipos_armazenagem TEXT,
    servicos_oferecidos TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE porto_terminal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    nome_porto_terminal VARCHAR(255) NOT NULL,
    tipo_terminal VARCHAR(100),
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE seguro_cobertura (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    tipo_seguro VARCHAR(100) NOT NULL,
    numero_apolice VARCHAR(100),
    data_validade DATE,
    seguradora VARCHAR(100),
    valor_cobertura TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE tecnologia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    nome_tecnologia VARCHAR(100) NOT NULL,
    detalhes TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE desempenho_qualidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    prazo_medio_atendimento VARCHAR(100),
    unidade_prazo TEXT DEFAULT 'horas',
    indice_avarias_extravios DECIMAL(5,2),
    indice_entregas_prazo DECIMAL(5,2),
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE cliente_segmento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    segmento VARCHAR(100) NOT NULL,
    principais_clientes TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE recurso_humano (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    numero_funcionarios INTEGER,
    programas_treinamento TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE sustentabilidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    certificacao_ambiental VARCHAR(100),
    programas_reducao_emissoes TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);



