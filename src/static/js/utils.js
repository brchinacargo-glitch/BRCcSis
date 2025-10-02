// ==================== MÓDULO DE UTILITÁRIOS ====================
// Funções auxiliares e de sanitização

const Utils = {
    // ==================== SANITIZAÇÃO E SEGURANÇA ====================
    
    /**
     * Sanitiza texto para prevenir XSS
     * @param {string} text - Texto a ser sanitizado
     * @returns {string} - Texto sanitizado
     */
    sanitizeText(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Define texto de forma segura em um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} text - Texto a ser definido
     */
    setTextContent(element, text) {
        if (element) {
            element.textContent = text || '';
        }
    },
    
    /**
     * Cria elemento HTML de forma segura
     * @param {string} tag - Tag HTML
     * @param {object} attributes - Atributos do elemento
     * @param {string} text - Texto interno
     * @returns {HTMLElement}
     */
    createElement(tag, attributes = {}, text = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'dataset') {
                Object.keys(attributes[key]).forEach(dataKey => {
                    element.dataset[dataKey] = attributes[key][dataKey];
                });
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (text) {
            element.textContent = text;
        }
        
        return element;
    },
    
    // ==================== FORMATAÇÃO DE DADOS ====================
    
    /**
     * Formata CNPJ
     * @param {string} cnpj - CNPJ sem formatação
     * @returns {string} - CNPJ formatado
     */
    formatCNPJ(cnpj) {
        if (!cnpj) return '';
        cnpj = cnpj.replace(/\D/g, '');
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    },
    
    /**
     * Formata telefone
     * @param {string} telefone - Telefone sem formatação
     * @returns {string} - Telefone formatado
     */
    formatTelefone(telefone) {
        if (!telefone) return '';
        telefone = telefone.replace(/\D/g, '');
        if (telefone.length === 11) {
            return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (telefone.length === 10) {
            return telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        }
        return telefone;
    },
    
    /**
     * Formata CEP
     * @param {string} cep - CEP sem formatação
     * @returns {string} - CEP formatado
     */
    formatCEP(cep) {
        if (!cep) return '';
        cep = cep.replace(/\D/g, '');
        return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    },
    
    /**
     * Formata valor monetário no padrão brasileiro
     * @param {number|string} valor - Valor a ser formatado
     * @returns {string} - Valor formatado
     */
    formatCurrency(valor) {
        if (!valor && valor !== 0) return 'R$ 0,00';
        const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(numero);
    },
    
    /**
     * Formata número no padrão brasileiro
     * @param {number|string} valor - Valor a ser formatado
     * @param {number} decimals - Casas decimais
     * @returns {string} - Número formatado
     */
    formatNumber(valor, decimals = 2) {
        if (!valor && valor !== 0) return '0';
        const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(numero);
    },
    
    /**
     * Converte valor formatado para número
     * @param {string} valor - Valor formatado
     * @returns {number} - Número
     */
    parseFormattedNumber(valor) {
        if (!valor) return 0;
        // Remove símbolos de moeda e espaços
        valor = valor.replace(/^(R\$|US\$|\$)\s*/, '');
        // Remove pontos (separadores de milhares) e substitui vírgula por ponto
        return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
    },
    
    /**
     * Formata data no padrão brasileiro
     * @param {string|Date} data - Data a ser formatada
     * @returns {string} - Data formatada
     */
    formatDate(data) {
        if (!data) return '';
        const date = typeof data === 'string' ? new Date(data) : data;
        return new Intl.DateTimeFormat('pt-BR').format(date);
    },
    
    /**
     * Formata data e hora no padrão brasileiro
     * @param {string|Date} data - Data a ser formatada
     * @returns {string} - Data e hora formatadas
     */
    formatDateTime(data) {
        if (!data) return '';
        const date = typeof data === 'string' ? new Date(data) : data;
        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(date);
    },
    
    // ==================== VALIDAÇÃO ====================
    
    /**
     * Valida CNPJ
     * @param {string} cnpj - CNPJ a ser validado
     * @returns {boolean} - True se válido
     */
    validateCNPJ(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        
        if (cnpj.length !== 14) return false;
        if (/^(\d)\1+$/.test(cnpj)) return false;
        
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) return false;
        
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1)) return false;
        
        return true;
    },
    
    /**
     * Valida email
     * @param {string} email - Email a ser validado
     * @returns {boolean} - True se válido
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    /**
     * Valida campo obrigatório
     * @param {string} value - Valor a ser validado
     * @returns {boolean} - True se válido
     */
    validateRequired(value) {
        return value !== null && value !== undefined && value.trim() !== '';
    },
    
    // ==================== MANIPULAÇÃO DE DOM ====================
    
    /**
     * Mostra elemento
     * @param {HTMLElement|string} element - Elemento ou ID
     */
    show(element) {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (el) {
            el.style.display = 'block';
            el.classList.remove('hidden');
        }
    },
    
    /**
     * Oculta elemento
     * @param {HTMLElement|string} element - Elemento ou ID
     */
    hide(element) {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (el) {
            el.style.display = 'none';
            el.classList.add('hidden');
        }
    },
    
    /**
     * Alterna visibilidade de elemento
     * @param {HTMLElement|string} element - Elemento ou ID
     */
    toggle(element) {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (el) {
            if (el.style.display === 'none' || el.classList.contains('hidden')) {
                this.show(el);
            } else {
                this.hide(el);
            }
        }
    },
    
    /**
     * Limpa conteúdo de um elemento
     * @param {HTMLElement|string} element - Elemento ou ID
     */
    clearContent(element) {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (el) {
            el.innerHTML = '';
        }
    },
    
    // ==================== NOTIFICAÇÕES ====================
    
    /**
     * Mostra mensagem de sucesso
     * @param {string} message - Mensagem
     */
    showSuccess(message) {
        alert(message); // Pode ser substituído por uma biblioteca de notificações
    },
    
    /**
     * Mostra mensagem de erro
     * @param {string} message - Mensagem
     */
    showError(message) {
        alert('Erro: ' + message); // Pode ser substituído por uma biblioteca de notificações
    },
    
    /**
     * Mostra mensagem de confirmação
     * @param {string} message - Mensagem
     * @returns {boolean} - True se confirmado
     */
    confirm(message) {
        return confirm(message);
    },
    
    // ==================== DEBOUNCE E THROTTLE ====================
    
    /**
     * Debounce function
     * @param {Function} func - Função a ser executada
     * @param {number} wait - Tempo de espera em ms
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     * @param {Function} func - Função a ser executada
     * @param {number} limit - Limite de tempo em ms
     * @returns {Function}
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Exportar para uso global
window.Utils = Utils;
