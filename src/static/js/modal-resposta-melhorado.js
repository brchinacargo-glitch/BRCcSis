// ==================== MODAL DE RESPOSTA MELHORADO ====================
// Interface profissional para operadores responderem cotações

console.log('✅ Modal Resposta Melhorado v1.0');

const ModalRespostaMelhorado = {
    cotacaoAtual: null,
    
    init() {
        console.log('🚀 Inicializando modal de resposta melhorado...');
        this.createModal();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Event delegation para botões de responder
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="responder-cotacao"]')) {
                const cotacaoId = parseInt(e.target.dataset.cotacaoId);
                this.abrirModal(cotacaoId);
            }
        });
    },
    
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'modal-resposta-cotacao';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="modal-header bg-blue-600 text-white p-6 rounded-t-lg">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-semibold">
                            <i class="fas fa-reply mr-2"></i>Responder Cotação
                        </h3>
                        <button class="modal-close text-white hover:text-gray-200 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="modal-body p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Resumo da Cotação -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-gray-800 mb-4">
                                <i class="fas fa-info-circle mr-2 text-blue-600"></i>Resumo da Cotação
                            </h4>
                            <div id="resumo-cotacao-resposta">
                                <!-- Será preenchido dinamicamente -->
                            </div>
                        </div>
                        
                        <!-- Formulário de Resposta -->
                        <div>
                            <h4 class="text-lg font-semibold text-gray-800 mb-4">
                                <i class="fas fa-edit mr-2 text-green-600"></i>Dados da Resposta
                            </h4>
                            
                            <form id="form-resposta-cotacao">
                                <!-- Valor do Frete -->
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Valor do Frete *
                                    </label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2 text-gray-500">R$</span>
                                        <input 
                                            type="text" 
                                            id="valor-frete" 
                                            class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0,00"
                                            required
                                        >
                                    </div>
                                    <div id="erro-valor" class="text-red-500 text-sm mt-1 hidden"></div>
                                </div>
                                
                                <!-- Prazo de Entrega -->
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Prazo de Entrega *
                                    </label>
                                    <div class="flex gap-2">
                                        <input 
                                            type="number" 
                                            id="prazo-entrega" 
                                            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0"
                                            min="1"
                                            max="365"
                                            required
                                        >
                                        <span class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                                            dias úteis
                                        </span>
                                    </div>
                                    <div id="erro-prazo" class="text-red-500 text-sm mt-1 hidden"></div>
                                </div>
                                
                                <!-- Empresa Prestadora -->
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Empresa Prestadora *
                                    </label>
                                    <select 
                                        id="empresa-prestadora" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Selecione uma empresa</option>
                                        <option value="transportadora-a">Transportadora A</option>
                                        <option value="transportadora-b">Transportadora B</option>
                                        <option value="transportadora-c">Transportadora C</option>
                                        <option value="logistica-express">Logística Express</option>
                                        <option value="cargo-rapido">Cargo Rápido</option>
                                    </select>
                                    <div id="erro-empresa" class="text-red-500 text-sm mt-1 hidden"></div>
                                </div>
                                
                                <!-- Tipo de Serviço -->
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Serviço
                                    </label>
                                    <select 
                                        id="tipo-servico" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="expresso">Expresso</option>
                                        <option value="economico">Econômico</option>
                                    </select>
                                </div>
                                
                                <!-- Seguro -->
                                <div class="mb-4">
                                    <label class="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id="seguro-incluso" 
                                            class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        >
                                        <span class="text-sm text-gray-700">Seguro incluso no valor</span>
                                    </label>
                                </div>
                                
                                <!-- Observações -->
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Observações
                                    </label>
                                    <textarea 
                                        id="observacoes-resposta" 
                                        rows="3" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Informações adicionais sobre o frete..."
                                        maxlength="500"
                                    ></textarea>
                                    <div class="text-right text-sm text-gray-500 mt-1">
                                        <span id="contador-chars">0</span>/500 caracteres
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer p-6 border-t bg-gray-50 rounded-b-lg">
                    <div class="flex justify-end gap-3">
                        <button id="btn-cancelar-resposta" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                            <i class="fas fa-times mr-2"></i>Cancelar
                        </button>
                        <button id="btn-enviar-resposta" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-paper-plane mr-2"></i>Enviar Resposta
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupModalListeners();
    },
    
    setupModalListeners() {
        // Botões do modal
        document.getElementById('btn-cancelar-resposta')?.addEventListener('click', () => {
            this.fecharModal();
        });
        
        document.getElementById('btn-enviar-resposta')?.addEventListener('click', () => {
            this.enviarResposta();
        });
        
        // Fechar modal - APENAS pelo botão X
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close') && e.target.closest('#modal-resposta-cotacao')) {
                this.fecharModal();
            }
            
            // REMOVIDO: Fechar ao clicar fora do modal
            // Modal só deve fechar pelo botão X
        });
        
        // Formatação do valor
        const valorInput = document.getElementById('valor-frete');
        valorInput?.addEventListener('input', (e) => {
            this.formatarValor(e.target);
        });
        
        valorInput?.addEventListener('blur', () => {
            this.validarValor();
        });
        
        // Validação do prazo
        const prazoInput = document.getElementById('prazo-entrega');
        prazoInput?.addEventListener('blur', () => {
            this.validarPrazo();
        });
        
        // Contador de caracteres
        const observacoesTextarea = document.getElementById('observacoes-resposta');
        observacoesTextarea?.addEventListener('input', (e) => {
            this.atualizarContador(e.target);
        });
    },
    
    abrirModal(cotacaoId) {
        const cotacao = this.getCotacao(cotacaoId);
        if (!cotacao) {
            alert('Cotação não encontrada');
            return;
        }
        
        if (cotacao.status !== 'aceita_operador') {
            alert('Esta cotação não pode ser respondida no momento');
            return;
        }
        
        this.cotacaoAtual = cotacaoId;
        this.preencherResumo(cotacao);
        this.limparFormulario();
        
        // Abrir modal
        const modal = document.getElementById('modal-resposta-cotacao');
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Focar no primeiro campo
        setTimeout(() => {
            document.getElementById('valor-frete')?.focus();
        }, 100);
    },
    
    preencherResumo(cotacao) {
        const resumo = document.getElementById('resumo-cotacao-resposta');
        resumo.innerHTML = `
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Cotação:</span>
                    <span class="text-gray-900">${cotacao.numero}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Cliente:</span>
                    <span class="text-gray-900">${cotacao.cliente}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Modalidade:</span>
                    <span class="text-gray-900">${this.getModalidadeLabel(cotacao.modalidade)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Origem:</span>
                    <span class="text-gray-900">${cotacao.origem}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Destino:</span>
                    <span class="text-gray-900">${cotacao.destino}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Status:</span>
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Aceita pelo Operador
                    </span>
                </div>
            </div>
        `;
    },
    
    limparFormulario() {
        document.getElementById('valor-frete').value = '';
        document.getElementById('prazo-entrega').value = '';
        document.getElementById('empresa-prestadora').value = '';
        document.getElementById('tipo-servico').value = 'normal';
        document.getElementById('seguro-incluso').checked = false;
        document.getElementById('observacoes-resposta').value = '';
        
        // Limpar erros
        this.limparErros();
        
        // Resetar contador
        this.atualizarContador(document.getElementById('observacoes-resposta'));
    },
    
    formatarValor(input) {
        let valor = input.value.replace(/\D/g, '');
        
        if (valor === '') {
            input.value = '';
            return;
        }
        
        // Converter para formato monetário
        const numero = parseInt(valor) / 100;
        input.value = numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },
    
    validarValor() {
        const input = document.getElementById('valor-frete');
        const erro = document.getElementById('erro-valor');
        const valor = this.parseValor(input.value);
        
        if (!input.value.trim()) {
            this.mostrarErro(erro, 'Valor do frete é obrigatório');
            return false;
        }
        
        if (valor <= 0) {
            this.mostrarErro(erro, 'Valor deve ser maior que zero');
            return false;
        }
        
        this.esconderErro(erro);
        return true;
    },
    
    validarPrazo() {
        const input = document.getElementById('prazo-entrega');
        const erro = document.getElementById('erro-prazo');
        const prazo = parseInt(input.value);
        
        if (!input.value.trim()) {
            this.mostrarErro(erro, 'Prazo de entrega é obrigatório');
            return false;
        }
        
        if (prazo < 1 || prazo > 365) {
            this.mostrarErro(erro, 'Prazo deve ser entre 1 e 365 dias');
            return false;
        }
        
        this.esconderErro(erro);
        return true;
    },
    
    validarEmpresa() {
        const select = document.getElementById('empresa-prestadora');
        const erro = document.getElementById('erro-empresa');
        
        if (!select.value) {
            this.mostrarErro(erro, 'Selecione uma empresa prestadora');
            return false;
        }
        
        this.esconderErro(erro);
        return true;
    },
    
    enviarResposta() {
        // Validar todos os campos
        const valorValido = this.validarValor();
        const prazoValido = this.validarPrazo();
        const empresaValida = this.validarEmpresa();
        
        if (!valorValido || !prazoValido || !empresaValida) {
            alert('Por favor, corrija os erros no formulário');
            return;
        }
        
        // Coletar dados
        const dados = {
            valor_frete: this.parseValor(document.getElementById('valor-frete').value),
            prazo_entrega: parseInt(document.getElementById('prazo-entrega').value),
            empresa_prestadora: document.getElementById('empresa-prestadora').value,
            tipo_servico: document.getElementById('tipo-servico').value,
            seguro_incluso: document.getElementById('seguro-incluso').checked,
            observacoes: document.getElementById('observacoes-resposta').value.trim()
        };
        
        // Atualizar cotação
        const cotacao = this.getCotacao(this.cotacaoAtual);
        if (cotacao) {
            cotacao.status = 'cotacao_enviada';
            cotacao.resposta = dados;
            cotacao.data_resposta = new Date().toLocaleDateString();
            
            // Salvar e atualizar
            if (window.Cotacoes) {
                Cotacoes.saveToStorage();
                Cotacoes.render();
                
                // Atualizar dashboard
                if (window.Dashboard && typeof Dashboard.refresh === 'function') {
                    Dashboard.refresh();
                }
            }
            
            console.log('✅ Resposta enviada:', dados);
        }
        
        this.fecharModal();
        this.mostrarSucesso('Resposta enviada com sucesso! Cliente será notificado.');
    },
    
    parseValor(valorFormatado) {
        if (!valorFormatado) return 0;
        return parseFloat(valorFormatado.replace(/\./g, '').replace(',', '.')) || 0;
    },
    
    atualizarContador(textarea) {
        const contador = document.getElementById('contador-chars');
        if (contador) {
            contador.textContent = textarea.value.length;
        }
    },
    
    mostrarErro(elemento, mensagem) {
        elemento.textContent = mensagem;
        elemento.classList.remove('hidden');
    },
    
    esconderErro(elemento) {
        elemento.classList.add('hidden');
    },
    
    limparErros() {
        ['erro-valor', 'erro-prazo', 'erro-empresa'].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.classList.add('hidden');
            }
        });
    },
    
    getCotacao(id) {
        if (window.Cotacoes && window.Cotacoes.cotacoes) {
            return window.Cotacoes.cotacoes.find(c => c.id === id);
        }
        return null;
    },
    
    getModalidadeLabel(modalidade) {
        const labels = {
            'rodoviario': 'Rodoviário',
            'maritimo': 'Marítimo',
            'aereo': 'Aéreo'
        };
        return labels[modalidade] || modalidade;
    },
    
    fecharModal() {
        const modal = document.getElementById('modal-resposta-cotacao');
        modal.classList.remove('show');
        modal.style.display = 'none';
    },
    
    mostrarSucesso(mensagem) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.innerHTML = `<i class="fas fa-check mr-2"></i>${mensagem}`;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
};

// Exportar globalmente
window.ModalRespostaMelhorado = ModalRespostaMelhorado;

console.log('✅ Modal resposta melhorado carregado');
