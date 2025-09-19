#!/usr/bin/env python3
"""
Script para verificar valores no banco de dados
"""

import sqlite3
import os

def check_db_values():
    """Verifica valores no banco de dados"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔍 Verificando valores no banco de dados...")
        
        # Verificar cotações
        cursor.execute("SELECT id, empresa_transporte, status FROM cotacoes")
        cotacoes = cursor.fetchall()
        
        print(f"📊 Cotações encontradas:")
        for cotacao_id, empresa_transporte, status in cotacoes:
            print(f"  ID: {cotacao_id}, Empresa: {empresa_transporte}, Status: {status}")
        
        # Verificar valores únicos
        cursor.execute("SELECT DISTINCT empresa_transporte FROM cotacoes")
        empresas_unicas = cursor.fetchall()
        print(f"\n📋 Valores únicos de empresa_transporte: {[e[0] for e in empresas_unicas]}")
        
        cursor.execute("SELECT DISTINCT status FROM cotacoes")
        status_unicos = cursor.fetchall()
        print(f"📋 Valores únicos de status: {[s[0] for s in status_unicos]}")
        
    except Exception as e:
        print(f"❌ Erro ao verificar banco: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_db_values()

