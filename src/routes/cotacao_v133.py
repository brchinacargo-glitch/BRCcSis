"""
Rotas adicionais para BRCcSis v1.3.3
Sistema completo de fluxo de cotações
"""

from flask import Blueprint, request, jsonify
from flask_cors import CORS
from flask_login import login_required, current_user
from sqlalchemy import or_, and_, desc, func
from datetime import datetime, date
import re

from src.models import db
from src.models.cotacao import Cotacao, HistoricoCotacao, StatusCotacao, EmpresaCotacao
from src.models.usuario import Usuario, TipoUsuario
from src.models.notificacao import Notificacao, TipoNotificacao
from src.models.empresa import Empresa

cotacao_v133_bp = Blueprint("cotacao_v133", __name__)
CORS(cotacao_v133_bp)

# ==================== ROTAS PARA OPERADORES ====================

@cotacao_v133_bp.route("/cotacoes/disponiveis", methods=["GET"])
@login_required
def obter_cotacoes_disponiveis():
    """Obtém cotações disponíveis para operadores aceitarem"""
    try:
        # Verificar permissão
        if current_user.tipo_usuario not in [TipoUsuario.OPERADOR, TipoUsuario.ADMINISTRADOR, TipoUsuario.GERENTE]:
            return jsonify({
                'success': False,
                'message': 'Acesso negado'
            }), 403
        
        # Buscar cotações com status SOLICITADA
        cotacoes = Cotacao.query.filter_by(
            status=StatusCotacao.SOLICITADA
        ).order_by(Cotacao.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'cotacoes': [cotacao.to_dict() for cotacao in cotacoes]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@cotacao_v133_bp.route("/cotacoes/<int:cotacao_id>/aceitar-operador", methods=["POST"])
@login_required
def aceitar_cotacao_operador(cotacao_id):
    """Operador aceita uma cotação"""
    try:
        # Verificar permissão
        if current_user.tipo_usuario not in [TipoUsuario.OPERADOR, TipoUsuario.ADMINISTRADOR, TipoUsuario.GERENTE]:
            return jsonify({
                'success': False,
                'message': 'Apenas operadores podem aceitar cotações'
            }), 403
        
        cotacao = Cotacao.query.get_or_404(cotacao_id)
        
        data = request.get_json() or {}
        observacoes = data.get('observacoes')
        
        # Aceitar cotação usando método do modelo
        cotacao.aceitar_por_operador(current_user.id, observacoes)
        
        return jsonify({
            'success': True,
            'message': 'Cotação aceita com sucesso',
            'cotacao': cotacao.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@cotacao_v133_bp.route("/cotacoes/<int:cotacao_id>/enviar-resposta", methods=["POST"])
@login_required
def enviar_resposta_cotacao(cotacao_id):
    """Operador envia resposta da cotação"""
    try:
        # Verificar permissão
        if current_user.tipo_usuario not in [TipoUsuario.OPERADOR, TipoUsuario.ADMINISTRADOR, TipoUsuario.GERENTE]:
            return jsonify({
                'success': False,
                'message': 'Apenas operadores podem responder cotações'
            }), 403
        
        cotacao = Cotacao.query.get_or_404(cotacao_id)
        
        # Verificar se o operador é responsável pela cotação
        if cotacao.operador_id != current_user.id and current_user.tipo_usuario == TipoUsuario.OPERADOR:
            return jsonify({
                'success': False,
                'message': 'Você não é responsável por esta cotação'
            }), 403
        
        data = request.get_json()
        
        # Validações
        if not data.get('empresa_prestadora_id'):
            return jsonify({
                'success': False,
                'message': 'Empresa prestadora é obrigatória'
            }), 400
        
        # Verificar se a empresa existe
        empresa = Empresa.query.get(data['empresa_prestadora_id'])
        if not empresa:
            return jsonify({
                'success': False,
                'message': 'Empresa prestadora não encontrada'
            }), 400
        
        # Enviar cotação usando método do modelo
        cotacao.enviar_cotacao(
            valor_frete=data.get('valor_frete'),
            prazo_entrega=data.get('prazo_entrega'),
            observacoes=data.get('observacoes'),
            empresa_prestadora_id=data['empresa_prestadora_id']
        )
        
        return jsonify({
            'success': True,
            'message': 'Resposta enviada com sucesso',
            'cotacao': cotacao.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@cotacao_v133_bp.route("/cotacoes/minhas-operacoes", methods=["GET"])
@login_required
def obter_minhas_operacoes():
    """Obtém cotações que o operador está gerenciando"""
    try:
        # Verificar permissão
        if current_user.tipo_usuario not in [TipoUsuario.OPERADOR, TipoUsuario.ADMINISTRADOR, TipoUsuario.GERENTE]:
            return jsonify({
                'success': False,
                'message': 'Acesso negado'
            }), 403
        
        # Para operadores, mostrar apenas suas cotações
        # Para admin/gerente, mostrar todas
        if current_user.tipo_usuario == TipoUsuario.OPERADOR:
            cotacoes = Cotacao.query.filter_by(
                operador_id=current_user.id
            ).order_by(Cotacao.updated_at.desc()).all()
        else:
            cotacoes = Cotacao.query.filter(
                Cotacao.operador_id.isnot(None)
            ).order_by(Cotacao.updated_at.desc()).all()
        
        return jsonify({
            'success': True,
            'cotacoes': [cotacao.to_dict() for cotacao in cotacoes]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

# ==================== ROTAS PARA CONSULTORES ====================

@cotacao_v133_bp.route("/cotacoes/<int:cotacao_id>/aceitar-consultor", methods=["POST"])
@login_required
def aceitar_cotacao_consultor(cotacao_id):
    """Consultor aceita uma cotação"""
    try:
        # Verificar permissão
        if current_user.tipo_usuario not in [TipoUsuario.CONSULTOR, TipoUsuario.ADMINISTRADOR, TipoUsuario.GERENTE]:
            return jsonify({
                'success': False,
                'message': 'Apenas consultores podem aceitar cotações'
            }), 403
        
        cotacao = Cotacao.query.get_or_404(cotacao_id)
        
        # Verificar se o consultor é dono da cotação
        if cotacao.consultor_id != current_user.id and current_user.tipo_usuario == TipoUsuario.CONSULTOR:
            return jsonify({
                'success': False,
                'message': 'Você não é responsável por esta cotação'
            }), 403
        
        data = request.get_json() or {}
        observacoes = data.get('observacoes')
        
        # Aceitar cotação usando método do modelo
        cotacao.aceitar_por_consultor(observacoes)
        
        return jsonify({
            'success': True,
            'message': 'Cotação aceita com sucesso',
            'cotacao': cotacao.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@cotacao_v133_bp.route("/cotacoes/<int:cotacao_id>/negar-consultor", methods=["POST"])
@login_required
def negar_cotacao_consultor(cotacao_id):
    """Consultor nega uma cotação"""
    try:
        # Verificar permissão
        if current_user.tipo_usuario not in [TipoUsuario.CONSULTOR, TipoUsuario.ADMINISTRADOR, TipoUsuario.GERENTE]:
            return jsonify({
                'success': False,
                'message': 'Apenas consultores podem negar cotações'
            }), 403
        
        cotacao = Cotacao.query.get_or_404(cotacao_id)
        
        # Verificar se o consultor é dono da cotação
        if cotacao.consultor_id != current_user.id and current_user.tipo_usuario == TipoUsuario.CONSULTOR:
            return jsonify({
                'success': False,
                'message': 'Você não é responsável por esta cotação'
            }), 403
        
        data = request.get_json() or {}
        observacoes = data.get('observacoes')
        
        # Negar cotação usando método do modelo
        cotacao.negar_por_consultor(observacoes)
        
        return jsonify({
            'success': True,
            'message': 'Cotação negada',
            'cotacao': cotacao.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@cotacao_v133_bp.route("/cotacoes/minhas-solicitacoes", methods=["GET"])
@login_required
def obter_minhas_solicitacoes():
    """Obtém cotações solicitadas pelo consultor"""
    try:
        # Verificar permissão
        if current_user.tipo_usuario not in [TipoUsuario.CONSULTOR, TipoUsuario.ADMINISTRADOR, TipoUsuario.GERENTE]:
            return jsonify({
                'success': False,
                'message': 'Acesso negado'
            }), 403
        
        # Para consultores, mostrar apenas suas cotações
        # Para admin/gerente, mostrar todas
        if current_user.tipo_usuario == TipoUsuario.CONSULTOR:
            cotacoes = Cotacao.query.filter_by(
                consultor_id=current_user.id
            ).order_by(Cotacao.created_at.desc()).all()
        else:
            cotacoes = Cotacao.query.order_by(Cotacao.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'cotacoes': [cotacao.to_dict() for cotacao in cotacoes]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

# ==================== ROTAS PARA SEPARAÇÃO POR MODALIDADE ====================

@cotacao_v133_bp.route("/cotacoes/rodoviarias", methods=["GET"])
@login_required
def obter_cotacoes_rodoviarias():
    """Obtém cotações rodoviárias"""
    try:
        cotacoes = Cotacao.query.filter_by(
            empresa_transporte=EmpresaCotacao.BRCARGO_RODOVIARIO
        ).order_by(Cotacao.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'cotacoes': [cotacao.to_dict() for cotacao in cotacoes]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@cotacao_v133_bp.route("/cotacoes/maritimas", methods=["GET"])
@login_required
def obter_cotacoes_maritimas():
    """Obtém cotações marítimas"""
    try:
        cotacoes = Cotacao.query.filter_by(
            empresa_transporte=EmpresaCotacao.BRCARGO_MARITIMO
        ).order_by(Cotacao.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'cotacoes': [cotacao.to_dict() for cotacao in cotacoes]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@cotacao_v133_bp.route("/cotacoes/aereas", methods=["GET"])
@login_required
def obter_cotacoes_aereas():
    """Obtém cotações aéreas"""
    try:
        cotacoes = Cotacao.query.filter_by(
            empresa_transporte=EmpresaCotacao.FRETE_AEREO
        ).order_by(Cotacao.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'cotacoes': [cotacao.to_dict() for cotacao in cotacoes]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

# ==================== ROTAS PARA NOTIFICAÇÕES ====================

@cotacao_v133_bp.route("/notificacoes", methods=["GET"])
@login_required
def obter_notificacoes():
    """Obtém notificações do usuário"""
    try:
        # Parâmetros de consulta
        apenas_nao_lidas = request.args.get('apenas_nao_lidas', 'false').lower() == 'true'
        limit = int(request.args.get('limit', 50))
        
        query = Notificacao.query.filter_by(usuario_id=current_user.id)
        
        if apenas_nao_lidas:
            query = query.filter_by(lida=False)
        
        notificacoes = query.order_by(
            Notificacao.created_at.desc()
        ).limit(limit).all()
        
        return jsonify({
            'success': True,
            'notificacoes': [notif.to_dict() for notif in notificacoes],
            'total_nao_lidas': Notificacao.contar_nao_lidas(current_user.id)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@cotacao_v133_bp.route("/notificacoes/<int:notificacao_id>/marcar-lida", methods=["POST"])
@login_required
def marcar_notificacao_lida(notificacao_id):
    """Marca uma notificação como lida"""
    try:
        sucesso = Notificacao.marcar_como_lida(notificacao_id, current_user.id)
        
        if sucesso:
            return jsonify({
                'success': True,
                'message': 'Notificação marcada como lida'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Notificação não encontrada'
            }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@cotacao_v133_bp.route("/notificacoes/marcar-todas-lidas", methods=["POST"])
@login_required
def marcar_todas_notificacoes_lidas():
    """Marca todas as notificações do usuário como lidas"""
    try:
        Notificacao.query.filter_by(
            usuario_id=current_user.id,
            lida=False
        ).update({'lida': True})
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Todas as notificações foram marcadas como lidas'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

# ==================== ROTAS PARA HISTÓRICO ====================

@cotacao_v133_bp.route("/cotacoes/<int:cotacao_id>/historico", methods=["GET"])
@login_required
def obter_historico_cotacao(cotacao_id):
    """Obtém histórico completo de uma cotação"""
    try:
        cotacao = Cotacao.query.get_or_404(cotacao_id)
        
        # Verificar permissão de visualização
        pode_visualizar = (
            current_user.tipo_usuario in [TipoUsuario.ADMINISTRADOR, TipoUsuario.GERENTE] or
            cotacao.consultor_id == current_user.id or
            cotacao.operador_id == current_user.id
        )
        
        if not pode_visualizar:
            return jsonify({
                'success': False,
                'message': 'Acesso negado'
            }), 403
        
        historico = HistoricoCotacao.obter_historico_cotacao(cotacao_id)
        
        return jsonify({
            'success': True,
            'historico': [item.to_dict() for item in historico]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

