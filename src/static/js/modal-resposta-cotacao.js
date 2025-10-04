// ==================== MODAL DE RESPOSTA DE COTAÇÃO ====================
// Gerencia o modal para responder cotações aceitas pelo operador

const ModalRespostaCotacao = {
    // Estado
    cotacaoAtual: null,
    empresas: [],
    
    // ==================== INICIALIZAÇÃO ====================
    
    /**
     * Inicializa o modal
     */
    init() {
        this.setupEventListeners();
        // Aguardar API estar disponível antes de carregar empresas
        this.waitForAPI().then(() => {
            this.loadEmpresas();
        });
    },
    
    /**
     * Aguarda a API estar disponível
     */
    async waitForAPI() {
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos máximo
        
        while (!window.API && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.API) {
            console.warn('API não encontrada após 5 segundos, usando fallback');
        }
    },
    
    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botão fechar modal
        const btnClose = document.querySelector('#modal-resposta-cotacao .modal-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.close());
        }
        
        // Fechar modal clicando no backdrop
        const modal = document.getElementById('modal-resposta-cotacao');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close();
                }
            });
        }
        
        // Formatação de campos numéricos
        const valorFreteInput = document.getElementById('valor-frete');
        if (valorFreteInput) {
            valorFreteInput.addEventListener('input', this.formatCurrency);
            valorFreteInput.addEventListener('blur', this.validateCurrency);
        }
        
        // Validação em tempo real
        const form = document.getElementById('form-resposta-cotacao');
        if (form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('change', () => this.validateField(input));
            });
        }
        
        // Tecla ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    },
    
    // ==================== CONTROLE DO MODAL ====================
    
    /**
     * Abre o modal para uma cotação específica
     * @param {number} cotacaoId - ID da cotação
     */
    async open(cotacaoId) {
        try {
            // Verificar se API está disponível
            if (!window.API) {
                console.error('API não disponível');
                this.showError('Sistema não está pronto. Tente novamente em alguns segundos.');
                return;
            }
            
            // Carregar dados da cotação
            const response = await window.API.getCotacaoById(cotacaoId);
            
            if (!response.success && !response.id) {
                this.showError('Erro ao carregar dados da cotação');
                return;
            }
            
            this.cotacaoAtual = response.data || response;
            
            // Verificar se cotação pode ser respondida
            if (!this.canRespond(this.cotacaoAtual)) {
                this.showError('Esta cotação não pode ser respondida no momento');
                return;
            }
            
            // Preencher dados da cotação
            this.populateCotacaoData();
            
            // Carregar empresas se necessário
            if (this.empresas.length === 0) {
                await this.loadEmpresas();
            }
            
            // Popular dropdown de empresas
            this.populateEmpresasDropdown();
            
            // Limpar formulário
            this.clearForm();
            
            // Mostrar modal
            this.showModal();
            
        } catch (error) {
            console.error('Erro ao abrir modal:', error);
            this.showError('Erro ao carregar dados da cotação');
        }
    },
    
    /**
     * Fecha o modal
     */
    close() {
        const modal = document.getElementById('modal-resposta-cotacao');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('show');
        }
        
        // Limpar dados
        this.cotacaoAtual = null;
        this.clearForm();
        this.clearErrors();
    },
    
    /**
     * Verifica se o modal está aberto
     * @returns {boolean}
     */
    isOpen() {
        const modal = document.getElementById('modal-resposta-cotacao');
        return modal && !modal.classList.contains('hidden');
    },
    
    /**
     * Mostra o modal
     */
    showModal() {
        const modal = document.getElementById('modal-resposta-cotacao');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('show', 'fade-in');
            
            // Focar no primeiro campo
            const firstInput = modal.querySelector('input, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    },
    
    // ==================== CARREGAMENTO DE DADOS ====================
    
    /**
     * Carrega lista de empresas prestadoras
     */
    async loadEmpresas() {
        if (!window.API) {
            console.warn('API não disponível, usando empresas padrão');
            this.empresas = [
                { id: 1, nome: 'BRCargo Rodoviário' },
                { id: 2, nome: 'BRCargo Marítimo' },
                { id: 3, nome: 'Frete Aéreo' }
            ];
            return;
        }
        
        try {
            const response = await window.API.getEmpresas();
            
            if (response.success) {
                this.empresas = response.data || [];
            } else {
                console.warn('Erro ao carregar empresas:', response.message);
                this.empresas = [];
            }
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
            this.empresas = [];
        }
    },
    
    /**
     * Popula dados da cotação no resumo
     */
    populateCotacaoData() {
        if (!this.cotacaoAtual) return;
        
        // Número da cotação
        const numeroCotacao = document.getElementById('numero-cotacao');
        if (numeroCotacao) {
            numeroCotacao.textContent = this.cotacaoAtual.numero_cotacao || this.cotacaoAtual.id;
        }
        
        // Resumo da cotação
        const resumoContainer = document.querySelector('.cotacao-resumo');
        if (resumoContainer) {
            const resumoHTML = `
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="font-medium text-gray-700">Empresa:</span>
                        <span class="text-gray-600 ml-2">${this.cotacaoAtual.empresa_nome || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700">Modalidade:</span>
                        <span class="text-gray-600 ml-2">${this.cotacaoAtual.modalidade || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700">Origem:</span>
                        <span class="text-gray-600 ml-2">${this.cotacaoAtual.origem || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700">Destino:</span>
                        <span class="text-gray-600 ml-2">${this.cotacaoAtual.destino || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700">Peso:</span>
                        <span class="text-gray-600 ml-2">${this.cotacaoAtual.peso || 'N/A'} kg</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700">Valor da Mercadoria:</span>
                        <span class="text-gray-600 ml-2">R$ ${this.formatMoney(this.cotacaoAtual.valor_mercadoria) || 'N/A'}</span>
                    </div>
                </div>
            `;
            resumoContainer.innerHTML = resumoHTML;
        }
    },
    
    /**
     * Popula dropdown de empresas prestadoras
     */
    populateEmpresasDropdown() {
        const select = document.getElementById('empresa-prestadora');
        if (!select) return;
        
        // Limpar opções existentes (exceto a primeira)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Adicionar empresas
        this.empresas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nome;
            select.appendChild(option);
        });
    },
    
    // ==================== VALIDAÇÃO ====================
    
    /**
     * Verifica se cotação pode ser respondida
     * @param {object} cotacao - Dados da cotação
     * @returns {boolean}
     */
    canRespond(cotacao) {
        return cotacao && cotacao.status === 'aceita_operador';
    },
    
    /**
     * Valida o formulário completo
     * @returns {boolean}
     */
    validateForm() {
        const form = document.getElementById('form-resposta-cotacao');
        if (!form) return false;
        
        let isValid = true;
        const errors = [];
        
        // Validar valor do frete
        const valorFrete = document.getElementById('valor-frete');
        if (!this.validateField(valorFrete)) {
            isValid = false;
            errors.push('Valor do frete é obrigatório e deve ser válido');
        }
        
        // Validar prazo de entrega
        const prazoEntrega = document.getElementById('prazo-entrega');
        if (!this.validateField(prazoEntrega)) {
            isValid = false;
            errors.push('Prazo de entrega é obrigatório');
        }
        
        // Validar empresa prestadora
        const empresaPrestadora = document.getElementById('empresa-prestadora');
        if (!this.validateField(empresaPrestadora)) {
            isValid = false;
            errors.push('Empresa prestadora é obrigatória');
        }
        
        // Validar observações (opcional, mas com limite)
        const observacoes = document.getElementById('observacoes');
        if (observacoes && observacoes.value.length > 500) {
            isValid = false;
            errors.push('Observações devem ter no máximo 500 caracteres');
            this.showFieldError(observacoes, 'Máximo 500 caracteres');
        }
        
        if (!isValid) {
            this.showError('Por favor, corrija os erros no formulário:\n' + errors.join('\n'));
        }
        
        return isValid;
    },
    
    /**
     * Valida um campo específico
     * @param {HTMLElement} field - Campo a ser validado
     * @returns {boolean}
     */
    validateField(field) {
        if (!field) return false;
        
        this.clearFieldError(field);
        
        // Validação por tipo de campo
        switch (field.id) {
            case 'valor-frete':
                return this.validateCurrency(field);
            case 'prazo-entrega':
            case 'empresa-prestadora':
                return this.validateRequired(field);
            case 'observacoes':
                return this.validateTextLength(field, 500);
            default:
                return true;
        }
    },
    
    /**
     * Valida campo obrigatório
     * @param {HTMLElement} field - Campo a ser validado
     * @returns {boolean}
     */
    validateRequired(field) {
        const isValid = field.value.trim() !== '';
        
        if (!isValid) {
            this.showFieldError(field, 'Este campo é obrigatório');
        }
        
        return isValid;
    },
    
    /**
     * Valida campo de moeda
     * @param {HTMLElement} field - Campo a ser validado
     * @returns {boolean}
     */
    validateCurrency(field) {
        const value = field.value.replace(/[^\d,]/g, '');
        const isValid = value !== '' && parseFloat(value.replace(',', '.')) > 0;
        
        if (!isValid) {
            this.showFieldError(field, 'Valor deve ser maior que zero');
        }
        
        return isValid;
    },
    
    /**
     * Valida comprimento de texto
     * @param {HTMLElement} field - Campo a ser validado
     * @param {number} maxLength - Comprimento máximo
     * @returns {boolean}
     */
    validateTextLength(field, maxLength) {
        const isValid = field.value.length <= maxLength;
        
        if (!isValid) {
            this.showFieldError(field, `Máximo ${maxLength} caracteres`);
        }
        
        return isValid;
    },
    
    // ==================== FORMATAÇÃO ====================
    
    /**
     * Formata campo de moeda
     * @param {Event} event - Evento de input
     */
    formatCurrency(event) {
        const input = event.target;
        let value = input.value.replace(/[^\d]/g, '');
        
        if (value === '') {
            input.value = '';
            return;
        }
        
        // Converter para formato monetário
        const numericValue = parseInt(value) / 100;
        input.value = numericValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },
    
    /**
     * Formata valor monetário para exibição
     * @param {number|string} value - Valor a ser formatado
     * @returns {string}
     */
    formatMoney(value) {
        if (!value) return '0,00';
        
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return numValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },
    
    // ==================== SUBMISSÃO ====================
    
    /**
     * Submete a resposta da cotação
     */
    async submit() {
        if (!this.cotacaoAtual) {
            this.showError('Nenhuma cotação selecionada');
            return;
        }
        
        // Validar formulário
        if (!this.validateForm()) {
            return;
        }
        
        // Coletar dados do formulário
        const formData = this.collectFormData();
        
        try {
            // Mostrar loading
            this.setSubmitLoading(true);
            
            // Enviar resposta
            const response = await window.API.responderCotacao(this.cotacaoAtual.id, formData);
            
            if (response.success) {
                this.showSuccess('Resposta enviada com sucesso!');
                this.close();
                
                // Recarregar lista de cotações
                if (window.Cotacoes) {
                    window.Cotacoes.load();
                }
            } else {
                this.showError(response.message || 'Erro ao enviar resposta');
            }
            
        } catch (error) {
            console.error('Erro ao enviar resposta:', error);
            this.showError('Erro ao enviar resposta da cotação');
        } finally {
            this.setSubmitLoading(false);
        }
    },
    
    /**
     * Coleta dados do formulário
     * @returns {object}
     */
    collectFormData() {
        const valorFreteInput = document.getElementById('valor-frete');
        const prazoEntregaInput = document.getElementById('prazo-entrega');
        const empresaPrestadoraInput = document.getElementById('empresa-prestadora');
        const observacoesInput = document.getElementById('observacoes');
        
        // Converter valor do frete para número
        const valorFreteStr = valorFreteInput.value.replace(/[^\d,]/g, '');
        const valorFrete = parseFloat(valorFreteStr.replace(',', '.'));
        
        return {
            valor_frete: valorFrete,
            prazo_entrega: prazoEntregaInput.value,
            empresa_prestadora_id: parseInt(empresaPrestadoraInput.value),
            observacoes: observacoesInput.value.trim() || null
        };
    },
    
    // ==================== UTILITÁRIOS ====================
    
    /**
     * Limpa o formulário
     */
    clearForm() {
        const form = document.getElementById('form-resposta-cotacao');
        if (form) {
            form.reset();
        }
        this.clearErrors();
    },
    
    /**
     * Limpa todos os erros de validação
     */
    clearErrors() {
        const errorElements = document.querySelectorAll('.field-error');
        errorElements.forEach(el => el.remove());
        
        const fieldsWithError = document.querySelectorAll('.field-invalid');
        fieldsWithError.forEach(field => {
            field.classList.remove('field-invalid');
        });
    },
    
    /**
     * Mostra erro em um campo específico
     * @param {HTMLElement} field - Campo com erro
     * @param {string} message - Mensagem de erro
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('field-invalid');
        
        const errorEl = document.createElement('div');
        errorEl.className = 'field-error text-red-600 text-sm mt-1';
        errorEl.textContent = message;
        
        field.parentNode.appendChild(errorEl);
    },
    
    /**
     * Limpa erro de um campo específico
     * @param {HTMLElement} field - Campo a limpar
     */
    clearFieldError(field) {
        field.classList.remove('field-invalid');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    },
    
    /**
     * Controla estado de loading do botão submit
     * @param {boolean} loading - Se deve mostrar loading
     */
    setSubmitLoading(loading) {
        const submitBtn = document.querySelector('#modal-resposta-cotacao .btn-primary');
        if (!submitBtn) return;
        
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading"></span> Enviando...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Resposta';
        }
    },
    
    // ==================== MÉTODOS DE FALLBACK ====================
    
    /**
     * Mostra mensagem de erro (fallback se Utils não estiver disponível)
     * @param {string} message - Mensagem de erro
     */
    showError(message) {
        if (window.Utils && window.Utils.showError) {
            window.Utils.showError(message);
        } else {
            alert('Erro: ' + message);
            console.error('Erro:', message);
        }
    },
    
    /**
     * Mostra mensagem de sucesso (fallback se Utils não estiver disponível)
     * @param {string} message - Mensagem de sucesso
     */
    showSuccess(message) {
        if (window.Utils && window.Utils.showSuccess) {
            window.Utils.showSuccess(message);
        } else {
            alert('Sucesso: ' + message);
            console.log('Sucesso:', message);
        }
    }
};

// Inicialização controlada pelo main.js
// ModalRespostaCotacao.init() é chamado centralmente

// Exportar para uso global
window.ModalRespostaCotacao = ModalRespostaCotacao;
