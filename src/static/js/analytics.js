// ==================== MÓDULO DE ANALYTICS ====================
// Gerencia funcionalidades de analytics e relatórios

const Analytics = {
    // Estado atual
    isLoading: false,
    currentData: null,

    // ==================== INICIALIZAÇÃO ====================
    
    /**
     * Inicializa o módulo de analytics
     */
    init() {
        console.log('📊 Inicializando módulo de analytics...');
        this.setupEventListeners();
        console.log('✅ Módulo de analytics inicializado');
    },

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botões de aba
        const abas = document.querySelectorAll('[data-tab]');
        abas.forEach(aba => {
            aba.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = aba.getAttribute('data-tab');
                this.showTab(tabId);
            });
        });

        // Botões de exportação
        const btnExportPdf = document.getElementById('btn-export-pdf');
        const btnExportExcel = document.getElementById('btn-export-excel');
        
        if (btnExportPdf) {
            btnExportPdf.addEventListener('click', () => this.exportToPdf());
        }
        
        if (btnExportExcel) {
            btnExportExcel.addEventListener('click', () => this.exportToExcel());
        }
    },

    // ==================== CARREGAMENTO ====================
    
    /**
     * Carrega dados de analytics
     */
    async load() {
        try {
            if (this.isLoading) {
                console.log('⏳ Analytics já está carregando...');
                return;
            }

            this.isLoading = true;

            // Verificar se a função global existe
            if (typeof window.carregarConteudoAnalytics === 'function') {
                await window.carregarConteudoAnalytics();
            } else if (typeof window.carregarDadosAnalytics === 'function') {
                await window.carregarDadosAnalytics();
            } else {
                console.warn('⚠️ Funções de analytics não encontradas, carregando dados básicos');
                await this.loadBasic();
            }

            this.isLoading = false;
        } catch (error) {
            console.error('❌ Erro ao carregar analytics:', error);
            this.showError('Erro ao carregar dados de analytics');
            this.isLoading = false;
        }
    },

    /**
     * Carregamento básico de analytics (fallback)
     */
    async loadBasic() {
        const container = document.getElementById('conteudo-analytics');
        if (!container) return;

        container.innerHTML = `
            <div class="p-8 text-center text-gray-500">
                <i class="fas fa-chart-bar text-4xl mb-4"></i>
                <p>Dados de analytics não disponíveis.</p>
                <p class="text-sm">Verifique a conexão com a API.</p>
            </div>
        `;
    },

    // ==================== NAVEGAÇÃO DE ABAS ====================
    
    /**
     * Mostra aba específica
     * @param {string} tabId - ID da aba
     */
    showTab(tabId) {
        try {
            // Remover classe ativa de todas as abas
            const abas = document.querySelectorAll('[data-tab]');
            abas.forEach(aba => {
                aba.classList.remove('border-green-500', 'text-green-600');
                aba.classList.add('border-transparent', 'text-gray-500');
            });

            // Ativar aba selecionada
            const abaAtiva = document.querySelector(`[data-tab="${tabId}"]`);
            if (abaAtiva) {
                abaAtiva.classList.remove('border-transparent', 'text-gray-500');
                abaAtiva.classList.add('border-green-500', 'text-green-600');
            }

            // Ocultar todos os conteúdos
            const conteudos = document.querySelectorAll('[data-tab-content]');
            conteudos.forEach(conteudo => {
                conteudo.style.display = 'none';
            });

            // Mostrar conteúdo da aba selecionada
            const conteudoAtivo = document.querySelector(`[data-tab-content="${tabId}"]`);
            if (conteudoAtivo) {
                conteudoAtivo.style.display = 'block';
            }

            // Carregar dados específicos da aba se necessário
            this.loadTabData(tabId);
        } catch (error) {
            console.error('❌ Erro ao mostrar aba:', error);
        }
    },

    /**
     * Carrega dados específicos da aba
     * @param {string} tabId - ID da aba
     */
    async loadTabData(tabId) {
        try {
            switch (tabId) {
                case 'empresas':
                    if (typeof window.carregarAnalyticsEmpresas === 'function') {
                        await window.carregarAnalyticsEmpresas();
                    }
                    break;
                case 'cotacoes':
                    if (typeof window.carregarAnalyticsCotacoes === 'function') {
                        await window.carregarAnalyticsCotacoes();
                    }
                    break;
                case 'financeiro':
                    if (typeof window.carregarAnalyticsFinanceiro === 'function') {
                        await window.carregarAnalyticsFinanceiro();
                    }
                    break;
                default:
                    console.log(`Aba ${tabId} não requer carregamento específico`);
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar dados da aba ${tabId}:`, error);
        }
    },

    // ==================== EXPORTAÇÃO ====================
    
    /**
     * Exporta dados para PDF
     */
    async exportToPdf() {
        try {
            if (typeof window.exportarRelatorioPDF === 'function') {
                await window.exportarRelatorioPDF();
                this.showSuccess('Relatório PDF gerado com sucesso!');
            } else {
                console.warn('⚠️ Função de exportação PDF não encontrada');
                this.showError('Funcionalidade de exportação PDF não disponível');
            }
        } catch (error) {
            console.error('❌ Erro ao exportar PDF:', error);
            this.showError('Erro ao gerar relatório PDF');
        }
    },

    /**
     * Exporta dados para Excel
     */
    async exportToExcel() {
        try {
            if (typeof window.exportarRelatorioExcel === 'function') {
                await window.exportarRelatorioExcel();
                this.showSuccess('Relatório Excel gerado com sucesso!');
            } else {
                console.warn('⚠️ Função de exportação Excel não encontrada');
                this.showError('Funcionalidade de exportação Excel não disponível');
            }
        } catch (error) {
            console.error('❌ Erro ao exportar Excel:', error);
            this.showError('Erro ao gerar relatório Excel');
        }
    },

    // ==================== GRÁFICOS ====================
    
    /**
     * Renderiza gráficos
     */
    async renderCharts() {
        try {
            if (typeof window.renderizarGraficos === 'function') {
                await window.renderizarGraficos();
            } else {
                console.warn('⚠️ Função de renderização de gráficos não encontrada');
            }
        } catch (error) {
            console.error('❌ Erro ao renderizar gráficos:', error);
        }
    },

    /**
     * Destroi gráficos existentes
     */
    destroyCharts() {
        try {
            if (typeof window.destruirGraficosAnteriores === 'function') {
                window.destruirGraficosAnteriores();
            }
        } catch (error) {
            console.error('❌ Erro ao destruir gráficos:', error);
        }
    },

    // ==================== UTILITÁRIOS ====================
    
    /**
     * Mostra mensagem de erro
     * @param {string} message - Mensagem de erro
     */
    showError(message) {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification(message, 'error');
        } else {
            console.error(message);
            alert(message);
        }
    },

    /**
     * Mostra mensagem de sucesso
     * @param {string} message - Mensagem de sucesso
     */
    showSuccess(message) {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification(message, 'success');
        } else {
            console.log(message);
        }
    },

    /**
     * Limpa conteúdo de analytics
     */
    clear() {
        const container = document.getElementById('conteudo-analytics');
        if (container) {
            container.innerHTML = '';
        }
        
        this.destroyCharts();
        this.currentData = null;
    }
};

// Exportar para uso global
window.Analytics = Analytics;
