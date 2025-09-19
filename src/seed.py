from flask import Blueprint, jsonify
from flask_cors import CORS
from src.models.empresa import (
    db, Empresa, Regulamentacao, Certificacao, ModalidadeTransporte, 
    TipoCarga, AbrangenciaGeografica, Frota, Armazenagem, PortoTerminal,
    SeguroCobertura, Tecnologia, DesempenhoQualidade, ClienteSegmento,
    RecursoHumano, Sustentabilidade
)
from datetime import datetime, date

seed_bp = Blueprint('seed', __name__)
CORS(seed_bp)

@seed_bp.route('/seed', methods=['POST'])
def seed_database():
    """Popular o banco de dados com dados de exemplo"""
    try:
        # Limpar dados existentes
        db.session.query(Sustentabilidade).delete()
        db.session.query(RecursoHumano).delete()
        db.session.query(ClienteSegmento).delete()
        db.session.query(DesempenhoQualidade).delete()
        db.session.query(Tecnologia).delete()
        db.session.query(SeguroCobertura).delete()
        db.session.query(PortoTerminal).delete()
        db.session.query(Armazenagem).delete()
        db.session.query(Frota).delete()
        db.session.query(AbrangenciaGeografica).delete()
        db.session.query(TipoCarga).delete()
        db.session.query(ModalidadeTransporte).delete()
        db.session.query(Certificacao).delete()
        db.session.query(Regulamentacao).delete()
        db.session.query(Empresa).delete()
        
        # Empresa 1: Transportadora Logística Brasil Ltda
        empresa1 = Empresa(
            razao_social="Transportadora Logística Brasil Ltda",
            nome_fantasia="LogiBrasil",
            cnpj="12.345.678/0001-90",
            inscricao_estadual="123456789",
            endereco_completo="Av. das Indústrias, 1000 - São Paulo/SP - CEP: 01234-567",
            telefone_comercial="(11) 3456-7890",
            telefone_emergencial="(11) 9876-5432",
            email="contato@logibrasil.com.br",
            website="www.logibrasil.com.br",
            data_fundacao=date(2010, 5, 15)
        )
        db.session.add(empresa1)
        db.session.flush()
        
        # Regulamentações da Empresa 1
        reg1 = Regulamentacao(
            empresa_id=empresa1.id,
            tipo_regulamentacao="RNTRC",
            numero_registro="123456789",
            data_emissao=date(2020, 1, 15),
            data_validade=date(2025, 1, 15),
            orgao_emissor="ANTT"
        )
        db.session.add(reg1)
        
        reg2 = Regulamentacao(
            empresa_id=empresa1.id,
            tipo_regulamentacao="AATPP",
            numero_registro="PP-987654321",
            data_emissao=date(2021, 3, 10),
            data_validade=date(2024, 3, 10),
            orgao_emissor="IBAMA"
        )
        db.session.add(reg2)
        
        # Certificações da Empresa 1
        cert1 = Certificacao(
            empresa_id=empresa1.id,
            nome_certificacao="ISO 9001",
            numero_certificacao="ISO-9001-2023-001",
            data_emissao=date(2023, 6, 1),
            data_validade=date(2026, 6, 1),
            orgao_certificador="Bureau Veritas"
        )
        db.session.add(cert1)
        
        cert2 = Certificacao(
            empresa_id=empresa1.id,
            nome_certificacao="SASSMAQ",
            numero_certificacao="SASSMAQ-2023-456",
            data_emissao=date(2023, 8, 15),
            data_validade=date(2025, 8, 15),
            orgao_certificador="ABIQUIM"
        )
        db.session.add(cert2)
        
        # Modalidades de Transporte da Empresa 1
        modal1 = ModalidadeTransporte(empresa_id=empresa1.id, modalidade="Rodoviário")
        modal2 = ModalidadeTransporte(empresa_id=empresa1.id, modalidade="Multimodal")
        db.session.add_all([modal1, modal2])
        
        # Tipos de Carga da Empresa 1
        carga1 = TipoCarga(empresa_id=empresa1.id, tipo_carga="Carga Geral")
        carga2 = TipoCarga(empresa_id=empresa1.id, tipo_carga="Carga Perigosa")
        carga3 = TipoCarga(empresa_id=empresa1.id, tipo_carga="Carga Refrigerada")
        db.session.add_all([carga1, carga2, carga3])
        
        # Abrangência Geográfica da Empresa 1
        abr1 = AbrangenciaGeografica(
            empresa_id=empresa1.id,
            tipo_abrangencia="Nacional",
            detalhes="Atende todo o território nacional com foco nas regiões Sul e Sudeste"
        )
        db.session.add(abr1)
        
        # Frota da Empresa 1
        frota1 = Frota(
            empresa_id=empresa1.id,
            tipo_frota="Própria",
            quantidade=50,
            tipo_veiculo="Carretas",
            capacidade_carga="30 toneladas",
            equipamentos_especificos="Baús refrigerados, tanques para produtos químicos"
        )
        db.session.add(frota1)
        
        # Armazenagem da Empresa 1
        arm1 = Armazenagem(
            empresa_id=empresa1.id,
            possui_armazem=True,
            localizacao="São Paulo/SP, Rio de Janeiro/RJ",
            capacidade_m2=5000.00,
            capacidade_m3=15000.00,
            tipos_armazenagem="Seca, Refrigerada, Climatizada",
            servicos_oferecidos="Cross-docking, Picking, Packing, Inventário"
        )
        db.session.add(arm1)
        
        # Portos e Terminais da Empresa 1
        porto1 = PortoTerminal(
            empresa_id=empresa1.id,
            nome_porto_terminal="Porto de Santos",
            tipo_terminal="Marítimo"
        )
        porto2 = PortoTerminal(
            empresa_id=empresa1.id,
            nome_porto_terminal="Terminal Rodoviário de Campinas",
            tipo_terminal="Terrestre"
        )
        db.session.add_all([porto1, porto2])
        
        # Seguros da Empresa 1
        seg1 = SeguroCobertura(
            empresa_id=empresa1.id,
            tipo_seguro="RCTR-C",
            numero_apolice="RCTR-123456789",
            data_validade=date(2024, 12, 31),
            seguradora="Porto Seguro"
        )
        db.session.add(seg1)
        
        # Tecnologias da Empresa 1
        tec1 = Tecnologia(
            empresa_id=empresa1.id,
            nome_tecnologia="GPS",
            detalhes="Rastreamento em tempo real de toda a frota"
        )
        tec2 = Tecnologia(
            empresa_id=empresa1.id,
            nome_tecnologia="TMS",
            detalhes="Sistema de Gestão de Transporte integrado"
        )
        db.session.add_all([tec1, tec2])
        
        # Desempenho da Empresa 1
        desp1 = DesempenhoQualidade(
            empresa_id=empresa1.id,
            prazo_medio_atendimento="24-48 horas",
            indice_avarias_extravios=0.5,
            indice_entregas_prazo=98.5
        )
        db.session.add(desp1)
        
        # Clientes/Segmentos da Empresa 1
        cli1 = ClienteSegmento(empresa_id=empresa1.id, segmento="Químico")
        cli2 = ClienteSegmento(empresa_id=empresa1.id, segmento="Alimentício")
        cli3 = ClienteSegmento(empresa_id=empresa1.id, segmento="Automotivo")
        db.session.add_all([cli1, cli2, cli3])
        
        # Recursos Humanos da Empresa 1
        rh1 = RecursoHumano(
            empresa_id=empresa1.id,
            numero_funcionarios=150,
            programas_treinamento="Direção defensiva, Transporte de produtos perigosos, Primeiros socorros"
        )
        db.session.add(rh1)
        
        # Sustentabilidade da Empresa 1
        sust1 = Sustentabilidade(
            empresa_id=empresa1.id,
            certificacao_ambiental="ISO 14001",
            programas_reducao_emissoes="Renovação da frota com veículos Euro 6, Programa de economia de combustível"
        )
        db.session.add(sust1)
        
        # Empresa 2: Transporte Rápido Express S.A.
        empresa2 = Empresa(
            razao_social="Transporte Rápido Express S.A.",
            nome_fantasia="Rápido Express",
            cnpj="98.765.432/0001-10",
            inscricao_estadual="987654321",
            endereco_completo="Rua dos Transportes, 500 - Belo Horizonte/MG - CEP: 30123-456",
            telefone_comercial="(31) 2345-6789",
            telefone_emergencial="(31) 8765-4321",
            email="contato@rapidoexpress.com.br",
            website="www.rapidoexpress.com.br",
            data_fundacao=date(2015, 8, 20)
        )
        db.session.add(empresa2)
        db.session.flush()
        
        # Regulamentações da Empresa 2
        reg3 = Regulamentacao(
            empresa_id=empresa2.id,
            tipo_regulamentacao="RNTRC",
            numero_registro="987654321",
            data_emissao=date(2021, 5, 10),
            data_validade=date(2026, 5, 10),
            orgao_emissor="ANTT"
        )
        db.session.add(reg3)
        
        # Certificações da Empresa 2
        cert3 = Certificacao(
            empresa_id=empresa2.id,
            nome_certificacao="OEA",
            numero_certificacao="OEA-2024-789",
            data_emissao=date(2024, 1, 15),
            data_validade=date(2027, 1, 15),
            orgao_certificador="Receita Federal"
        )
        db.session.add(cert3)
        
        # Modalidades de Transporte da Empresa 2
        modal3 = ModalidadeTransporte(empresa_id=empresa2.id, modalidade="Rodoviário")
        db.session.add(modal3)
        
        # Tipos de Carga da Empresa 2
        carga4 = TipoCarga(empresa_id=empresa2.id, tipo_carga="Carga Geral")
        carga5 = TipoCarga(empresa_id=empresa2.id, tipo_carga="Carga Fracionada")
        carga6 = TipoCarga(empresa_id=empresa2.id, tipo_carga="Eletrônicos")
        db.session.add_all([carga4, carga5, carga6])
        
        # Abrangência Geográfica da Empresa 2
        abr2 = AbrangenciaGeografica(
            empresa_id=empresa2.id,
            tipo_abrangencia="Regional",
            detalhes="Minas Gerais, São Paulo, Rio de Janeiro, Espírito Santo"
        )
        db.session.add(abr2)
        
        # Frota da Empresa 2
        frota2 = Frota(
            empresa_id=empresa2.id,
            tipo_frota="Mista",
            quantidade=25,
            tipo_veiculo="Caminhões e Vans",
            capacidade_carga="5-15 toneladas",
            equipamentos_especificos="Baús secos, plataformas"
        )
        db.session.add(frota2)
        
        # Armazenagem da Empresa 2
        arm2 = Armazenagem(
            empresa_id=empresa2.id,
            possui_armazem=False,
            localizacao=None,
            capacidade_m2=None,
            capacidade_m3=None,
            tipos_armazenagem=None,
            servicos_oferecidos=None
        )
        db.session.add(arm2)
        
        # Seguros da Empresa 2
        seg2 = SeguroCobertura(
            empresa_id=empresa2.id,
            tipo_seguro="RCTR-C",
            numero_apolice="RCTR-987654321",
            data_validade=date(2024, 11, 30),
            seguradora="Bradesco Seguros"
        )
        db.session.add(seg2)
        
        # Tecnologias da Empresa 2
        tec3 = Tecnologia(
            empresa_id=empresa2.id,
            nome_tecnologia="GPS",
            detalhes="Monitoramento 24h com central própria"
        )
        db.session.add(tec3)
        
        # Desempenho da Empresa 2
        desp2 = DesempenhoQualidade(
            empresa_id=empresa2.id,
            prazo_medio_atendimento="12-24 horas",
            indice_avarias_extravios=0.3,
            indice_entregas_prazo=99.2
        )
        db.session.add(desp2)
        
        # Clientes/Segmentos da Empresa 2
        cli4 = ClienteSegmento(empresa_id=empresa2.id, segmento="E-commerce")
        cli5 = ClienteSegmento(empresa_id=empresa2.id, segmento="Eletrônicos")
        cli6 = ClienteSegmento(empresa_id=empresa2.id, segmento="Varejo")
        db.session.add_all([cli4, cli5, cli6])
        
        # Recursos Humanos da Empresa 2
        rh2 = RecursoHumano(
            empresa_id=empresa2.id,
            numero_funcionarios=80,
            programas_treinamento="Atendimento ao cliente, Direção defensiva, Manuseio de cargas frágeis"
        )
        db.session.add(rh2)
        
        # Sustentabilidade da Empresa 2
        sust2 = Sustentabilidade(
            empresa_id=empresa2.id,
            certificacao_ambiental=None,
            programas_reducao_emissoes="Otimização de rotas para redução de consumo de combustível"
        )
        db.session.add(sust2)
        
        # Empresa 3: Cargas Pesadas do Norte Ltda
        empresa3 = Empresa(
            razao_social="Cargas Pesadas do Norte Ltda",
            nome_fantasia="Norte Cargas",
            cnpj="11.222.333/0001-44",
            inscricao_estadual="112233445",
            endereco_completo="Av. Industrial Norte, 2000 - Manaus/AM - CEP: 69000-123",
            telefone_comercial="(92) 3333-4444",
            telefone_emergencial="(92) 9999-8888",
            email="contato@nortecargas.com.br",
            website="www.nortecargas.com.br",
            data_fundacao=date(2008, 3, 10)
        )
        db.session.add(empresa3)
        db.session.flush()
        
        # Regulamentações da Empresa 3
        reg4 = Regulamentacao(
            empresa_id=empresa3.id,
            tipo_regulamentacao="RNTRC",
            numero_registro="112233445",
            data_emissao=date(2019, 9, 5),
            data_validade=date(2024, 9, 5),
            orgao_emissor="ANTT"
        )
        db.session.add(reg4)
        
        reg5 = Regulamentacao(
            empresa_id=empresa3.id,
            tipo_regulamentacao="AET",
            numero_registro="AET-2024-001",
            data_emissao=date(2024, 1, 20),
            data_validade=date(2024, 12, 31),
            orgao_emissor="DNIT"
        )
        db.session.add(reg5)
        
        # Modalidades de Transporte da Empresa 3
        modal4 = ModalidadeTransporte(empresa_id=empresa3.id, modalidade="Rodoviário")
        modal5 = ModalidadeTransporte(empresa_id=empresa3.id, modalidade="Aquaviário")
        db.session.add_all([modal4, modal5])
        
        # Tipos de Carga da Empresa 3
        carga7 = TipoCarga(empresa_id=empresa3.id, tipo_carga="Carga Superdimensionada")
        carga8 = TipoCarga(empresa_id=empresa3.id, tipo_carga="Equipamentos Industriais")
        carga9 = TipoCarga(empresa_id=empresa3.id, tipo_carga="Granel Sólido")
        db.session.add_all([carga7, carga8, carga9])
        
        # Abrangência Geográfica da Empresa 3
        abr3 = AbrangenciaGeografica(
            empresa_id=empresa3.id,
            tipo_abrangencia="Regional",
            detalhes="Região Norte: Amazonas, Pará, Rondônia, Acre"
        )
        db.session.add(abr3)
        
        # Frota da Empresa 3
        frota3 = Frota(
            empresa_id=empresa3.id,
            tipo_frota="Própria",
            quantidade=15,
            tipo_veiculo="Carretas especiais",
            capacidade_carga="50-80 toneladas",
            equipamentos_especificos="Pranchas baixas, guindastes móveis, equipamentos para cargas especiais"
        )
        db.session.add(frota3)
        
        # Portos e Terminais da Empresa 3
        porto3 = PortoTerminal(
            empresa_id=empresa3.id,
            nome_porto_terminal="Porto de Manaus",
            tipo_terminal="Aquaviário"
        )
        db.session.add(porto3)
        
        # Seguros da Empresa 3
        seg3 = SeguroCobertura(
            empresa_id=empresa3.id,
            tipo_seguro="RCTR-C",
            numero_apolice="RCTR-112233445",
            data_validade=date(2024, 10, 15),
            seguradora="Mapfre Seguros"
        )
        db.session.add(seg3)
        
        # Tecnologias da Empresa 3
        tec4 = Tecnologia(
            empresa_id=empresa3.id,
            nome_tecnologia="Telemetria",
            detalhes="Monitoramento avançado para cargas especiais"
        )
        db.session.add(tec4)
        
        # Desempenho da Empresa 3
        desp3 = DesempenhoQualidade(
            empresa_id=empresa3.id,
            prazo_medio_atendimento="48-72 horas",
            indice_avarias_extravios=0.1,
            indice_entregas_prazo=95.0
        )
        db.session.add(desp3)
        
        # Clientes/Segmentos da Empresa 3
        cli7 = ClienteSegmento(empresa_id=empresa3.id, segmento="Industrial")
        cli8 = ClienteSegmento(empresa_id=empresa3.id, segmento="Mineração")
        cli9 = ClienteSegmento(empresa_id=empresa3.id, segmento="Construção Civil")
        db.session.add_all([cli7, cli8, cli9])
        
        # Recursos Humanos da Empresa 3
        rh3 = RecursoHumano(
            empresa_id=empresa3.id,
            numero_funcionarios=45,
            programas_treinamento="Operação de guindastes, Transporte de cargas especiais, Segurança industrial"
        )
        db.session.add(rh3)
        
        # Sustentabilidade da Empresa 3
        sust3 = Sustentabilidade(
            empresa_id=empresa3.id,
            certificacao_ambiental=None,
            programas_reducao_emissoes="Manutenção preventiva rigorosa da frota"
        )
        db.session.add(sust3)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Banco de dados populado com sucesso!',
            'empresas_criadas': 3
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

