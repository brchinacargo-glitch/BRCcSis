// ==================== MÓDULO DE DASHBOARD ====================
// Gerencia o dashboard e gráficos

const Dashboard = {
    // Instâncias dos gráficos
    charts: {},
    
    // Dados do dashboard
    stats: null,
    
    // Flag para evitar carregamento múltiplo
    isLoading: false,
    
    // ==================== INICIALIZAÇÃO ====================
    
    /**
     * Inicializa o módulo Dashboard
     */
    init() {
        console.log('✅ Dashboard inicializado');
    },
    
    // ==================== CARREGAMENTO ====================
    
    /**
     * Carrega dados do dashboard
     */
    async load() {
        // Evitar carregamento múltiplo
        if (this.isLoading) {
            console.log('⏳ Dashboard já está carregando, pulando...');
            return;
        }
        
        this.isLoading = true;
        
        try {
            // Destruir todos os gráficos antes de carregar novos
            this.destroyAllCharts();
            
            await this.loadStats();
            await this.loadCharts();
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            Utils.showError('Erro ao carregar dados do dashboard');
        } finally {
            this.isLoading = false;
        }
    },
    
    /**
     * Carrega estatísticas do dashboard (otimizado com single endpoint)
     */
    async loadStats() {
        try {
            const response = await API.getDashboardStats();
            
            if (response.success) {
                this.stats = response.data;
                this.renderStats(response.data);
            } else {
                // Fallback: carregar manualmente se o endpoint não existir
                await this.loadStatsManually();
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            // Fallback: carregar manualmente
            await this.loadStatsManually();
        }
    },
    
    /**
     * Carrega estatísticas manualmente (fallback)
     */
    async loadStatsManually() {
        try {
            const response = await API.getEmpresas();
            
            if (response.success) {
                const empresas = response.data;
                
                const stats = {
                    total_empresas: empresas.length,
                    empresas_certificadas: empresas.filter(e => e.certificacoes && e.certificacoes.length > 0).length,
                    empresas_armazem: empresas.filter(e => e.possui_armazem === true).length,
                    empresas_nacional: empresas.filter(e => e.abrangencia === 'Nacional').length
                };
                
                this.stats = stats;
                this.renderStats(stats);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas manualmente:', error);
        }
    },
    
    /**
     * Renderiza estatísticas
     * @param {object} stats - Estatísticas
     */
    renderStats(stats) {
        // Verificar se stats existe e tem as propriedades necessárias
        if (!stats) {
            console.warn('Stats não disponível, usando valores padrão');
            stats = {
                total_empresas: 0,
                empresas_certificadas: 0,
                empresas_armazem: 0,
                empresas_nacional: 0
            };
        }
        
        Utils.setTextContent(document.getElementById('total-empresas'), stats.total_empresas || 0);
        Utils.setTextContent(document.getElementById('empresas-certificadas'), stats.empresas_certificadas || 0);
        Utils.setTextContent(document.getElementById('empresas-armazem'), stats.empresas_armazem || 0);
        Utils.setTextContent(document.getElementById('empresas-nacional'), stats.empresas_nacional || 0);
    },
    
    /**
     * Carrega dados dos gráficos
     */
    async loadCharts() {
        try {
            const response = await API.getDashboardCharts();
            
            if (response.success) {
                this.renderCharts(response.data);
            } else {
                // Fallback: carregar manualmente
                await this.loadChartsManually();
            }
        } catch (error) {
            console.error('Erro ao carregar gráficos:', error);
            // Fallback: carregar manualmente
            await this.loadChartsManually();
        }
    },
    
    /**
     * Carrega dados dos gráficos manualmente (fallback)
     */
    async loadChartsManually() {
        try {
            const response = await API.getEmpresas();
            
            if (response.success) {
                const empresas = response.data;
                
                // Processar dados para gráficos
                const chartData = this.processChartData(empresas);
                this.renderCharts(chartData);
            }
        } catch (error) {
            console.error('Erro ao carregar gráficos manualmente:', error);
        }
    },
    
    /**
     * Processa dados para os gráficos
     * @param {Array} empresas - Lista de empresas
     * @returns {object} - Dados processados
     */
    processChartData(empresas) {
        // Verificar se empresas existe e é um array
        if (!empresas || !Array.isArray(empresas)) {
            console.warn('Empresas não disponível ou não é um array, usando dados padrão');
            return {
                regioes: {
                    labels: ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte'],
                    data: [45, 30, 15, 7, 3]
                },
                tipos_carga: {
                    labels: ['Geral', 'Refrigerada', 'Perigosa', 'Frágil', 'Valiosa'],
                    data: [60, 20, 10, 7, 3]
                }
            };
        }
        
        // Empresas por região
        const regioes = {};
        empresas.forEach(e => {
            const regiao = e.regiao || 'Não especificado';
            regioes[regiao] = (regioes[regiao] || 0) + 1;
        });
        
        // Tipos de carga
        const tiposCarga = {};
        empresas.forEach(e => {
            if (e.tipos_carga && Array.isArray(e.tipos_carga)) {
                e.tipos_carga.forEach(tipo => {
                    tiposCarga[tipo] = (tiposCarga[tipo] || 0) + 1;
                });
            }
        });
        
        return {
            regioes: {
                labels: Object.keys(regioes),
                data: Object.values(regioes)
            },
            tipos_carga: {
                labels: Object.keys(tiposCarga).slice(0, 10), // Top 10
                data: Object.values(tiposCarga).slice(0, 10)
            }
        };
    },
    
    /**
     * Renderiza todos os gráficos
     * @param {object} data - Dados dos gráficos
     */
    renderCharts(data) {
        // Verificar se data existe e tem as propriedades necessárias
        if (!data) {
            console.warn('Data não disponível para gráficos, usando valores padrão');
            data = {
                regioes: { labels: ['Sudeste', 'Sul', 'Nordeste'], data: [45, 30, 25] },
                tipos_carga: { labels: ['Geral', 'Refrigerada', 'Perigosa'], data: [60, 25, 15] }
            };
        }
        
        // Verificar se as propriedades existem
        if (!data.regioes) {
            data.regioes = { labels: ['Sudeste', 'Sul', 'Nordeste'], data: [45, 30, 25] };
        }
        if (!data.tipos_carga) {
            data.tipos_carga = { labels: ['Geral', 'Refrigerada', 'Perigosa'], data: [60, 25, 15] };
        }
        
        this.renderChartRegiao(data.regioes);
        this.renderChartTiposCarga(data.tipos_carga);
        this.renderChartCrescimento();
        this.renderChartCertificacoes();
    },
    
    // ==================== GRÁFICOS ====================
    
    /**
     * Renderiza gráfico de empresas por região
     * @param {object} data - Dados do gráfico
     */
    renderChartRegiao(data) {
        const ctx = document.getElementById('chart-empresas-regiao');
        if (!ctx) return;
        
        // Destruir gráfico existente se houver
        if (this.charts.regiao) {
            try {
                this.charts.regiao.destroy();
                console.log('🧹 Gráfico região destruído');
            } catch (error) {
                console.warn('Erro ao destruir gráfico região:', error);
            }
        }
        
        try {
            this.charts.regiao = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: 'Empresas',
                    data: data.data || [],
                    backgroundColor: 'rgba(34, 139, 34, 0.6)',
                    borderColor: 'rgba(34, 139, 34, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
        } catch (error) {
            console.error('Erro ao criar gráfico região:', error);
        }
    },
    
    /**
     * Renderiza gráfico de tipos de carga
     * @param {object} data - Dados do gráfico
     */
    renderChartTiposCarga(data) {
        const ctx = document.getElementById('chart-tipos-carga');
        if (!ctx) return;
        
        // Destruir gráfico existente se houver
        if (this.charts.tiposCarga) {
            try {
                this.charts.tiposCarga.destroy();
                console.log('🧹 Gráfico tipos carga destruído');
            } catch (error) {
                console.warn('Erro ao destruir gráfico tipos carga:', error);
            }
        }
        
        try {
            this.charts.tiposCarga = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels || [],
                datasets: [{
                    data: data.data || [],
                    backgroundColor: [
                        '#228B22', '#DC143C', '#3b82f6', '#f59e0b', '#10b981',
                        '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        } catch (error) {
            console.error('Erro ao criar gráfico tipos carga:', error);
        }
    },
    
    /**
     * Renderiza gráfico de crescimento
     */
    renderChartCrescimento() {
        const ctx = document.getElementById('chart-crescimento');
        if (!ctx) return;
        
        // Destruir gráfico existente se houver
        if (this.charts.crescimento) {
            try {
                this.charts.crescimento.destroy();
                console.log('🧹 Gráfico crescimento destruído');
            } catch (error) {
                console.warn('Erro ao destruir gráfico crescimento:', error);
            }
        }
        
        // Dados de exemplo (pode ser substituído por dados reais)
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const dados = [10, 15, 18, 22, 28, 32, 38, 42, 48, 52, 58, 65];
        
        try {
            this.charts.crescimento = new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Empresas Cadastradas',
                    data: dados,
                    borderColor: '#228B22',
                    backgroundColor: 'rgba(34, 139, 34, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        } catch (error) {
            console.error('Erro ao criar gráfico crescimento:', error);
        }
    },
    
    /**
     * Renderiza gráfico de certificações
     */
    renderChartCertificacoes() {
        const ctx = document.getElementById('chart-certificacoes');
        if (!ctx) return;
        
        // Destruir gráfico existente se houver
        if (this.charts.certificacoes) {
            try {
                this.charts.certificacoes.destroy();
                console.log('🧹 Gráfico certificações destruído');
            } catch (error) {
                console.warn('Erro ao destruir gráfico certificações:', error);
            }
        }
        
        // Dados de exemplo (pode ser substituído por dados reais)
        const certificacoes = ['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'OEA', 'Outras'];
        const dados = [25, 18, 12, 8, 10];
        
        try {
            this.charts.certificacoes = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: certificacoes,
                datasets: [{
                    label: 'Empresas Certificadas',
                    data: dados,
                    backgroundColor: 'rgba(220, 20, 60, 0.6)',
                    borderColor: 'rgba(220, 20, 60, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
            console.error('Erro ao criar gráfico certificações:', error);
        }
    },
    
    /**
     * Destrói todos os gráficos
     */
    destroyAllCharts() {
        if (!this.charts) return;
        
        Object.keys(this.charts).forEach(key => {
            try {
                if (this.charts[key]) {
                    this.charts[key].destroy();
                    console.log(`🧹 Gráfico ${key} destruído`);
                }
            } catch (error) {
                console.warn(`Erro ao destruir gráfico ${key}:`, error);
            }
        });
        
        this.charts = {};
    },
    
    // ==================== EXPORTAÇÃO ====================
    
    /**
     * Exporta dashboard para PDF
     */
    async exportPDF() {
        try {
            Utils.showSuccess('Funcionalidade de exportação PDF em desenvolvimento');
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            Utils.showError('Erro ao exportar PDF');
        }
    },
    
    /**
     * Exporta dashboard para Excel
     */
    async exportExcel() {
        try {
            Utils.showSuccess('Funcionalidade de exportação Excel em desenvolvimento');
        } catch (error) {
            console.error('Erro ao exportar Excel:', error);
            Utils.showError('Erro ao exportar Excel');
        }
    }
};

// Exportar para uso global
window.Dashboard = Dashboard;
