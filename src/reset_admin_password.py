#!/usr/bin/env python3
"""
Script para resetar a senha do usuário admin
"""

import sqlite3
import os
from werkzeug.security import generate_password_hash

def reset_admin_password():
    """Reseta a senha do usuário admin"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔧 Resetando senha do usuário admin...")
        
        # Gerar hash da nova senha
        new_password = "admin123"
        password_hash = generate_password_hash(new_password)
        
        # Atualizar senha do admin
        cursor.execute("""
            UPDATE usuarios 
            SET password_hash = ? 
            WHERE username = 'admin'
        """, (password_hash,))
        
        if cursor.rowcount > 0:
            conn.commit()
            print("✅ Senha do admin resetada com sucesso!")
            print(f"   Usuário: admin")
            print(f"   Nova senha: {new_password}")
        else:
            print("❌ Usuário admin não encontrado!")
        
    except Exception as e:
        print(f"❌ Erro ao resetar senha: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    reset_admin_password()

