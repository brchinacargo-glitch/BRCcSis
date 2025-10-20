// ==================== SYSTEM-FIX.JS - Sistema de Correção Unificado ====================
// Sistema para gerenciar gráficos, inicialização e correções do BRCcSis
// Versão: 1.3.5

console.log('🔧 System-Fix v1.3.5 carregado');

// ==================== CHART MANAGER ====================
const ChartManager = {
    charts: {},
    
    // Destruir gráfico existente
    destroy(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
            console.log(`📊 Gráfico ${canvasId} destruído`);
        }
    },
    
    // Destruir todos os gráficos
    destroyAll() {
        Object.keys(this.charts).forEach(canvasId => {
            this.destroy(canvasId);
        });
        console.log('📊 Todos os gráficos destruídos');
    },
    
    // Criar novo gráfico
    create(canvasId, config) {
        // Destruir gráfico existente primeiro
        this.destroy(canvasId);
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`❌ Canvas ${canvasId} não encontrado`);
            return null;
        }
        
        try {
            this.charts[canvasId] = new Chart(canvas, config);
            console.log(`✅ Gráfico ${canvasId} criado`);
            return this.charts[canvasId];
        } catch (error) {
            console.error(`❌ Erro ao criar gráfico ${canvasId}:`, error);
            return null;
        }
    },
    
    // Verificar se gráfico existe
    exists(canvasId) {
        return !!this.charts[canvasId];
    }
};

// ==================== SYSTEM INIT ====================
const SystemInit = {
    initialized: false,
    
    // Inicialização controlada
    init() {
        if (this.initialized) {
            console.log('⚠️ Sistema já inicializado');
            return;
        }
        
        console.log('🚀 Iniciando System-Fix...');
        
        // Inicializar componentes
        this.initChartManager();
        this.initSimpleDashboard();
        this.initSimpleNavigation();
        this.initSimpleModal();
        
        this.initialized = true;
        console.log('✅ System-Fix inicializado com sucesso');
    },
    
    initChartManager() {
        // Expor ChartManager globalmente
        window.ChartManager = ChartManager;
        console.log('📊 ChartManager disponível globalmente');
    },
    
    initSimpleDashboard() {
        // Dashboard funcional simples
        window.SimpleDashboard = {
            loadCharts: () => {
                console.log('📊 Carregando gráficos do dashboard...');
                if (typeof Dashboard !== 'undefined' && Dashboard.loadCharts) {
                    Dashboard.loadCharts();
                } else {
                    console.log('⚠️ Dashboard.loadCharts não encontrado');
                }
            },
            
            refresh: () => {
                console.log('🔄 Atualizando dashboard...');
                ChartManager.destroyAll();
                setTimeout(() => {
                    window.SimpleDashboard.loadCharts();
                }, 100);
            }
        };
        console.log('📊 SimpleDashboard inicializado');
    },
    
    initSimpleNavigation() {
        // Navegação unificada
        window.SimpleNavigation = {
            showSection: (sectionId) => {
                console.log(`🧭 Navegando para: ${sectionId}`);
                if (typeof showSection === 'function') {
                    showSection(sectionId);
                } else if (typeof UI !== 'undefined' && UI.showSection) {
                    UI.showSection(sectionId);
                } else {
                    console.error('❌ Função de navegação não encontrada');
                }
            }
        };
        console.log('🧭 SimpleNavigation inicializado');
    },
    
    initSimpleModal() {
        // Sistema de modais
        window.SimpleModal = {
            show: (modalId) => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'block';
                    console.log(`📋 Modal ${modalId} aberto`);
                } else {
                    console.error(`❌ Modal ${modalId} não encontrado`);
                }
            },
            
            hide: (modalId) => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'none';
                    console.log(`📋 Modal ${modalId} fechado`);
                } else {
                    console.error(`❌ Modal ${modalId} não encontrado`);
                }
            }
        };
        console.log('📋 SimpleModal inicializado');
    }
};

// ==================== AUTO INIT ====================
// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SystemInit.init();
    });
} else {
    SystemInit.init();
}

// ==================== GLOBAL EXPORTS ====================
window.SystemFix = {
    ChartManager,
    SystemInit,
    version: '1.3.5'
};

console.log('✅ System-Fix v1.3.5 pronto para uso');
