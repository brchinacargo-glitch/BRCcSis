from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime, timedelta
import pytz
from enum import Enum
from . import db

# Configurar fuso horário de Brasília
BRASILIA_TZ = pytz.timezone('America/Sao_Paulo')

def get_brasilia_time():
    """Retorna o horário atual de Brasília"""
    return datetime.now(BRASILIA_TZ)  # Usar a mesma instância do SQLAlchemy

class TipoUsuario(Enum):
    ADMINISTRADOR = "administrador"
    GERENTE = "gerente"
    OPERADOR = "operador"
    CONSULTOR = "consultor"

class Usuario(UserMixin, db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    nome_completo = db.Column(db.String(200), nullable=False)
    tipo_usuario = db.Column(db.Enum(TipoUsuario), nullable=False, default=TipoUsuario.OPERADOR)
    ativo = db.Column(db.Boolean, default=True, nullable=False)
    data_criacao = db.Column(db.DateTime, default=get_brasilia_time)
    ultimo_login = db.Column(db.DateTime)
    tentativas_login = db.Column(db.Integer, default=0)
    bloqueado_ate = db.Column(db.DateTime)
    
    def set_password(self, password):
        """Define a senha do usuário com hash seguro"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
    
    def check_password(self, password):
        """Verifica se a senha fornecida está correta"""
        return check_password_hash(self.password_hash, password)
    
    def is_active(self):
        """Verifica se o usuário está ativo"""
        return self.ativo and (self.bloqueado_ate is None or self.bloqueado_ate < datetime.utcnow())
    
    def pode_acessar(self, recurso):
        """Verifica se o usuário tem permissão para acessar um recurso"""
        if not self.ativo:
            return False
            
        permissoes = {
            TipoUsuario.ADMINISTRADOR: {
                'gerenciar_usuarios': True,
                'criar_empresa': True,
                'editar_empresa': True,
                'excluir_empresa': True,
                'visualizar_empresa': True,
                'acessar_administracao': True,
                'exportar_dados': True,
                'importar_dados': True,
                'importar_excel': True,
                'criar_cotacao': True,
                'visualizar_cotacoes': True,
                'aceitar_cotacao': True,
                'responder_cotacao': True,
                'finalizar_cotacao': True,
                'reatribuir_cotacao': True
            },
            TipoUsuario.GERENTE: {
                'gerenciar_usuarios': False,  # Não pode mudar dados das contas
                'criar_empresa': True,
                'editar_empresa': True,
                'excluir_empresa': True,
                'visualizar_empresa': True,
                'acessar_administracao': True,
                'exportar_dados': True,
                'importar_dados': True,
                'importar_excel': True,
                'criar_cotacao': True,
                'visualizar_cotacoes': True,
                'aceitar_cotacao': True,
                'responder_cotacao': True,
                'finalizar_cotacao': True,
                'reatribuir_cotacao': True
            },
            TipoUsuario.OPERADOR: {
                'gerenciar_usuarios': False,
                'criar_empresa': True,
                'editar_empresa': True,
                'excluir_empresa': False,
                'visualizar_empresa': True,
                'acessar_administracao': False,  # Não tem acesso à administração
                'exportar_dados': False,  # Apenas admin e gerente
                'importar_dados': False,  # Apenas admin e gerente
                'importar_excel': True,   # Operador pode importar Excel
                'criar_cotacao': False,  # Operador não cria cotações
                'visualizar_cotacoes': True,
                'aceitar_cotacao': True,
                'responder_cotacao': True,
                'finalizar_cotacao': True,
                'reatribuir_cotacao': False
            },
            TipoUsuario.CONSULTOR: {
                'gerenciar_usuarios': False,
                'criar_empresa': False,  # Só visualização
                'editar_empresa': False,  # Só visualização
                'excluir_empresa': False,  # Só visualização
                'visualizar_empresa': True,
                'acessar_administracao': False,  # Não tem acesso à administração
                'exportar_dados': False,
                'importar_dados': False,
                'importar_excel': False,
                'criar_cotacao': True,  # Consultor pode criar cotações
                'visualizar_cotacoes': True,  # Apenas suas próprias
                'aceitar_cotacao': False,
                'responder_cotacao': False,
                'finalizar_cotacao': False,
                'reatribuir_cotacao': False
            }
        }
        
        return permissoes.get(self.tipo_usuario, {}).get(recurso, False)
    
    def incrementar_tentativas_login(self):
        """Incrementa o contador de tentativas de login falhadas"""
        self.tentativas_login += 1
        if self.tentativas_login >= 5:
            # Bloqueia por 30 minutos após 5 tentativas
            from datetime import timedelta
            self.bloqueado_ate = datetime.utcnow() + timedelta(minutes=30)
        db.session.commit()
    
    def resetar_tentativas_login(self):
        """Reseta o contador de tentativas de login"""
        self.tentativas_login = 0
        self.bloqueado_ate = None
        self.ultimo_login = get_brasilia_time()
        db.session.commit()
    
    def to_dict(self):
        """Converte o usuário para dicionário (sem senha)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'nome_completo': self.nome_completo,
            'tipo_usuario': self.tipo_usuario.value,
            'ativo': self.ativo,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'ultimo_login': self.ultimo_login.isoformat() if self.ultimo_login else None
        }
    
    def __repr__(self):
        return f'<Usuario {self.username}>'

class LogAuditoria(db.Model):
    __tablename__ = 'logs_auditoria'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    acao = db.Column(db.String(100), nullable=False)
    recurso = db.Column(db.String(100), nullable=False)
    detalhes = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=get_brasilia_time)
    
    usuario = db.relationship('Usuario', backref='logs_auditoria')
    
    @staticmethod
    def registrar_acao(usuario_id, acao, recurso, detalhes=None, ip_address=None, user_agent=None):
        """Registra uma ação no log de auditoria"""
        log = LogAuditoria(
            usuario_id=usuario_id,
            acao=acao,
            recurso=recurso,
            detalhes=detalhes,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(log)
        db.session.commit()
        return log
    
    def to_dict(self):
        """Converte o log para dicionário"""
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'usuario_nome': self.usuario.nome_completo if self.usuario else 'Sistema',
            'acao': self.acao,
            'recurso': self.recurso,
            'detalhes': self.detalhes,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    def __repr__(self):
        return f'<LogAuditoria {self.acao} - {self.recurso}>'

