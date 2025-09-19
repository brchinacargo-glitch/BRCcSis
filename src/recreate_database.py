#!/usr/bin/env python3
from main import app
from models import db
import os

with app.app_context():
    # Fazer backup do banco atual se existir
    if os.path.exists('database.db'):
        os.rename('database.db', 'database_backup.db')
        print("Backup do banco criado: database_backup.db")
    
    # Recriar todas as tabelas
    db.create_all()
    print("Banco de dados recriado com sucesso!")
    
    # Verificar se as tabelas foram criadas
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Tabelas criadas: {tables}")
    
    # Verificar colunas da tabela cotacoes
    if 'cotacoes' in tables:
        columns = inspector.get_columns('cotacoes')
        print('\nColunas na tabela cotacoes:')
        for col in columns:
            print(f'  {col["name"]} - {col["type"]}')

