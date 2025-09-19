#!/usr/bin/env python3
"""
Script para verificar usuários no banco de dados
"""

import sqlite3
import os

def check_users():
    """Verifica usuários no banco de dados"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔍 Verificando usuários no banco de dados...")
        
        # Verificar se a tabela usuarios existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("❌ Tabela 'usuarios' não encontrada!")
            
            # Verificar outras tabelas possíveis
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            print(f"📋 Tabelas disponíveis: {[t[0] for t in tables]}")
            
            # Tentar tabela 'user'
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user'")
            user_table = cursor.fetchone()
            
            if user_table:
                print("✅ Encontrada tabela 'user'")
                cursor.execute("SELECT * FROM user")
                users = cursor.fetchall()
                print(f"👥 Usuários na tabela 'user': {len(users)}")
                for user in users:
                    print(f"   - {user}")
            
            return
        
        # Listar usuários
        cursor.execute("SELECT * FROM usuarios")
        users = cursor.fetchall()
        
        print(f"👥 Total de usuários: {len(users)}")
        
        if users:
            # Mostrar estrutura da tabela
            cursor.execute("PRAGMA table_info(usuarios)")
            columns = cursor.fetchall()
            column_names = [col[1] for col in columns]
            print(f"📋 Colunas: {column_names}")
            
            # Mostrar usuários
            for user in users:
                print(f"   - {user}")
        else:
            print("⚠️  Nenhum usuário encontrado!")
            
            # Criar usuário admin se não existir
            print("🔧 Criando usuário admin...")
            cursor.execute("""
                INSERT INTO usuarios (username, password, nome, tipo, ativo) 
                VALUES (?, ?, ?, ?, ?)
            """, ('admin', 'admin123', 'Administrador', 'admin', True))
            
            conn.commit()
            print("✅ Usuário admin criado!")
        
    except Exception as e:
        print(f"❌ Erro ao verificar usuários: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_users()

