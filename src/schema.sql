CREATE TABLE Empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
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

CREATE TABLE Regulamentacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    tipo_regulamentacao VARCHAR(100) NOT NULL,
    numero_registro VARCHAR(100),
    data_emissao DATE,
    data_validade DATE,
    orgao_emissor VARCHAR(100),
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE Certificacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    nome_certificacao VARCHAR(100) NOT NULL,
    numero_certificacao VARCHAR(100),
    data_emissao DATE,
    data_validade DATE,
    orgao_certificador VARCHAR(100),
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE ModalidadesTransporte (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    modalidade VARCHAR(50) NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE TiposCarga (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    tipo_carga VARCHAR(100) NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE AbrangenciaGeografica (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    tipo_abrangencia VARCHAR(50) NOT NULL, -- Nacional, Regional, Internacional
    detalhes TEXT, -- Estados, cidades, países
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE Frota (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    tipo_frota VARCHAR(50) NOT NULL, -- Própria, Terceirizada
    quantidade INT,
    tipo_veiculo VARCHAR(100),
    capacidade_carga VARCHAR(100),
    equipamentos_especificos TEXT,
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE Armazenagem (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    possui_armazem BOOLEAN NOT NULL,
    localizacao TEXT,
    capacidade_m2 DECIMAL(10,2),
    capacidade_m3 DECIMAL(10,2),
    tipos_armazenagem TEXT,
    servicos_oferecidos TEXT,
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE PortosTerminais (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    nome_porto_terminal VARCHAR(255) NOT NULL,
    tipo_terminal VARCHAR(100), -- Marítimo, Terrestre (ferroviário, rodoviário)
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE SegurosCoberturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    tipo_seguro VARCHAR(100) NOT NULL,
    numero_apolice VARCHAR(100),
    data_validade DATE,
    seguradora VARCHAR(100),
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE Tecnologias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    nome_tecnologia VARCHAR(100) NOT NULL,
    detalhes TEXT,
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE DesempenhoQualidade (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    prazo_medio_atendimento VARCHAR(100),
    indice_avarias_extravios DECIMAL(5,2),
    indice_entregas_prazo DECIMAL(5,2),
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE ClientesSegmentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    segmento VARCHAR(100) NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE RecursosHumanos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    numero_funcionarios INT,
    programas_treinamento TEXT,
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE Sustentabilidade (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    certificacao_ambiental VARCHAR(100),
    programas_reducao_emissoes TEXT,
    FOREIGN KEY (empresa_id) REFERENCES Empresas(id)
);


