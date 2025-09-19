from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Importar instância do SQLAlchemy do __init__.py
from . import db

class Empresa(db.Model):
    __tablename__ = 'empresas'
    id = db.Column(db.Integer, primary_key=True)
    razao_social = db.Column(db.String(255), nullable=False)
    nome_fantasia = db.Column(db.String(255))
    cnpj = db.Column(db.String(18), unique=True, nullable=False)
    inscricao_estadual = db.Column(db.String(20))
    endereco_completo = db.Column(db.String(500))
    telefone_comercial = db.Column(db.String(20))
    telefone_emergencial = db.Column(db.String(20))
    email = db.Column(db.String(100))
    website = db.Column(db.String(100))
    data_fundacao = db.Column(db.Date)
    observacoes = db.Column(db.Text)  # Campo para observações gerais
    link_cotacao = db.Column(db.String(200))  # Link para cotação da transportadora
    etiqueta = db.Column(db.String(50), default='CADASTRADA') # PARCEIRA, CADASTRADA, ENCERRADO
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    regulamentacoes = db.relationship('Regulamentacao', backref='empresa', lazy=True, cascade='all, delete-orphan')
    certificacoes = db.relationship('Certificacao', backref='empresa', lazy=True, cascade='all, delete-orphan')
    modalidades_transporte = db.relationship('ModalidadeTransporte', backref='empresa', lazy=True, cascade='all, delete-orphan')
    tipos_carga = db.relationship('TipoCarga', backref='empresa', lazy=True, cascade='all, delete-orphan')
    abrangencia_geografica = db.relationship('AbrangenciaGeografica', backref='empresa', lazy=True, cascade='all, delete-orphan')
    frota = db.relationship('Frota', backref='empresa', lazy=True, cascade='all, delete-orphan')
    armazenagem = db.relationship('Armazenagem', backref='empresa', lazy=True, cascade='all, delete-orphan')
    portos_terminais = db.relationship("PortoTerminal", backref="empresa", lazy="selectin", cascade="all, delete-orphan")
    seguros_coberturas = db.relationship('SeguroCobertura', backref='empresa', lazy=True, cascade='all, delete-orphan')
    tecnologias = db.relationship('Tecnologia', backref='empresa', lazy=True, cascade='all, delete-orphan')
    desempenho_qualidade = db.relationship('DesempenhoQualidade', backref='empresa', lazy=True, cascade='all, delete-orphan')
    clientes_segmentos = db.relationship('ClienteSegmento', backref='empresa', lazy=True, cascade='all, delete-orphan')
    recursos_humanos = db.relationship('RecursoHumano', backref='empresa', lazy=True, cascade='all, delete-orphan')
    sustentabilidade = db.relationship('Sustentabilidade', backref='empresa', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'razao_social': self.razao_social,
            'nome_fantasia': self.nome_fantasia,
            'cnpj': self.cnpj,
            'email': self.email,
            'telefone_comercial': self.telefone_comercial,
            'etiqueta': self.etiqueta
        }

    def to_dict_complete(self):
        # Eliminar duplicatas de portos_terminais
        portos_unicos = {}
        for p in self.portos_terminais:
            chave = f"{p.nome_porto_terminal}|{p.tipo_terminal}"
            if chave not in portos_unicos:
                portos_unicos[chave] = p.to_dict()
        
        return {
            'id': self.id,
            'razao_social': self.razao_social,
            'nome_fantasia': self.nome_fantasia,
            'cnpj': self.cnpj,
            'inscricao_estadual': self.inscricao_estadual,
            'endereco_completo': self.endereco_completo,
            'telefone_comercial': self.telefone_comercial,
            'telefone_emergencial': self.telefone_emergencial,
            'email': self.email,
            'website': self.website,
            'observacoes': self.observacoes,
            'link_cotacao': self.link_cotacao,
            'etiqueta': self.etiqueta,
            'data_fundacao': self.data_fundacao.strftime('%Y-%m-%d') if self.data_fundacao else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'regulamentacoes': [r.to_dict() for r in self.regulamentacoes],
            'certificacoes': [c.to_dict() for c in self.certificacoes],
            'modalidades_transporte': [m.to_dict() for m in self.modalidades_transporte],
            'tipos_carga': [t.to_dict() for t in self.tipos_carga],
            'abrangencia_geografica': [a.to_dict() for a in self.abrangencia_geografica],
            'frota': [f.to_dict() for f in self.frota],
            'armazenagem': [a.to_dict() for a in self.armazenagem],
            'portos_terminais': list(portos_unicos.values()),
            'seguros_coberturas': [s.to_dict() for s in self.seguros_coberturas],
            'tecnologias': [t.to_dict() for t in self.tecnologias],
            'desempenho_qualidade': [d.to_dict() for d in self.desempenho_qualidade],
            'clientes_segmentos': [c.to_dict() for c in self.clientes_segmentos],
            'recursos_humanos': [r.to_dict() for r in self.recursos_humanos],
            'sustentabilidade': [s.to_dict() for s in self.sustentabilidade]
        }

class Regulamentacao(db.Model):
    __tablename__ = 'regulamentacoes'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    tipo_regulamentacao = db.Column(db.String(100), nullable=False)
    numero_registro = db.Column(db.String(100))
    data_emissao = db.Column(db.Date)
    data_validade = db.Column(db.Date)
    orgao_emissor = db.Column(db.String(100))

    def to_dict(self):
        return {
            'id': self.id,
            'tipo_regulamentacao': self.tipo_regulamentacao,
            'numero_registro': self.numero_registro,
            'data_emissao': self.data_emissao.strftime('%Y-%m-%d') if self.data_emissao else None,
            'data_validade': self.data_validade.strftime('%Y-%m-%d') if self.data_validade else None,
            'orgao_emissor': self.orgao_emissor
        }

class Certificacao(db.Model):
    __tablename__ = 'certificacoes'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    nome_certificacao = db.Column(db.String(100), nullable=False)
    numero_certificacao = db.Column(db.String(100))
    data_emissao = db.Column(db.Date)
    data_validade = db.Column(db.Date)
    orgao_certificador = db.Column(db.String(100))

    def to_dict(self):
        return {
            'id': self.id,
            'nome_certificacao': self.nome_certificacao,
            'numero_certificacao': self.numero_certificacao,
            'data_emissao': self.data_emissao.strftime('%Y-%m-%d') if self.data_emissao else None,
            'data_validade': self.data_validade.strftime('%Y-%m-%d') if self.data_validade else None,
            'orgao_certificador': self.orgao_certificador
        }

class ModalidadeTransporte(db.Model):
    __tablename__ = 'modalidades_transporte'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    modalidade = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'modalidade': self.modalidade
        }

class TipoCarga(db.Model):
    __tablename__ = 'tipos_carga'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    tipo_carga = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'tipo_carga': self.tipo_carga
        }

class AbrangenciaGeografica(db.Model):
    __tablename__ = 'abrangencia_geografica'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    tipo_abrangencia = db.Column(db.String(100), nullable=False) # Ex: Nacional, Regional, Internacional
    detalhes = db.Column(db.String(500)) # Ex: Estados atendidos, rotas específicas

    def to_dict(self):
        return {
            'id': self.id,
            'tipo_abrangencia': self.tipo_abrangencia,
            'detalhes': self.detalhes
        }

class Frota(db.Model):
    __tablename__ = 'frota'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    tipo_frota = db.Column(db.String(100), nullable=False) # Ex: Própria, Terceirizada
    quantidade = db.Column(db.Integer)
    tipo_veiculo = db.Column(db.String(100)) # Ex: Carreta, Caminhão, Van
    tipo_carroceria = db.Column(db.String(100)) # Ex: Baú, Sider, Graneleiro
    capacidade = db.Column(db.Float) # Capacidade em toneladas
    ano_medio = db.Column(db.Integer) # Ano médio da frota

    def to_dict(self):
        return {
            'id': self.id,
            'tipo_frota': self.tipo_frota,
            'quantidade': self.quantidade,
            'tipo_veiculo': self.tipo_veiculo,
            'tipo_carroceria': self.tipo_carroceria,
            'capacidade': self.capacidade,
            'ano_medio': self.ano_medio
        }

class Armazenagem(db.Model):
    __tablename__ = 'armazenagem'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    possui_armazem = db.Column(db.Boolean, nullable=False)
    localizacao = db.Column(db.String(255))
    capacidade_m2 = db.Column(db.Float)
    capacidade_m3 = db.Column(db.Float)
    tipos_armazenagem = db.Column(db.String(255)) # Ex: Seca, Refrigerada, Climatizada
    servicos_oferecidos = db.Column(db.String(500)) # Ex: Cross-docking, Picking, Packing, Controle de inventário

    def to_dict(self):
        return {
            'id': self.id,
            'possui_armazem': self.possui_armazem,
            'localizacao': self.localizacao,
            'capacidade_m2': self.capacidade_m2,
            'capacidade_m3': self.capacidade_m3,
            'tipos_armazenagem': self.tipos_armazenagem,
            'servicos_oferecidos': self.servicos_oferecidos
        }

class PortoTerminal(db.Model):
    __tablename__ = 'portos_terminais'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    nome_porto_terminal = db.Column(db.String(255), nullable=False)
    tipo_terminal = db.Column(db.String(100)) # Ex: Marítimo, Ferroviário, Rodoviário

    def to_dict(self):
        return {
            'id': self.id,
            'nome_porto_terminal': self.nome_porto_terminal,
            'tipo_terminal': self.tipo_terminal
        }

class SeguroCobertura(db.Model):
    __tablename__ = 'seguros_coberturas'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    tipo_seguro = db.Column(db.String(100), nullable=False) # Ex: RCTR-C, RC-DC, RCTF-DA
    numero_apolice = db.Column(db.String(100))
    data_validade = db.Column(db.Date)
    seguradora = db.Column(db.String(100))
    valor_cobertura = db.Column(db.String(50))  # Valor da cobertura como string formatada

    def to_dict(self):
        return {
            'id': self.id,
            'tipo_seguro': self.tipo_seguro,
            'numero_apolice': self.numero_apolice,
            'data_validade': self.data_validade.strftime('%Y-%m-%d') if self.data_validade else None,
            'seguradora': self.seguradora,
            'valor_cobertura': self.valor_cobertura
        }

class Tecnologia(db.Model):
    __tablename__ = 'tecnologias'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    nome_tecnologia = db.Column(db.String(100), nullable=False) # Ex: Rastreamento GPS, Telemetria, TMS, WMS
    detalhes = db.Column(db.String(500))

    def to_dict(self):
        return {
            'id': self.id,
            'nome_tecnologia': self.nome_tecnologia,
            'detalhes': self.detalhes
        }

class DesempenhoQualidade(db.Model):
    __tablename__ = 'desempenho_qualidade'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    prazo_medio_atendimento = db.Column(db.String(100)) # Em dias ou horas
    unidade_prazo = db.Column(db.String(10), default='dias') # 'horas' ou 'dias'
    indice_avarias_extravios = db.Column(db.Float) # Percentual
    indice_entregas_prazo = db.Column(db.Float) # Percentual

    def to_dict(self):
        return {
            'id': self.id,
            'prazo_medio_atendimento': self.prazo_medio_atendimento,
            'unidade_prazo': self.unidade_prazo,
            'indice_avarias_extravios': self.indice_avarias_extravios,
            'indice_entregas_prazo': self.indice_entregas_prazo
        }

class ClienteSegmento(db.Model):
    __tablename__ = 'clientes_segmentos'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    segmento = db.Column(db.String(100), nullable=False) # Ex: Varejo, Indústria, Agronegócio
    principais_clientes = db.Column(db.String(500)) # Lista dos principais clientes

    def to_dict(self):
        return {
            'id': self.id,
            'segmento': self.segmento,
            'principais_clientes': self.principais_clientes
        }

class RecursoHumano(db.Model):
    __tablename__ = 'recursos_humanos'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    numero_funcionarios = db.Column(db.Integer)
    programas_treinamento = db.Column(db.String(500)) # Ex: Direção defensiva, Produtos perigosos

    def to_dict(self):
        return {
            'id': self.id,
            'numero_funcionarios': self.numero_funcionarios,
            'programas_treinamento': self.programas_treinamento
        }

class Sustentabilidade(db.Model):
    __tablename__ = 'sustentabilidade'
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.id'), nullable=False)
    certificacao_ambiental = db.Column(db.String(100)) # Ex: ISO 14001
    programas_reducao_emissoes = db.Column(db.String(500)) # Ex: Frota Euro 5/6, Biodiesel

    def to_dict(self):
        return {
            'id': self.id,
            'certificacao_ambiental': self.certificacao_ambiental,
            'programas_reducao_emissoes': self.programas_reducao_emissoes
        }

