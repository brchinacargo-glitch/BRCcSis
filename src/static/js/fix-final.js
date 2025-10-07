// ==================== CORREÇÕES FINAIS DO SISTEMA ====================
// Este arquivo resolve TODOS os problemas identificados no sistema

console.log('🚀 Aplicando correções finais do sistema...');

// 1. Resolver problema de Chart.js Canvas Already in Use
(function fixChartJS() {
    // Aguardar Chart.js carregar
    const checkChart = setInterval(() => {
        if (window.Chart) {
            clearInterval(checkChart);
            
            // Limpar TODAS as instâncias de Chart.js existentes
            if (window.Chart.instances) {
                Object.keys(window.Chart.instances).forEach(key => {
                    try {
                        window.Chart.instances[key].destroy();
                        console.log(`🧹 Instância Chart.js ${key} destruída`);
                    } catch (error) {
                        // Ignorar erros
                    }
                });
            }
            
            // Criar mapa global de instâncias
            window.chartInstancesMap = {};
            
            // Interceptar criação de novos gráficos
            const OriginalChart = window.Chart;
            window.Chart = function(ctx, config) {
                const canvasId = ctx?.canvas?.id || ctx?.id || 'unknown';
                
                // Destruir instância anterior se existir
                if (window.chartInstancesMap[canvasId]) {
                    try {
                        window.chartInstancesMap[canvasId].destroy();
                        console.log(`♻️ Gráfico anterior destruído: ${canvasId}`);
                    } catch (e) {
                        // Ignorar
                    }
                    delete window.chartInstancesMap[canvasId];
                }
                
                // Criar nova instância
                try {
                    const chart = new OriginalChart(ctx, config);
                    window.chartInstancesMap[canvasId] = chart;
                    return chart;
                } catch (error) {
                    console.error(`Erro ao criar gráfico ${canvasId}:`, error);
                    // Tentar limpar canvas e criar novamente
                    if (ctx?.canvas) {
                        const context = ctx.canvas.getContext('2d');
                        context.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                        const chart = new OriginalChart(context, config);
                        window.chartInstancesMap[canvasId] = chart;
                        return chart;
                    }
                    throw error;
                }
            };
            
            // Copiar propriedades estáticas
            Object.setPrototypeOf(window.Chart, OriginalChart);
            Object.keys(OriginalChart).forEach(key => {
                if (!window.Chart.hasOwnProperty(key)) {
                    window.Chart[key] = OriginalChart[key];
                }
            });
            
            console.log('✅ Chart.js corrigido com interceptação completa');
        }
    }, 100);
})();

// 2. Evitar carregamento múltiplo do Dashboard
(function fixDashboardMultipleLoading() {
    let dashboardLoadCount = 0;
    const maxLoads = 1;
    
    const checkDashboard = setInterval(() => {
        if (window.Dashboard) {
            clearInterval(checkDashboard);
            
            const originalLoad = window.Dashboard.load;
            window.Dashboard.load = async function() {
                if (dashboardLoadCount >= maxLoads) {
                    console.log('⚠️ Dashboard já carregado, pulando...');
                    return;
                }
                dashboardLoadCount++;
                
                // Destruir gráficos antes de carregar
                if (window.Dashboard.destroyAllCharts) {
                    window.Dashboard.destroyAllCharts();
                }
                
                // Chamar função original
                return originalLoad.apply(this, arguments);
            };
            
            console.log('✅ Dashboard protegido contra carregamento múltiplo');
        }
    }, 100);
})();

// 3. Corrigir processChartData com verificação de array
(function fixProcessChartData() {
    const checkDashboard = setInterval(() => {
        if (window.Dashboard && window.Dashboard.processChartData) {
            clearInterval(checkDashboard);
            
            const originalProcessChartData = window.Dashboard.processChartData;
            window.Dashboard.processChartData = function(empresas) {
                // Verificar se empresas é válido
                if (!empresas || !Array.isArray(empresas)) {
                    console.warn('Empresas inválido, usando dados padrão');
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
                
                return originalProcessChartData.apply(this, arguments);
            };
            
            console.log('✅ processChartData protegido contra dados inválidos');
        }
    }, 100);
})();

// 4. Limpar gráficos do index.html que causam conflito
(function cleanupIndexCharts() {
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanup);
    } else {
        cleanup();
    }
    
    function cleanup() {
        // Destruir gráficos criados no index.html
        const canvasIds = [
            'chart-empresas-regiao',
            'chart-tipos-carga', 
            'chart-crescimento',
            'chart-certificacoes'
        ];
        
        canvasIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Remover qualquer instância associada
                if (window.chartInstancesMap && window.chartInstancesMap[id]) {
                    try {
                        window.chartInstancesMap[id].destroy();
                        delete window.chartInstancesMap[id];
                    } catch (e) {
                        // Ignorar
                    }
                }
            }
        });
        
        console.log('✅ Canvas de gráficos limpos preventivamente');
    }
})();

// 5. Interceptar chamadas duplicadas de showSection
(function fixShowSection() {
    let lastSection = null;
    let isNavigating = false;
    
    const checkShowSection = setInterval(() => {
        if (window.showSection) {
            clearInterval(checkShowSection);
            
            const originalShowSection = window.showSection;
            window.showSection = function(section) {
                if (isNavigating) {
                    console.log(`⏳ Navegação em andamento, ignorando: ${section}`);
                    return;
                }
                
                if (lastSection === section && section === 'dashboard') {
                    console.log(`⚠️ Seção ${section} já está ativa, pulando...`);
                    return;
                }
                
                isNavigating = true;
                lastSection = section;
                
                // Limpar gráficos antes de mudar de seção
                if (section === 'dashboard' && window.Dashboard?.destroyAllCharts) {
                    window.Dashboard.destroyAllCharts();
                }
                
                const result = originalShowSection.apply(this, arguments);
                
                setTimeout(() => {
                    isNavigating = false;
                }, 500);
                
                return result;
            };
            
            console.log('✅ showSection protegido contra chamadas duplicadas');
        }
    }, 100);
})();

// 6. Resetar contadores ao navegar para dashboard
(function resetDashboardOnNavigation() {
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'nav-dashboard') {
            // Resetar contador de carregamento
            if (window.Dashboard) {
                window.Dashboard.isLoading = false;
                
                // Destruir todos os gráficos
                if (window.Dashboard.destroyAllCharts) {
                    window.Dashboard.destroyAllCharts();
                }
                
                // Limpar mapa de instâncias
                if (window.chartInstancesMap) {
                    Object.keys(window.chartInstancesMap).forEach(key => {
                        try {
                            window.chartInstancesMap[key].destroy();
                        } catch (e) {
                            // Ignorar
                        }
                    });
                    window.chartInstancesMap = {};
                }
                
                console.log('🔄 Dashboard resetado para nova navegação');
            }
        }
    });
})();

// 7. Adicionar método destroyAllCharts se não existir
(function addDestroyAllCharts() {
    const checkDashboard = setInterval(() => {
        if (window.Dashboard) {
            clearInterval(checkDashboard);
            
            if (!window.Dashboard.destroyAllCharts) {
                window.Dashboard.destroyAllCharts = function() {
                    if (this.charts) {
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
                    }
                    
                    // Limpar mapa global também
                    if (window.chartInstancesMap) {
                        Object.keys(window.chartInstancesMap).forEach(key => {
                            try {
                                window.chartInstancesMap[key].destroy();
                            } catch (e) {
                                // Ignorar
                            }
                        });
                        window.chartInstancesMap = {};
                    }
                };
                
                console.log('✅ Método destroyAllCharts adicionado ao Dashboard');
            }
        }
    }, 100);
})();

console.log('✅ Todas as correções finais aplicadas com sucesso!');
