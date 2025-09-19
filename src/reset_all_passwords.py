#!/usr/bin/env python3
"""
Script para resetar senhas de todos os usuários
"""

import sqlite3
import os
from werkzeug.security import generate_password_hash

def reset_all_passwords():
    """Reseta senhas de todos os usuários"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔧 Resetando senhas de todos os usuários...")
        
        # Senha padrão
        default_password = "123456"
        password_hash = generate_password_hash(default_password)
        
        # Buscar todos os usuários
        cursor.execute("SELECT id, username FROM usuarios")
        users = cursor.fetchall()
        
        print(f"👥 Encontrados {len(users)} usuários")
        
        # Resetar senha de todos
        for user_id, username in users:
            cursor.execute("""
                UPDATE usuarios 
                SET password_hash = ? 
                WHERE id = ?
            """, (password_hash, user_id))
            
            print(f"   ✅ {username}: senha resetada")
        
        conn.commit()
        print(f"\n🎉 Todas as senhas foram resetadas para: {default_password}")
        
    except Exception as e:
        print(f"❌ Erro ao resetar senhas: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    reset_all_passwords()

