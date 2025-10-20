// ==================== MÓDULO DE EMPRESAS ====================
// Gerencia funcionalidades relacionadas às empresas

const Empresas = {
    // Estado atual
    currentPage: 1,
    currentFilters: {},
    editingEmpresaId: null,

    // ==================== INICIALIZAÇÃO ====================
    
    /**
     * Inicializa o módulo de empresas
     */
    init() {
        console.log('🏢 Inicializando módulo de empresas...');
        this.setupEventListeners();
        console.log('✅ Módulo de empresas inicializado');
    },

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botões de filtros
        const btnBuscar = document.getElementById('btn-buscar-filtros');
        const btnLimpar = document.getElementById('btn-limpar-filtros');
        
        if (btnBuscar) {
            btnBuscar.addEventListener('click', () => this.buscar());
        }
        
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => this.limparFiltros());
        }

        // Formulário de cadastro
        const formCadastro = document.getElementById('form-cadastro-empresa');
        if (formCadastro) {
            formCadastro.addEventListener('submit', (e) => {
                e.preventDefault();
                this.cadastrar();
            });
        }
    },

    // ==================== CARREGAMENTO ====================
    
    /**
     * Carrega lista de empresas
     * @param {number} page - Página a carregar
     * @param {boolean} forceLoad - Forçar carregamento
     */
    async load(page = 1, forceLoad = false) {
        try {
            // Verificar se a função global existe
            if (typeof window.loadEmpresas === 'function') {
                await window.loadEmpresas(page, forceLoad);
            } else {
                console.warn('⚠️ Função loadEmpresas não encontrada, carregando dados básicos');
                await this.loadBasic();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar empresas:', error);
            this.showError('Erro ao carregar lista de empresas');
        }
    },

    /**
     * Carregamento básico de empresas (fallback)
     */
    async loadBasic() {
        const container = document.getElementById('lista-empresas');
        if (!container) return;

        container.innerHTML = `
            <div class="p-8 text-center text-gray-500">
                <i class="fas fa-building text-4xl mb-4"></i>
                <p>Nenhuma empresa encontrada.</p>
                <p class="text-sm">Cadastre uma nova empresa para começar.</p>
            </div>
        `;

        // Atualizar contador
        const resultCount = document.getElementById('resultado-count');
        if (resultCount) {
            resultCount.textContent = '0 empresas encontradas';
        }
    },

    // ==================== BUSCA E FILTROS ====================
    
    /**
     * Busca empresas com filtros
     */
    buscar() {
        try {
            if (typeof window.buscarEmpresas === 'function') {
                window.buscarEmpresas();
            } else {
                console.warn('⚠️ Função buscarEmpresas não encontrada');
                this.load(1, true);
            }
        } catch (error) {
            console.error('❌ Erro ao buscar empresas:', error);
            this.showError('Erro ao buscar empresas');
        }
    },

    /**
     * Limpa filtros de busca
     */
    limparFiltros() {
        try {
            // Limpar campos de filtro
            const filtros = [
                'filtro-razao-social',
                'filtro-cnpj',
                'filtro-cidade',
                'filtro-estado',
                'filtro-modalidade',
                'filtro-status'
            ];

            filtros.forEach(filtroId => {
                const elemento = document.getElementById(filtroId);
                if (elemento) {
                    elemento.value = '';
                }
            });

            // Recarregar lista
            this.load(1, true);
        } catch (error) {
            console.error('❌ Erro ao limpar filtros:', error);
        }
    },

    // ==================== CADASTRO E EDIÇÃO ====================
    
    /**
     * Reseta formulário de cadastro
     */
    resetForm() {
        try {
            const form = document.getElementById('form-cadastro-empresa');
            if (form) {
                form.reset();
                this.editingEmpresaId = null;
                window.editingEmpresaId = null;

                // Limpar erros de validação
                const errors = form.querySelectorAll('.text-red-500');
                errors.forEach(error => error.classList.add('hidden'));

                // Atualizar título
                const titulo = document.getElementById('titulo-cadastro');
                if (titulo) {
                    titulo.textContent = 'Cadastrar Nova Empresa';
                }

                // Atualizar botão
                const btnSalvar = document.getElementById('btn-salvar-empresa');
                if (btnSalvar) {
                    btnSalvar.textContent = 'Cadastrar Empresa';
                }
            }
        } catch (error) {
            console.error('❌ Erro ao resetar formulário:', error);
        }
    },

    /**
     * Cadastra ou atualiza empresa
     */
    async cadastrar() {
        try {
            if (typeof window.cadastrarEmpresa === 'function') {
                await window.cadastrarEmpresa();
            } else {
                console.warn('⚠️ Função cadastrarEmpresa não encontrada');
                this.showError('Funcionalidade de cadastro não disponível');
            }
        } catch (error) {
            console.error('❌ Erro ao cadastrar empresa:', error);
            this.showError('Erro ao cadastrar empresa');
        }
    },

    /**
     * Edita empresa existente
     * @param {number} empresaId - ID da empresa
     */
    async editar(empresaId) {
        try {
            if (typeof window.editarEmpresa === 'function') {
                await window.editarEmpresa(empresaId);
            } else {
                console.warn('⚠️ Função editarEmpresa não encontrada');
                this.showError('Funcionalidade de edição não disponível');
            }
        } catch (error) {
            console.error('❌ Erro ao editar empresa:', error);
            this.showError('Erro ao carregar dados da empresa');
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
    }
};

// Exportar para uso global
window.Empresas = Empresas;
