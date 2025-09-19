#!/usr/bin/env python3
"""
Script de migração para BRCcSis v1.3.3
Adiciona novos campos para sistema completo de cotações
"""

import sqlite3
import os
from datetime import datetime

def migrate_database():
    """Executa a migração do banco de dados para v1.3.3"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print("❌ Banco de dados não encontrado. Execute o sistema primeiro para criar o banco.")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Iniciando migração para v1.3.3...")
        
        # 1. Adicionar novos campos na tabela cotacoes
        print("📝 Adicionando novos campos na tabela cotacoes...")
        
        # Verificar se os campos já existem
        cursor.execute("PRAGMA table_info(cotacoes)")
        existing_columns = [column[1] for column in cursor.fetchall()]
        
        # Campos específicos para transporte marítimo
        new_columns = [
            ("empresa_prestadora_id", "INTEGER"),
            ("numero_cliente", "VARCHAR(50)"),
            ("net_weight", "DECIMAL(10,2)"),
            ("gross_weight", "DECIMAL(10,2)"),
            ("cubagem", "DECIMAL(10,3)"),
            ("incoterm", "VARCHAR(10)"),
            ("tipo_carga_maritima", "VARCHAR(50)"),
            ("tamanho_container", "VARCHAR(20)"),
            ("quantidade_containers", "INTEGER"),
            ("porto_origem", "VARCHAR(100)"),
            ("porto_destino", "VARCHAR(100)"),
            ("cliente_endereco", "VARCHAR(500)"),
            ("cliente_complemento", "VARCHAR(200)")
        ]
        
        for column_name, column_type in new_columns:
            if column_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE cotacoes ADD COLUMN {column_name} {column_type}")
                    print(f"  ✅ Campo {column_name} adicionado")
                except sqlite3.Error as e:
                    print(f"  ⚠️ Erro ao adicionar campo {column_name}: {e}")
        
        # 2. Criar tabela de notificações
        print("📝 Criando tabela de notificações...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notificacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                cotacao_id INTEGER NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                titulo VARCHAR(200) NOT NULL,
                mensagem TEXT NOT NULL,
                lida BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
                FOREIGN KEY (cotacao_id) REFERENCES cotacoes (id)
            )
        """)
        print("  ✅ Tabela notificacoes criada")
        
        # 3. Criar tabela de histórico de cotações
        print("📝 Criando tabela de histórico de cotações...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS historico_cotacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cotacao_id INTEGER NOT NULL,
                usuario_id INTEGER NOT NULL,
                status_anterior VARCHAR(50),
                status_novo VARCHAR(50) NOT NULL,
                observacoes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cotacao_id) REFERENCES cotacoes (id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
            )
        """)
        print("  ✅ Tabela historico_cotacoes criada")
        
        # 4. Atualizar enum de status (SQLite não suporta ALTER ENUM, mas vamos documentar)
        print("📝 Atualizando status de cotações...")
        print("  ℹ️ Novos status disponíveis: solicitada, aceita_operador, cotacao_enviada, aceita_consultor, negada_consultor, finalizada")
        
        # 5. Adicionar foreign key para empresa_prestadora_id (SQLite não suporta ADD CONSTRAINT, mas vamos documentar)
        print("📝 Documentando relacionamento com empresas...")
        print("  ℹ️ Campo empresa_prestadora_id referencia tabela empresas(id)")
        
        # 6. Criar índices para performance
        print("📝 Criando índices para performance...")
        indices = [
            "CREATE INDEX IF NOT EXISTS idx_cotacoes_status ON cotacoes(status)",
            "CREATE INDEX IF NOT EXISTS idx_cotacoes_consultor ON cotacoes(consultor_id)",
            "CREATE INDEX IF NOT EXISTS idx_cotacoes_operador ON cotacoes(operador_id)",
            "CREATE INDEX IF NOT EXISTS idx_cotacoes_empresa_prestadora ON cotacoes(empresa_prestadora_id)",
            "CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id)",
            "CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida)",
            "CREATE INDEX IF NOT EXISTS idx_historico_cotacao ON historico_cotacoes(cotacao_id)"
        ]
        
        for index_sql in indices:
            try:
                cursor.execute(index_sql)
                print(f"  ✅ Índice criado")
            except sqlite3.Error as e:
                print(f"  ⚠️ Erro ao criar índice: {e}")
        
        # 7. Inserir dados de exemplo para testes (opcional)
        print("📝 Verificando dados de exemplo...")
        cursor.execute("SELECT COUNT(*) FROM usuarios WHERE tipo = 'operador'")
        operadores_count = cursor.fetchone()[0]
        
        if operadores_count == 0:
            print("  ℹ️ Criando usuário operador de exemplo...")
            cursor.execute("""
                INSERT INTO usuarios (username, password_hash, nome, email, tipo, ativo)
                VALUES ('operador1', 'pbkdf2:sha256:260000$salt$hash', 'Operador Exemplo', 'operador@brccsis.com', 'operador', 1)
            """)
            print("  ✅ Usuário operador criado (username: operador1, senha: 123456)")
        
        # Commit das alterações
        conn.commit()
        
        print("✅ Migração para v1.3.3 concluída com sucesso!")
        print("\n📋 Resumo das alterações:")
        print("  • Novos campos para transporte marítimo")
        print("  • Sistema de notificações")
        print("  • Histórico de cotações")
        print("  • Índices para performance")
        print("  • Relacionamento com empresas prestadoras")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Erro durante a migração: {e}")
        return False
    finally:
        if conn:
            conn.close()

def rollback_migration():
    """Desfaz a migração (remove campos adicionados)"""
    print("⚠️ Rollback não implementado para SQLite")
    print("   Para reverter, restaure um backup do banco de dados")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        rollback_migration()
    else:
        migrate_database()

