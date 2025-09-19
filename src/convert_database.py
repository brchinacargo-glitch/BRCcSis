#!/usr/bin/env python3
"""
Script para converter banco de dados para a nova versão do sistema
"""

import sqlite3
import os

def convert_database():
    """Converte banco de dados para nova versão"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔧 Convertendo banco de dados para nova versão...")
        
        # Verificar estrutura atual
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"📊 Tabelas encontradas: {[t[0] for t in tables]}")
        
        # Verificar cotações
        try:
            cursor.execute("SELECT id, empresa_transporte, status FROM cotacoes LIMIT 5")
            cotacoes = cursor.fetchall()
            print(f"📋 Cotações encontradas: {len(cotacoes)}")
            
            if cotacoes:
                print("📝 Primeiras 5 cotações:")
                for cotacao_id, empresa_transporte, status in cotacoes:
                    print(f"  ID: {cotacao_id}, Empresa: {empresa_transporte}, Status: {status}")
        except Exception as e:
            print(f"⚠️  Erro ao ler cotações: {e}")
        
        # Mapear valores antigos para novos (empresa_transporte)
        empresa_mapping = {
            'brcargo_rodoviario': 'BRCARGO_RODOVIARIO',
            'brcargo_maritimo': 'BRCARGO_MARITIMO', 
            'frete_aereo': 'FRETE_AEREO',
            'BRCARGO': 'BRCARGO_RODOVIARIO',
            'brcargo': 'BRCARGO_RODOVIARIO'
        }
        
        # Mapear valores antigos para novos (status)
        status_mapping = {
            'solicitada': 'SOLICITADA',
            'aceita_operador': 'ACEITA_OPERADOR',
            'cotacao_enviada': 'COTACAO_ENVIADA',
            'aceita_consultor': 'ACEITA_CONSULTOR',
            'negada_consultor': 'NEGADA_CONSULTOR',
            'finalizada': 'FINALIZADA'
        }
        
        # Aplicar conversões
        cursor.execute("SELECT id, empresa_transporte, status FROM cotacoes")
        all_cotacoes = cursor.fetchall()
        
        updates = 0
        for cotacao_id, empresa_transporte, status in all_cotacoes:
            nova_empresa = empresa_mapping.get(empresa_transporte, empresa_transporte)
            novo_status = status_mapping.get(status, status)
            
            if nova_empresa != empresa_transporte or novo_status != status:
                cursor.execute(
                    "UPDATE cotacoes SET empresa_transporte = ?, status = ? WHERE id = ?",
                    (nova_empresa, novo_status, cotacao_id)
                )
                print(f"✅ Cotação {cotacao_id}: {empresa_transporte} → {nova_empresa}, {status} → {novo_status}")
                updates += 1
        
        # Commit das mudanças
        conn.commit()
        print(f"🎉 Conversão concluída! {updates} cotações atualizadas.")
        
        # Verificar resultado final
        cursor.execute("SELECT DISTINCT empresa_transporte FROM cotacoes")
        empresas_unicas = cursor.fetchall()
        print(f"📋 Empresas únicas após conversão: {[e[0] for e in empresas_unicas]}")
        
        cursor.execute("SELECT DISTINCT status FROM cotacoes")
        status_unicos = cursor.fetchall()
        print(f"📋 Status únicos após conversão: {[s[0] for s in status_unicos]}")
        
        # Verificar total de cotações
        cursor.execute("SELECT COUNT(*) FROM cotacoes")
        total_cotacoes = cursor.fetchone()[0]
        print(f"📊 Total de cotações no banco: {total_cotacoes}")
        
    except Exception as e:
        print(f"❌ Erro ao converter banco: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    convert_database()

