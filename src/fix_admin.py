import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask
from src.models import db
from src.models.usuario import Usuario, TipoUsuario

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    # Verificar usuários existentes
    users = Usuario.query.all()
    print('Usuários no banco:')
    for user in users:
        print(f'- {user.username} | {user.email} | {user.tipo_usuario}')
    
    # Verificar se admin existe
    admin_user = Usuario.query.filter_by(username='admin').first()
    if admin_user:
        print(f'\nUsuário admin encontrado: {admin_user.username}')
        # Resetar senha
        admin_user.set_password('admin123')
        db.session.commit()
        print('Senha do admin resetada para: admin123')
    else:
        print('\nCriando usuário admin...')
        admin = Usuario(
            username='admin',
            email='admin@brchina.com',
            nome_completo='Administrador do Sistema',
            tipo_usuario=TipoUsuario.ADMINISTRADOR
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print('Usuário admin criado: admin / admin123')
