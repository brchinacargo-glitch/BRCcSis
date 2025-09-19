from flask import Blueprint, jsonify
from flask_cors import CORS
from src.models import db
from src.models.empresa import (
    Empresa, Regulamentacao, Certificacao, ModalidadeTransporte, 
    TipoCarga, AbrangenciaGeografica, Frota, Armazenagem, PortoTerminal,
    SeguroCobertura, Tecnologia, DesempenhoQualidade, ClienteSegmento,
    RecursoHumano, Sustentabilidade
)
from datetime import datetime, date

seed_bp = Blueprint("seed", __name__)
CORS(seed_bp)

@seed_bp.route("/seed", methods=["POST"])
def seed_database():
    """Popular o banco de dados com dados de exemplo"""
    try:
        # Limpar dados existentes
        db.session.query(Empresa).delete()
        db.session.commit()
        
        # Criar empresas de exemplo
        empresas_data = [
            {
                "razao_social": "Transportes Rápido Ltda",
                "nome_fantasia": "Rápido Express",
                "cnpj": "12.345.678/0001-90",
                "inscricao_estadual": "123456789",
                "endereco_completo": "Rua das Flores, 123 - São Paulo/SP",
                "telefone_comercial": "(11) 1234-5678",
                "telefone_emergencial": "(11) 9876-5432",
                "email": "contato@rapidoexpress.com.br",
                "website": "www.rapidoexpress.com.br",
                "data_fundacao": date(2010, 5, 15)
            },
            {
                "razao_social": "Logística Nacional S.A.",
                "nome_fantasia": "LogNacional",
                "cnpj": "98.765.432/0001-10",
                "inscricao_estadual": "987654321",
                "endereco_completo": "Av. Brasil, 456 - Rio de Janeiro/RJ",
                "telefone_comercial": "(21) 2345-6789",
                "telefone_emergencial": "(21) 8765-4321",
                "email": "contato@lognacional.com.br",
                "website": "www.lognacional.com.br",
                "data_fundacao": date(2005, 3, 20)
            },
            {
                "razao_social": "Cargas Especiais do Brasil Ltda",
                "nome_fantasia": "CEB Transportes",
                "cnpj": "11.222.333/0001-44",
                "inscricao_estadual": "112223334",
                "endereco_completo": "Rod. Anhanguera, Km 25 - Campinas/SP",
                "telefone_comercial": "(19) 3456-7890",
                "telefone_emergencial": "(19) 9654-3210",
                "email": "contato@cebtransportes.com.br",
                "website": "www.cebtransportes.com.br",
                "data_fundacao": date(2015, 8, 10)
            }
        ]
        
        for empresa_data in empresas_data:
            empresa = Empresa(**empresa_data)
            db.session.add(empresa)
            db.session.flush()  # Para obter o ID
            
            # Adicionar dados relacionados baseados na empresa
            if empresa.razao_social == "Transportes Rápido Ltda":
                _add_rapido_express_data(empresa)
            elif empresa.razao_social == "Logística Nacional S.A.":
                _add_log_nacional_data(empresa)
            elif empresa.razao_social == "Cargas Especiais do Brasil Ltda":
                _add_ceb_transportes_data(empresa)
        
        db.session.commit()
        
        return jsonify({"message": "Banco de dados populado com sucesso!"}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

def _add_rapido_express_data(empresa):
    """Adicionar dados para Rápido Express"""
    
    # Regulamentações
    regulamentacoes = [
        {
            "tipo_regulamentacao": "RNTRC",
            "numero_registro": "RNTRC123456",
            "data_emissao": date(2020, 1, 15),
            "data_validade": date(2025, 1, 15),
            "orgao_emissor": "ANTT"
        }
    ]
    
    for reg_data in regulamentacoes:
        reg = Regulamentacao(empresa_id=empresa.id, **reg_data)
        db.session.add(reg)
    
    # Certificações
    certificacoes = [
        {
            "nome_certificacao": "ISO 9001",
            "numero_certificacao": "ISO9001-2023-001",
            "data_emissao": date(2023, 1, 10),
            "data_validade": date(2026, 1, 10),
            "orgao_certificador": "Bureau Veritas"
        }
    ]
    
    for cert_data in certificacoes:
        cert = Certificacao(empresa_id=empresa.id, **cert_data)
        db.session.add(cert)
    
    # Modalidades de Transporte
    modalidades = ["Rodoviário", "Multimodal"]
    for modalidade in modalidades:
        modal = ModalidadeTransporte(empresa_id=empresa.id, modalidade=modalidade)
        db.session.add(modal)
    
    # Tipos de Carga
    tipos_carga = ["Carga Geral", "Carga Refrigerada"]
    for tipo in tipos_carga:
        tipo_carga = TipoCarga(empresa_id=empresa.id, tipo_carga=tipo)
        db.session.add(tipo_carga)
    
    # Abrangência Geográfica
    abrangencia = AbrangenciaGeografica(
        empresa_id=empresa.id,
        tipo_abrangencia="Regional",
        detalhes="Sudeste e Sul do Brasil"
    )
    db.session.add(abrangencia)
    
    # Frota
    frota = Frota(
        empresa_id=empresa.id,
        tipo_frota="Própria",
        quantidade=50,
        tipo_veiculo="Carreta",
        capacidade_carga="25 toneladas",
        equipamentos_especificos="Baú refrigerado, Sider"
    )
    db.session.add(frota)
    
    # Armazenagem
    armazenagem = Armazenagem(
        empresa_id=empresa.id,
        possui_armazem=True,
        localizacao="São Paulo/SP",
        capacidade_m2=5000.0,
        capacidade_m3=15000.0,
        tipos_armazenagem="Seca, Refrigerada",
        servicos_oferecidos="Cross-docking, Picking, Controle de inventário"
    )
    db.session.add(armazenagem)
    
    # Portos e Terminais
    portos = [
        {"nome_porto_terminal": "Porto de Santos", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Paranaguá", "tipo_terminal": "Marítimo"}
    ]
    
    for porto_data in portos:
        porto = PortoTerminal(empresa_id=empresa.id, **porto_data)
        db.session.add(porto)

def _add_log_nacional_data(empresa):
    """Adicionar dados para LogNacional"""
    
    # Regulamentações
    regulamentacoes = [
        {
            "tipo_regulamentacao": "RNTRC",
            "numero_registro": "RNTRC789012",
            "data_emissao": date(2018, 6, 20),
            "data_validade": date(2025, 6, 20),
            "orgao_emissor": "ANTT"
        },
        {
            "tipo_regulamentacao": "AATPP",
            "numero_registro": "AATPP456789",
            "data_emissao": date(2022, 3, 15),
            "data_validade": date(2025, 3, 15),
            "orgao_emissor": "IBAMA"
        }
    ]
    
    for reg_data in regulamentacoes:
        reg = Regulamentacao(empresa_id=empresa.id, **reg_data)
        db.session.add(reg)
    
    # Certificações
    certificacoes = [
        {
            "nome_certificacao": "ISO 9001",
            "numero_certificacao": "ISO9001-2022-002",
            "data_emissao": date(2022, 5, 20),
            "data_validade": date(2025, 5, 20),
            "orgao_certificador": "SGS"
        },
        {
            "nome_certificacao": "SASSMAQ",
            "numero_certificacao": "SASSMAQ-2023-001",
            "data_emissao": date(2023, 2, 10),
            "data_validade": date(2026, 2, 10),
            "orgao_certificador": "ABIQUIM"
        }
    ]
    
    for cert_data in certificacoes:
        cert = Certificacao(empresa_id=empresa.id, **cert_data)
        db.session.add(cert)
    
    # Modalidades de Transporte
    modalidades = ["Rodoviário", "Multimodal", "Ferroviário"]
    for modalidade in modalidades:
        modal = ModalidadeTransporte(empresa_id=empresa.id, modalidade=modalidade)
        db.session.add(modal)
    
    # Tipos de Carga
    tipos_carga = ["Carga Geral", "Carga Perigosa", "Granel Líquido"]
    for tipo in tipos_carga:
        tipo_carga = TipoCarga(empresa_id=empresa.id, tipo_carga=tipo)
        db.session.add(tipo_carga)
    
    # Abrangência Geográfica
    abrangencia = AbrangenciaGeografica(
        empresa_id=empresa.id,
        tipo_abrangencia="Nacional",
        detalhes="Todo território nacional"
    )
    db.session.add(abrangencia)
    
    # Frota
    frota = Frota(
        empresa_id=empresa.id,
        tipo_frota="Mista",
        quantidade=120,
        tipo_veiculo="Carreta, Caminhão",
        capacidade_carga="30 toneladas",
        equipamentos_especificos="Tanque para líquidos, Baú seco"
    )
    db.session.add(frota)
    
    # Armazenagem
    armazenagem = Armazenagem(
        empresa_id=empresa.id,
        possui_armazem=True,
        localizacao="Rio de Janeiro/RJ, São Paulo/SP",
        capacidade_m2=15000.0,
        capacidade_m3=45000.0,
        tipos_armazenagem="Seca, Climatizada",
        servicos_oferecidos="Cross-docking, Picking, Packing, Controle de inventário"
    )
    db.session.add(armazenagem)
    
    # Portos e Terminais
    portos = [
        {"nome_porto_terminal": "Ponta da Madeira", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto da Alumar", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Angra dos Reis", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Antonina", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Aratu", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Areia Branca", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Barra do Riacho", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Barra dos Coqueiros", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Belém", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Cabedelo", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Ilhéus", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Imbituba", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Itaguaí", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Itajaí", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Itapoá", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Jaraguá", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Natal", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Navegantes", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Niterói", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Paranaguá", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto do Pecém", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Rio Grande", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Salvador", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Macapá", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Santos", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de São Francisco do Sul", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de São Sebastião", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Suape", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Tubarão", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Vila do Conde", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Vitória", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto do Açu", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto do Forno", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto do Itaqui", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto do Mucuripe", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto do Recife", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto do Rio de Janeiro", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto Pesqueiro de Laguna", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto Piauí", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto Sudeste", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Terminal de Miramar", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Terminal de Praia Mole", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Porto de Cáceres", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Cachoeira do Sul", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Caracaraí", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Charqueadas", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Corumbá", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Eirunepé", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Estrela", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Terminal de Itacoatiara", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Juazeiro", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Ladário", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Manaus", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Pelotas", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Parintins", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Petrolina", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Pirapora", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Porto Alegre", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Porto Murtinho", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Porto Velho", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto Internacional de Porto Xavier", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Santana", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Santarém", "tipo_terminal": "Fluvial"},
        {"nome_porto_terminal": "Porto de Tabatinga", "tipo_terminal": "Fluvial"}
    ]
    
    for porto_data in portos:
        porto = PortoTerminal(empresa_id=empresa.id, **porto_data)
        db.session.add(porto)

def _add_ceb_transportes_data(empresa):
    """Adicionar dados para CEB Transportes"""
    
    # Regulamentações
    regulamentacoes = [
        {
            "tipo_regulamentacao": "RNTRC",
            "numero_registro": "RNTRC345678",
            "data_emissao": date(2020, 8, 10),
            "data_validade": date(2025, 8, 10),
            "orgao_emissor": "ANTT"
        },
        {
            "tipo_regulamentacao": "AET",
            "numero_registro": "AET123456",
            "data_emissao": date(2023, 1, 5),
            "data_validade": date(2024, 1, 5),
            "orgao_emissor": "DNIT"
        }
    ]
    
    for reg_data in regulamentacoes:
        reg = Regulamentacao(empresa_id=empresa.id, **reg_data)
        db.session.add(reg)
    
    # Certificações
    certificacoes = [
        {
            "nome_certificacao": "OEA",
            "numero_certificacao": "OEA-2022-003",
            "data_emissao": date(2022, 9, 15),
            "data_validade": date(2025, 9, 15),
            "orgao_certificador": "Receita Federal"
        }
    ]
    
    for cert_data in certificacoes:
        cert = Certificacao(empresa_id=empresa.id, **cert_data)
        db.session.add(cert)
    
    # Modalidades de Transporte
    modalidades = ["Rodoviário"]
    for modalidade in modalidades:
        modal = ModalidadeTransporte(empresa_id=empresa.id, modalidade=modalidade)
        db.session.add(modal)
    
    # Tipos de Carga
    tipos_carga = ["Carga Superdimensionada", "Granel Sólido"]
    for tipo in tipos_carga:
        tipo_carga = TipoCarga(empresa_id=empresa.id, tipo_carga=tipo)
        db.session.add(tipo_carga)
    
    # Abrangência Geográfica
    abrangencia = AbrangenciaGeografica(
        empresa_id=empresa.id,
        tipo_abrangencia="Nacional",
        detalhes="Especializada em rotas para projetos industriais"
    )
    db.session.add(abrangencia)
    
    # Frota
    frota = Frota(
        empresa_id=empresa.id,
        tipo_frota="Própria",
        quantidade=30,
        tipo_veiculo="Prancha baixa, Carreta extensível",
        capacidade_carga="80 toneladas",
        equipamentos_especificos="Pranchas baixas, Carretas extensíveis, Guindaste"
    )
    db.session.add(frota)
    
    # Armazenagem
    armazenagem = Armazenagem(
        empresa_id=empresa.id,
        possui_armazem=False,
        localizacao=None,
        capacidade_m2=None,
        capacidade_m3=None,
        tipos_armazenagem=None,
        servicos_oferecidos=None
    )
    db.session.add(armazenagem)
    
    # Portos e Terminais
    portos = [
        {"nome_porto_terminal": "Porto de Itaguaí", "tipo_terminal": "Marítimo"},
        {"nome_porto_terminal": "Terminal Ferroviário MRS", "tipo_terminal": "Ferroviário"}
    ]
    
    for porto_data in portos:
        porto = PortoTerminal(empresa_id=empresa.id, **porto_data)
        db.session.add(porto)
    
    # Tecnologias
    tecnologias = [
        {"nome_tecnologia": "Rastreamento GPS", "detalhes": "Monitoramento 24h de cargas especiais"},
        {"nome_tecnologia": "Telemetria", "detalhes": "Controle de velocidade e comportamento do motorista"}
    ]
    
    for tec_data in tecnologias:
        tec = Tecnologia(empresa_id=empresa.id, **tec_data)
        db.session.add(tec)



