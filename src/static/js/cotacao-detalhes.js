// ==================== MODAL DE DETALHES DA COTAÇÃO ====================
// Interface expandida com histórico, ações e informações completas

const CotacaoDetalhes = {
    // Estado atual
    cotacaoAtual: null,
    
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.setupEventListeners();
        console.log('✅ CotacaoDetalhes inicializado');
    },
    
    setupEventListeners() {
        // Fechar modal
        document.addEventListener('click', (e) => {
            if (e.target.id === 'modal-cotacao-detalhes' || e.target.classList.contains('fechar-modal-detalhes')) {
                this.fecharModal();
            }
        });
        
        // Escape para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fecharModal();
            }
        });
    },
    
    // ==================== MODAL PRINCIPAL ====================
    
    async abrirModal(cotacaoId) {
        try {
            // Mostrar loading
            this.mostrarLoading();
            
            // Carregar dados completos da cotação
            const response = await API.getCotacaoById(cotacaoId);
            
            if (response.success || response.id) {
                this.cotacaoAtual = response.data || response;
                this.renderizarModal();
                this.mostrarModal();
            } else {
                throw new Error(response.message || 'Erro ao carregar cotação');
            }
            
        } catch (error) {
            console.error('Erro ao abrir modal de detalhes:', error);
            this.mostrarErro('Erro ao carregar detalhes da cotação');
        }
    },
    
    mostrarLoading() {
        const modal = this.criarModalBase();
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div class="flex items-center justify-center p-8">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                    <span class="ml-3 text-gray-600">Carregando detalhes...</span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    renderizarModal() {
        const modal = document.getElementById('modal-cotacao-detalhes');
        if (!modal) return;
        
        const cotacao = this.cotacaoAtual;
        
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="modal-header bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-lg sticky top-0 z-10">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold">
                                <i class="fas fa-file-invoice mr-3"></i>
                                Cotação #${cotacao.numero_cotacao || cotacao.id}
                            </h2>
                            <p class="text-orange-100 mt-1">
                                ${this.getStatusDisplay(cotacao.status)} • ${this.formatarData(cotacao.data_criacao)}
                            </p>
                        </div>
                        <button class="fechar-modal-detalhes text-white hover:text-gray-200 text-3xl font-bold transition-colors">
                            &times;
                        </button>
                    </div>
                </div>
                
                <!-- Conteúdo -->
                <div class="modal-body p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Coluna Principal - Informações -->
                        <div class="lg:col-span-2 space-y-6">
                            ${this.renderizarInformacoesGerais(cotacao)}
                            ${this.renderizarDadosCliente(cotacao)}
                            ${this.renderizarDadosCarga(cotacao)}
                            ${this.renderizarDadosTransporte(cotacao)}
                            ${this.renderizarRespostaCotacao(cotacao)}
                        </div>
                        
                        <!-- Coluna Lateral - Ações e Histórico -->
                        <div class="space-y-6">
                            ${this.renderizarAcoes(cotacao)}
                            ${this.renderizarHistorico(cotacao)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Configurar event listeners específicos
        this.configurarEventListeners();
    },
    
    // ==================== SEÇÕES DO MODAL ====================
    
    renderizarInformacoesGerais(cotacao) {
        return `
            <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                    Informações Gerais
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <span class="status-badge status-${cotacao.status || 'solicitada'} inline-block mt-1">
                            ${this.getStatusDisplay(cotacao.status)}
                        </span>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Modalidade</label>
                        <p class="text-gray-900 mt-1">${this.getModalidadeDisplay(cotacao.modalidade)}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Data de Criação</label>
                        <p class="text-gray-900 mt-1">${this.formatarDataCompleta(cotacao.data_criacao)}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Operador Responsável</label>
                        <p class="text-gray-900 mt-1">${cotacao.operador_nome || 'Não atribuído'}</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderizarDadosCliente(cotacao) {
        return `
            <div class="bg-blue-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-user-tie text-blue-600 mr-2"></i>
                    Dados do Cliente
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Número do Cliente</label>
                        <p class="text-gray-900 mt-1">${cotacao.numero_cliente || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Nome/Razão Social</label>
                        <p class="text-gray-900 mt-1">${cotacao.cliente_nome || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">CNPJ</label>
                        <p class="text-gray-900 mt-1">${cotacao.cliente_cnpj || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Endereço</label>
                        <p class="text-gray-900 mt-1">${cotacao.cliente_endereco || 'N/A'}</p>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Contato</label>
                        <p class="text-gray-900 mt-1">
                            ${cotacao.cliente_telefone ? `Tel: ${cotacao.cliente_telefone}` : ''}
                            ${cotacao.cliente_email ? ` • Email: ${cotacao.cliente_email}` : ''}
                        </p>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderizarDadosCarga(cotacao) {
        return `
            <div class="bg-green-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-boxes text-green-600 mr-2"></i>
                    Dados da Carga
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Descrição</label>
                        <p class="text-gray-900 mt-1 bg-white p-3 rounded border">${cotacao.carga_descricao || 'N/A'}</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Peso Total</label>
                            <p class="text-gray-900 mt-1">${cotacao.carga_peso_kg ? cotacao.carga_peso_kg + ' kg' : 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Valor da Mercadoria</label>
                            <p class="text-gray-900 mt-1">${cotacao.carga_valor_mercadoria || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Cubagem</label>
                            <p class="text-gray-900 mt-1">${cotacao.carga_cubagem ? cotacao.carga_cubagem + ' m³' : 'N/A'}</p>
                        </div>
                    </div>
                    ${this.renderizarDimensoes(cotacao)}
                </div>
            </div>
        `;
    },
    
    renderizarDadosTransporte(cotacao) {
        return `
            <div class="bg-purple-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-truck text-purple-600 mr-2"></i>
                    Dados do Transporte
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Origem</label>
                        <p class="text-gray-900 mt-1 bg-white p-3 rounded border">
                            ${this.formatarEndereco(cotacao, 'origem')}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Destino</label>
                        <p class="text-gray-900 mt-1 bg-white p-3 rounded border">
                            ${this.formatarEndereco(cotacao, 'destino')}
                        </p>
                    </div>
                </div>
                ${this.renderizarDadosEspecificos(cotacao)}
            </div>
        `;
    },
    
    renderizarRespostaCotacao(cotacao) {
        if (!cotacao.valor_frete && !cotacao.prazo_entrega) {
            return '';
        }
        
        return `
            <div class="bg-yellow-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-calculator text-yellow-600 mr-2"></i>
                    Resposta da Cotação
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Valor do Frete</label>
                        <p class="text-2xl font-bold text-green-600 mt-1">${cotacao.valor_frete || 'Não informado'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Prazo de Entrega</label>
                        <p class="text-xl font-semibold text-blue-600 mt-1">${cotacao.prazo_entrega ? cotacao.prazo_entrega + ' dias' : 'Não informado'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Empresa Prestadora</label>
                        <p class="text-gray-900 mt-1">${cotacao.empresa_prestadora || 'Não informado'}</p>
                    </div>
                </div>
                ${cotacao.observacoes_resposta ? `
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700">Observações</label>
                        <p class="text-gray-900 mt-1 bg-white p-3 rounded border">${cotacao.observacoes_resposta}</p>
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    renderizarAcoes(cotacao) {
        const acoes = this.getAcoesDisponiveis(cotacao);
        
        return `
            <div class="bg-white rounded-lg border-2 border-gray-200 p-6 sticky top-24">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-cogs text-gray-600 mr-2"></i>
                    Ações Disponíveis
                </h3>
                <div class="space-y-3">
                    ${acoes.map(acao => `
                        <button 
                            class="w-full px-4 py-3 ${acao.classe} text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center"
                            onclick="CotacaoDetalhes.${acao.funcao}(${cotacao.id})"
                        >
                            <i class="${acao.icone} mr-2"></i>
                            ${acao.texto}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    renderizarHistorico(cotacao) {
        const historico = cotacao.historico || this.gerarHistoricoSimulado(cotacao);
        
        return `
            <div class="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-history text-gray-600 mr-2"></i>
                    Histórico de Alterações
                </h3>
                <div class="space-y-4 max-h-96 overflow-y-auto">
                    ${historico.map(item => `
                        <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <i class="${this.getIconeHistorico(item.acao)} text-blue-600 text-sm"></i>
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900">${item.descricao}</p>
                                <p class="text-xs text-gray-500">${this.formatarDataCompleta(item.data)}</p>
                                ${item.usuario ? `<p class="text-xs text-gray-600">por ${item.usuario}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ==================== FUNÇÕES AUXILIARES ====================
    
    criarModalBase() {
        // Remover modal existente
        const existente = document.getElementById('modal-cotacao-detalhes');
        if (existente) {
            existente.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'modal-cotacao-detalhes';
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        return modal;
    },
    
    mostrarModal() {
        const modal = document.getElementById('modal-cotacao-detalhes');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },
    
    fecharModal() {
        const modal = document.getElementById('modal-cotacao-detalhes');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },
    
    mostrarErro(mensagem) {
        alert(mensagem); // Substituir por sistema de notificações
    },
    
    getStatusDisplay(status) {
        const statusMap = {
            'solicitada': 'Solicitada',
            'aceita_operador': 'Aceita pelo Operador',
            'cotacao_enviada': 'Cotação Enviada',
            'aceita_consultor': 'Aceita pelo Consultor',
            'negada_consultor': 'Negada',
            'finalizada': 'Finalizada'
        };
        return statusMap[status] || status;
    },
    
    getModalidadeDisplay(modalidade) {
        const modalidadeMap = {
            'brcargo_rodoviario': 'BRCargo Rodoviário',
            'brcargo_maritimo': 'BRCargo Marítimo',
            'frete_aereo': 'Frete Aéreo'
        };
        return modalidadeMap[modalidade] || modalidade;
    },
    
    formatarData(data) {
        if (!data) return 'N/A';
        return new Date(data).toLocaleDateString('pt-BR');
    },
    
    formatarDataCompleta(data) {
        if (!data) return 'N/A';
        return new Date(data).toLocaleString('pt-BR');
    },
    
    formatarEndereco(cotacao, tipo) {
        const cep = cotacao[`${tipo}_cep`];
        const endereco = cotacao[`${tipo}_endereco`];
        const cidade = cotacao[`${tipo}_cidade`];
        const estado = cotacao[`${tipo}_estado`];
        const porto = cotacao[`${tipo}_porto`];
        
        if (porto) {
            return porto;
        }
        
        const partes = [endereco, cidade, estado, cep].filter(Boolean);
        return partes.length > 0 ? partes.join(', ') : 'N/A';
    },
    
    renderizarDimensoes(cotacao) {
        const comprimento = cotacao.carga_comprimento_cm;
        const largura = cotacao.carga_largura_cm;
        const altura = cotacao.carga_altura_cm;
        
        if (!comprimento && !largura && !altura) {
            return '';
        }
        
        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Dimensões (cm)</label>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <span class="text-xs text-gray-500">Comprimento</span>
                        <p class="text-gray-900">${comprimento || 'N/A'}</p>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500">Largura</span>
                        <p class="text-gray-900">${largura || 'N/A'}</p>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500">Altura</span>
                        <p class="text-gray-900">${altura || 'N/A'}</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderizarDadosEspecificos(cotacao) {
        if (cotacao.modalidade === 'brcargo_maritimo') {
            return `
                <div class="mt-4 pt-4 border-t border-purple-200">
                    <h4 class="font-medium text-gray-800 mb-3">Dados Marítimos</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Incoterm</label>
                            <p class="text-gray-900 mt-1">${cotacao.incoterm || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Tipo de Carga</label>
                            <p class="text-gray-900 mt-1">${cotacao.tipo_carga_maritima || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        return '';
    },
    
    getAcoesDisponiveis(cotacao) {
        const acoes = [];
        
        switch (cotacao.status) {
            case 'solicitada':
                acoes.push(
                    { texto: 'Aceitar Cotação', classe: 'bg-green-600', icone: 'fas fa-check', funcao: 'aceitarCotacao' },
                    { texto: 'Negar Cotação', classe: 'bg-red-600', icone: 'fas fa-times', funcao: 'negarCotacao' }
                );
                break;
                
            case 'aceita_operador':
                acoes.push(
                    { texto: 'Responder Cotação', classe: 'bg-blue-600', icone: 'fas fa-reply', funcao: 'responderCotacao' },
                    { texto: 'Reatribuir', classe: 'bg-purple-600', icone: 'fas fa-exchange-alt', funcao: 'reatribuirCotacao' }
                );
                break;
                
            case 'cotacao_enviada':
                acoes.push(
                    { texto: 'Editar Resposta', classe: 'bg-yellow-600', icone: 'fas fa-edit', funcao: 'editarResposta' }
                );
                break;
        }
        
        // Ações sempre disponíveis
        acoes.push(
            { texto: 'Imprimir', classe: 'bg-gray-600', icone: 'fas fa-print', funcao: 'imprimirCotacao' },
            { texto: 'Exportar PDF', classe: 'bg-indigo-600', icone: 'fas fa-file-pdf', funcao: 'exportarPDF' }
        );
        
        return acoes;
    },
    
    gerarHistoricoSimulado(cotacao) {
        const historico = [
            {
                acao: 'criacao',
                descricao: 'Cotação criada',
                data: cotacao.data_criacao,
                usuario: 'Sistema'
            }
        ];
        
        if (cotacao.status !== 'solicitada') {
            historico.push({
                acao: 'aceite',
                descricao: 'Cotação aceita pelo operador',
                data: cotacao.data_aceite || cotacao.data_criacao,
                usuario: cotacao.operador_nome || 'Operador'
            });
        }
        
        if (cotacao.valor_frete) {
            historico.push({
                acao: 'resposta',
                descricao: 'Resposta enviada com valores',
                data: cotacao.data_resposta || cotacao.data_criacao,
                usuario: cotacao.operador_nome || 'Operador'
            });
        }
        
        return historico.reverse();
    },
    
    getIconeHistorico(acao) {
        const icones = {
            'criacao': 'fas fa-plus',
            'aceite': 'fas fa-check',
            'resposta': 'fas fa-reply',
            'finalizacao': 'fas fa-flag-checkered',
            'reatribuicao': 'fas fa-exchange-alt'
        };
        return icones[acao] || 'fas fa-circle';
    },
    
    configurarEventListeners() {
        // Event listeners específicos serão adicionados aqui
        console.log('Event listeners configurados para modal de detalhes');
    },
    
    // ==================== AÇÕES DO MODAL ====================
    
    async aceitarCotacao(id) {
        if (!confirm('Deseja aceitar esta cotação?')) return;
        
        try {
            const response = await API.aceitarCotacao(id);
            if (response.success) {
                this.mostrarSucesso('Cotação aceita com sucesso!');
                this.abrirModal(id); // Recarregar modal
                if (window.CotacoesManager) {
                    window.CotacoesManager.carregarCotacoes();
                }
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.mostrarErro('Erro ao aceitar cotação: ' + error.message);
        }
    },
    
    async negarCotacao(id) {
        const motivo = prompt('Motivo da negação (opcional):');
        if (motivo === null) return; // Cancelou
        
        try {
            const response = await API.negarCotacao(id, motivo);
            if (response.success) {
                this.mostrarSucesso('Cotação negada com sucesso!');
                this.fecharModal();
                if (window.CotacoesManager) {
                    window.CotacoesManager.carregarCotacoes();
                }
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.mostrarErro('Erro ao negar cotação: ' + error.message);
        }
    },
    
    responderCotacao(id) {
        // Abrir modal de resposta melhorado
        if (window.ModalRespostaMelhorado) {
            window.ModalRespostaMelhorado.abrir(this.cotacaoAtual);
        } else if (window.ModalRespostaCotacao) {
            // Fallback para modal antigo
            window.ModalRespostaCotacao.abrir(this.cotacaoAtual);
        }
    },
    
    reatribuirCotacao(id) {
        // Abrir modal de reatribuição
        if (window.SistemaMensagens) {
            window.SistemaMensagens.abrirModalReatribuicao(id);
        } else {
            alert('Sistema de mensagens não disponível');
        }
    },
    
    editarResposta(id) {
        // Abrir modal de resposta melhorado em modo edição
        if (window.ModalRespostaMelhorado) {
            window.ModalRespostaMelhorado.abrir(this.cotacaoAtual, true);
        } else if (window.ModalRespostaCotacao) {
            // Fallback para modal antigo
            window.ModalRespostaCotacao.abrir(this.cotacaoAtual, true);
        }
    },
    
    imprimirCotacao(id) {
        window.print();
    },
    
    exportarPDF(id) {
        alert('Funcionalidade de exportação PDF será implementada em breve');
    },
    
    mostrarSucesso(mensagem) {
        alert(mensagem); // Substituir por sistema de notificações
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    CotacaoDetalhes.init();
});

// Exportar para uso global
window.CotacaoDetalhes = CotacaoDetalhes;
