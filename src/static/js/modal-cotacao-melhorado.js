// ==================== MODAL DE COTAÇÃO MELHORADO ====================
// Corrige problemas de formatação, validação e usabilidade

const ModalCotacaoMelhorado = {
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.setupNumericFields();
        this.setupValidation();
        this.setupModalScroll();
        console.log('✅ Modal de Cotação Melhorado inicializado');
    },
    
    // ==================== CAMPOS NUMÉRICOS ====================
    
    /**
     * Formatar número com separadores de milhares (padrão brasileiro)
     * @param {string} numero - Número como string (apenas dígitos)
     * @returns {string} - Número formatado com pontos
     */
    formatarNumero(numero) {
        if (!numero || numero === '') return '';
        
        // Remover qualquer formatação existente
        numero = numero.replace(/\D/g, '');
        
        // Aplicar separadores de milhares (pontos a cada 3 dígitos da direita para esquerda)
        return numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },
    
    setupNumericFields() {
        const camposNumericos = document.querySelectorAll('.campo-numerico');
        
        camposNumericos.forEach(campo => {
            const tipo = campo.dataset.tipo;
            
            // Configurar formatação baseada no tipo
            switch (tipo) {
                case 'peso':
                    this.setupPesoField(campo);
                    break;
                case 'dimensao':
                    this.setupDimensaoField(campo);
                    break;
                case 'cubagem':
                    this.setupCubagemField(campo);
                    break;
                case 'inteiro':
                    this.setupInteiroField(campo);
                    break;
                default:
                    this.setupNumericField(campo);
            }
        });
        
        // Configurar campos monetários
        const camposMonetarios = document.querySelectorAll('input[name="carga_valor_mercadoria"]');
        camposMonetarios.forEach(campo => {
            this.setupMoneyField(campo);
        });
        
        console.log(`✅ ${camposNumericos.length} campos numéricos configurados`);
    },
    
    setupPesoField(campo) {
        // Formato: 123.456.789.012.345,45 (com separadores de milhares)
        campo.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/[^\d,]/g, '');
            
            // Permitir apenas uma vírgula
            const partes = valor.split(',');
            if (partes.length > 2) {
                valor = partes[0] + ',' + partes.slice(1).join('');
            }
            
            // Limitar parte inteira a 15 dígitos
            if (partes[0] && partes[0].length > 15) {
                partes[0] = partes[0].substring(0, 15);
            }
            
            // Limitar decimais a 2 dígitos (padrão para peso)
            if (partes[1] && partes[1].length > 2) {
                partes[1] = partes[1].substring(0, 2);
            }
            
            // Aplicar formatação com separadores de milhares
            if (partes[0]) {
                partes[0] = this.formatarNumero(partes[0]);
            }
            
            e.target.value = partes.join(',');
        });
        
        campo.addEventListener('blur', (e) => {
            this.validatePeso(e.target);
        });
    },
    
    setupDimensaoField(campo) {
        // Formato: 123.456.789.012.345 (com separadores de milhares)
        campo.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/[^\d]/g, '');
            
            // Limitar a 15 dígitos
            if (valor.length > 15) {
                valor = valor.substring(0, 15);
            }
            
            // Aplicar formatação com separadores de milhares
            e.target.value = this.formatarNumero(valor);
        });
        
        campo.addEventListener('blur', (e) => {
            this.validateDimensao(e.target);
        });
    },
    
    setupCubagemField(campo) {
        // Formato: 123.456.789.012.345,123 (com separadores de milhares)
        campo.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/[^\d,]/g, '');
            
            const partes = valor.split(',');
            if (partes.length > 2) {
                valor = partes[0] + ',' + partes.slice(1).join('');
            }
            
            // Limitar parte inteira a 15 dígitos
            if (partes[0] && partes[0].length > 15) {
                partes[0] = partes[0].substring(0, 15);
            }
            
            // Limitar decimais a 3 dígitos (padrão para cubagem)
            if (partes[1] && partes[1].length > 3) {
                partes[1] = partes[1].substring(0, 3);
            }
            
            // Aplicar formatação com separadores de milhares
            if (partes[0]) {
                partes[0] = this.formatarNumero(partes[0]);
            }
            
            e.target.value = partes.join(',');
        });
        
        campo.addEventListener('blur', (e) => {
            this.validateCubagem(e.target);
        });
    },
    
    setupInteiroField(campo) {
        // Formato: 123.456.789.012.345 (com separadores de milhares)
        campo.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/[^\d]/g, '');
            
            // Limitar a 15 dígitos
            if (valor.length > 15) {
                valor = valor.substring(0, 15);
            }
            
            // Aplicar formatação com separadores de milhares
            e.target.value = this.formatarNumero(valor);
        });
        
        campo.addEventListener('blur', (e) => {
            this.validateInteiro(e.target);
        });
    },
    
    setupNumericField(campo) {
        // Formato genérico numérico: 123.456.789.012.345,12 (com separadores de milhares)
        campo.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/[^\d,]/g, '');
            
            const partes = valor.split(',');
            if (partes.length > 2) {
                valor = partes[0] + ',' + partes.slice(1).join('');
            }
            
            // Limitar parte inteira a 15 dígitos
            if (partes[0] && partes[0].length > 15) {
                partes[0] = partes[0].substring(0, 15);
            }
            
            // Limitar decimais a 2 dígitos para campos genéricos
            if (partes[1] && partes[1].length > 2) {
                partes[1] = partes[1].substring(0, 2);
            }
            
            // Aplicar formatação com separadores de milhares
            if (partes[0]) {
                partes[0] = this.formatarNumero(partes[0]);
            }
            
            e.target.value = partes.join(',');
        });
    },
    
    setupMoneyField(campo) {
        // Formato monetário: R$ 1.234,56
        campo.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/[^\d]/g, '');
            
            if (valor === '') {
                e.target.value = '';
                return;
            }
            
            // Converter para formato monetário
            const numero = parseInt(valor) / 100;
            e.target.value = 'R$ ' + numero.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        });
        
        campo.addEventListener('blur', (e) => {
            this.validateMoney(e.target);
        });
    },
    
    // ==================== VALIDAÇÃO ====================
    
    setupValidation() {
        const form = document.getElementById('form-cotacao');
        if (!form) return;
        
        // Interceptar submit para validação customizada
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateAndSubmit();
        });
        
        // Validação em tempo real nos campos obrigatórios
        const camposObrigatorios = form.querySelectorAll('[required]');
        camposObrigatorios.forEach(campo => {
            campo.addEventListener('blur', () => {
                this.validateField(campo);
            });
        });
    },
    
    validateAndSubmit() {
        const form = document.getElementById('form-cotacao');
        let isValid = true;
        const errors = [];
        
        // Limpar erros anteriores
        this.clearErrors();
        
        // Validar campos obrigatórios
        const camposObrigatorios = form.querySelectorAll('[required]');
        camposObrigatorios.forEach(campo => {
            if (!this.validateField(campo)) {
                isValid = false;
            }
        });
        
        // Validações específicas por modalidade
        const modalidade = form.querySelector('input[name="empresa_transporte"]:checked')?.value;
        
        if (modalidade === 'brcargo_maritimo') {
            if (!this.validateMaritimoFields()) {
                isValid = false;
            }
        }
        
        if (isValid) {
            this.submitForm();
        } else {
            this.showValidationErrors();
            this.scrollToFirstError();
        }
    },
    
    validateField(campo) {
        const valor = campo.value.trim();
        const isRequired = campo.hasAttribute('required');
        
        // Limpar erro anterior
        this.clearFieldError(campo);
        
        // Verificar se campo obrigatório está vazio
        if (isRequired && valor === '') {
            this.showFieldError(campo, 'Este campo é obrigatório');
            return false;
        }
        
        // Validações específicas por tipo
        if (campo.classList.contains('campo-numerico') && valor !== '') {
            const tipo = campo.dataset.tipo;
            
            switch (tipo) {
                case 'peso':
                    return this.validatePeso(campo);
                case 'dimensao':
                    return this.validateDimensao(campo);
                case 'cubagem':
                    return this.validateCubagem(campo);
                case 'inteiro':
                    return this.validateInteiro(campo);
            }
        }
        
        // Validar campos monetários
        if (campo.name === 'carga_valor_mercadoria' && valor !== '') {
            return this.validateMoney(campo);
        }
        
        return true;
    },
    
    validatePeso(campo) {
        // Remover formatação para validação
        const valor = campo.value.replace(/\./g, '').replace(',', '.');
        const numero = parseFloat(valor);
        
        if (isNaN(numero) || numero <= 0) {
            this.showFieldError(campo, 'Peso deve ser um número maior que zero');
            return false;
        }
        
        if (numero > 999999999999999) {
            this.showFieldError(campo, 'Peso não pode ser maior que 999.999.999.999.999 kg');
            return false;
        }
        
        return true;
    },
    
    validateDimensao(campo) {
        // Remover formatação para validação
        const valor = campo.value.replace(/\./g, '');
        const numero = parseInt(valor);
        
        if (campo.value !== '' && (isNaN(numero) || numero <= 0)) {
            this.showFieldError(campo, 'Dimensão deve ser um número inteiro maior que zero');
            return false;
        }
        
        if (numero > 999999999999999) {
            this.showFieldError(campo, 'Dimensão não pode ser maior que 999.999.999.999.999 cm');
            return false;
        }
        
        return true;
    },
    
    validateCubagem(campo) {
        // Remover formatação para validação
        const valor = campo.value.replace(/\./g, '').replace(',', '.');
        const numero = parseFloat(valor);
        
        if (isNaN(numero) || numero <= 0) {
            this.showFieldError(campo, 'Cubagem deve ser um número maior que zero');
            return false;
        }
        
        if (numero > 999999999999999) {
            this.showFieldError(campo, 'Cubagem não pode ser maior que 999.999.999.999.999 m³');
            return false;
        }
        
        return true;
    },
    
    validateInteiro(campo) {
        // Remover formatação para validação
        const valor = campo.value.replace(/\./g, '');
        const numero = parseInt(valor);
        
        if (campo.value !== '' && (isNaN(numero) || numero <= 0)) {
            this.showFieldError(campo, 'Deve ser um número inteiro maior que zero');
            return false;
        }
        
        return true;
    },
    
    validateMoney(campo) {
        const valor = campo.value.replace(/[^\d,]/g, '').replace(',', '.');
        const numero = parseFloat(valor);
        
        if (isNaN(numero) || numero <= 0) {
            this.showFieldError(campo, 'Valor deve ser maior que zero');
            return false;
        }
        
        return true;
    },
    
    validateMaritimoFields() {
        const form = document.getElementById('form-cotacao');
        const modalidade = form.querySelector('input[name="empresa_transporte"]:checked')?.value;
        
        if (modalidade !== 'brcargo_maritimo') return true;
        
        let isValid = true;
        
        // Campos específicos do marítimo
        const camposMaritimo = [
            'net_weight',
            'gross_weight',
            'cubagem',
            'incoterm',
            'tipo_carga_maritima',
            'porto_origem',
            'porto_destino'
        ];
        
        camposMaritimo.forEach(fieldName => {
            const campo = form.querySelector(`[name="${fieldName}"]`);
            if (campo && !this.validateField(campo)) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    // ==================== INTERFACE DE ERROS ====================
    
    showFieldError(campo, mensagem) {
        campo.classList.add('border-red-500');
        
        // Remover erro anterior se existir
        const errorExistente = campo.parentNode.querySelector('.error-message');
        if (errorExistente) {
            errorExistente.remove();
        }
        
        // Adicionar nova mensagem de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-600 text-sm mt-1';
        errorDiv.textContent = mensagem;
        
        campo.parentNode.appendChild(errorDiv);
    },
    
    clearFieldError(campo) {
        campo.classList.remove('border-red-500');
        
        const errorMessage = campo.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    },
    
    clearErrors() {
        const form = document.getElementById('form-cotacao');
        const errorMessages = form.querySelectorAll('.error-message');
        const fieldsWithError = form.querySelectorAll('.border-red-500');
        
        errorMessages.forEach(error => error.remove());
        fieldsWithError.forEach(field => field.classList.remove('border-red-500'));
    },
    
    showValidationErrors() {
        const errorCount = document.querySelectorAll('.error-message').length;
        
        if (errorCount > 0) {
            const message = `Por favor, corrija ${errorCount} erro(s) no formulário antes de continuar.`;
            
            // Mostrar notificação
            this.showNotification(message, 'error');
        }
    },
    
    scrollToFirstError() {
        const firstError = document.querySelector('.border-red-500');
        if (firstError) {
            firstError.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            firstError.focus();
        }
    },
    
    // ==================== SCROLL DO MODAL ====================
    
    setupModalScroll() {
        const modal = document.getElementById('modal-cotacao');
        if (!modal) return;
        
        // Garantir que o modal tenha scroll adequado
        const modalContent = modal.querySelector('.max-h-\\[90vh\\]');
        if (modalContent) {
            modalContent.style.overflowY = 'auto';
            modalContent.style.maxHeight = '90vh';
        }
        
        // Melhorar experiência de scroll em mobile
        if (window.innerWidth <= 768) {
            modalContent.style.maxHeight = '95vh';
            modalContent.style.padding = '1rem';
        }
    },
    
    // ==================== SUBMISSÃO ====================
    
    async submitForm() {
        const form = document.getElementById('form-cotacao');
        const submitBtn = document.getElementById('salvar-cotacao');
        
        try {
            // Mostrar loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
            
            // Coletar dados do formulário
            const formData = new FormData(form);
            const dados = this.processFormData(formData);
            
            console.log('Dados da cotação:', dados);
            
            // Verificar se API está disponível
            if (typeof API === 'undefined' || !API.createCotacao) {
                throw new Error('API não está disponível. Verifique se o script api.js foi carregado.');
            }
            
            // Enviar via API real
            const response = await API.createCotacao(dados);
            
            if (response.success) {
                this.showNotification('Cotação solicitada com sucesso!', 'success');
                this.closeModal();
                form.reset();
                
                // Recarregar lista de cotações se estiver na seção de cotações
                if (window.CotacoesManager && typeof window.CotacoesManager.carregarCotacoes === 'function') {
                    window.CotacoesManager.carregarCotacoes();
                }
            } else {
                throw new Error(response.message || 'Erro ao processar cotação');
            }
            
        } catch (error) {
            console.error('Erro ao enviar cotação:', error);
            this.showNotification(
                error.message || 'Erro ao enviar cotação. Tente novamente.', 
                'error'
            );
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Solicitar Cotação';
        }
    },
    
    processFormData(formData) {
        const dados = {};
        
        for (let [key, value] of formData.entries()) {
            // Processar campos numéricos (remover formatação)
            if (key.includes('peso') || key.includes('weight') || key.includes('cubagem')) {
                dados[key] = parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
            } else if (key === 'carga_valor_mercadoria') {
                dados[key] = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            } else if (key.includes('comprimento') || key.includes('largura') || key.includes('altura') || key.includes('quantidade')) {
                // Campos inteiros com formatação
                dados[key] = parseInt(value.replace(/\./g, '')) || 0;
            } else {
                dados[key] = value;
            }
        }
        
        return dados;
    },
    
    closeModal() {
        const modal = document.getElementById('modal-cotacao');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    },
    
    // ==================== NOTIFICAÇÕES ====================
    
    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    'fa-info-circle'
                } mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 5 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que outros scripts carregaram
    setTimeout(() => {
        ModalCotacaoMelhorado.init();
    }, 1000);
});

// Também inicializar quando o modal for aberto
document.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'btn-nova-cotacao' || e.target.id === 'btn-solicitar-cotacao')) {
        // Aguardar modal aparecer e inicializar
        setTimeout(() => {
            ModalCotacaoMelhorado.init();
        }, 100);
    }
});

// Exportar para uso global
window.ModalCotacaoMelhorado = ModalCotacaoMelhorado;
