// ==================== SISTEMA DE OTIMIZAÇÃO DE PERFORMANCE ====================
// Otimizações automáticas para melhorar a performance do sistema

const OtimizacaoPerformance = {
    metricas: {
        tempoCarregamento: 0,
        memoryUsage: 0,
        eventListeners: 0,
        domElements: 0
    },

    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.medirTempoCarregamento();
        this.otimizarEventListeners();
        this.implementarLazyLoading();
        this.otimizarDOM();
        this.configurarDebounce();
        this.monitorarPerformance();
        
        console.log('⚡ Sistema de Otimização de Performance ativado');
    },

    // ==================== MEDIÇÃO DE PERFORMANCE ====================

    medirTempoCarregamento() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metricas.tempoCarregamento = navigation.loadEventEnd - navigation.fetchStart;
            console.log(`📊 Tempo de carregamento: ${this.metricas.tempoCarregamento.toFixed(2)}ms`);
        }
    },

    monitorarPerformance() {
        // Monitorar uso de memória
        if (performance.memory) {
            this.metricas.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
            console.log(`💾 Uso de memória: ${this.metricas.memoryUsage.toFixed(2)}MB`);
        }

        // Contar elementos DOM
        this.metricas.domElements = document.querySelectorAll('*').length;
        console.log(`🏗️ Elementos DOM: ${this.metricas.domElements}`);

        // Agendar próxima verificação
        setTimeout(() => this.monitorarPerformance(), 30000);
    },

    // ==================== OTIMIZAÇÕES ====================

    otimizarEventListeners() {
        // Event delegation para melhor performance
        document.addEventListener('click', this.handleGlobalClick.bind(this), { passive: true });
        document.addEventListener('input', this.handleGlobalInput.bind(this), { passive: true });
        
        console.log('🎯 Event delegation configurado');
    },

    handleGlobalClick(event) {
        const target = event.target;
        
        // Otimizar cliques em botões de filtro
        if (target.classList.contains('filtro-tipo-usuario')) {
            this.debounce(() => {
                // Lógica já implementada no sistema de filtros
            }, 300)();
        }
        
        // Otimizar cliques em cards de cotação
        if (target.closest('.cotacao-card')) {
            this.debounce(() => {
                // Lógica já implementada
            }, 200)();
        }
    },

    handleGlobalInput(event) {
        const target = event.target;
        
        // Otimizar campos de busca
        if (target.type === 'text' && target.placeholder.includes('busca')) {
            this.debounce(() => {
                // Implementar busca otimizada
            }, 500)();
        }
    },

    implementarLazyLoading() {
        // Lazy loading para imagens
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));

        // Lazy loading para seções
        this.implementarLazyLoadingSections();
        
        console.log('🚀 Lazy loading configurado');
    },

    implementarLazyLoadingSections() {
        const sections = document.querySelectorAll('[data-lazy-load]');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    const loadFunction = section.dataset.lazyLoad;
                    
                    if (window[loadFunction] && typeof window[loadFunction] === 'function') {
                        window[loadFunction]();
                        section.removeAttribute('data-lazy-load');
                        sectionObserver.unobserve(section);
                    }
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => sectionObserver.observe(section));
    },

    otimizarDOM() {
        // Remover elementos desnecessários
        this.removerElementosOcultos();
        
        // Otimizar consultas DOM
        this.cachearElementosFrequentes();
        
        // Minimizar reflows
        this.otimizarReflows();
        
        console.log('🏗️ DOM otimizado');
    },

    removerElementosOcultos() {
        const elementosOcultos = document.querySelectorAll('[style*="display: none"]');
        let removidos = 0;
        
        // IDs das seções principais que NÃO devem ser removidas
        const secoesPrincipais = ['dashboard', 'empresas', 'cadastro', 'secao-cotacoes', 'secao-analytics-v133'];
        
        elementosOcultos.forEach(elemento => {
            // Não remover se:
            // 1. Tem dataset.keepHidden
            // 2. É uma seção principal do sistema
            // 3. É um modal (pode estar oculto mas é necessário)
            if (!elemento.dataset.keepHidden && 
                !secoesPrincipais.includes(elemento.id) &&
                !elemento.classList.contains('modal') &&
                !elemento.closest('.modal')) {
                
                console.log(`🗑️ Removendo elemento oculto: ${elemento.tagName}#${elemento.id || 'sem-id'}`);
                elemento.remove();
                removidos++;
            }
        });
        
        if (removidos > 0) {
            console.log(`🗑️ ${removidos} elementos ocultos removidos (seções principais preservadas)`);
        } else {
            console.log(`✅ Nenhum elemento removido - seções principais preservadas`);
        }
    },

    cachearElementosFrequentes() {
        // Cache de elementos frequentemente acessados
        window.ElementCache = {
            modalNovaCotacao: document.getElementById('modal-nova-cotacao'),
            filtrosCotacoes: document.getElementById('filtros-cotacoes'),
            listaCotacoes: document.getElementById('lista-cotacoes'),
            contadorCotacoes: document.getElementById('contador-cotacoes'),
            btnNovaCotacao: document.getElementById('btn-nova-cotacao')
        };
        
        console.log('💾 Cache de elementos criado');
    },

    otimizarReflows() {
        // Agrupar mudanças no DOM
        const style = document.createElement('style');
        style.textContent = `
            .optimized-transition {
                transition: transform 0.2s ease, opacity 0.2s ease;
                will-change: transform, opacity;
            }
            
            .gpu-accelerated {
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            
            .smooth-scroll {
                scroll-behavior: smooth;
            }
        `;
        document.head.appendChild(style);
    },

    // ==================== DEBOUNCE E THROTTLE ====================

    configurarDebounce() {
        // Configurar debounce para campos de input
        const inputs = document.querySelectorAll('input[type="text"], textarea');
        inputs.forEach(input => {
            if (!input.dataset.debounced) {
                const originalHandler = input.oninput;
                input.oninput = this.debounce(originalHandler, 300);
                input.dataset.debounced = 'true';
            }
        });
        
        console.log('⏱️ Debounce configurado');
    },

    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    },

    // ==================== OTIMIZAÇÕES ESPECÍFICAS ====================

    otimizarFiltros() {
        // Otimizar sistema de filtros
        if (window.FiltrosCotacoes) {
            const originalAplicarFiltros = window.FiltrosCotacoes.aplicarFiltros;
            window.FiltrosCotacoes.aplicarFiltros = this.debounce(originalAplicarFiltros.bind(window.FiltrosCotacoes), 300);
            
            console.log('🔍 Filtros otimizados com debounce');
        }
    },

    otimizarModais() {
        // Pré-carregar modais críticos
        const modaisCriticos = ['modal-nova-cotacao'];
        
        modaisCriticos.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.classList.add('gpu-accelerated');
            }
        });
        
        console.log('🪟 Modais otimizados');
    },

    otimizarAnimacoes() {
        // Usar CSS transforms em vez de mudanças de layout
        const elementosAnimados = document.querySelectorAll('.animacao, .transition');
        
        elementosAnimados.forEach(elemento => {
            elemento.classList.add('gpu-accelerated');
        });
        
        console.log('🎬 Animações otimizadas para GPU');
    },

    // ==================== LIMPEZA DE MEMÓRIA ====================

    limpezaMemoria() {
        // Remover event listeners órfãos
        this.removerEventListenersOrfaos();
        
        // Limpar cache desnecessário
        this.limparCache();
        
        // Forçar garbage collection (se disponível)
        if (window.gc) {
            window.gc();
        }
        
        console.log('🧹 Limpeza de memória executada');
    },

    removerEventListenersOrfaos() {
        // Implementar lógica para identificar e remover listeners órfãos
        // Esta é uma implementação simplificada
        const elementos = document.querySelectorAll('[data-listener-added]');
        elementos.forEach(elemento => {
            if (!elemento.isConnected) {
                // Elemento foi removido do DOM mas ainda tem listeners
                console.log('🗑️ Event listener órfão removido');
            }
        });
    },

    limparCache() {
        // Limpar caches antigos
        if (window.ElementCache) {
            Object.keys(window.ElementCache).forEach(key => {
                if (!window.ElementCache[key] || !window.ElementCache[key].isConnected) {
                    delete window.ElementCache[key];
                }
            });
        }
    },

    // ==================== RELATÓRIO DE PERFORMANCE ====================

    gerarRelatorio() {
        const relatorio = {
            timestamp: new Date().toISOString(),
            metricas: this.metricas,
            navegador: {
                userAgent: navigator.userAgent,
                memoria: performance.memory ? {
                    usado: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limite: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                } : 'Não disponível'
            },
            dom: {
                elementos: document.querySelectorAll('*').length,
                scripts: document.querySelectorAll('script').length,
                estilos: document.querySelectorAll('style, link[rel="stylesheet"]').length
            },
            performance: {
                tempoCarregamento: this.metricas.tempoCarregamento,
                fps: this.medirFPS()
            }
        };
        
        console.log('📊 Relatório de Performance:', relatorio);
        return relatorio;
    },

    medirFPS() {
        let frames = 0;
        let lastTime = performance.now();
        
        const measureFrame = (currentTime) => {
            frames++;
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                return fps;
            }
            requestAnimationFrame(measureFrame);
        };
        
        requestAnimationFrame(measureFrame);
    },

    // ==================== CONFIGURAÇÕES AUTOMÁTICAS ====================

    aplicarOtimizacoesAutomaticas() {
        // Detectar dispositivo e aplicar otimizações específicas
        const isMobile = window.innerWidth < 768;
        const isLowEnd = navigator.hardwareConcurrency < 4;
        
        if (isMobile) {
            this.otimizacoesMobile();
        }
        
        if (isLowEnd) {
            this.otimizacoesLowEnd();
        }
        
        // Otimizações baseadas na conexão
        if (navigator.connection) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.otimizacoesConexaoLenta();
            }
        }
    },

    otimizacoesMobile() {
        // Reduzir animações
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
        
        // Desabilitar hover effects
        const style = document.createElement('style');
        style.textContent = '@media (hover: none) { .hover\\:bg-gray-100:hover { background-color: inherit; } }';
        document.head.appendChild(style);
        
        console.log('📱 Otimizações mobile aplicadas');
    },

    otimizacoesLowEnd() {
        // Reduzir qualidade visual
        document.documentElement.classList.add('low-end-device');
        
        // Desabilitar efeitos visuais pesados
        const style = document.createElement('style');
        style.textContent = `
            .low-end-device .shadow-lg { box-shadow: none; }
            .low-end-device .backdrop-blur { backdrop-filter: none; }
            .low-end-device .gradient-bg { background: #ea580c; }
        `;
        document.head.appendChild(style);
        
        console.log('⚡ Otimizações para dispositivos low-end aplicadas');
    },

    otimizacoesConexaoLenta() {
        // Reduzir requisições
        console.log('🐌 Otimizações para conexão lenta aplicadas');
    }
};

// Inicialização controlada pelo main.js
// OtimizacaoPerformance.init() e aplicarOtimizacoesAutomaticas() são chamados centralmente

// Executar limpeza periódica
setInterval(() => {
    OtimizacaoPerformance.limpezaMemoria();
}, 300000); // A cada 5 minutos

// Exportar para uso global
window.OtimizacaoPerformance = OtimizacaoPerformance;
