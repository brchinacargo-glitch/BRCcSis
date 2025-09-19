#!/usr/bin/env python3
"""
Script para verificar estrutura da tabela cotacoes
"""

import sqlite3
import os

def check_cotacoes_structure():
    """Verifica estrutura da tabela cotacoes"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔍 Verificando estrutura da tabela cotacoes...")
        
        # Verificar estrutura da tabela cotacoes
        cursor.execute("PRAGMA table_info(cotacoes)")
        columns = cursor.fetchall()
        
        print(f"📊 Colunas da tabela cotacoes:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Verificar se há empresa_prestadora_id
        column_names = [col[1] for col in columns]
        
        if 'empresa_prestadora_id' not in column_names:
            print("⚠️  Coluna 'empresa_prestadora_id' não encontrada!")
            print("🔧 Adicionando coluna empresa_prestadora_id...")
            
            try:
                cursor.execute("ALTER TABLE cotacoes ADD COLUMN empresa_prestadora_id INTEGER")
                print("✅ Coluna 'empresa_prestadora_id' adicionada")
                
                # Atualizar cotações existentes com valor padrão
                cursor.execute("UPDATE cotacoes SET empresa_prestadora_id = 1 WHERE empresa_prestadora_id IS NULL")
                print("✅ Cotações existentes atualizadas com empresa_prestadora_id = 1")
                
                conn.commit()
            except Exception as e:
                print(f"❌ Erro ao adicionar coluna: {e}")
        else:
            print("✅ Coluna 'empresa_prestadora_id' já existe")
        
        # Verificar dados das cotações
        cursor.execute("SELECT id, numero_cotacao, empresa_transporte, status, empresa_prestadora_id FROM cotacoes LIMIT 5")
        cotacoes = cursor.fetchall()
        
        print(f"\n📋 Primeiras 5 cotações:")
        for cotacao in cotacoes:
            print(f"  ID: {cotacao[0]}, Número: {cotacao[1]}, Empresa: {cotacao[2]}, Status: {cotacao[3]}, Prestadora: {cotacao[4]}")
        
    except Exception as e:
        print(f"❌ Erro ao verificar estrutura: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_cotacoes_structure()

