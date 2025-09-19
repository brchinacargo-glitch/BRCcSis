#!/usr/bin/env python3
"""
Script para corrigir valores de status no banco de dados
"""

import sqlite3
import os

def fix_status_values():
    """Corrige valores de status no banco de dados"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔧 Corrigindo valores de status no banco de dados...")
        
        # Verificar valores atuais
        cursor.execute("SELECT id, status FROM cotacoes")
        cotacoes = cursor.fetchall()
        
        print(f"📊 Encontradas {len(cotacoes)} cotações")
        
        # Mapear valores antigos para novos
        status_mapping = {
            'ACEITA_OPERADOR': 'aceita_operador',
            'SOLICITADA': 'solicitada',
            'COTACAO_ENVIADA': 'cotacao_enviada',
            'ACEITA_CONSULTOR': 'aceita_consultor',
            'NEGADA_CONSULTOR': 'negada_consultor',
            'FINALIZADA': 'finalizada'
        }
        
        updates = 0
        for cotacao_id, status in cotacoes:
            if status in status_mapping:
                novo_valor = status_mapping[status]
                cursor.execute(
                    "UPDATE cotacoes SET status = ? WHERE id = ?",
                    (novo_valor, cotacao_id)
                )
                print(f"✅ Cotação {cotacao_id}: {status} → {novo_valor}")
                updates += 1
            else:
                print(f"ℹ️  Cotação {cotacao_id}: {status} (já correto)")
        
        # Commit das mudanças
        conn.commit()
        print(f"🎉 Correção concluída! {updates} cotações atualizadas.")
        
        # Verificar resultado
        cursor.execute("SELECT DISTINCT status FROM cotacoes")
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
    fix_status_values()

