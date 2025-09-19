#!/usr/bin/env python3
"""
Script para corrigir nomes de enum no banco de dados
"""

import sqlite3
import os

def fix_enum_names():
    """Corrige nomes de enum no banco de dados"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔧 Corrigindo nomes de enum no banco de dados...")
        
        # Verificar valores atuais
        cursor.execute("SELECT id, empresa_transporte, status FROM cotacoes")
        cotacoes = cursor.fetchall()
        
        print(f"📊 Encontradas {len(cotacoes)} cotações")
        
        # Mapear valores para nomes de enum
        empresa_mapping = {
            'brcargo_rodoviario': 'BRCARGO_RODOVIARIO',
            'brcargo_maritimo': 'BRCARGO_MARITIMO', 
            'frete_aereo': 'FRETE_AEREO'
        }
        
        status_mapping = {
            'solicitada': 'SOLICITADA',
            'aceita_operador': 'ACEITA_OPERADOR',
            'cotacao_enviada': 'COTACAO_ENVIADA',
            'aceita_consultor': 'ACEITA_CONSULTOR',
            'negada_consultor': 'NEGADA_CONSULTOR',
            'finalizada': 'FINALIZADA'
        }
        
        updates = 0
        for cotacao_id, empresa_transporte, status in cotacoes:
            nova_empresa = empresa_mapping.get(empresa_transporte, empresa_transporte)
            novo_status = status_mapping.get(status, status)
            
            if nova_empresa != empresa_transporte or novo_status != status:
                cursor.execute(
                    "UPDATE cotacoes SET empresa_transporte = ?, status = ? WHERE id = ?",
                    (nova_empresa, novo_status, cotacao_id)
                )
                print(f"✅ Cotação {cotacao_id}: {empresa_transporte} → {nova_empresa}, {status} → {novo_status}")
                updates += 1
            else:
                print(f"ℹ️  Cotação {cotacao_id}: {empresa_transporte}, {status} (já correto)")
        
        # Commit das mudanças
        conn.commit()
        print(f"🎉 Correção concluída! {updates} cotações atualizadas.")
        
        # Verificar resultado
        cursor.execute("SELECT DISTINCT empresa_transporte FROM cotacoes")
        empresas_unicas = cursor.fetchall()
        print(f"📋 Empresas únicas após correção: {[e[0] for e in empresas_unicas]}")
        
        cursor.execute("SELECT DISTINCT status FROM cotacoes")
        status_unicos = cursor.fetchall()
        print(f"📋 Status únicos após correção: {[s[0] for s in status_unicos]}")
        
    except Exception as e:
        print(f"❌ Erro ao corrigir banco: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    fix_enum_names()

