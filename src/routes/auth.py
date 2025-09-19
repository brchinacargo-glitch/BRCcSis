from flask import Blueprint, request, jsonify, session, redirect, url_for, render_template_string
from flask_login import login_user, logout_user, login_required, current_user
from src.models.usuario import Usuario, LogAuditoria, db
from datetime import datetime
import re

auth_bp = Blueprint('auth', __name__)

# Template HTML para página de login
LOGIN_TEMPLATE = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - BRCcSis</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #228B22 0%, #DC143C 100%);
        }
        .login-card {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.95);
        }
    </style>
</head>
<body class="gradient-bg min-h-screen flex items-center justify-center">
    <div class="login-card rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
            <img src="logo-brchina.png" alt="BRChina" class="h-16 mx-auto mb-4">
            <h1 class="text-3xl font-bold text-gray-800">BRCcSis</h1>
            <p class="text-gray-600 mt-2">Sistema de Gestão Logística</p>
        </div>
        
        <form id="loginForm" class="space-y-6">
            <div>
                <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-user mr-2"></i>Usuário
                </label>
                <input type="text" id="username" name="username" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            </div>
            
            <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-lock mr-2"></i>Senha
                </label>
                <input type="password" id="password" name="password" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            </div>
            
            <div id="errorMessage" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            </div>
            
            <button type="submit" id="loginButton"
                    class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                <i class="fas fa-sign-in-alt mr-2"></i>Entrar
            </button>
        </form>
        
        <div class="mt-8 text-center text-sm text-gray-600">
            <p>© 2025 BRChina - Todos os direitos reservados</p>
            <p class="mt-1">Projetado por Inácio Victor</p>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('errorMessage');
            const loginButton = document.getElementById('loginButton');
            
            // Reset error message
            errorDiv.classList.add('hidden');
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Entrando...';
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    window.location.href = '/';
                } else {
                    errorDiv.textContent = data.error || 'Erro ao fazer login';
                    errorDiv.classList.remove('hidden');
                }
            } catch (error) {
                errorDiv.textContent = 'Erro de conexão. Tente novamente.';
                errorDiv.classList.remove('hidden');
            } finally {
                loginButton.disabled = false;
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Entrar';
            }
        });
    </script>
</body>
</html>
"""

@auth_bp.route('/login', methods=['GET'])
def login_page():
    """Exibe a página de login"""
    if current_user.is_authenticated:
        return redirect('/')
    return render_template_string(LOGIN_TEMPLATE)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """Endpoint para autenticação de usuários"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Usuário e senha são obrigatórios'}), 400
        
        # Busca o usuário
        usuario = Usuario.query.filter_by(username=username).first()
        
        if not usuario:
            # Log de tentativa de login com usuário inexistente
            LogAuditoria.registrar_acao(
                usuario_id=None,
                acao='LOGIN_FALHA',
                recurso='AUTH',
                detalhes=f'Tentativa de login com usuário inexistente: {username}',
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            return jsonify({'error': 'Usuário ou senha incorretos'}), 401
        
        # Verifica se o usuário está bloqueado
        if not usuario.is_active():
            LogAuditoria.registrar_acao(
                usuario_id=usuario.id,
                acao='LOGIN_BLOQUEADO',
                recurso='AUTH',
                detalhes='Tentativa de login com usuário bloqueado',
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            return jsonify({'error': 'Usuário temporariamente bloqueado. Tente novamente mais tarde.'}), 401
        
        # Verifica a senha
        if not usuario.check_password(password):
            usuario.incrementar_tentativas_login()
            LogAuditoria.registrar_acao(
                usuario_id=usuario.id,
                acao='LOGIN_FALHA',
                recurso='AUTH',
                detalhes='Senha incorreta',
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            return jsonify({'error': 'Usuário ou senha incorretos'}), 401
        
        # Login bem-sucedido
        login_user(usuario, remember=False, duration=None)  # Não lembrar login e sem duração específica
        usuario.resetar_tentativas_login()
        
        # Configurar sessão para expirar ao fechar navegador
        session.permanent = False
        
        LogAuditoria.registrar_acao(
            usuario_id=usuario.id,
            acao='LOGIN_SUCESSO',
            recurso='AUTH',
            detalhes='Login realizado com sucesso',
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'usuario': usuario.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@auth_bp.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    """Endpoint para logout de usuários"""
    try:
        LogAuditoria.registrar_acao(
            usuario_id=current_user.id,
            acao='LOGOUT',
            recurso='AUTH',
            detalhes='Logout realizado',
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        logout_user()
        return jsonify({'message': 'Logout realizado com sucesso'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@auth_bp.route('/api/auth/user-info', methods=['GET'])
@login_required
def get_user_info():
    """Retorna informações básicas do usuário atual para o rodapé"""
    return jsonify({
        'username': current_user.username,
        'nome': current_user.nome_completo,
        'tipo': current_user.tipo_usuario.value if current_user.tipo_usuario else 'operador'
    }), 200

@auth_bp.route('/api/auth/me', methods=['GET'])
@login_required
def get_current_user():
    """Retorna informações do usuário atual"""
    return jsonify(current_user.to_dict()), 200

@auth_bp.route('/api/auth/usuarios', methods=['GET'])
@login_required
def listar_usuarios():
    """Lista todos os usuários (apenas administradores)"""
    if not current_user.pode_acessar('gerenciar_usuarios'):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        usuarios = Usuario.query.all()
        return jsonify([usuario.to_dict() for usuario in usuarios]), 200
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@auth_bp.route('/api/auth/usuarios', methods=['POST'])
@login_required
def criar_usuario():
    """Cria um novo usuário (apenas administradores)"""
    if not current_user.pode_acessar('gerenciar_usuarios'):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        data = request.get_json()
        
        # Validações
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        nome_completo = data.get('nome_completo', '').strip()
        tipo_usuario = data.get('tipo_usuario', 'operador')
        
        if not all([username, email, password, nome_completo]):
            return jsonify({'error': 'Todos os campos são obrigatórios'}), 400
        
        # Validação de email
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'error': 'Email inválido'}), 400
        
        # Verifica se usuário já existe
        if Usuario.query.filter_by(username=username).first():
            return jsonify({'error': 'Nome de usuário já existe'}), 400
        
        if Usuario.query.filter_by(email=email).first():
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Cria o usuário
        from src.models.usuario import TipoUsuario
        usuario = Usuario(
            username=username,
            email=email,
            nome_completo=nome_completo,
            tipo_usuario=TipoUsuario(tipo_usuario)
        )
        usuario.set_password(password)
        
        db.session.add(usuario)
        db.session.commit()
        
        LogAuditoria.registrar_acao(
            usuario_id=current_user.id,
            acao='CRIAR_USUARIO',
            recurso='USUARIOS',
            detalhes=f'Usuário criado: {username}',
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'usuario': usuario.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro interno do servidor'}), 500

@auth_bp.route('/api/auth/usuarios/<int:usuario_id>', methods=['PUT'])
@login_required
def editar_usuario(usuario_id):
    """Edita um usuário existente (apenas administradores)"""
    if not current_user.pode_acessar('gerenciar_usuarios'):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        usuario = Usuario.query.get_or_404(usuario_id)
        data = request.get_json()
        
        # Validações
        nome_completo = data.get('nome_completo', '').strip()
        email = data.get('email', '').strip()
        tipo_usuario = data.get('tipo_usuario')
        ativo = data.get('ativo', True)
        nova_senha = data.get('nova_senha', '').strip()
        
        if not all([nome_completo, email]):
            return jsonify({'error': 'Nome completo e email são obrigatórios'}), 400
        
        # Validação de email
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'error': 'Email inválido'}), 400
        
        # Verifica se email já existe (exceto para o próprio usuário)
        email_existente = Usuario.query.filter(Usuario.email == email, Usuario.id != usuario_id).first()
        if email_existente:
            return jsonify({'error': 'Email já cadastrado para outro usuário'}), 400
        
        # Atualizar dados
        usuario.nome_completo = nome_completo
        usuario.email = email
        usuario.ativo = ativo
        
        if tipo_usuario:
            from src.models.usuario import TipoUsuario
            usuario.tipo_usuario = TipoUsuario(tipo_usuario)
        
        # Alterar senha se fornecida
        if nova_senha:
            usuario.set_password(nova_senha)
        
        db.session.commit()
        
        LogAuditoria.registrar_acao(
            usuario_id=current_user.id,
            acao='EDITAR_USUARIO',
            recurso='USUARIOS',
            detalhes=f'Usuário editado: {usuario.username}',
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        return jsonify({
            'message': 'Usuário atualizado com sucesso',
            'usuario': usuario.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro interno do servidor'}), 500

@auth_bp.route('/api/auth/usuarios/<int:usuario_id>/toggle-status', methods=['POST'])
@login_required
def toggle_status_usuario(usuario_id):
    """Ativa/desativa um usuário (apenas administradores)"""
    if not current_user.pode_acessar('gerenciar_usuarios'):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        usuario = Usuario.query.get_or_404(usuario_id)
        
        # Não permitir desativar o próprio usuário
        if usuario.id == current_user.id:
            return jsonify({'error': 'Não é possível desativar seu próprio usuário'}), 400
        
        usuario.ativo = not usuario.ativo
        db.session.commit()
        
        acao = 'ATIVAR_USUARIO' if usuario.ativo else 'DESATIVAR_USUARIO'
        LogAuditoria.registrar_acao(
            usuario_id=current_user.id,
            acao=acao,
            recurso='USUARIOS',
            detalhes=f'Status do usuário {usuario.username} alterado para {"ativo" if usuario.ativo else "inativo"}',
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        return jsonify({
            'message': f'Usuário {"ativado" if usuario.ativo else "desativado"} com sucesso',
            'usuario': usuario.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro interno do servidor'}), 500

@auth_bp.route('/api/auth/check-permission', methods=['POST'])
@login_required
def check_permission():
    """Verifica se o usuário atual tem permissão para um recurso"""
    try:
        data = request.get_json()
        recurso = data.get('recurso')
        
        if not recurso:
            return jsonify({'error': 'Recurso não especificado'}), 400
        
        permitido = current_user.pode_acessar(recurso)
        
        return jsonify({
            'permitido': permitido,
            'usuario': current_user.username,
            'tipo_usuario': current_user.tipo_usuario.value
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@auth_bp.route('/api/auth/migrar-usuarios', methods=['POST'])
@login_required
def migrar_usuarios():
    """Migra usuários de um backup (apenas administradores)"""
    if not current_user.pode_acessar('gerenciar_usuarios'):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        if not file.filename.endswith('.json'):
            return jsonify({'error': 'Apenas arquivos JSON são aceitos'}), 400
        
        # Ler conteúdo do arquivo
        import json
        content = file.read().decode('utf-8')
        data = json.loads(content)
        
        # Validar estrutura do arquivo
        if 'usuarios' not in data:
            return jsonify({'error': 'Arquivo inválido: campo "usuarios" não encontrado'}), 400
        
        usuarios_migrados = 0
        usuarios_existentes = 0
        erros = []
        
        for usuario_data in data['usuarios']:
            try:
                # Verificar se usuário já existe
                usuario_existente = Usuario.query.filter_by(username=usuario_data['username']).first()
                if usuario_existente:
                    usuarios_existentes += 1
                    continue
                
                # Criar novo usuário
                novo_usuario = Usuario(
                    username=usuario_data['username'],
                    email=usuario_data['email'],
                    nome_completo=usuario_data['nome_completo'],
                    tipo_usuario=TipoUsuario(usuario_data['tipo_usuario']),
                    ativo=usuario_data.get('ativo', True)
                )
                
                # Definir senha (usar senha padrão se não fornecida)
                senha = usuario_data.get('senha', 'senha123')
                novo_usuario.set_password(senha)
                
                db.session.add(novo_usuario)
                usuarios_migrados += 1
                
            except Exception as e:
                erros.append(f"Erro ao migrar usuário {usuario_data.get('username', 'desconhecido')}: {str(e)}")
        
        db.session.commit()
        
        # Registrar log da migração
        LogAuditoria.registrar_acao(
            usuario_id=current_user.id,
            acao='MIGRAR_USUARIOS',
            recurso='USUARIOS',
            detalhes=f'Migração de usuários: {usuarios_migrados} criados, {usuarios_existentes} já existiam',
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        return jsonify({
            'success': True,
            'usuarios_migrados': usuarios_migrados,
            'usuarios_existentes': usuarios_existentes,
            'erros': erros,
            'message': f'Migração concluída: {usuarios_migrados} usuários criados, {usuarios_existentes} já existiam'
        }), 200
        
    except json.JSONDecodeError:
        return jsonify({'error': 'Arquivo JSON inválido'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/api/auth/exportar-usuarios', methods=['GET'])
@login_required
def exportar_usuarios():
    """Exporta usuários para backup (apenas administradores)"""
    if not current_user.pode_acessar('gerenciar_usuarios'):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        from flask import send_file
        import json
        import tempfile
        import os
        
        usuarios = Usuario.query.all()
        
        usuarios_data = []
        for usuario in usuarios:
            usuarios_data.append({
                'username': usuario.username,
                'email': usuario.email,
                'nome_completo': usuario.nome_completo,
                'tipo_usuario': usuario.tipo_usuario.value,
                'ativo': usuario.ativo,
                'data_criacao': usuario.data_criacao.isoformat() if usuario.data_criacao else None
            })
        
        # Criar arquivo temporário
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
            json.dump({
                'usuarios': usuarios_data,
                'total_usuarios': len(usuarios_data),
                'data_exportacao': datetime.utcnow().isoformat(),
                'exportado_por': current_user.username,
                'versao_sistema': 'v1.3.2'
            }, f, indent=2, ensure_ascii=False)
            temp_path = f.name
        
        # Registrar log da exportação
        LogAuditoria.registrar_acao(
            usuario_id=current_user.id,
            acao='EXPORTAR_USUARIOS',
            recurso='USUARIOS',
            detalhes=f'Exportação de {len(usuarios_data)} usuários para backup',
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=f'usuarios_backup_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.json',
            mimetype='application/json'
        )
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500
    finally:
        # Limpar arquivo temporário
        try:
            if 'temp_path' in locals():
                os.unlink(temp_path)
        except:
            pass

@auth_bp.route('/api/auth/logs/export', methods=['GET'])
@login_required
def exportar_logs():
    """Exporta logs de auditoria (apenas administradores)"""
    if not current_user.pode_acessar('gerenciar_usuarios'):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        from flask import send_file
        import json
        import tempfile
        import os
        
        logs = LogAuditoria.query.order_by(LogAuditoria.timestamp.desc()).all()
        
        logs_data = []
        for log in logs:
            logs_data.append({
                'id': log.id,
                'usuario': log.usuario.username if log.usuario else 'Sistema',
                'acao': log.acao,
                'recurso': log.recurso,
                'detalhes': log.detalhes,
                'ip_address': log.ip_address,
                'user_agent': log.user_agent,
                'timestamp': log.timestamp.isoformat() if log.timestamp else None
            })
        
        # Criar arquivo temporário
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
            json.dump({
                'logs_auditoria': logs_data,
                'total_logs': len(logs_data),
                'data_exportacao': datetime.utcnow().isoformat(),
                'exportado_por': current_user.username
            }, f, indent=2, ensure_ascii=False)
            temp_path = f.name
        
        # Registrar log da exportação
        LogAuditoria.registrar_acao(
            usuario_id=current_user.id,
            acao='EXPORTAR_LOGS',
            recurso='LOGS',
            detalhes=f'Exportação de {len(logs_data)} logs de auditoria',
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=f'logs_auditoria_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.json',
            mimetype='application/json'
        )
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500
    finally:
        # Limpar arquivo temporário
        try:
            if 'temp_path' in locals():
                os.unlink(temp_path)
        except:
            pass

@auth_bp.route('/api/auth/logs', methods=['GET'])
@login_required
def listar_logs():
    """Lista logs de auditoria (apenas administradores)"""
    if not current_user.pode_acessar('gerenciar_usuarios'):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        logs = LogAuditoria.query.order_by(LogAuditoria.timestamp.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'logs': [log.to_dict() for log in logs.items],
            'total': logs.total,
            'pages': logs.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

