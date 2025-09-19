#!/usr/bin/env python3
"""
Script de migração para BRCcSis v1.3.2
Adiciona as colunas necessárias para as novas funcionalidades
Verifica se as tabelas existem antes de tentar modificá-las
"""

import sqlite3
import os

def table_exists(cursor, table_name):
    """Verifica se uma tabela existe no banco de dados"""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
    return cursor.fetchone() is not None

def column_exists(cursor, table_name, column_name):
    """Verifica se uma coluna existe em uma tabela"""
    if not table_exists(cursor, table_name):
        return False
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [column[1] for column in cursor.fetchall()]
    return column_name in columns

def migrate_database():
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    schema_path = os.path.join(os.path.dirname(__file__), 'schema_sqlite.sql')

    # Garante que o diretório 'database' existe
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    # Se o banco de dados não existe, cria ele do zero com o schema completo
    if not os.path.exists(db_path):
        print("Banco de dados não encontrado. Criando novo banco com o schema completo...")
        with open(schema_path, 'r') as f:
            schema = f.read()
        
        conn = sqlite3.connect(db_path)
        conn.executescript(schema)
        conn.close()
        print("Banco de dados criado com sucesso com o schema completo!")
        return # Sai da função, pois o banco já está atualizado
    
    print("Iniciando migração do banco de dados existente...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar e criar tabela usuarios se não existir
        if not table_exists(cursor, 'usuarios'):
            print("Criando tabela 'usuarios'...")
            cursor.execute("""
                CREATE TABLE usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(80) UNIQUE NOT NULL,
                    email VARCHAR(120) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    nome_completo VARCHAR(200) NOT NULL,
                    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'operador',
                    ativo BOOLEAN NOT NULL DEFAULT 1,
                    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                    ultimo_login DATETIME,
                    tentativas_login INTEGER DEFAULT 0,
                    bloqueado_ate DATETIME
                )
            """)
            print("✅ Tabela 'usuarios' criada com sucesso!")
        else:
            print("✅ Tabela 'usuarios' já existe.")

        # Verificar e criar tabela logs_auditoria se não existir
        if not table_exists(cursor, 'logs_auditoria'):
            print("Criando tabela 'logs_auditoria'...")
            cursor.execute("""
                CREATE TABLE logs_auditoria (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER,
                    acao VARCHAR(100) NOT NULL,
                    recurso VARCHAR(100) NOT NULL,
                    detalhes TEXT,
                    ip_address VARCHAR(45),
                    user_agent VARCHAR(500),
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
                )
            """)
            print("✅ Tabela 'logs_auditoria' criada com sucesso!")
        else:
            print("✅ Tabela 'logs_auditoria' já existe.")

        # Adicionar coluna unidade_prazo na tabela desempenho_qualidade (se a tabela existir)
        if table_exists(cursor, 'desempenho_qualidade'):
            if not column_exists(cursor, 'desempenho_qualidade', 'unidade_prazo'):
                print("Adicionando coluna 'unidade_prazo' na tabela desempenho_qualidade...")
                cursor.execute("ALTER TABLE desempenho_qualidade ADD COLUMN unidade_prazo TEXT DEFAULT 'horas'")
                print("✅ Coluna 'unidade_prazo' adicionada com sucesso!")
            else:
                print("✅ Coluna 'unidade_prazo' já existe.")
        else:
            print("⚠️ Tabela 'desempenho_qualidade' não existe, pulando migração desta coluna.")
        
        # Adicionar coluna valor_cobertura na tabela seguro_cobertura (se a tabela existir)
        if table_exists(cursor, 'seguro_cobertura'):
            if not column_exists(cursor, 'seguro_cobertura', 'valor_cobertura'):
                print("Adicionando coluna 'valor_cobertura' na tabela seguro_cobertura...")
                cursor.execute("ALTER TABLE seguro_cobertura ADD COLUMN valor_cobertura TEXT")
                print("✅ Coluna 'valor_cobertura' adicionada com sucesso!")
            else:
                print("✅ Coluna 'valor_cobertura' já existe.")
        else:
            print("⚠️ Tabela 'seguro_cobertura' não existe, pulando migração desta coluna.")
        
        # Adicionar colunas na tabela empresas (v1.3.2)
        if table_exists(cursor, 'empresas'):
            if not column_exists(cursor, 'empresas', 'observacoes'):
                print("Adicionando coluna 'observacoes' na tabela empresas...")
                cursor.execute("ALTER TABLE empresas ADD COLUMN observacoes TEXT")
                print("✅ Coluna 'observacoes' adicionada com sucesso!")
            else:
                print("✅ Coluna 'observacoes' já existe.")
                
            if not column_exists(cursor, 'empresas', 'link_cotacao'):
                print("Adicionando coluna 'link_cotacao' na tabela empresas...")
                cursor.execute("ALTER TABLE empresas ADD COLUMN link_cotacao VARCHAR(200)")
                print("✅ Coluna 'link_cotacao' adicionada com sucesso!")
            else:
                print("✅ Coluna 'link_cotacao' já existe.")
        else:
            print("⚠️ Tabela 'empresas' não existe, pulando migração destas colunas.")
        
        # Adicionar colunas na tabela frota (se a tabela existir)
        if table_exists(cursor, 'frota'):
            if not column_exists(cursor, 'frota', 'ano_fabricacao'):
                print("Adicionando coluna 'ano_fabricacao' na tabela frota...")
                cursor.execute("ALTER TABLE frota ADD COLUMN ano_fabricacao INTEGER")
                print("✅ Coluna 'ano_fabricacao' adicionada com sucesso!")
            else:
                print("✅ Coluna 'ano_fabricacao' já existe.")
                
            if not column_exists(cursor, 'frota', 'capacidade_carga'):
                print("Adicionando coluna 'capacidade_carga' na tabela frota...")
                cursor.execute("ALTER TABLE frota ADD COLUMN capacidade_carga TEXT")
                print("✅ Coluna 'capacidade_carga' adicionada com sucesso!")
            else:
                print("✅ Coluna 'capacidade_carga' já existe.")
        else:
            print("⚠️ Tabela 'frota' não existe, pulando migração destas colunas.")

        # Adicionar coluna principais_clientes na tabela cliente_segmento (se a tabela existir)
        if table_exists(cursor, 'cliente_segmento'):
            if not column_exists(cursor, 'cliente_segmento', 'principais_clientes'):
                print("Adicionando coluna 'principais_clientes' na tabela cliente_segmento...")
                cursor.execute("ALTER TABLE cliente_segmento ADD COLUMN principais_clientes TEXT")
                print("✅ Coluna 'principais_clientes' adicionada com sucesso!")
            else:
                print("✅ Coluna 'principais_clientes' já existe.")
        else:
            print("⚠️ Tabela 'cliente_segmento' não existe, pulando migração desta coluna.")

        # Verificar se existe usuário admin, se não existir, criar
        cursor.execute("SELECT COUNT(*) FROM usuarios WHERE username = 'admin'")
        if cursor.fetchone()[0] == 0:
            print("Criando usuário administrador padrão...")
            from werkzeug.security import generate_password_hash
            password_hash = generate_password_hash('admin123', method='pbkdf2:sha256', salt_length=16)
            cursor.execute("""
                INSERT INTO usuarios (username, email, password_hash, nome_completo, tipo_usuario, ativo)
                VALUES (?, ?, ?, ?, ?, ?)
            """, ('admin', 'admin@brchina.com', password_hash, 'Administrador do Sistema', 'administrador', True))
            print("✅ Usuário administrador criado com sucesso!")
            print("   Usuário: admin")
            print("   Senha: admin123")
            print("   ⚠️ ALTERE A SENHA APÓS O PRIMEIRO LOGIN!")
        else:
            print("✅ Usuário administrador já existe.")

        conn.commit()
        print("\n🎉 Migração concluída com sucesso!")
        print("\n📋 Resumo:")
        print("   - Tabelas de usuários e logs criadas/verificadas")
        print("   - Colunas adicionais migradas (quando aplicável)")
        print("   - Usuário administrador configurado")
        print("\n🚀 O sistema está pronto para uso!")
        
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()

