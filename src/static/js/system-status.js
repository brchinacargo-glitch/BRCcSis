// ==================== SISTEMA DE STATUS DO SISTEMA ====================
// Mostra status de saúde e funcionalidades para o usuário

console.log('📊 Inicializando sistema de status...');

window.SystemStatus = {
    components: {
        frontend: { status: 'healthy', message: 'Interface carregada' },
        api: { status: 'checking', message: 'Verificando APIs...' },
        database: { status: 'fallback', message: 'Usando dados de demonstração' },
        charts: { status: 'healthy', message: 'Gráficos funcionais' },
        navigation: { status: 'healthy', message: 'Navegação ativa' }
    },
    
    init() {
        this.createStatusIndicator();
        this.checkAllComponents();
        this.startPeriodicCheck();
    },
    
    createStatusIndicator() {
        // Criar indicador de status no canto superior direito
        const indicator = document.createElement('div');
        indicator.id = 'system-status-indicator';
        indicator.className = 'fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2 cursor-pointer';
        indicator.style.cssText = `
            min-width: 120px;
            border: 2px solid #10b981;
            transition: all 0.3s ease;
        `;
        
        indicator.innerHTML = `
            <div class="flex items-center space-x-2">
                <div id="status-dot" class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span id="status-text" class="text-sm font-medium text-gray-700">Sistema OK</span>
            </div>
        `;
        
        // Adicionar tooltip expandido ao clicar
        indicator.addEventListener('click', () => this.showDetailedStatus());
        
        document.body.appendChild(indicator);
    },
    
    async checkAllComponents() {
        // 1. Verificar Frontend
        this.updateComponent('frontend', 'healthy', 'Interface carregada');
        
        // 2. Verificar APIs
        await this.checkAPIs();
        
        // 3. Verificar Chart.js
        this.checkCharts();
        
        // 4. Verificar Navegação
        this.checkNavigation();
        
        // 5. Atualizar indicador geral
        this.updateGeneralStatus();
    },
    
    async checkAPIs() {
        const endpoints = [
            { name: 'empresas', url: '/api/v133/empresas' },
            { name: 'operadores', url: '/api/v133/operadores' },
            { name: 'cotacoes', url: '/api/v133/cotacoes' },
            { name: 'analytics', url: '/api/v133/analytics/geral' }
        ];
        
        let workingEndpoints = 0;
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint.url, { 
                    method: 'GET',
                    timeout: 3000 
                });
                
                if (response.ok) {
                    workingEndpoints++;
                }
            } catch (error) {
                // Endpoint não funciona, mas isso é esperado
            }
        }
        
        if (workingEndpoints === endpoints.length) {
            this.updateComponent('api', 'healthy', 'Todas as APIs funcionais');
            this.updateComponent('database', 'healthy', 'Banco de dados conectado');
        } else if (workingEndpoints > 0) {
            this.updateComponent('api', 'partial', `${workingEndpoints}/${endpoints.length} APIs funcionais`);
            this.updateComponent('database', 'partial', 'Conexão parcial com banco');
        } else {
            this.updateComponent('api', 'fallback', 'APIs não implementadas');
            this.updateComponent('database', 'fallback', 'Usando dados de demonstração');
        }
    },
    
    checkCharts() {
        if (window.Chart && window.DashboardGraficos) {
            this.updateComponent('charts', 'healthy', 'Chart.js carregado');
        } else {
            this.updateComponent('charts', 'warning', 'Chart.js não carregado');
        }
    },
    
    checkNavigation() {
        const navElements = ['nav-dashboard', 'nav-empresas', 'nav-cotacoes', 'nav-cadastro'];
        const foundElements = navElements.filter(id => document.getElementById(id));
        
        if (foundElements.length === navElements.length) {
            this.updateComponent('navigation', 'healthy', 'Navegação completa');
        } else {
            this.updateComponent('navigation', 'warning', `${foundElements.length}/${navElements.length} elementos encontrados`);
        }
    },
    
    updateComponent(name, status, message) {
        this.components[name] = { status, message };
    },
    
    updateGeneralStatus() {
        const statuses = Object.values(this.components).map(c => c.status);
        const hasError = statuses.includes('error');
        const hasWarning = statuses.includes('warning');
        const hasPartial = statuses.includes('partial');
        
        let generalStatus, color, text;
        
        if (hasError) {
            generalStatus = 'error';
            color = '#ef4444';
            text = 'Erro';
        } else if (hasWarning) {
            generalStatus = 'warning';
            color = '#f59e0b';
            text = 'Atenção';
        } else if (hasPartial) {
            generalStatus = 'partial';
            color = '#3b82f6';
            text = 'Parcial';
        } else {
            generalStatus = 'healthy';
            color = '#10b981';
            text = 'Sistema OK';
        }
        
        const indicator = document.getElementById('system-status-indicator');
        const dot = document.getElementById('status-dot');
        const textEl = document.getElementById('status-text');
        
        if (indicator && dot && textEl) {
            indicator.style.borderColor = color;
            dot.style.backgroundColor = color;
            textEl.textContent = text;
            
            // Adicionar animação se houver problemas
            if (generalStatus !== 'healthy') {
                dot.classList.add('animate-pulse');
            } else {
                dot.classList.remove('animate-pulse');
            }
        }
    },
    
    showDetailedStatus() {
        // Criar modal com status detalhado
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const content = document.createElement('div');
        content.className = 'bg-white rounded-lg p-6 max-w-md w-full mx-4';
        
        content.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Status do Sistema</h3>
                <button id="close-status" class="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div class="space-y-3">
                ${Object.entries(this.components).map(([name, comp]) => `
                    <div class="flex items-center justify-between p-2 rounded ${this.getStatusBg(comp.status)}">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 rounded-full ${this.getStatusColor(comp.status)}"></div>
                            <span class="font-medium">${this.getComponentName(name)}</span>
                        </div>
                        <span class="text-sm text-gray-600">${comp.message}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-800">
                    <strong>Modo de Operação:</strong> 
                    ${this.getOperationMode()}
                </p>
            </div>
            
            <div class="mt-4 flex justify-end">
                <button id="refresh-status" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Atualizar Status
                </button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('close-status').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('refresh-status').addEventListener('click', () => {
            this.checkAllComponents();
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    },
    
    getStatusColor(status) {
        const colors = {
            healthy: 'bg-green-500',
            partial: 'bg-blue-500',
            warning: 'bg-yellow-500',
            error: 'bg-red-500',
            fallback: 'bg-gray-500',
            checking: 'bg-gray-400'
        };
        return colors[status] || 'bg-gray-400';
    },
    
    getStatusBg(status) {
        const backgrounds = {
            healthy: 'bg-green-50',
            partial: 'bg-blue-50',
            warning: 'bg-yellow-50',
            error: 'bg-red-50',
            fallback: 'bg-gray-50',
            checking: 'bg-gray-50'
        };
        return backgrounds[status] || 'bg-gray-50';
    },
    
    getComponentName(name) {
        const names = {
            frontend: 'Interface',
            api: 'APIs',
            database: 'Banco de Dados',
            charts: 'Gráficos',
            navigation: 'Navegação'
        };
        return names[name] || name;
    },
    
    getOperationMode() {
        const apiStatus = this.components.api.status;
        
        if (apiStatus === 'healthy') {
            return 'Produção - Todas as funcionalidades disponíveis';
        } else if (apiStatus === 'partial') {
            return 'Híbrido - Algumas APIs funcionais, outras em fallback';
        } else {
            return 'Demonstração - Usando dados simulados (funcionalidade completa)';
        }
    },
    
    startPeriodicCheck() {
        // Verificar status a cada 5 minutos
        setInterval(() => {
            this.checkAllComponents();
        }, 5 * 60 * 1000);
    }
};

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => SystemStatus.init(), 2000);
    });
} else {
    setTimeout(() => SystemStatus.init(), 2000);
}

console.log('✅ Sistema de status inicializado');
