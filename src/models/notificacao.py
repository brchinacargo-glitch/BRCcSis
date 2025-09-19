"""
Modelo para sistema de notificações
"""

from enum import Enum
from . import db
from .usuario import get_brasilia_time

class TipoNotificacao(Enum):
    NOVA_COTACAO = "nova_cotacao"  # Para operadores: nova cotação disponível
    COTACAO_ACEITA = "cotacao_aceita"  # Para consultor: operador aceitou cotação
    COTACAO_RESPONDIDA = "cotacao_respondida"  # Para consultor: cotação foi respondida
    COTACAO_FINALIZADA = "cotacao_finalizada"  # Para todos: cotação foi finalizada

class Notificacao(db.Model):
    __tablename__ = 'notificacoes'
    
    # Identificação
    id = db.Column(db.Integer, primary_key=True)
    
    # Relacionamentos
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    cotacao_id = db.Column(db.Integer, db.ForeignKey('cotacoes.id'), nullable=False)
    
    # Dados da notificação
    tipo = db.Column(db.Enum(TipoNotificacao), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    mensagem = db.Column(db.Text, nullable=False)
    lida = db.Column(db.Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=get_brasilia_time)
    
    # Relacionamentos
    usuario = db.relationship('Usuario', backref='notificacoes')
    cotacao = db.relationship('Cotacao', backref='notificacoes')
    
    def __repr__(self):
        return f'<Notificacao {self.id}: {self.titulo}>'
    
    def to_dict(self):
        """Converte a notificação para dicionário"""
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'cotacao_id': self.cotacao_id,
            'tipo': self.tipo.value if self.tipo else None,
            'titulo': self.titulo,
            'mensagem': self.mensagem,
            'lida': self.lida,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'cotacao_numero': self.cotacao.numero_cotacao if self.cotacao else None
        }
    
    @staticmethod
    def criar_notificacao(usuario_id, cotacao_id, tipo, titulo, mensagem):
        """Cria uma nova notificação"""
        notificacao = Notificacao(
            usuario_id=usuario_id,
            cotacao_id=cotacao_id,
            tipo=tipo,
            titulo=titulo,
            mensagem=mensagem
        )
        
        db.session.add(notificacao)
        db.session.commit()
        
        return notificacao
    
    @staticmethod
    def marcar_como_lida(notificacao_id, usuario_id):
        """Marca uma notificação como lida"""
        notificacao = Notificacao.query.filter_by(
            id=notificacao_id,
            usuario_id=usuario_id
        ).first()
        
        if notificacao:
            notificacao.lida = True
            db.session.commit()
            return True
        
        return False
    
    @staticmethod
    def obter_nao_lidas(usuario_id):
        """Obtém notificações não lidas de um usuário"""
        return Notificacao.query.filter_by(
            usuario_id=usuario_id,
            lida=False
        ).order_by(Notificacao.created_at.desc()).all()
    
    @staticmethod
    def contar_nao_lidas(usuario_id):
        """Conta notificações não lidas de um usuário"""
        return Notificacao.query.filter_by(
            usuario_id=usuario_id,
            lida=False
        ).count()
    
    @staticmethod
    def notificar_nova_cotacao(cotacao):
        """Notifica todos os operadores sobre nova cotação"""
        from .usuario import Usuario
        
        operadores = Usuario.query.filter_by(tipo='operador', ativo=True).all()
        
        for operador in operadores:
            titulo = f"Nova Cotação Disponível - {cotacao.numero_cotacao}"
            mensagem = f"Uma nova cotação foi solicitada por {cotacao.consultor.nome}. " \
                      f"Empresa: {cotacao.empresa_transporte.value}. " \
                      f"Cliente: {cotacao.cliente_nome}."
            
            Notificacao.criar_notificacao(
                usuario_id=operador.id,
                cotacao_id=cotacao.id,
                tipo=TipoNotificacao.NOVA_COTACAO,
                titulo=titulo,
                mensagem=mensagem
            )
    
    @staticmethod
    def notificar_cotacao_aceita(cotacao):
        """Notifica consultor que operador aceitou a cotação"""
        titulo = f"Cotação Aceita - {cotacao.numero_cotacao}"
        mensagem = f"Sua cotação foi aceita pelo operador {cotacao.operador.nome}. " \
                  f"Aguarde o retorno com os valores."
        
        Notificacao.criar_notificacao(
            usuario_id=cotacao.consultor_id,
            cotacao_id=cotacao.id,
            tipo=TipoNotificacao.COTACAO_ACEITA,
            titulo=titulo,
            mensagem=mensagem
        )
    
    @staticmethod
    def notificar_cotacao_respondida(cotacao):
        """Notifica consultor que cotação foi respondida"""
        titulo = f"Cotação Respondida - {cotacao.numero_cotacao}"
        mensagem = f"Sua cotação foi respondida pelo operador {cotacao.operador.nome}. " \
                  f"Valor: R$ {cotacao.cotacao_valor_frete or 'A consultar'}. " \
                  f"Prazo: {cotacao.cotacao_prazo_entrega or 'A consultar'} dias."
        
        Notificacao.criar_notificacao(
            usuario_id=cotacao.consultor_id,
            cotacao_id=cotacao.id,
            tipo=TipoNotificacao.COTACAO_RESPONDIDA,
            titulo=titulo,
            mensagem=mensagem
        )
    
    @staticmethod
    def notificar_cotacao_finalizada(cotacao, aceita=True):
        """Notifica operador sobre decisão final do consultor"""
        status_texto = "aceita" if aceita else "recusada"
        titulo = f"Cotação {status_texto.title()} - {cotacao.numero_cotacao}"
        mensagem = f"A cotação foi {status_texto} pelo consultor {cotacao.consultor.nome}."
        
        Notificacao.criar_notificacao(
            usuario_id=cotacao.operador_id,
            cotacao_id=cotacao.id,
            tipo=TipoNotificacao.COTACAO_FINALIZADA,
            titulo=titulo,
            mensagem=mensagem
        )

