#!/usr/bin/env python3
"""
Script para corrigir valores de enum no banco de dados
"""

import sqlite3
import os

def fix_enum_values():
    """Corrige valores de enum no banco de dados"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔧 Corrigindo valores de enum no banco de dados...")
        
        # Verificar valores atuais
        cursor.execute("SELECT id, empresa_transporte FROM cotacoes")
        cotacoes = cursor.fetchall()
        
        print(f"📊 Encontradas {len(cotacoes)} cotações")
        
        # Mapear valores antigos para novos
        mapping = {
            'BRCARGO': 'brcargo_rodoviario',
            'brcargo': 'brcargo_rodoviario',
            'BRCARGO_RODOVIARIO': 'brcargo_rodoviario',
            'BRCARGO_MARITIMO': 'brcargo_maritimo',
            'FRETE_AEREO': 'frete_aereo',
            'frete_aereo': 'frete_aereo'
        }
        
        updates = 0
        for cotacao_id, empresa_transporte in cotacoes:
            if empresa_transporte in mapping:
                novo_valor = mapping[empresa_transporte]
                cursor.execute(
                    "UPDATE cotacoes SET empresa_transporte = ? WHERE id = ?",
                    (novo_valor, cotacao_id)
                )
                print(f"✅ Cotação {cotacao_id}: {empresa_transporte} → {novo_valor}")
                updates += 1
            else:
                print(f"ℹ️  Cotação {cotacao_id}: {empresa_transporte} (já correto)")
        
        # Commit das mudanças
        conn.commit()
        print(f"🎉 Correção concluída! {updates} cotações atualizadas.")
        
        # Verificar resultado
        cursor.execute("SELECT DISTINCT empresa_transporte FROM cotacoes")
        valores_unicos = cursor.fetchall()
        print(f"📋 Valores únicos após correção: {[v[0] for v in valores_unicos]}")
        
    except Exception as e:
        print(f"❌ Erro ao corrigir banco: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    fix_enum_values()

