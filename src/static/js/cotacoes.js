// ==================== MÓDULO DE COTAÇÕES ====================
// Gerencia cotações e suas operações

const Cotacoes = {
    // Estado
    currentTab: 'todas',
    cotacoes: [],
    
    // ==================== INICIALIZAÇÃO ====================
    
    /**
     * Inicializa o módulo
     */
    init() {
        this.setupEventListeners();
    },
    
    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botão de nova cotação
        document.getElementById('btn-nova-cotacao')?.addEventListener('click', () => {
            this.showNewCotacaoModal();
        });
        
        // Tabs de filtro
        const tabs = document.querySelectorAll('.tab-modalidade');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });
    },
    
    // ==================== CARREGAMENTO ====================
    
    /**
     * Carrega cotações
     */
    async load() {
        try {
            const response = await API.getCotacoes();
            
            if (response.success) {
                this.cotacoes = response.data || [];
                this.render();
            } else {
                Utils.showError(response.message || 'Erro ao carregar cotações');
            }
        } catch (error) {
            console.error('Erro ao carregar cotações:', error);
            Utils.showError('Erro ao carregar cotações');
        }
    },
    
    // ==================== RENDERIZAÇÃO ====================
    
    /**
     * Renderiza lista de cotações
     */
    render() {
        const container = document.getElementById('lista-cotacoes');
        if (!container) return;
        
        Utils.clearContent(container);
        
        // Filtrar cotações por tab
        let cotacoesFiltradas = this.cotacoes;
        if (this.currentTab !== 'todas') {
            cotacoesFiltradas = this.cotacoes.filter(c => c.modalidade === this.currentTab);
        }
        
        if (cotacoesFiltradas.length === 0) {
            const noResults = Utils.createElement('div', {
                className: 'p-8 text-center text-gray-500'
            }, 'Nenhuma cotação encontrada');
            container.appendChild(noResults);
            return;
        }
        
        cotacoesFiltradas.forEach(cotacao => {
            const card = this.createCotacaoCard(cotacao);
            container.appendChild(card);
        });
    },
    
    /**
     * Cria card de cotação
     * @param {object} cotacao - Dados da cotação
     * @returns {HTMLElement}
     */
    createCotacaoCard(cotacao) {
        const card = Utils.createElement('div', {
            className: `cotacao-card bg-white rounded-lg shadow-md p-6 mb-4 ${cotacao.status || ''}`
        });
        
        // Header
        const header = Utils.createElement('div', {
            className: 'flex items-start justify-between mb-4'
        });
        
        const info = Utils.createElement('div');
        const title = Utils.createElement('h4', {
            className: 'text-lg font-semibold text-gray-900'
        });
        Utils.setTextContent(title, `Cotação #${cotacao.numero_cotacao || cotacao.id}`);
        
        const subtitle = Utils.createElement('p', {
            className: 'text-sm text-gray-600'
        });
        Utils.setTextContent(subtitle, `Empresa: ${cotacao.empresa_nome || 'N/A'}`);
        
        info.appendChild(title);
        info.appendChild(subtitle);
        
        // Status badge
        const statusBadge = Utils.createElement('span', {
            className: `status-badge status-${cotacao.status || 'solicitada'}`
        });
        Utils.setTextContent(statusBadge, this.getStatusDisplay(cotacao.status));
        
        header.appendChild(info);
        header.appendChild(statusBadge);
        
        // Detalhes
        const details = Utils.createElement('div', {
            className: 'grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4'
        });
        
        const addDetail = (label, value) => {
            const detail = Utils.createElement('div');
            const labelEl = Utils.createElement('span', {
                className: 'font-medium text-gray-700'
            });
            Utils.setTextContent(labelEl, label + ': ');
            const valueEl = Utils.createElement('span', {
                className: 'text-gray-600'
            });
            Utils.setTextContent(valueEl, value || 'N/A');
            detail.appendChild(labelEl);
            detail.appendChild(valueEl);
            details.appendChild(detail);
        };
        
        addDetail('Modalidade', cotacao.modalidade || 'N/A');
        addDetail('Origem', cotacao.origem || 'N/A');
        addDetail('Destino', cotacao.destino || 'N/A');
        
        // Botões de ação
        const actions = Utils.createElement('div', {
            className: 'flex space-x-2 mt-4'
        });
        
        const btnView = Utils.createElement('button', {
            className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
        });
        Utils.setTextContent(btnView, 'Ver Detalhes');
        btnView.addEventListener('click', () => this.viewDetails(cotacao.id));
        
        actions.appendChild(btnView);
        
        // Botões específicos por status
        if (cotacao.status === 'solicitada') {
            const btnAccept = Utils.createElement('button', {
                className: 'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'
            });
            Utils.setTextContent(btnAccept, 'Aceitar');
            btnAccept.addEventListener('click', () => this.accept(cotacao.id));
            actions.appendChild(btnAccept);
            
            const btnReject = Utils.createElement('button', {
                className: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
            });
            Utils.setTextContent(btnReject, 'Negar');
            btnReject.addEventListener('click', () => this.reject(cotacao.id));
            actions.appendChild(btnReject);
        }
        
        card.appendChild(header);
        card.appendChild(details);
        card.appendChild(actions);
        
        return card;
    },
    
    /**
     * Obtém texto de exibição do status
     * @param {string} status - Status da cotação
     * @returns {string}
     */
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
    
    // ==================== AÇÕES ====================
    
    /**
     * Alterna tab
     * @param {string} tab - Nome da tab
     */
    switchTab(tab) {
        this.currentTab = tab;
        
        // Atualizar classes das tabs
        document.querySelectorAll('.tab-modalidade').forEach(t => {
            t.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`.tab-modalidade[data-tab="${tab}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        this.render();
    },
    
    /**
     * Mostra modal de nova cotação
     */
    showNewCotacaoModal() {
        UI.showModal('modal-nova-cotacao');
    },
    
    /**
     * Visualiza detalhes de cotação
     * @param {number} id - ID da cotação
     */
    async viewDetails(id) {
        try {
            const response = await API.getCotacaoById(id);
            
            if (response.success || response.id) {
                const cotacao = response.data || response;
                this.showDetailsModal(cotacao);
            } else {
                Utils.showError('Erro ao carregar detalhes da cotação');
            }
        } catch (error) {
            console.error('Erro ao visualizar cotação:', error);
            Utils.showError('Erro ao carregar detalhes da cotação');
        }
    },
    
    /**
     * Mostra modal com detalhes da cotação
     * @param {object} cotacao - Dados da cotação
     */
    showDetailsModal(cotacao) {
        // Implementação simplificada
        const details = `
Cotação #${cotacao.numero_cotacao || cotacao.id}
Empresa: ${cotacao.empresa_nome || 'N/A'}
Status: ${this.getStatusDisplay(cotacao.status)}
Modalidade: ${cotacao.modalidade || 'N/A'}
Origem: ${cotacao.origem || 'N/A'}
Destino: ${cotacao.destino || 'N/A'}
        `;
        alert(details);
    },
    
    /**
     * Aceita cotação
     * @param {number} id - ID da cotação
     */
    async accept(id) {
        if (!Utils.confirm('Deseja aceitar esta cotação?')) {
            return;
        }
        
        try {
            const response = await API.aceitarCotacao(id);
            
            if (response.success) {
                Utils.showSuccess('Cotação aceita com sucesso');
                this.load();
            } else {
                Utils.showError(response.message || 'Erro ao aceitar cotação');
            }
        } catch (error) {
            console.error('Erro ao aceitar cotação:', error);
            Utils.showError('Erro ao aceitar cotação');
        }
    },
    
    /**
     * Nega cotação
     * @param {number} id - ID da cotação
     */
    async reject(id) {
        const motivo = prompt('Motivo da negação:');
        if (!motivo) return;
        
        try {
            const response = await API.negarCotacao(id, motivo);
            
            if (response.success) {
                Utils.showSuccess('Cotação negada');
                this.load();
            } else {
                Utils.showError(response.message || 'Erro ao negar cotação');
            }
        } catch (error) {
            console.error('Erro ao negar cotação:', error);
            Utils.showError('Erro ao negar cotação');
        }
    },
    
    /**
     * Cria nova cotação
     * @param {object} data - Dados da cotação
     */
    async create(data) {
        try {
            const response = await API.createCotacao(data);
            
            if (response.success) {
                Utils.showSuccess('Cotação criada com sucesso');
                UI.hideModal('modal-nova-cotacao');
                this.load();
            } else {
                Utils.showError(response.message || 'Erro ao criar cotação');
            }
        } catch (error) {
            console.error('Erro ao criar cotação:', error);
            Utils.showError('Erro ao criar cotação');
        }
    }
};

// Exportar para uso global
window.Cotacoes = Cotacoes;
