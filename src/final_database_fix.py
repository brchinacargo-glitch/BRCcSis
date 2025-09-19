#!/usr/bin/env python3
"""
Script final para corrigir todas as colunas faltantes no banco de dados
"""

import sqlite3
import os

def final_database_fix():
    """Corrige todas as colunas faltantes no banco de dados"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔧 Aplicando correções finais no banco de dados...")
        
        # Verificar estrutura atual da tabela cotacoes
        cursor.execute("PRAGMA table_info(cotacoes)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        print(f"📊 Colunas atuais: {len(column_names)} colunas")
        
        # Colunas que podem estar faltando
        missing_columns = {
            'numero_cliente': 'VARCHAR(50)',
            'empresa_prestadora_id': 'INTEGER',
            'tipo_carga_maritima': 'VARCHAR(100)',
            'tamanho_container': 'VARCHAR(50)',
            'quantidade_containers': 'INTEGER',
            'porto_origem': 'VARCHAR(100)',
            'porto_destino': 'VARCHAR(100)',
            'numero_gross_weight': 'NUMERIC(10,2)',
            'numero_net_weight': 'NUMERIC(10,2)',
            'cubagem': 'NUMERIC(10,2)',
            'incoterm': 'VARCHAR(10)'
        }
        
        # Adicionar colunas faltantes
        added_count = 0
        for column_name, column_type in missing_columns.items():
            if column_name not in column_names:
                try:
                    cursor.execute(f"ALTER TABLE cotacoes ADD COLUMN {column_name} {column_type}")
                    print(f"✅ Coluna '{column_name}' adicionada")
                    added_count += 1
                except Exception as e:
                    print(f"⚠️  Erro ao adicionar coluna '{column_name}': {e}")
        
        # Atualizar valores padrão para colunas importantes
        if 'empresa_prestadora_id' in missing_columns:
            cursor.execute("UPDATE cotacoes SET empresa_prestadora_id = 1 WHERE empresa_prestadora_id IS NULL")
            print("✅ Valores padrão atualizados para empresa_prestadora_id")
        
        if 'numero_cliente' in missing_columns:
            cursor.execute("UPDATE cotacoes SET numero_cliente = 'CLI-' || SUBSTR('000' || id, -3) WHERE numero_cliente IS NULL")
            print("✅ Valores padrão atualizados para numero_cliente")
        
        # Commit das mudanças
        conn.commit()
        print(f"🎉 Correções aplicadas! {added_count} colunas adicionadas.")
        
        # Verificar resultado final
        cursor.execute("PRAGMA table_info(cotacoes)")
        final_columns = cursor.fetchall()
        print(f"📋 Total de colunas após correção: {len(final_columns)}")
        
        # Testar uma consulta simples
        cursor.execute("SELECT COUNT(*) FROM cotacoes")
        total_cotacoes = cursor.fetchone()[0]
        print(f"📊 Total de cotações no banco: {total_cotacoes}")
        
    except Exception as e:
        print(f"❌ Erro ao aplicar correções: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    final_database_fix()

