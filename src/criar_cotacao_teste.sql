-- Script SQL para criar uma cotação de teste com status 'aceita_operador'
-- Execute este script no seu banco de dados SQLite

-- Primeiro, verificar se há usuários
SELECT 'Usuários existentes:' as info;
SELECT id, username, nome_completo, tipo_usuario FROM usuarios LIMIT 5;

-- Verificar cotações existentes
SELECT 'Cotações existentes:' as info;
SELECT id, numero_cotacao, status, cliente_nome FROM cotacoes LIMIT 5;

-- Inserir cotação de teste (ajuste os IDs conforme seus usuários)
INSERT INTO cotacoes (
    numero_cotacao,
    consultor_id,
    operador_id,
    status,
    cliente_nome,
    cliente_cnpj,
    origem_cep,
    origem_endereco,
    origem_cidade,
    origem_estado,
    destino_cep,
    destino_endereco,
    destino_cidade,
    destino_estado,
    carga_descricao,
    carga_peso_kg,
    carga_valor_mercadoria,
    data_solicitacao,
    data_aceite_operador,
    created_at,
    updated_at
) VALUES (
    'COT-' || strftime('%Y%m%d', 'now') || '-9999',
    1, -- ID do consultor (ajuste conforme necessário)
    1, -- ID do operador (ajuste conforme necessário)
    'aceita_operador',
    'Empresa Teste Modal Ltda',
    '12.345.678/0001-90',
    '01310-100',
    'Av. Paulista, 1000',
    'São Paulo',
    'SP',
    '20040-020',
    'Av. Rio Branco, 500',
    'Rio de Janeiro',
    'RJ',
    'Equipamentos para teste do modal',
    150.50,
    25000.00,
    datetime('now'),
    datetime('now'),
    datetime('now'),
    datetime('now')
);

-- Verificar se a cotação foi criada
SELECT 'Nova cotação criada:' as info;
SELECT id, numero_cotacao, status, cliente_nome FROM cotacoes WHERE cliente_nome LIKE '%Teste Modal%';
