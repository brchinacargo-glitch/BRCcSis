// ==================== DASHBOARD COM GRÁFICOS FUNCIONAIS ====================
// Sistema completo de visualização de dados com gráficos interativos

const DashboardGraficos = {
    // Estado
    dadosCarregados: false,
    graficosRenderizados: {},
    
    // Configurações
    cores: {
        primaria: '#ea580c',
        secundaria: '#dc2626',
        sucesso: '#16a34a',
        aviso: '#d97706',
        info: '#2563eb',
        neutro: '#6b7280'
    },
    
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.criarContainersGraficos();
        this.carregarDados();
        this.setupEventListeners();
        console.log('✅ Dashboard com Gráficos inicializado');
    },
    
    criarContainersGraficos() {
        const dashboardContainer = document.getElementById('dashboard-analytics');
        if (!dashboardContainer) {
            console.warn('Container do dashboard não encontrado');
            return;
        }
        
        dashboardContainer.innerHTML = `
            <!-- Métricas Principais -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100 mr-4">
                            <i class="fas fa-file-invoice text-blue-600 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-600">Total de Cotações</p>
                            <p id="total-cotacoes" class="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100 mr-4">
                            <i class="fas fa-check-circle text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-600">Finalizadas</p>
                            <p id="cotacoes-finalizadas" class="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-yellow-100 mr-4">
                            <i class="fas fa-clock text-yellow-600 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-600">Pendentes</p>
                            <p id="cotacoes-pendentes" class="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-purple-100 mr-4">
                            <i class="fas fa-chart-line text-purple-600 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                            <p id="taxa-conversao" class="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Gráficos -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- Gráfico de Status -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Cotações por Status</h3>
                        <button id="refresh-status" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div class="h-64">
                        <canvas id="grafico-status"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico de Modalidades -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Cotações por Modalidade</h3>
                        <button id="refresh-modalidade" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div class="h-64">
                        <canvas id="grafico-modalidade"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Gráficos de Linha -->
            <div class="grid grid-cols-1 gap-6 mb-8">
                <!-- Evolução Temporal -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Evolução das Cotações (Últimos 30 dias)</h3>
                        <div class="flex space-x-2">
                            <select id="periodo-evolucao" class="text-sm border border-gray-300 rounded px-3 py-1">
                                <option value="7">7 dias</option>
                                <option value="30" selected>30 dias</option>
                                <option value="90">90 dias</option>
                            </select>
                            <button id="refresh-evolucao" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="h-80">
                        <canvas id="grafico-evolucao"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Performance por Operador -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Ranking de Operadores -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Performance por Operador</h3>
                        <button id="refresh-operadores" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div class="h-64">
                        <canvas id="grafico-operadores"></canvas>
                    </div>
                </div>
                
                <!-- Valores Médios -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Valores Médios por Modalidade</h3>
                        <button id="refresh-valores" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div class="h-64">
                        <canvas id="grafico-valores"></canvas>
                    </div>
                </div>
            </div>
        `;
    },
    
    setupEventListeners() {
        // Botões de refresh
        document.getElementById('refresh-status')?.addEventListener('click', () => {
            this.renderizarGraficoStatus();
        });
        
        document.getElementById('refresh-modalidade')?.addEventListener('click', () => {
            this.renderizarGraficoModalidade();
        });
        
        document.getElementById('refresh-evolucao')?.addEventListener('click', () => {
            this.renderizarGraficoEvolucao();
        });
        
        document.getElementById('refresh-operadores')?.addEventListener('click', () => {
            this.renderizarGraficoOperadores();
        });
        
        document.getElementById('refresh-valores')?.addEventListener('click', () => {
            this.renderizarGraficoValores();
        });
        
        // Mudança de período
        document.getElementById('periodo-evolucao')?.addEventListener('change', (e) => {
            this.renderizarGraficoEvolucao(parseInt(e.target.value));
        });
    },
    
    // ==================== CARREGAMENTO DE DADOS ====================
    
    async carregarDados() {
        try {
            // Tentar carregar dados da API
            let dados = null;
            
            if (window.API && typeof API.getDashboardData === 'function') {
                const response = await API.getDashboardData();
                dados = response.data || response;
            }
            
            // Fallback para dados simulados
            if (!dados) {
                dados = this.gerarDadosSimulados();
            }
            
            this.dados = dados;
            this.dadosCarregados = true;
            
            // Renderizar métricas e gráficos
            this.atualizarMetricas();
            this.renderizarTodosGraficos();
            
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            this.dados = this.gerarDadosSimulados();
            this.dadosCarregados = true;
            this.atualizarMetricas();
            this.renderizarTodosGraficos();
        }
    },
    
    gerarDadosSimulados() {
        const hoje = new Date();
        const dados = {
            metricas: {
                total: 156,
                finalizadas: 89,
                pendentes: 34,
                taxaConversao: 67.3
            },
            porStatus: [
                { status: 'solicitada', count: 23, label: 'Solicitadas' },
                { status: 'aceita_operador', count: 34, label: 'Aceitas' },
                { status: 'cotacao_enviada', count: 45, label: 'Enviadas' },
                { status: 'aceita_consultor', count: 32, label: 'Aprovadas' },
                { status: 'finalizada', count: 22, label: 'Finalizadas' }
            ],
            porModalidade: [
                { modalidade: 'brcargo_rodoviario', count: 78, label: 'Rodoviário' },
                { modalidade: 'brcargo_maritimo', count: 45, label: 'Marítimo' },
                { modalidade: 'frete_aereo', count: 33, label: 'Aéreo' }
            ],
            evolucao: [],
            porOperador: [
                { operador: 'João Silva', count: 45, finalizadas: 32 },
                { operador: 'Maria Santos', count: 38, finalizadas: 28 },
                { operador: 'Pedro Costa', count: 42, finalizadas: 29 },
                { operador: 'Ana Oliveira', count: 31, finalizadas: 22 }
            ],
            valoresMedios: [
                { modalidade: 'Rodoviário', valor: 2850.50 },
                { modalidade: 'Marítimo', valor: 8750.25 },
                { modalidade: 'Aéreo', valor: 12500.75 }
            ]
        };
        
        // Gerar dados de evolução dos últimos 30 dias
        for (let i = 29; i >= 0; i--) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            
            dados.evolucao.push({
                data: data.toISOString().split('T')[0],
                solicitadas: Math.floor(Math.random() * 8) + 2,
                finalizadas: Math.floor(Math.random() * 6) + 1,
                total: Math.floor(Math.random() * 12) + 5
            });
        }
        
        return dados;
    },
    
    // ==================== MÉTRICAS ====================
    
    atualizarMetricas() {
        if (!this.dados || !this.dados.metricas) return;
        
        const metricas = this.dados.metricas;
        
        document.getElementById('total-cotacoes').textContent = metricas.total.toLocaleString('pt-BR');
        document.getElementById('cotacoes-finalizadas').textContent = metricas.finalizadas.toLocaleString('pt-BR');
        document.getElementById('cotacoes-pendentes').textContent = metricas.pendentes.toLocaleString('pt-BR');
        document.getElementById('taxa-conversao').textContent = metricas.taxaConversao.toFixed(1) + '%';
    },
    
    // ==================== RENDERIZAÇÃO DE GRÁFICOS ====================
    
    renderizarTodosGraficos() {
        this.renderizarGraficoStatus();
        this.renderizarGraficoModalidade();
        this.renderizarGraficoEvolucao();
        this.renderizarGraficoOperadores();
        this.renderizarGraficoValores();
    },
    
    renderizarGraficoStatus() {
        const ctx = document.getElementById('grafico-status');
        if (!ctx || !this.dados) return;
        
        // Destruir gráfico anterior se existir
        if (this.graficosRenderizados.status) {
            this.graficosRenderizados.status.destroy();
        }
        
        const dados = this.dados.porStatus;
        
        this.graficosRenderizados.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: dados.map(d => d.label),
                datasets: [{
                    data: dados.map(d => d.count),
                    backgroundColor: [
                        '#fbbf24', // Solicitadas - Amarelo
                        '#3b82f6', // Aceitas - Azul
                        '#8b5cf6', // Enviadas - Roxo
                        '#10b981', // Aprovadas - Verde
                        '#6b7280'  // Finalizadas - Cinza
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed * 100) / total).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    renderizarGraficoModalidade() {
        const ctx = document.getElementById('grafico-modalidade');
        if (!ctx || !this.dados) return;
        
        if (this.graficosRenderizados.modalidade) {
            this.graficosRenderizados.modalidade.destroy();
        }
        
        const dados = this.dados.porModalidade;
        
        this.graficosRenderizados.modalidade = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dados.map(d => d.label),
                datasets: [{
                    label: 'Cotações',
                    data: dados.map(d => d.count),
                    backgroundColor: [
                        this.cores.primaria,
                        this.cores.info,
                        this.cores.sucesso
                    ],
                    borderColor: [
                        this.cores.primaria,
                        this.cores.info,
                        this.cores.sucesso
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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
    
    renderizarGraficoEvolucao(dias = 30) {
        const ctx = document.getElementById('grafico-evolucao');
        if (!ctx || !this.dados) return;
        
        if (this.graficosRenderizados.evolucao) {
            this.graficosRenderizados.evolucao.destroy();
        }
        
        const dados = this.dados.evolucao.slice(-dias);
        
        this.graficosRenderizados.evolucao = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dados.map(d => new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
                datasets: [
                    {
                        label: 'Solicitadas',
                        data: dados.map(d => d.solicitadas),
                        borderColor: this.cores.aviso,
                        backgroundColor: this.cores.aviso + '20',
                        tension: 0.4
                    },
                    {
                        label: 'Finalizadas',
                        data: dados.map(d => d.finalizadas),
                        borderColor: this.cores.sucesso,
                        backgroundColor: this.cores.sucesso + '20',
                        tension: 0.4
                    },
                    {
                        label: 'Total',
                        data: dados.map(d => d.total),
                        borderColor: this.cores.info,
                        backgroundColor: this.cores.info + '20',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    },
    
    renderizarGraficoOperadores() {
        const ctx = document.getElementById('grafico-operadores');
        if (!ctx || !this.dados) return;
        
        if (this.graficosRenderizados.operadores) {
            this.graficosRenderizados.operadores.destroy();
        }
        
        const dados = this.dados.porOperador;
        
        this.graficosRenderizados.operadores = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dados.map(d => d.operador),
                datasets: [
                    {
                        label: 'Total',
                        data: dados.map(d => d.count),
                        backgroundColor: this.cores.info + '80',
                        borderColor: this.cores.info,
                        borderWidth: 1
                    },
                    {
                        label: 'Finalizadas',
                        data: dados.map(d => d.finalizadas),
                        backgroundColor: this.cores.sucesso + '80',
                        borderColor: this.cores.sucesso,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
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
    
    renderizarGraficoValores() {
        const ctx = document.getElementById('grafico-valores');
        if (!ctx || !this.dados) return;
        
        if (this.graficosRenderizados.valores) {
            this.graficosRenderizados.valores.destroy();
        }
        
        const dados = this.dados.valoresMedios;
        
        this.graficosRenderizados.valores = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dados.map(d => d.modalidade),
                datasets: [{
                    label: 'Valor Médio (R$)',
                    data: dados.map(d => d.valor),
                    backgroundColor: [
                        this.cores.primaria + '80',
                        this.cores.info + '80',
                        this.cores.sucesso + '80'
                    ],
                    borderColor: [
                        this.cores.primaria,
                        this.cores.info,
                        this.cores.sucesso
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
    },
    
    // ==================== ATUALIZAÇÃO EM TEMPO REAL ====================
    
    atualizarDados() {
        this.carregarDados();
    },
    
    // ==================== DESTRUIÇÃO ====================
    
    destruirGraficos() {
        Object.values(this.graficosRenderizados).forEach(grafico => {
            if (grafico && typeof grafico.destroy === 'function') {
                grafico.destroy();
            }
        });
        this.graficosRenderizados = {};
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se Chart.js está disponível
    if (typeof Chart !== 'undefined') {
        DashboardGraficos.init();
    } else {
        console.warn('Chart.js não encontrado. Carregando via CDN...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            DashboardGraficos.init();
        };
        document.head.appendChild(script);
    }
});

// Exportar para uso global
window.DashboardGraficos = DashboardGraficos;
