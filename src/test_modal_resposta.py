#!/usr/bin/env python3
"""
Script para testar o modal de resposta de cotação
Cria uma cotação de teste com status 'aceita_operador' se necessário
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar Flask app antes de importar modelos
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Criar app temporária para teste
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database/brccsis.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'test-key'

# Inicializar SQLAlchemy
db = SQLAlchemy(app)

# Importar modelos após configurar app
from models.cotacao import Cotacao, StatusCotacao
from models.usuario import Usuario
from models.empresa import Empresa
from datetime import datetime

def criar_cotacao_teste():
    """Cria uma cotação de teste com status aceita_operador"""
    with app.app_context():
        # Buscar um usuário consultor
        consultor = Usuario.query.filter_by(tipo_usuario='consultor').first()
        if not consultor:
            print("❌ Nenhum consultor encontrado. Criando um...")
            consultor = Usuario(
                username='consultor_teste',
                nome_completo='Consultor Teste',
                email='consultor@teste.com',
                tipo_usuario='consultor'
            )
            consultor.set_password('123456')
            db.session.add(consultor)
            db.session.commit()
            print("✅ Consultor criado")
        
        # Buscar um operador
        operador = Usuario.query.filter_by(tipo_usuario='operador').first()
        if not operador:
            print("❌ Nenhum operador encontrado. Criando um...")
            operador = Usuario(
                username='operador_teste',
                nome_completo='Operador Teste',
                email='operador@teste.com',
                tipo_usuario='operador'
            )
            operador.set_password('123456')
            db.session.add(operador)
            db.session.commit()
            print("✅ Operador criado")
        
        # Verificar se já existe cotação aceita_operador
        cotacao_existente = Cotacao.query.filter_by(status=StatusCotacao.ACEITA_OPERADOR).first()
        if cotacao_existente:
            print(f"✅ Já existe cotação com status aceita_operador: {cotacao_existente.numero_cotacao}")
            return cotacao_existente
        
        # Criar cotação de teste
        cotacao = Cotacao(
            consultor_id=consultor.id,
            operador_id=operador.id,
            status=StatusCotacao.ACEITA_OPERADOR,
            cliente_nome='Empresa Teste Ltda',
            cliente_cnpj='12.345.678/0001-90',
            cliente_contato_telefone='(11) 99999-9999',
            cliente_contato_email='contato@empresateste.com',
            origem_cep='01310-100',
            origem_endereco='Av. Paulista, 1000',
            origem_cidade='São Paulo',
            origem_estado='SP',
            destino_cep='20040-020',
            destino_endereco='Av. Rio Branco, 500',
            destino_cidade='Rio de Janeiro',
            destino_estado='RJ',
            carga_descricao='Equipamentos eletrônicos',
            carga_peso_kg=150.50,
            carga_valor_mercadoria=25000.00,
            servico_prazo_desejado=5,
            servico_tipo='expresso',
            servico_observacoes='Carga frágil, manuseio cuidadoso',
            data_aceite_operador=datetime.now()
        )
        
        db.session.add(cotacao)
        db.session.commit()
        
        print(f"✅ Cotação de teste criada: {cotacao.numero_cotacao}")
        print(f"   Status: {cotacao.status.value}")
        print(f"   Consultor: {consultor.nome_completo}")
        print(f"   Operador: {operador.nome_completo}")
        
        return cotacao

def listar_cotacoes():
    """Lista todas as cotações e seus status"""
    with app.app_context():
        cotacoes = Cotacao.query.all()
        
        if not cotacoes:
            print("❌ Nenhuma cotação encontrada no banco de dados")
            return
        
        print(f"\n📋 Total de cotações: {len(cotacoes)}")
        print("-" * 80)
        
        for cotacao in cotacoes:
            print(f"ID: {cotacao.id:3d} | {cotacao.numero_cotacao:15s} | {cotacao.status.value:20s} | {cotacao.cliente_nome}")
        
        print("-" * 80)
        
        # Contar por status
        status_count = {}
        for cotacao in cotacoes:
            status = cotacao.status.value
            status_count[status] = status_count.get(status, 0) + 1
        
        print("\n📊 Cotações por status:")
        for status, count in status_count.items():
            emoji = "🟢" if status == "aceita_operador" else "🔵"
            print(f"   {emoji} {status}: {count}")

def main():
    print("🧪 Teste do Modal de Resposta de Cotação")
    print("=" * 50)
    
    # Listar cotações existentes
    listar_cotacoes()
    
    # Verificar se há cotações aceita_operador
    with app.app_context():
        cotacoes_aceitas = Cotacao.query.filter_by(status=StatusCotacao.ACEITA_OPERADOR).count()
        
        if cotacoes_aceitas == 0:
            print(f"\n⚠️  Nenhuma cotação com status 'aceita_operador' encontrada")
            print("   Criando uma cotação de teste...")
            criar_cotacao_teste()
        else:
            print(f"\n✅ {cotacoes_aceitas} cotação(ões) com status 'aceita_operador' encontrada(s)")
    
    print("\n🔧 Instruções para testar o modal:")
    print("1. Acesse http://127.0.0.1:5000 no navegador")
    print("2. Faça login com um usuário operador")
    print("3. Vá para a seção de Cotações")
    print("4. Procure por cotações com status 'Aceita pelo Operador'")
    print("5. Clique no botão 'Responder' (azul)")
    print("6. O modal deve abrir com o formulário de resposta")
    
    print("\n💡 Se o botão 'Responder' não aparecer:")
    print("- Recarregue a página com Ctrl+F5 (ou Cmd+Shift+R)")
    print("- Verifique o console do navegador (F12) por erros")
    print("- Certifique-se de estar logado como operador")

if __name__ == '__main__':
    main()
