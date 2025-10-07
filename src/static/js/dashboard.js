// ==================== DASHBOARD COM GRÁFICOS ====================
// Dashboard com Chart.js - Implementação cuidadosa

console.log('📊 Dashboard com Gráficos v3.0');

const Dashboard = {
    dados: null,
    charts: {},
    
    init() {
        console.log('🚀 Inicializando dashboard com gráficos...');
        this.loadData();
    },
    
    async loadData() {
        try {
            // Tentar usar dados das cotações carregadas
            if (window.Cotacoes && window.Cotacoes.cotacoes && window.Cotacoes.cotacoes.length > 0) {
                console.log('📊 Usando dados das cotações carregadas');
                this.processData(window.Cotacoes.cotacoes);
                return;
            }
            
            // Tentar API
            if (window.API && typeof API.getCotacoes === 'function') {
                const response = await API.getCotacoes();
                if (response.success) {
                    this.processData(response.cotacoes);
                    return;
                }
            }
            
            console.log('📊 Usando dados de exemplo');
            this.showBasicStats();
            
        } catch (error) {
            console.log('📊 Erro ao carregar dados, usando exemplo');
            this.showBasicStats();
        }
    },
    
    processData(cotacoes) {
        const stats = {
            total: cotacoes.length,
            finalizadas: cotacoes.filter(c => c.status === 'finalizada').length,
            pendentes: cotacoes.filter(c => c.status !== 'finalizada').length
        };
        
        // Dados para gráficos
        const porStatus = this.contarPorStatus(cotacoes);
        const porModalidade = this.contarPorModalidade(cotacoes);
        
        this.updateUI(stats);
        this.createCharts(porStatus, porModalidade);
    },
    
    contarPorStatus(cotacoes) {
        const contadores = {};
        cotacoes.forEach(c => {
            contadores[c.status] = (contadores[c.status] || 0) + 1;
        });
        return contadores;
    },
    
    contarPorModalidade(cotacoes) {
        const contadores = {};
        cotacoes.forEach(c => {
            contadores[c.modalidade] = (contadores[c.modalidade] || 0) + 1;
        });
        return contadores;
    },
    
    updateUI(stats) {
        // Atualizar elementos se existirem
        this.updateElement('total-cotacoes', stats.total);
        this.updateElement('cotacoes-finalizadas', stats.finalizadas);
        this.updateElement('cotacoes-pendentes', stats.pendentes);
        
        console.log('✅ Dashboard atualizado:', stats);
    },
    
    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },
    
    showBasicStats() {
        this.updateUI({ total: 12, finalizadas: 8, pendentes: 4 });
        
        // Gráficos de exemplo
        const porStatus = { 'solicitada': 3, 'aceita_operador': 2, 'finalizada': 8, 'negada': 1 };
        const porModalidade = { 'rodoviario': 8, 'maritimo': 3, 'aereo': 1 };
        this.createCharts(porStatus, porModalidade);
    },
    
    createCharts(porStatus, porModalidade) {
        if (!window.Chart) {
            console.warn('Chart.js não carregado');
            return;
        }
        
        // Destruir gráficos existentes para evitar conflitos
        this.destroyCharts();
        
        // Gráfico por Status
        this.createStatusChart(porStatus);
        
        // Gráfico por Modalidade
        this.createModalidadeChart(porModalidade);
        
        console.log('✅ Gráficos criados');
    },
    
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    },
    
    createStatusChart(dados) {
        const canvas = document.getElementById('chart-status');
        if (!canvas) return;
        
        const labels = Object.keys(dados);
        const values = Object.values(dados);
        const colors = ['#FCD34D', '#60A5FA', '#34D399', '#F87171'];
        
        this.charts.status = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels.map(this.getStatusLabel),
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Cotações por Status'
                    }
                }
            }
        });
    },
    
    createModalidadeChart(dados) {
        const canvas = document.getElementById('chart-modalidades');
        if (!canvas) return;
        
        const labels = Object.keys(dados);
        const values = Object.values(dados);
        const colors = ['#3B82F6', '#10B981', '#F59E0B'];
        
        this.charts.modalidade = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels.map(this.getModalidadeLabel),
                datasets: [{
                    label: 'Cotações',
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Cotações por Modalidade'
                    }
                },
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
    },
    
    getStatusLabel(status) {
        const labels = {
            'solicitada': 'Solicitada',
            'aceita_operador': 'Aceita',
            'finalizada': 'Finalizada',
            'negada': 'Negada'
        };
        return labels[status] || status;
    },
    
    getModalidadeLabel(modalidade) {
        const labels = {
            'rodoviario': 'Rodoviário',
            'maritimo': 'Marítimo',
            'aereo': 'Aéreo'
        };
        return labels[modalidade] || modalidade;
    },
    
    // Função para atualizar dashboard quando cotações mudarem
    refresh() {
        console.log('🔄 Atualizando dashboard...');
        this.loadData();
    }
};

// Exportar globalmente
window.Dashboard = Dashboard;

console.log('✅ Dashboard simples carregado');
