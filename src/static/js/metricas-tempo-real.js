// ==================== MÉTRICAS EM TEMPO REAL ====================
// Sistema de atualização automática de métricas e notificações

const MetricasTempoReal = {
    // Estado
    intervalos: {},
    ultimaAtualizacao: null,
    metricas: {},
    configuracoes: {
        intervaloAtualizacao: 30000, // 30 segundos
        intervaloNotificacoes: 60000, // 1 minuto
        habilitado: true
    },
    
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.criarInterfaceControles();
        this.iniciarMonitoramento();
        this.setupEventListeners();
        console.log('✅ Métricas em Tempo Real inicializadas');
    },
    
    criarInterfaceControles() {
        const container = document.getElementById('controles-tempo-real');
        if (!container) {
            // Criar container se não existir
            const dashboardContainer = document.getElementById('dashboard-analytics');
            if (dashboardContainer) {
                const controlesDiv = document.createElement('div');
                controlesDiv.id = 'controles-tempo-real';
                dashboardContainer.insertBefore(controlesDiv, dashboardContainer.firstChild);
            } else {
                return;
            }
        }
        
        const controlesContainer = document.getElementById('controles-tempo-real');
        controlesContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-4 mb-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center">
                            <i class="fas fa-broadcast-tower text-green-600 mr-2"></i>
                            <span class="font-semibold text-gray-800">Métricas em Tempo Real</span>
                        </div>
                        
                        <div class="flex items-center space-x-2">
                            <div id="status-conexao" class="flex items-center">
                                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                <span class="text-sm text-green-600">Conectado</span>
                            </div>
                            
                            <div class="text-sm text-gray-500">
                                Última atualização: <span id="ultima-atualizacao">-</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-3">
                        <!-- Controles -->
                        <select id="intervalo-atualizacao" class="text-sm border border-gray-300 rounded px-3 py-1">
                            <option value="10000">10s</option>
                            <option value="30000" selected>30s</option>
                            <option value="60000">1min</option>
                            <option value="300000">5min</option>
                        </select>
                        
                        <button id="toggle-tempo-real" class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                            <i class="fas fa-pause mr-1"></i>
                            Pausar
                        </button>
                        
                        <button id="atualizar-agora" class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                            <i class="fas fa-sync-alt mr-1"></i>
                            Atualizar
                        </button>
                        
                        <button id="configurar-alertas" class="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                            <i class="fas fa-bell mr-1"></i>
                            Alertas
                        </button>
                    </div>
                </div>
                
                <!-- Indicadores de Performance -->
                <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600" id="cotacoes-hoje">-</div>
                        <div class="text-xs text-gray-600">Hoje</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600" id="finalizadas-hoje">-</div>
                        <div class="text-xs text-gray-600">Finalizadas Hoje</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-orange-600" id="tempo-medio-resposta">-</div>
                        <div class="text-xs text-gray-600">Tempo Médio</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600" id="operadores-ativos">-</div>
                        <div class="text-xs text-gray-600">Operadores Ativos</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    setupEventListeners() {
        // Toggle tempo real
        document.getElementById('toggle-tempo-real')?.addEventListener('click', () => {
            this.toggleMonitoramento();
        });
        
        // Atualizar agora
        document.getElementById('atualizar-agora')?.addEventListener('click', () => {
            this.atualizarMetricas();
        });
        
        // Mudança de intervalo
        document.getElementById('intervalo-atualizacao')?.addEventListener('change', (e) => {
            this.configuracoes.intervaloAtualizacao = parseInt(e.target.value);
            if (this.configuracoes.habilitado) {
                this.reiniciarMonitoramento();
            }
        });
        
        // Configurar alertas
        document.getElementById('configurar-alertas')?.addEventListener('click', () => {
            this.abrirModalAlertas();
        });
    },
    
    // ==================== MONITORAMENTO ====================
    
    iniciarMonitoramento() {
        if (!this.configuracoes.habilitado) return;
        
        // Primeira atualização imediata
        this.atualizarMetricas();
        
        // Configurar intervalos
        this.intervalos.metricas = setInterval(() => {
            this.atualizarMetricas();
        }, this.configuracoes.intervaloAtualizacao);
        
        this.intervalos.notificacoes = setInterval(() => {
            this.verificarAlertas();
        }, this.configuracoes.intervaloNotificacoes);
        
        console.log('🔄 Monitoramento em tempo real iniciado');
    },
    
    pararMonitoramento() {
        Object.values(this.intervalos).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        this.intervalos = {};
        
        // Atualizar status visual
        const statusConexao = document.getElementById('status-conexao');
        if (statusConexao) {
            statusConexao.innerHTML = `
                <div class="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span class="text-sm text-gray-500">Pausado</span>
            `;
        }
        
        console.log('⏸️ Monitoramento pausado');
    },
    
    reiniciarMonitoramento() {
        this.pararMonitoramento();
        this.iniciarMonitoramento();
    },
    
    toggleMonitoramento() {
        const btn = document.getElementById('toggle-tempo-real');
        
        if (this.configuracoes.habilitado) {
            this.configuracoes.habilitado = false;
            this.pararMonitoramento();
            btn.innerHTML = '<i class="fas fa-play mr-1"></i>Iniciar';
            btn.classList.remove('bg-green-600', 'hover:bg-green-700');
            btn.classList.add('bg-gray-600', 'hover:bg-gray-700');
        } else {
            this.configuracoes.habilitado = true;
            this.iniciarMonitoramento();
            btn.innerHTML = '<i class="fas fa-pause mr-1"></i>Pausar';
            btn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
            btn.classList.add('bg-green-600', 'hover:bg-green-700');
        }
    },
    
    // ==================== ATUALIZAÇÃO DE DADOS ====================
    
    async atualizarMetricas() {
        try {
            // Mostrar indicador de carregamento
            this.mostrarCarregando();
            
            // Carregar dados
            const dados = await this.carregarDadosTempoReal();
            
            // Atualizar métricas
            this.atualizarIndicadores(dados);
            
            // Atualizar gráficos se disponível
            if (window.DashboardGraficos) {
                window.DashboardGraficos.atualizarDados();
            }
            
            // Atualizar timestamp
            this.ultimaAtualizacao = new Date();
            this.atualizarTimestamp();
            
            // Verificar mudanças significativas
            this.verificarMudancas(dados);
            
        } catch (error) {
            console.error('Erro ao atualizar métricas:', error);
            this.mostrarErroConexao();
        }
    },
    
    async carregarDadosTempoReal() {
        // Tentar carregar da API
        if (window.API && typeof API.getMetricasTempoReal === 'function') {
            const response = await API.getMetricasTempoReal();
            return response.data || response;
        }
        
        // Simular dados em tempo real
        return this.gerarDadosSimulados();
    },
    
    gerarDadosSimulados() {
        const base = this.metricas;
        const agora = new Date();
        
        return {
            cotacoes_hoje: (base.cotacoes_hoje || 12) + Math.floor(Math.random() * 3),
            finalizadas_hoje: (base.finalizadas_hoje || 8) + Math.floor(Math.random() * 2),
            tempo_medio_resposta: Math.floor(Math.random() * 120) + 60, // 60-180 minutos
            operadores_ativos: Math.floor(Math.random() * 3) + 4, // 4-6 operadores
            total_cotacoes: (base.total_cotacoes || 156) + Math.floor(Math.random() * 2),
            taxa_conversao: 65 + Math.random() * 10, // 65-75%
            timestamp: agora.toISOString(),
            alertas: this.gerarAlertasSimulados()
        };
    },
    
    gerarAlertasSimulados() {
        const alertas = [];
        
        // Alerta de cotação urgente (10% chance)
        if (Math.random() < 0.1) {
            alertas.push({
                tipo: 'urgente',
                titulo: 'Cotação Urgente',
                mensagem: 'Nova cotação com prioridade alta aguardando processamento',
                cotacao_id: Math.floor(Math.random() * 100) + 1
            });
        }
        
        // Alerta de prazo (5% chance)
        if (Math.random() < 0.05) {
            alertas.push({
                tipo: 'prazo',
                titulo: 'Prazo Vencendo',
                mensagem: 'Cotação próxima do prazo limite de resposta',
                cotacao_id: Math.floor(Math.random() * 100) + 1
            });
        }
        
        return alertas;
    },
    
    // ==================== INTERFACE ====================
    
    atualizarIndicadores(dados) {
        // Atualizar indicadores principais
        this.atualizarElemento('cotacoes-hoje', dados.cotacoes_hoje);
        this.atualizarElemento('finalizadas-hoje', dados.finalizadas_hoje);
        this.atualizarElemento('tempo-medio-resposta', dados.tempo_medio_resposta + 'min');
        this.atualizarElemento('operadores-ativos', dados.operadores_ativos);
        
        // Salvar métricas anteriores para comparação
        this.metricas = dados;
    },
    
    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            // Animação de mudança
            elemento.style.transform = 'scale(1.1)';
            elemento.textContent = valor;
            
            setTimeout(() => {
                elemento.style.transform = 'scale(1)';
            }, 200);
        }
    },
    
    atualizarTimestamp() {
        const elemento = document.getElementById('ultima-atualizacao');
        if (elemento && this.ultimaAtualizacao) {
            elemento.textContent = this.ultimaAtualizacao.toLocaleTimeString('pt-BR');
        }
    },
    
    mostrarCarregando() {
        const statusConexao = document.getElementById('status-conexao');
        if (statusConexao) {
            statusConexao.innerHTML = `
                <div class="w-3 h-3 bg-blue-500 rounded-full animate-spin mr-2"></div>
                <span class="text-sm text-blue-600">Atualizando...</span>
            `;
        }
    },
    
    mostrarErroConexao() {
        const statusConexao = document.getElementById('status-conexao');
        if (statusConexao) {
            statusConexao.innerHTML = `
                <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span class="text-sm text-red-600">Erro de conexão</span>
            `;
        }
        
        // Voltar ao normal após 5 segundos
        setTimeout(() => {
            const status = document.getElementById('status-conexao');
            if (status) {
                status.innerHTML = `
                    <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span class="text-sm text-green-600">Conectado</span>
                `;
            }
        }, 5000);
    },
    
    // ==================== SISTEMA DE ALERTAS ====================
    
    verificarMudancas(dadosNovos) {
        if (!this.metricas.cotacoes_hoje) return;
        
        // Verificar aumento significativo em cotações
        const aumentoCotacoes = dadosNovos.cotacoes_hoje - this.metricas.cotacoes_hoje;
        if (aumentoCotacoes >= 3) {
            this.mostrarNotificacao('info', `${aumentoCotacoes} novas cotações recebidas!`);
        }
        
        // Verificar operadores offline
        const diferencaOperadores = this.metricas.operadores_ativos - dadosNovos.operadores_ativos;
        if (diferencaOperadores >= 2) {
            this.mostrarNotificacao('warning', 'Operadores ficaram offline');
        }
    },
    
    verificarAlertas() {
        if (!this.metricas.alertas) return;
        
        this.metricas.alertas.forEach(alerta => {
            this.mostrarAlerta(alerta);
        });
    },
    
    mostrarAlerta(alerta) {
        // Criar notificação visual
        const notificacao = document.createElement('div');
        notificacao.className = `fixed top-4 right-4 z-50 bg-white border-l-4 ${
            alerta.tipo === 'urgente' ? 'border-red-500' : 'border-yellow-500'
        } rounded-lg shadow-lg p-4 max-w-sm animate-slide-in`;
        
        notificacao.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <i class="fas ${alerta.tipo === 'urgente' ? 'fa-exclamation-triangle text-red-500' : 'fa-clock text-yellow-500'} text-lg"></i>
                </div>
                <div class="ml-3 flex-1">
                    <h4 class="text-sm font-semibold text-gray-900">${alerta.titulo}</h4>
                    <p class="text-sm text-gray-600 mt-1">${alerta.mensagem}</p>
                    ${alerta.cotacao_id ? `
                        <button class="text-xs text-blue-600 hover:text-blue-800 mt-2" onclick="CotacaoDetalhes.abrirModal(${alerta.cotacao_id})">
                            Ver Cotação #${alerta.cotacao_id}
                        </button>
                    ` : ''}
                </div>
                <button class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notificacao);
        
        // Remover após 10 segundos
        setTimeout(() => {
            if (notificacao.parentElement) {
                notificacao.remove();
            }
        }, 10000);
    },
    
    mostrarNotificacao(tipo, mensagem) {
        // Sistema simples de notificações
        const cores = {
            'info': 'bg-blue-100 text-blue-800 border-blue-500',
            'success': 'bg-green-100 text-green-800 border-green-500',
            'warning': 'bg-yellow-100 text-yellow-800 border-yellow-500',
            'error': 'bg-red-100 text-red-800 border-red-500'
        };
        
        const notificacao = document.createElement('div');
        notificacao.className = `fixed bottom-4 right-4 z-50 ${cores[tipo]} border-l-4 rounded-lg shadow-lg p-3 max-w-sm animate-slide-up`;
        notificacao.textContent = mensagem;
        
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            if (notificacao.parentElement) {
                notificacao.remove();
            }
        }, 5000);
    },
    
    // ==================== MODAL DE CONFIGURAÇÃO ====================
    
    abrirModalAlertas() {
        const modal = document.createElement('div');
        modal.id = 'modal-alertas';
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="modal-header bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold">
                            <i class="fas fa-bell mr-2"></i>
                            Configurar Alertas
                        </h3>
                        <button class="fechar-modal-alertas text-white hover:text-gray-200 text-2xl font-bold">
                            &times;
                        </button>
                    </div>
                </div>
                
                <div class="p-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-gray-700">Cotações Urgentes</label>
                        <input type="checkbox" checked class="h-4 w-4 text-purple-600 rounded">
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-gray-700">Prazos Vencendo</label>
                        <input type="checkbox" checked class="h-4 w-4 text-purple-600 rounded">
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-gray-700">Operadores Offline</label>
                        <input type="checkbox" class="h-4 w-4 text-purple-600 rounded">
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-gray-700">Notificações Sonoras</label>
                        <input type="checkbox" class="h-4 w-4 text-purple-600 rounded">
                    </div>
                    
                    <div class="pt-4 border-t border-gray-200">
                        <button class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            Salvar Configurações
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('fechar-modal-alertas')) {
                modal.remove();
            }
        });
    }
};

// CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slide-up {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    .animate-slide-in {
        animation: slide-in 0.3s ease-out;
    }
    
    .animate-slide-up {
        animation: slide-up 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar dashboard estar pronto
    setTimeout(() => {
        MetricasTempoReal.init();
    }, 1000);
});

// Exportar para uso global
window.MetricasTempoReal = MetricasTempoReal;
