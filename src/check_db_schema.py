#!/usr/bin/env python3
from main import app
from models import db
from sqlalchemy import inspect

with app.app_context():
    inspector = inspect(db.engine)
    columns = inspector.get_columns('cotacoes')
    print('Colunas na tabela cotacoes:')
    for col in columns:
        print(f'  {col["name"]} - {col["type"]}')
    
    # Verificar se as colunas marítimas existem
    column_names = [col['name'] for col in columns]
    maritime_columns = ['net_weight', 'gross_weight', 'cubagem', 'incoterm', 'tipo_carga_maritima', 'tamanho_container', 'quantidade_containers', 'porto_origem', 'porto_destino']
    
    print('\nColunas marítimas:')
    for col in maritime_columns:
        exists = col in column_names
        print(f'  {col}: {"✅ Existe" if exists else "❌ Não existe"}')

