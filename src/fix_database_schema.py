#!/usr/bin/env python3
"""
Script para corrigir estrutura do banco de dados
"""

import sqlite3
import os

def fix_database_schema():
    """Corrige estrutura do banco de dados"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔧 Corrigindo estrutura do banco de dados...")
        
        # Verificar estrutura da tabela empresas
        cursor.execute("PRAGMA table_info(empresas)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        print(f"📊 Colunas atuais da tabela empresas: {column_names}")
        
        # Colunas necessárias que podem estar faltando
        required_columns = {
            'observacoes': 'TEXT',
            'link_cotacao': 'TEXT',
            'etiqueta': 'TEXT',
            'created_at': 'DATETIME DEFAULT CURRENT_TIMESTAMP',
            'updated_at': 'DATETIME DEFAULT CURRENT_TIMESTAMP'
        }
        
        # Adicionar colunas faltantes
        for column_name, column_type in required_columns.items():
            if column_name not in column_names:
                try:
                    cursor.execute(f"ALTER TABLE empresas ADD COLUMN {column_name} {column_type}")
                    print(f"✅ Coluna '{column_name}' adicionada à tabela empresas")
                except Exception as e:
                    print(f"⚠️  Erro ao adicionar coluna '{column_name}': {e}")
        
        # Verificar estrutura da tabela cotacoes
        cursor.execute("PRAGMA table_info(cotacoes)")
        cotacao_columns = cursor.fetchall()
        cotacao_column_names = [col[1] for col in cotacao_columns]
        
        print(f"📊 Colunas atuais da tabela cotacoes: {cotacao_column_names}")
        
        # Verificar se há campo created_at na tabela cotacoes
        if 'created_at' not in cotacao_column_names:
            try:
                cursor.execute("ALTER TABLE cotacoes ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
                print("✅ Coluna 'created_at' adicionada à tabela cotacoes")
            except Exception as e:
                print(f"⚠️  Erro ao adicionar coluna 'created_at' à cotacoes: {e}")
        
        # Commit das mudanças
        conn.commit()
        print("🎉 Estrutura do banco corrigida!")
        
        # Verificar resultado final
        cursor.execute("PRAGMA table_info(empresas)")
        final_columns = cursor.fetchall()
        final_column_names = [col[1] for col in final_columns]
        print(f"📋 Colunas finais da tabela empresas: {final_column_names}")
        
    except Exception as e:
        print(f"❌ Erro ao corrigir estrutura: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    fix_database_schema()

