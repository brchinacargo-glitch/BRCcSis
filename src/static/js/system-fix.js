// ==================== CORREÇÃO COMPLETA DO SISTEMA ====================
// Sistema unificado para corrigir todos os problemas identificados

console.log('🔧 Iniciando correção completa do sistema...');

// 1. CORREÇÃO DE CHART.JS - Gerenciador único de gráficos
window.ChartManager = {
    instances: new Map(),
    
    create(id, config) {
        // Destruir instância anterior se existir
        this.destroy(id);
        
        const canvas = document.getElementById(id);
        if (!canvas) {
            console.warn(`Canvas ${id} não encontrado`);
            return null;
        }
        
        try {
            const chart = new Chart(canvas, config);
            this.instances.set(id, chart);
            console.log(`✅ Gráfico ${id} criado`);
            return chart;
        } catch (error) {
            console.error(`Erro ao criar gráfico ${id}:`, error);
            return null;
        }
    },
    
    destroy(id) {
        const chart = this.instances.get(id);
        if (chart) {
            try {
                chart.destroy();
                this.instances.delete(id);
                console.log(`🧹 Gráfico ${id} destruído`);
            } catch (error) {
                console.warn(`Erro ao destruir gráfico ${id}:`, error);
            }
        }
    },
    
    destroyAll() {
        for (const [id] of this.instances) {
            this.destroy(id);
        }
        console.log('🧹 Todos os gráficos destruídos');
    }
};

// 2. SISTEMA DE INICIALIZAÇÃO SIMPLIFICADO
window.SystemInit = {
    initialized: false,
    modules: [],
    
    register(name, initFunction) {
        this.modules.push({ name, init: initFunction });
    },
    
    async start() {
        if (this.initialized) {
            console.warn('Sistema já inicializado');
            return;
        }
        
        console.log('🚀 Iniciando sistema BRCcSis...');
        
        // Inicializar módulos essenciais primeiro
        const essentialModules = ['API', 'Utils', 'Dashboard'];
        const otherModules = [];
        
        this.modules.forEach(module => {
            if (essentialModules.includes(module.name)) {
                try {
                    module.init();
                    console.log(`✅ ${module.name} inicializado`);
                } catch (error) {
                    console.error(`❌ Erro ao inicializar ${module.name}:`, error);
                }
            } else {
                otherModules.push(module);
            }
        });
        
        // Aguardar um pouco e inicializar outros módulos
        setTimeout(() => {
            otherModules.forEach(module => {
                try {
                    module.init();
                    console.log(`✅ ${module.name} inicializado`);
                } catch (error) {
                    console.error(`❌ Erro ao inicializar ${module.name}:`, error);
                }
            });
        }, 100);
        
        this.initialized = true;
        console.log('✅ Sistema BRCcSis inicializado com sucesso');
    }
};

// 3. DASHBOARD SIMPLIFICADO
window.SimpleDashboard = {
    charts: {},
    
    init() {
        console.log('📊 Inicializando dashboard simplificado...');
        this.loadData();
    },
    
    async loadData() {
        try {
            // Limpar gráficos anteriores
            ChartManager.destroyAll();
            
            // Carregar dados básicos
            const data = await this.getBasicData();
            
            // Renderizar gráficos
            this.renderCharts(data);
            
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    },
    
    async getBasicData() {
        // Dados básicos para demonstração
        return {
            stats: {
                total_cotacoes: 15,
                cotacoes_pendentes: 8,
                cotacoes_finalizadas: 7,
                valor_total: 45000
            },
            chartData: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
                data: [10, 15, 12, 18, 20]
            }
        };
    },
    
    renderCharts(data) {
        // Atualizar estatísticas
        this.updateStats(data.stats);
        
        // Criar gráfico simples
        this.createSimpleChart(data.chartData);
    },
    
    updateStats(stats) {
        const elements = {
            'total-cotacoes': stats.total_cotacoes,
            'cotacoes-pendentes': stats.cotacoes_pendentes,
            'cotacoes-finalizadas': stats.cotacoes_finalizadas,
            'valor-total': `R$ ${stats.valor_total.toLocaleString()}`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    },
    
    createSimpleChart(data) {
        const config = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Cotações por Mês',
                    data: data.data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
        };
        
        ChartManager.create('chart-cotacoes-mes', config);
    }
};

// 4. SISTEMA DE NAVEGAÇÃO SIMPLIFICADO
window.SimpleNavigation = {
    currentSection: 'dashboard',
    
    init() {
        console.log('🧭 Inicializando navegação...');
        this.setupListeners();
        this.showSection('dashboard');
    },
    
    setupListeners() {
        // Event delegation para navegação
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('[data-nav]');
            if (navItem) {
                e.preventDefault();
                const section = navItem.dataset.nav;
                this.showSection(section);
            }
        });
    },
    
    showSection(sectionName) {
        if (this.currentSection === sectionName) return;
        
        // Ocultar todas as seções
        const sections = ['dashboard', 'empresas', 'cotacoes', 'cadastro', 'secao-analytics-v133'];
        sections.forEach(name => {
            const section = document.getElementById(name);
            if (section) {
                section.style.display = 'none';
            }
        });
        
        // Mostrar seção solicitada
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionName;
            
            // Carregar dados específicos da seção
            this.loadSectionData(sectionName);
            
            console.log(`📄 Seção ${sectionName} ativada`);
        } else {
            console.warn(`Seção ${sectionName} não encontrada`);
        }
        
        // Atualizar navegação visual
        this.updateNavigation(sectionName);
    },
    
    updateNavigation(activeSection) {
        document.querySelectorAll('[data-nav]').forEach(item => {
            const section = item.dataset.nav;
            if (section === activeSection) {
                item.classList.add('bg-blue-600', 'text-white');
                item.classList.remove('text-gray-600', 'hover:text-blue-600');
            } else {
                item.classList.remove('bg-blue-600', 'text-white');
                item.classList.add('text-gray-600', 'hover:text-blue-600');
            }
        });
    },
    
    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                if (window.SimpleDashboard) {
                    SimpleDashboard.loadData();
                }
                break;
            case 'secao-analytics-v133':
                if (window.SimpleDashboard) {
                    SimpleDashboard.loadData();
                }
                break;
            // Adicionar outros casos conforme necessário
        }
    }
};

// 5. SISTEMA DE MODAL SIMPLIFICADO
window.SimpleModal = {
    currentModal: null,
    
    init() {
        console.log('📋 Inicializando sistema de modais...');
        this.setupListeners();
    },
    
    setupListeners() {
        // Event delegation para abrir modais
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal]');
            if (trigger) {
                e.preventDefault();
                const modalId = trigger.dataset.modal;
                this.open(modalId);
            }
            
            // Fechar modal ao clicar no backdrop
            if (e.target.classList.contains('modal-backdrop')) {
                this.close();
            }
            
            // Fechar modal ao clicar no botão fechar
            if (e.target.closest('[data-modal-close]')) {
                this.close();
            }
        });
        
        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close();
            }
        });
    },
    
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal ${modalId} não encontrado`);
            return;
        }
        
        // Fechar modal anterior se houver
        this.close();
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.currentModal = modal;
        
        console.log(`📋 Modal ${modalId} aberto`);
    },
    
    close() {
        if (this.currentModal) {
            this.currentModal.style.display = 'none';
            document.body.style.overflow = '';
            console.log('📋 Modal fechado');
            this.currentModal = null;
        }
    }
};

// 6. INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM carregado, iniciando correções...');
    
    // Registrar módulos essenciais
    SystemInit.register('ChartManager', () => {
        // ChartManager já está disponível globalmente
    });
    
    SystemInit.register('SimpleDashboard', () => {
        SimpleDashboard.init();
    });
    
    SystemInit.register('SimpleNavigation', () => {
        SimpleNavigation.init();
    });
    
    SystemInit.register('SimpleModal', () => {
        SimpleModal.init();
    });
    
    // Iniciar sistema
    SystemInit.start();
});

// 7. LIMPEZA DE CONFLITOS
window.addEventListener('load', () => {
    // Remover event listeners duplicados
    const duplicateEvents = ['click', 'change', 'submit'];
    duplicateEvents.forEach(eventType => {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            // Clonar elemento para remover todos os listeners
            if (element.hasAttribute('data-cleanup')) {
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
            }
        });
    });
    
    console.log('🧹 Limpeza de conflitos concluída');
});

console.log('✅ Sistema de correção carregado com sucesso!');
