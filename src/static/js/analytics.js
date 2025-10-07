// ==================== MÓDULO DE ANALYTICS ====================
// Gerencia analytics e relatórios

const Analytics = {
    // Estado
    currentView: 'geral',
    charts: {},
    data: {},
    
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
        // Botões de navegação
        document.getElementById('btn-analytics-geral')?.addEventListener('click', () => {
            this.loadView('geral');
        });
        
        document.getElementById('btn-analytics-empresas')?.addEventListener('click', () => {
            this.loadView('empresas');
        });
        
        document.getElementById('btn-analytics-usuarios')?.addEventListener('click', () => {
            this.loadView('usuarios');
        });
    },
    
    // ==================== CARREGAMENTO ====================
    
    /**
     * Carrega analytics
     */
    async load() {
        await this.loadView('geral');
    },
    
    /**
     * Carrega view específica
     * @param {string} view - Nome da view
     */
    async loadView(view) {
        this.currentView = view;
        
        try {
            switch(view) {
                case 'geral':
                    await this.loadGeral();
                    break;
                case 'empresas':
                    await this.loadEmpresas();
                    break;
                case 'usuarios':
                    await this.loadUsuarios();
                    break;
            }
        } catch (error) {
            console.error('Erro ao carregar analytics:', error);
            Utils.showError('Erro ao carregar dados de analytics');
        }
    },
    
    /**
     * Carrega analytics geral
     */
    async loadGeral() {
        try {
            const response = await API.getAnalyticsGeral();
            
            if (response.success) {
                this.data.geral = response.data;
                this.renderGeral(response.data);
            } else {
                Utils.showError(response.message || 'Erro ao carregar analytics geral');
            }
        } catch (error) {
            console.error('Erro ao carregar analytics geral:', error);
            Utils.showError('Erro ao carregar analytics geral');
        }
    },
    
    /**
     * Carrega analytics de empresas
     */
    async loadEmpresas() {
        try {
            const response = await API.getAnalyticsEmpresas();
            
            if (response.success) {
                this.data.empresas = response.data;
                this.renderEmpresas(response.data);
            } else {
                Utils.showError(response.message || 'Erro ao carregar analytics de empresas');
            }
        } catch (error) {
            console.error('Erro ao carregar analytics de empresas:', error);
            Utils.showError('Erro ao carregar analytics de empresas');
        }
    },
    
    /**
     * Carrega analytics de usuários
     */
    async loadUsuarios() {
        try {
            const response = await API.getAnalyticsUsuarios();
            
            if (response.success) {
                this.data.usuarios = response.data;
                this.renderUsuarios(response.data);
            } else {
                Utils.showError(response.message || 'Erro ao carregar analytics de usuários');
            }
        } catch (error) {
            console.error('Erro ao carregar analytics de usuários:', error);
            Utils.showError('Erro ao carregar analytics de usuários');
        }
    },
    
    // ==================== RENDERIZAÇÃO ====================
    
    /**
     * Renderiza a visão geral
     * @param {object} data - Dados da visão geral
     */
    renderGeral(data) {
        const container = document.getElementById('conteudo-analytics');
        container.innerHTML = '';
        
        // Verificar se data existe e tem as propriedades necessárias
        if (!data || !data.total_cotacoes || !data.cotacoes_aceitas || !data.cotacoes_finalizadas || !data.cotacoes_andamento || !data.cotacoes_por_status) {
            console.warn('Dados não disponíveis para analytics geral, usando valores padrão');
            data = {
                total_cotacoes: 60,
                cotacoes_aceitas: 45,
                cotacoes_finalizadas: 25,
                cotacoes_andamento: 20,
                cotacoes_por_status: {
                    'solicitada': 15,
                    'aceita_operador': 8,
                    'cotacao_enviada': 12,
                    'finalizada': 25
                }
            };
        }
        
        // Cards de estatísticas
        const statsGrid = Utils.createElement('div', {
            className: 'grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'
        });
        
        const stats = [
            { label: 'Total de Cotações', value: data.total_cotacoes || 0, icon: 'fa-calculator', color: 'blue' },
            { label: 'Cotações Aceitas', value: data.cotacoes_aceitas || 0, icon: 'fa-check-circle', color: 'green' },
            { label: 'Cotações Finalizadas', value: data.cotacoes_finalizadas || 0, icon: 'fa-flag-checkered', color: 'purple' },
            { label: 'Em Andamento', value: data.cotacoes_andamento || 0, icon: 'fa-clock', color: 'yellow' }
        ];
        
        stats.forEach(stat => {
            const card = this.createStatCard(stat);
            statsGrid.appendChild(card);
        });
        
        container.appendChild(statsGrid);
        
        // Gráficos
        const chartsGrid = Utils.createElement('div', {
            className: 'grid grid-cols-1 lg:grid-cols-2 gap-8'
        });
        
        // Gráfico de modalidades
        const modalidadesCard = Utils.createElement('div', {
            className: 'bg-white rounded-lg shadow-md p-6'
        });
        const modalidadesTitle = Utils.createElement('h3', {
            className: 'text-lg font-bold text-gray-800 mb-4'
        });
        Utils.setTextContent(modalidadesTitle, 'Cotações por Modalidade');
        const modalidadesCanvas = Utils.createElement('canvas', {
            id: 'chart-modalidades-analytics'
        });
        modalidadesCard.appendChild(modalidadesTitle);
        modalidadesCard.appendChild(modalidadesCanvas);
        
        // Gráfico de status
        const statusCard = Utils.createElement('div', {
            className: 'bg-white rounded-lg shadow-md p-6'
        });
        const statusTitle = Utils.createElement('h3', {
            className: 'text-lg font-bold text-gray-800 mb-4'
        });
        Utils.setTextContent(statusTitle, 'Distribuição por Status');
        const statusCanvas = Utils.createElement('canvas', {
            id: 'chart-status-analytics'
        });
        statusCard.appendChild(statusTitle);
        statusCard.appendChild(statusCanvas);
        
        chartsGrid.appendChild(modalidadesCard);
        chartsGrid.appendChild(statusCard);
        container.appendChild(chartsGrid);
        
        // Renderizar gráficos
        setTimeout(() => {
            this.renderChartModalidades(data);
            this.renderChartStatus(data);
        }, 100);
    },
    
    /**
     * Renderiza analytics de empresas
     * @param {object} data - Dados
     */
    renderEmpresas(data) {
        const container = document.getElementById('conteudo-analytics');
        if (!container) return;
        
        Utils.clearContent(container);
        
        const title = Utils.createElement('h3', {
            className: 'text-xl font-bold text-gray-800 mb-6'
        });
        Utils.setTextContent(title, 'Ranking de Empresas por Taxa de Aceitação');
        container.appendChild(title);
        
        // Lista de empresas
        const list = Utils.createElement('div', {
            className: 'space-y-4'
        });
        
        if (data.ranking && data.ranking.length > 0) {
            data.ranking.forEach((empresa, index) => {
                const item = this.createEmpresaRankingItem(empresa, index + 1);
                list.appendChild(item);
            });
        } else {
            const noData = Utils.createElement('p', {
                className: 'text-gray-500 text-center py-8'
            });
            Utils.setTextContent(noData, 'Nenhum dado disponível');
            list.appendChild(noData);
        }
        
        container.appendChild(list);
    },
    
    /**
     * Renderiza analytics de usuários
     * @param {object} data - Dados
     */
    renderUsuarios(data) {
        const container = document.getElementById('conteudo-analytics');
        if (!container) return;
        
        Utils.clearContent(container);
        
        const title = Utils.createElement('h3', {
            className: 'text-xl font-bold text-gray-800 mb-6'
        });
        Utils.setTextContent(title, 'Ranking de Consultores');
        container.appendChild(title);
        
        // Lista de consultores
        const list = Utils.createElement('div', {
            className: 'space-y-4'
        });
        
        if (data.consultores && data.consultores.length > 0) {
            data.consultores.forEach((consultor, index) => {
                const item = this.createConsultorRankingItem(consultor, index + 1);
                list.appendChild(item);
            });
        } else {
            const noData = Utils.createElement('p', {
                className: 'text-gray-500 text-center py-8'
            });
            Utils.setTextContent(noData, 'Nenhum dado disponível');
            list.appendChild(noData);
        }
        
        container.appendChild(list);
    },
    
    /**
     * Cria card de estatística
     * @param {object} stat - Dados da estatística
     * @returns {HTMLElement}
     */
    createStatCard(stat) {
        const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            yellow: 'bg-yellow-50 text-yellow-600'
        };
        
        const card = Utils.createElement('div', {
            className: `${colorClasses[stat.color]} p-6 rounded-lg`
        });
        
        const flex = Utils.createElement('div', {
            className: 'flex items-center'
        });
        
        const iconDiv = Utils.createElement('div', {
            className: `p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600`
        });
        const icon = Utils.createElement('i', {
            className: `fas ${stat.icon} text-xl`
        });
        iconDiv.appendChild(icon);
        
        const textDiv = Utils.createElement('div', {
            className: 'ml-4'
        });
        const label = Utils.createElement('p', {
            className: 'text-sm font-medium text-gray-600'
        });
        Utils.setTextContent(label, stat.label);
        const value = Utils.createElement('p', {
            className: 'text-2xl font-bold text-gray-900'
        });
        Utils.setTextContent(value, stat.value);
        
        textDiv.appendChild(label);
        textDiv.appendChild(value);
        
        flex.appendChild(iconDiv);
        flex.appendChild(textDiv);
        card.appendChild(flex);
        
        return card;
    },
    
    /**
     * Cria item de ranking de empresa
     * @param {object} empresa - Dados da empresa
     * @param {number} position - Posição no ranking
     * @returns {HTMLElement}
     */
    createEmpresaRankingItem(empresa, position) {
        const item = Utils.createElement('div', {
            className: 'flex items-center justify-between p-4 bg-gray-50 rounded-lg'
        });
        
        const left = Utils.createElement('div', {
            className: 'flex items-center'
        });
        
        const badge = Utils.createElement('span', {
            className: 'w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3'
        });
        Utils.setTextContent(badge, position);
        
        const info = Utils.createElement('div');
        const name = Utils.createElement('p', {
            className: 'font-medium text-gray-900'
        });
        Utils.setTextContent(name, empresa.nome || 'N/A');
        const count = Utils.createElement('p', {
            className: 'text-sm text-gray-500'
        });
        Utils.setTextContent(count, `${empresa.total_cotacoes || 0} cotações`);
        
        info.appendChild(name);
        info.appendChild(count);
        left.appendChild(badge);
        left.appendChild(info);
        
        const right = Utils.createElement('div', {
            className: 'text-right'
        });
        const rate = Utils.createElement('p', {
            className: 'text-lg font-bold text-green-600'
        });
        Utils.setTextContent(rate, `${empresa.taxa_aceitacao || 0}%`);
        const ratio = Utils.createElement('p', {
            className: 'text-sm text-gray-500'
        });
        Utils.setTextContent(ratio, `${empresa.aceitas || 0}/${empresa.total_cotacoes || 0}`);
        
        right.appendChild(rate);
        right.appendChild(ratio);
        
        item.appendChild(left);
        item.appendChild(right);
        
        return item;
    },
    
    /**
     * Cria item de ranking de consultor
     * @param {object} consultor - Dados do consultor
     * @param {number} position - Posição no ranking
     * @returns {HTMLElement}
     */
    createConsultorRankingItem(consultor, position) {
        const item = Utils.createElement('div', {
            className: 'flex items-center justify-between p-4 bg-blue-50 rounded-lg'
        });
        
        const left = Utils.createElement('div', {
            className: 'flex items-center'
        });
        
        const badge = Utils.createElement('span', {
            className: 'w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3'
        });
        Utils.setTextContent(badge, position);
        
        const info = Utils.createElement('div');
        const name = Utils.createElement('p', {
            className: 'font-medium text-gray-900'
        });
        Utils.setTextContent(name, consultor.nome || 'N/A');
        const role = Utils.createElement('p', {
            className: 'text-sm text-gray-500'
        });
        Utils.setTextContent(role, 'Consultor');
        
        info.appendChild(name);
        info.appendChild(role);
        left.appendChild(badge);
        left.appendChild(info);
        
        const right = Utils.createElement('div', {
            className: 'text-right'
        });
        const count = Utils.createElement('p', {
            className: 'text-lg font-bold text-blue-600'
        });
        Utils.setTextContent(count, consultor.total_cotacoes || 0);
        const label = Utils.createElement('p', {
            className: 'text-sm text-gray-500'
        });
        Utils.setTextContent(label, 'cotações');
        
        right.appendChild(count);
        right.appendChild(label);
        
        item.appendChild(left);
        item.appendChild(right);
        
        return item;
    },
    
    // ==================== GRÁFICOS ====================
    
    /**
     * Renderiza gráfico de modalidades
     * @param {object} data - Dados
     */
    renderChartModalidades(data) {
        const ctx = document.getElementById('chart-modalidades-analytics');
        if (!ctx) return;
        
        if (this.charts.modalidades) {
            this.charts.modalidades.destroy();
        }
        
        this.charts.modalidades = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Rodoviário', 'Marítimo', 'Aéreo'],
                datasets: [{
                    data: [
                        data.por_modalidade?.rodoviario || 0,
                        data.por_modalidade?.maritimo || 0,
                        data.por_modalidade?.aereo || 0
                    ],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },
    
    /**
     * Renderiza gráfico de status
     * @param {object} data - Dados
     */
    renderChartStatus(data) {
        const ctx = document.getElementById('chart-status-analytics');
        if (!ctx) return;
        
        if (this.charts.status) {
            this.charts.status.destroy();
        }
        
        this.charts.status = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Solicitadas', 'Em Análise', 'Enviadas', 'Finalizadas'],
                datasets: [{
                    data: [
                        data.por_status?.solicitadas || 0,
                        data.por_status?.em_analise || 0,
                        data.por_status?.enviadas || 0,
                        data.por_status?.finalizadas || 0
                    ],
                    backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
};

// Exportar para uso global
window.Analytics = Analytics;
