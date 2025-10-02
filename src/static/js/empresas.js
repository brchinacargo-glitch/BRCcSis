// ==================== MÓDULO DE EMPRESAS ====================
// Gerencia listagem, busca, cadastro e edição de empresas

const Empresas = {
    // Estado da paginação
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
    totalResults: 0,
    
    // Filtros atuais
    currentFilters: {},
    
    // ID da empresa sendo editada
    editingId: null,
    
    // ==================== INICIALIZAÇÃO ====================
    
    /**
     * Inicializa o módulo
     */
    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    },
    
    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botões de busca e filtros
        document.getElementById('btn-buscar-filtros')?.addEventListener('click', () => {
            this.applyFilters();
        });
        
        document.getElementById('btn-limpar-filtros')?.addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Paginação
        document.getElementById('btn-prev')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.load();
            }
        });
        
        document.getElementById('btn-next')?.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.load();
            }
        });
        
        // Formulário de cadastro
        const form = document.getElementById('form-cadastro');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
        
        // Exportação e importação
        document.getElementById('btn-exportar-dados')?.addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('btn-importar-dados')?.addEventListener('click', () => {
            this.importData();
        });
        
        document.getElementById('btn-importar-excel')?.addEventListener('click', () => {
            this.importExcel();
        });
        
        document.getElementById('btn-template-excel')?.addEventListener('click', () => {
            this.downloadTemplate();
        });
    },
    
    /**
     * Configura validação de formulário
     */
    setupFormValidation() {
        const form = document.getElementById('form-cadastro');
        if (!form) return;
        
        // Validação em tempo real
        const razaoSocial = form.querySelector('[name="razao_social"]');
        const cnpj = form.querySelector('[name="cnpj"]');
        
        if (razaoSocial) {
            razaoSocial.addEventListener('blur', () => {
                if (!Utils.validateRequired(razaoSocial.value)) {
                    UI.showFieldError('razao_social', 'A Razão Social é obrigatória');
                } else {
                    UI.hideFieldError('razao_social');
                }
            });
        }
        
        if (cnpj) {
            cnpj.addEventListener('blur', () => {
                if (!Utils.validateRequired(cnpj.value)) {
                    UI.showFieldError('cnpj', 'O CNPJ é obrigatório');
                } else if (!Utils.validateCNPJ(cnpj.value)) {
                    UI.showFieldError('cnpj', 'CNPJ inválido');
                } else {
                    UI.hideFieldError('cnpj');
                }
            });
        }
    },
    
    // ==================== CARREGAMENTO E BUSCA ====================
    
    /**
     * Carrega lista de empresas
     */
    async load() {
        try {
            const params = {
                page: this.currentPage,
                per_page: this.itemsPerPage,
                ...this.currentFilters
            };
            
            const response = await API.getEmpresas(params);
            
            if (response.success) {
                this.totalResults = response.total || response.data.length;
                this.totalPages = Math.ceil(this.totalResults / this.itemsPerPage);
                
                this.renderList(response.data);
                UI.updatePagination({
                    currentPage: this.currentPage,
                    totalPages: this.totalPages,
                    totalResults: this.totalResults,
                    itemsPerPage: this.itemsPerPage
                });
            } else {
                Utils.showError(response.message || 'Erro ao carregar empresas');
            }
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
            Utils.showError('Erro ao carregar lista de empresas');
        }
    },
    
    /**
     * Aplica filtros de busca
     */
    applyFilters() {
        const filters = {};
        
        // Coletar valores dos filtros
        const filterFields = [
            'filtro-razao-social', 'filtro-cnpj', 'filtro-cidade', 'filtro-estado',
            'filtro-modalidade', 'filtro-tipo-carga', 'filtro-abrangencia',
            'filtro-certificacao', 'filtro-porto', 'filtro-tipo-regulamentacao',
            'filtro-tipo-frota', 'filtro-tipo-veiculo', 'filtro-possui-seguro',
            'filtro-nome-tecnologia', 'filtro-segmento-cliente', 'filtro-certificacao-ambiental'
        ];
        
        filterFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element && element.value) {
                const filterName = fieldId.replace('filtro-', '').replace(/-/g, '_');
                filters[filterName] = element.value;
            }
        });
        
        this.currentFilters = filters;
        this.currentPage = 1;
        this.load();
    },
    
    /**
     * Limpa filtros de busca
     */
    clearFilters() {
        // Limpar campos de filtro
        document.querySelectorAll('#empresas input, #empresas select').forEach(element => {
            if (element.type === 'checkbox') {
                element.checked = false;
            } else {
                element.value = '';
            }
        });
        
        this.currentFilters = {};
        this.currentPage = 1;
        this.load();
    },
    
    // ==================== RENDERIZAÇÃO ====================
    
    /**
     * Renderiza lista de empresas
     * @param {Array} empresas - Lista de empresas
     */
    renderList(empresas) {
        const container = document.getElementById('lista-empresas');
        if (!container) return;
        
        Utils.clearContent(container);
        
        if (!empresas || empresas.length === 0) {
            const noResults = Utils.createElement('div', {
                className: 'p-6 text-center text-gray-500'
            }, 'Nenhuma empresa encontrada');
            container.appendChild(noResults);
            return;
        }
        
        empresas.forEach(empresa => {
            const empresaCard = this.createEmpresaCard(empresa);
            container.appendChild(empresaCard);
        });
        
        // Atualizar contador
        const resultCount = document.getElementById('resultado-count');
        if (resultCount) {
            Utils.setTextContent(resultCount, `${this.totalResults} empresa(s) encontrada(s)`);
        }
    },
    
    /**
     * Cria card de empresa
     * @param {object} empresa - Dados da empresa
     * @returns {HTMLElement}
     */
    createEmpresaCard(empresa) {
        const card = Utils.createElement('div', {
            className: 'p-6 hover:bg-gray-50 transition-colors'
        });
        
        // Header do card
        const header = Utils.createElement('div', {
            className: 'flex items-start justify-between mb-4'
        });
        
        const info = Utils.createElement('div');
        const title = Utils.createElement('h4', {
            className: 'text-lg font-semibold text-gray-900'
        });
        Utils.setTextContent(title, empresa.razao_social || 'Sem nome');
        
        const subtitle = Utils.createElement('p', {
            className: 'text-sm text-gray-600'
        });
        Utils.setTextContent(subtitle, `CNPJ: ${Utils.formatCNPJ(empresa.cnpj || '')}`);
        
        info.appendChild(title);
        info.appendChild(subtitle);
        
        // Botões de ação
        const actions = Utils.createElement('div', {
            className: 'flex space-x-2'
        });
        
        const btnView = Utils.createElement('button', {
            className: 'px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
        });
        btnView.innerHTML = '<i class="fas fa-eye"></i>';
        btnView.addEventListener('click', () => this.viewDetails(empresa.id));
        
        const btnEdit = Utils.createElement('button', {
            className: 'px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'
        });
        btnEdit.innerHTML = '<i class="fas fa-edit"></i>';
        btnEdit.addEventListener('click', () => this.edit(empresa.id));
        
        const btnDelete = Utils.createElement('button', {
            className: 'px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
        });
        btnDelete.innerHTML = '<i class="fas fa-trash"></i>';
        btnDelete.addEventListener('click', () => this.delete(empresa.id));
        
        actions.appendChild(btnView);
        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);
        
        header.appendChild(info);
        header.appendChild(actions);
        
        // Informações adicionais
        const details = Utils.createElement('div', {
            className: 'grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'
        });
        
        const addDetail = (label, value) => {
            const detail = Utils.createElement('div');
            const labelEl = Utils.createElement('span', {
                className: 'font-medium text-gray-700'
            });
            Utils.setTextContent(labelEl, label + ': ');
            const valueEl = Utils.createElement('span', {
                className: 'text-gray-600'
            });
            Utils.setTextContent(valueEl, value || 'N/A');
            detail.appendChild(labelEl);
            detail.appendChild(valueEl);
            details.appendChild(detail);
        };
        
        addDetail('Telefone', Utils.formatTelefone(empresa.telefone_comercial || ''));
        addDetail('Email', empresa.email || '');
        addDetail('Cidade', empresa.cidade || '');
        addDetail('Estado', empresa.estado || '');
        
        card.appendChild(header);
        card.appendChild(details);
        
        return card;
    },
    
    // ==================== AÇÕES ====================
    
    /**
     * Visualiza detalhes de uma empresa
     * @param {number} id - ID da empresa
     */
    async viewDetails(id) {
        try {
            const response = await API.getEmpresaById(id);
            
            if (response.success || response.id) {
                const empresa = response.data || response;
                this.showDetailsModal(empresa);
            } else {
                Utils.showError('Erro ao carregar detalhes da empresa');
            }
        } catch (error) {
            console.error('Erro ao visualizar empresa:', error);
            Utils.showError('Erro ao carregar detalhes da empresa');
        }
    },
    
    /**
     * Mostra modal com detalhes da empresa
     * @param {object} empresa - Dados da empresa
     */
    showDetailsModal(empresa) {
        // Implementação simplificada - pode ser expandida
        alert(`Detalhes da empresa:\n\nRazão Social: ${empresa.razao_social}\nCNPJ: ${empresa.cnpj}\nTelefone: ${empresa.telefone_comercial}\nEmail: ${empresa.email}`);
    },
    
    /**
     * Edita uma empresa
     * @param {number} id - ID da empresa
     */
    async edit(id) {
        try {
            const response = await API.getEmpresaById(id);
            
            if (response.success || response.id) {
                const empresa = response.data || response;
                this.editingId = id;
                this.fillForm(empresa);
                UI.showSection('cadastro');
                
                // Atualizar título e botão
                const titulo = document.querySelector('#cadastro h2');
                if (titulo) {
                    Utils.setTextContent(titulo, 'Editar Empresa');
                }
                
                const submitBtn = document.querySelector('#form-cadastro button[type="submit"]');
                if (submitBtn) {
                    Utils.setTextContent(submitBtn, 'Atualizar Empresa');
                }
            } else {
                Utils.showError('Erro ao carregar dados da empresa');
            }
        } catch (error) {
            console.error('Erro ao editar empresa:', error);
            Utils.showError('Erro ao carregar dados da empresa');
        }
    },
    
    /**
     * Preenche formulário com dados da empresa
     * @param {object} empresa - Dados da empresa
     */
    fillForm(empresa) {
        const form = document.getElementById('form-cadastro');
        if (!form) return;
        
        // Limpar formulário
        form.reset();
        
        // Preencher campos básicos
        const fields = [
            'razao_social', 'nome_fantasia', 'cnpj', 'inscricao_estadual',
            'endereco_completo', 'telefone_comercial', 'telefone_emergencial',
            'email', 'website', 'link_cotacao', 'data_fundacao', 'observacoes', 'etiqueta'
        ];
        
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && empresa[field]) {
                input.value = empresa[field];
            }
        });
        
        // Preencher checkboxes de modalidades
        if (empresa.modalidades_transporte && Array.isArray(empresa.modalidades_transporte)) {
            empresa.modalidades_transporte.forEach(modalidade => {
                const checkbox = form.querySelector(`[name="modalidades_transporte"][value="${modalidade.modalidade}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Preencher checkboxes de tipos de carga
        if (empresa.tipos_carga && Array.isArray(empresa.tipos_carga)) {
            empresa.tipos_carga.forEach(tipo => {
                const checkbox = form.querySelector(`[name="tipos_carga"][value="${tipo.tipo_carga}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Preencher campos dinâmicos (implementação simplificada)
        // A lógica completa de campos dinâmicos deve ser mantida do código original
    },
    
    /**
     * Deleta uma empresa
     * @param {number} id - ID da empresa
     */
    async delete(id) {
        if (!Utils.confirm('Tem certeza que deseja excluir esta empresa?')) {
            return;
        }
        
        try {
            const response = await API.deleteEmpresa(id);
            
            if (response.success) {
                Utils.showSuccess('Empresa excluída com sucesso');
                this.load();
            } else {
                Utils.showError(response.message || 'Erro ao excluir empresa');
            }
        } catch (error) {
            console.error('Erro ao excluir empresa:', error);
            Utils.showError('Erro ao excluir empresa');
        }
    },
    
    // ==================== FORMULÁRIO ====================
    
    /**
     * Processa envio do formulário
     */
    async handleSubmit() {
        const form = document.getElementById('form-cadastro');
        if (!form) return;
        
        // Validar formulário
        if (!this.validateForm(form)) {
            return;
        }
        
        try {
            const data = UI.getFormData(form);
            
            let response;
            if (this.editingId) {
                response = await API.updateEmpresa(this.editingId, data);
            } else {
                response = await API.createEmpresa(data);
            }
            
            if (response.success) {
                Utils.showSuccess(this.editingId ? 'Empresa atualizada com sucesso' : 'Empresa cadastrada com sucesso');
                this.resetForm();
                UI.showSection('empresas');
                this.load();
            } else {
                Utils.showError(response.message || 'Erro ao salvar empresa');
            }
        } catch (error) {
            console.error('Erro ao salvar empresa:', error);
            Utils.showError('Erro ao salvar empresa');
        }
    },
    
    /**
     * Valida formulário
     * @param {HTMLFormElement} form - Formulário
     * @returns {boolean}
     */
    validateForm(form) {
        let isValid = true;
        
        // Validar Razão Social
        const razaoSocial = form.querySelector('[name="razao_social"]');
        if (!Utils.validateRequired(razaoSocial.value)) {
            UI.showFieldError('razao_social', 'A Razão Social é obrigatória');
            isValid = false;
        }
        
        // Validar CNPJ
        const cnpj = form.querySelector('[name="cnpj"]');
        if (!Utils.validateRequired(cnpj.value)) {
            UI.showFieldError('cnpj', 'O CNPJ é obrigatório');
            isValid = false;
        } else if (!Utils.validateCNPJ(cnpj.value)) {
            UI.showFieldError('cnpj', 'CNPJ inválido');
            isValid = false;
        }
        
        return isValid;
    },
    
    /**
     * Reseta formulário
     */
    resetForm() {
        const form = document.getElementById('form-cadastro');
        if (form) {
            UI.clearForm(form);
        }
        
        this.editingId = null;
        
        // Restaurar título e botão
        const titulo = document.querySelector('#cadastro h2');
        if (titulo) {
            Utils.setTextContent(titulo, 'Cadastrar Nova Empresa');
        }
        
        const submitBtn = document.querySelector('#form-cadastro button[type="submit"]');
        if (submitBtn) {
            Utils.setTextContent(submitBtn, 'Cadastrar Empresa');
        }
    },
    
    // ==================== IMPORTAÇÃO E EXPORTAÇÃO ====================
    
    /**
     * Exporta dados
     */
    async exportData() {
        try {
            const blob = await API.exportEmpresas('json');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `empresas_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            Utils.showError('Erro ao exportar dados');
        }
    },
    
    /**
     * Importa dados
     */
    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                const response = await API.importEmpresas(data);
                
                if (response.success) {
                    Utils.showSuccess('Dados importados com sucesso');
                    this.load();
                } else {
                    Utils.showError(response.message || 'Erro ao importar dados');
                }
            } catch (error) {
                console.error('Erro ao importar dados:', error);
                Utils.showError('Erro ao importar dados');
            }
        };
        
        input.click();
    },
    
    /**
     * Importa Excel
     */
    async importExcel() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const response = await API.importExcel(file);
                
                if (response.success) {
                    Utils.showSuccess('Excel importado com sucesso');
                    this.load();
                } else {
                    Utils.showError(response.message || 'Erro ao importar Excel');
                }
            } catch (error) {
                console.error('Erro ao importar Excel:', error);
                Utils.showError('Erro ao importar Excel');
            }
        };
        
        input.click();
    },
    
    /**
     * Baixa template Excel
     */
    async downloadTemplate() {
        try {
            const blob = await API.downloadTemplateExcel();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'template_empresas.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao baixar template:', error);
            Utils.showError('Erro ao baixar template');
        }
    }
};

// Exportar para uso global
window.Empresas = Empresas;
