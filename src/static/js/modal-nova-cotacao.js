// ==================== MODAL DE NOVA COTAÇÃO ====================
// Sistema completo para criação de novas cotações

const ModalNovaCotacao = {
    modal: null,
    form: null,
    isSubmitting: false,

    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.modal = document.getElementById('modal-nova-cotacao');
        this.form = document.getElementById('form-nova-cotacao');
        
        if (!this.modal || !this.form) {
            console.warn('Modal de nova cotação não encontrado');
            return;
        }

        this.setupEventListeners();
        this.setupFieldFormatting();
        console.log('✅ Modal de Nova Cotação inicializado');
    },

    setupEventListeners() {
        // Submit do formulário
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        // Fechar modal ao clicar fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.fechar();
            }
        });

        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.fechar();
            }
        });

        // Conectar botão "Nova Cotação"
        const btnNovaCotacao = document.getElementById('btn-nova-cotacao');
        if (btnNovaCotacao) {
            btnNovaCotacao.addEventListener('click', () => {
                this.abrir();
            });
        }
    },

    setupFieldFormatting() {
        // Formatação de campos numéricos
        const camposNumericos = this.form.querySelectorAll('.campo-numerico');
        camposNumericos.forEach(campo => {
            campo.addEventListener('input', (e) => {
                this.formatarCampoNumerico(e.target);
            });
        });

        // Formatação de CNPJ
        const campoCnpj = this.form.querySelector('input[name="cnpj"]');
        if (campoCnpj) {
            campoCnpj.addEventListener('input', (e) => {
                this.formatarCNPJ(e.target);
            });
        }
    },

    // ==================== CONTROLE DO MODAL ====================

    abrir() {
        if (!this.modal) return;
        
        // Limpar formulário
        this.form.reset();
        this.limparErros();
        
        // Mostrar modal
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focar no primeiro campo
        const primeiroInput = this.form.querySelector('input[type="text"]');
        if (primeiroInput) {
            setTimeout(() => primeiroInput.focus(), 300);
        }
        
        console.log('Modal de nova cotação aberto');
    },

    fechar() {
        if (!this.modal) return;
        
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        
        console.log('Modal de nova cotação fechado');
    },

    // ==================== FORMATAÇÃO DE CAMPOS ====================

    formatarCampoNumerico(input) {
        const tipo = input.dataset.tipo;
        let valor = input.value.replace(/[^\d,]/g, '');

        switch (tipo) {
            case 'peso':
                // Formato: 1.000,50
                if (valor) {
                    valor = valor.replace(',', '.');
                    const numero = parseFloat(valor) || 0;
                    input.value = numero.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
                break;

            case 'cubagem':
                // Formato: 10,500
                if (valor) {
                    valor = valor.replace(',', '.');
                    const numero = parseFloat(valor) || 0;
                    input.value = numero.toLocaleString('pt-BR', {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3
                    });
                }
                break;

            case 'monetario':
                // Formato: R$ 10.000,00
                if (valor) {
                    valor = valor.replace(',', '.');
                    const numero = parseFloat(valor) || 0;
                    input.value = 'R$ ' + numero.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
                break;
        }
    },

    formatarCNPJ(input) {
        let valor = input.value.replace(/\D/g, '');
        
        if (valor.length <= 14) {
            valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
            valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
            valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
            input.value = valor;
        }
    },

    // ==================== VALIDAÇÃO ====================

    validarFormulario() {
        this.limparErros();
        let valido = true;
        const erros = [];

        // Campos obrigatórios
        const camposObrigatorios = [
            { name: 'empresa_nome', label: 'Nome da Empresa' },
            { name: 'cnpj', label: 'CNPJ' },
            { name: 'origem_cidade', label: 'Cidade Origem' },
            { name: 'origem_estado', label: 'Estado Origem' },
            { name: 'destino_cidade', label: 'Cidade Destino' },
            { name: 'destino_estado', label: 'Estado Destino' },
            { name: 'carga_peso_kg', label: 'Peso da Carga' },
            { name: 'carga_valor_mercadoria', label: 'Valor da Mercadoria' }
        ];

        camposObrigatorios.forEach(campo => {
            const input = this.form.querySelector(`[name="${campo.name}"]`);
            if (!input || !input.value.trim()) {
                this.marcarErro(input, `${campo.label} é obrigatório`);
                erros.push(`${campo.label} é obrigatório`);
                valido = false;
            }
        });

        // Validar modalidade
        const modalidade = this.form.querySelector('input[name="modalidade"]:checked');
        if (!modalidade) {
            erros.push('Selecione uma modalidade de transporte');
            valido = false;
        }

        // Validar CNPJ
        const cnpj = this.form.querySelector('input[name="cnpj"]').value;
        if (cnpj && !this.validarCNPJ(cnpj)) {
            const inputCnpj = this.form.querySelector('input[name="cnpj"]');
            this.marcarErro(inputCnpj, 'CNPJ inválido');
            erros.push('CNPJ inválido');
            valido = false;
        }

        // Validar email se preenchido
        const email = this.form.querySelector('input[name="email"]').value;
        if (email && !this.validarEmail(email)) {
            const inputEmail = this.form.querySelector('input[name="email"]');
            this.marcarErro(inputEmail, 'Email inválido');
            erros.push('Email inválido');
            valido = false;
        }

        if (!valido) {
            this.mostrarErros(erros);
        }

        return valido;
    },

    validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]/g, '');
        
        if (cnpj.length !== 14) return false;
        if (/^(\d)\1+$/.test(cnpj)) return false;

        // Validação dos dígitos verificadores
        let soma = 0;
        let peso = 2;
        
        for (let i = 11; i >= 0; i--) {
            soma += parseInt(cnpj.charAt(i)) * peso;
            peso = peso === 9 ? 2 : peso + 1;
        }
        
        let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        
        if (parseInt(cnpj.charAt(12)) !== digito1) return false;
        
        soma = 0;
        peso = 2;
        
        for (let i = 12; i >= 0; i--) {
            soma += parseInt(cnpj.charAt(i)) * peso;
            peso = peso === 9 ? 2 : peso + 1;
        }
        
        let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        
        return parseInt(cnpj.charAt(13)) === digito2;
    },

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    marcarErro(input, mensagem) {
        if (!input) return;
        
        input.classList.add('border-red-500', 'bg-red-50');
        input.classList.remove('border-gray-300');
        
        // Adicionar mensagem de erro
        let errorDiv = input.parentNode.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message text-red-500 text-sm mt-1';
            input.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = mensagem;
    },

    limparErros() {
        // Remover classes de erro
        this.form.querySelectorAll('.border-red-500').forEach(input => {
            input.classList.remove('border-red-500', 'bg-red-50');
            input.classList.add('border-gray-300');
        });

        // Remover mensagens de erro
        this.form.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });

        // Remover alerta geral
        const alertaGeral = this.form.querySelector('.alert-error');
        if (alertaGeral) {
            alertaGeral.remove();
        }
    },

    mostrarErros(erros) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert-error bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
        alertDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <div>
                    <strong>Corrija os seguintes erros:</strong>
                    <ul class="mt-2 ml-4 list-disc">
                        ${erros.map(erro => `<li>${erro}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        this.form.insertBefore(alertDiv, this.form.firstChild);
        
        // Scroll para o topo do modal
        this.modal.querySelector('.modal-body').scrollTop = 0;
    },

    // ==================== SUBMISSÃO ====================

    async submitForm() {
        if (this.isSubmitting) return;

        if (!this.validarFormulario()) {
            return;
        }

        this.isSubmitting = true;
        const btnSalvar = document.getElementById('btn-salvar-cotacao');
        const textoOriginal = btnSalvar.innerHTML;
        
        try {
            // Mostrar loading
            btnSalvar.disabled = true;
            btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';

            // Coletar dados do formulário
            const dados = this.coletarDadosFormulario();
            
            console.log('Enviando cotação:', dados);

            // Enviar para API
            if (window.API && typeof API.createCotacao === 'function') {
                const response = await API.createCotacao(dados);
                
                if (response.success) {
                    this.mostrarSucesso('Cotação criada com sucesso!');
                    
                    // Fechar modal após 2 segundos
                    setTimeout(() => {
                        this.fechar();
                        
                        // Recarregar lista de cotações se existir
                        if (window.FiltrosCotacoes && typeof FiltrosCotacoes.aplicarFiltros === 'function') {
                            FiltrosCotacoes.aplicarFiltros();
                        }
                    }, 2000);
                } else {
                    throw new Error(response.message || 'Erro ao criar cotação');
                }
            } else {
                throw new Error('Sistema de API não disponível');
            }

        } catch (error) {
            console.error('Erro ao salvar cotação:', error);
            this.mostrarErros([error.message || 'Erro ao salvar cotação']);
        } finally {
            this.isSubmitting = false;
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = textoOriginal;
        }
    },

    coletarDadosFormulario() {
        const formData = new FormData(this.form);
        const dados = {};

        // Coletar todos os campos
        for (let [key, value] of formData.entries()) {
            dados[key] = value;
        }

        // Processar campos numéricos
        if (dados.carga_peso_kg) {
            dados.carga_peso_kg = this.extrairNumero(dados.carga_peso_kg);
        }
        
        if (dados.carga_cubagem) {
            dados.carga_cubagem = this.extrairNumero(dados.carga_cubagem);
        }
        
        if (dados.carga_valor_mercadoria) {
            dados.carga_valor_mercadoria = this.extrairNumero(dados.carga_valor_mercadoria);
        }

        // Limpar CNPJ
        if (dados.cnpj) {
            dados.cnpj = dados.cnpj.replace(/[^\d]/g, '');
        }

        return dados;
    },

    extrairNumero(valor) {
        if (!valor) return 0;
        return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    },

    mostrarSucesso(mensagem) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert-success bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
        alertDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>${mensagem}</span>
            </div>
        `;
        
        this.form.insertBefore(alertDiv, this.form.firstChild);
        this.modal.querySelector('.modal-body').scrollTop = 0;
    }
};

// Inicialização controlada pelo main.js
// ModalNovaCotacao.init() é chamado centralmente

// Exportar para uso global
window.ModalNovaCotacao = ModalNovaCotacao;
