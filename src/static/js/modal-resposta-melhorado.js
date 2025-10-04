// ==================== MODAL DE RESPOSTA MELHORADO ====================
// Interface completa para operadores responderem cotações com valores e prazos

const ModalRespostaMelhorado = {
    // Estado
    cotacaoAtual: null,
    empresas: [],
    modoEdicao: false,
    
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.setupEventListeners();
        this.carregarEmpresas();
        console.log('✅ Modal Resposta Melhorado inicializado');
    },
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'modal-resposta-melhorado' || e.target.classList.contains('fechar-modal-resposta')) {
                this.fechar();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fechar();
            }
        });
    },
    
    // ==================== MODAL PRINCIPAL ====================
    
    async abrir(cotacao, edicao = false) {
        try {
            this.cotacaoAtual = cotacao;
            this.modoEdicao = edicao;
            
            this.renderizarModal();
            this.mostrarModal();
            this.configurarFormulario();
            
        } catch (error) {
            console.error('Erro ao abrir modal de resposta:', error);
            this.mostrarErro('Erro ao abrir modal de resposta');
        }
    },
    
    renderizarModal() {
        const modal = this.criarModalBase();
        const cotacao = this.cotacaoAtual;
        
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="modal-header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold">
                                <i class="fas fa-calculator mr-3"></i>
                                ${this.modoEdicao ? 'Editar' : 'Responder'} Cotação #${cotacao.numero_cotacao || cotacao.id}
                            </h2>
                            <p class="text-blue-100 mt-1">Informe valores e prazos para o cliente</p>
                        </div>
                        <button class="fechar-modal-resposta text-white hover:text-gray-200 text-3xl font-bold">
                            &times;
                        </button>
                    </div>
                </div>
                
                <!-- Conteúdo -->
                <div class="modal-body p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Resumo da Cotação -->
                        <div class="lg:col-span-1">
                            ${this.renderizarResumo(cotacao)}
                        </div>
                        
                        <!-- Formulário de Resposta -->
                        <div class="lg:col-span-2">
                            ${this.renderizarFormulario(cotacao)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.configurarEventListeners();
    },
    
    renderizarResumo(cotacao) {
        return `
            <div class="bg-gray-50 rounded-lg p-6 sticky top-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                    Resumo da Cotação
                </h3>
                
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Cliente:</span>
                        <span class="font-medium">${cotacao.cliente_nome || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Modalidade:</span>
                        <span class="font-medium">${this.getModalidadeDisplay(cotacao.modalidade)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Origem:</span>
                        <span class="font-medium text-sm">${this.formatarEndereco(cotacao, 'origem')}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Destino:</span>
                        <span class="font-medium text-sm">${this.formatarEndereco(cotacao, 'destino')}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Peso:</span>
                        <span class="font-medium">${cotacao.carga_peso_kg ? cotacao.carga_peso_kg + ' kg' : 'N/A'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Cubagem:</span>
                        <span class="font-medium">${cotacao.carga_cubagem ? cotacao.carga_cubagem + ' m³' : 'N/A'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Valor Mercadoria:</span>
                        <span class="font-medium">${cotacao.carga_valor_mercadoria || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 class="font-medium text-blue-800 mb-2">Descrição da Carga</h4>
                    <p class="text-sm text-blue-700">${cotacao.carga_descricao || 'Não informado'}</p>
                </div>
            </div>
        `;
    },
    
    renderizarFormulario(cotacao) {
        return `
            <form id="form-resposta-cotacao" class="space-y-6">
                <!-- Valores e Prazos -->
                <div class="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-money-bill-wave text-green-600 mr-2"></i>
                        Valores e Prazos
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Valor do Frete (R$) *
                            </label>
                            <input 
                                type="text" 
                                name="valor_frete" 
                                id="valor_frete"
                                required
                                placeholder="R$ 0,00"
                                value="${cotacao.valor_frete || ''}"
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 campo-monetario"
                            >
                            <div class="error-message text-red-600 text-sm mt-1 hidden"></div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Prazo de Entrega (dias) *
                            </label>
                            <input 
                                type="number" 
                                name="prazo_entrega" 
                                id="prazo_entrega"
                                required
                                min="1"
                                max="365"
                                placeholder="Ex: 5"
                                value="${cotacao.prazo_entrega || ''}"
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                            <div class="error-message text-red-600 text-sm mt-1 hidden"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Empresa Prestadora -->
                <div class="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-building text-purple-600 mr-2"></i>
                        Empresa Prestadora
                    </h3>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Selecione a Empresa *
                        </label>
                        <select 
                            name="empresa_prestadora" 
                            id="empresa_prestadora"
                            required
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Selecione uma empresa...</option>
                            ${this.renderizarOpcoesEmpresas(cotacao.empresa_prestadora)}
                        </select>
                        <div class="error-message text-red-600 text-sm mt-1 hidden"></div>
                    </div>
                </div>
                
                <!-- Detalhes Adicionais -->
                <div class="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-clipboard-list text-orange-600 mr-2"></i>
                        Detalhes Adicionais
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Serviço
                            </label>
                            <select 
                                name="tipo_servico" 
                                id="tipo_servico"
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Selecione...</option>
                                <option value="normal">Normal</option>
                                <option value="expresso">Expresso</option>
                                <option value="economico">Econômico</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Seguro Incluso
                            </label>
                            <select 
                                name="seguro_incluso" 
                                id="seguro_incluso"
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="nao">Não</option>
                                <option value="sim">Sim</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Observações
                        </label>
                        <textarea 
                            name="observacoes_resposta" 
                            id="observacoes_resposta"
                            rows="4"
                            maxlength="500"
                            placeholder="Informações adicionais sobre a cotação, condições especiais, etc..."
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >${cotacao.observacoes_resposta || ''}</textarea>
                        <div class="text-sm text-gray-500 mt-1">
                            <span id="contador-observacoes">0</span>/500 caracteres
                        </div>
                    </div>
                </div>
                
                <!-- Botões de Ação -->
                <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button 
                        type="button" 
                        class="fechar-modal-resposta px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        id="btn-enviar-resposta"
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <i class="fas fa-paper-plane mr-2"></i>
                        ${this.modoEdicao ? 'Atualizar' : 'Enviar'} Resposta
                    </button>
                </div>
            </form>
        `;
    },
    
    // ==================== CONFIGURAÇÕES ====================
    
    configurarFormulario() {
        // Formatação monetária
        this.configurarCampoMonetario();
        
        // Contador de caracteres
        this.configurarContadorCaracteres();
        
        // Validação em tempo real
        this.configurarValidacao();
        
        // Submit do formulário
        this.configurarSubmit();
    },
    
    configurarCampoMonetario() {
        const campoValor = document.getElementById('valor_frete');
        if (campoValor) {
            campoValor.addEventListener('input', (e) => {
                let valor = e.target.value.replace(/\D/g, '');
                valor = (valor / 100).toFixed(2);
                valor = valor.replace('.', ',');
                valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                e.target.value = 'R$ ' + valor;
            });
        }
    },
    
    configurarContadorCaracteres() {
        const textarea = document.getElementById('observacoes_resposta');
        const contador = document.getElementById('contador-observacoes');
        
        if (textarea && contador) {
            const atualizarContador = () => {
                contador.textContent = textarea.value.length;
            };
            
            textarea.addEventListener('input', atualizarContador);
            atualizarContador(); // Inicial
        }
    },
    
    configurarValidacao() {
        const form = document.getElementById('form-resposta-cotacao');
        const campos = form.querySelectorAll('input[required], select[required]');
        
        campos.forEach(campo => {
            campo.addEventListener('blur', () => {
                this.validarCampo(campo);
            });
        });
    },
    
    configurarSubmit() {
        const form = document.getElementById('form-resposta-cotacao');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.enviarResposta();
        });
    },
    
    // ==================== VALIDAÇÃO ====================
    
    validarCampo(campo) {
        const errorDiv = campo.parentNode.querySelector('.error-message');
        let isValid = true;
        let mensagem = '';
        
        // Limpar erro anterior
        campo.classList.remove('border-red-500');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
        
        // Validar campo obrigatório
        if (campo.hasAttribute('required') && !campo.value.trim()) {
            isValid = false;
            mensagem = 'Este campo é obrigatório';
        }
        
        // Validações específicas
        if (campo.name === 'valor_frete' && campo.value) {
            const valor = this.extrairValorMonetario(campo.value);
            if (valor <= 0) {
                isValid = false;
                mensagem = 'Valor deve ser maior que zero';
            }
        }
        
        if (campo.name === 'prazo_entrega' && campo.value) {
            const prazo = parseInt(campo.value);
            if (prazo < 1 || prazo > 365) {
                isValid = false;
                mensagem = 'Prazo deve ser entre 1 e 365 dias';
            }
        }
        
        // Mostrar erro se inválido
        if (!isValid) {
            campo.classList.add('border-red-500');
            if (errorDiv) {
                errorDiv.textContent = mensagem;
                errorDiv.classList.remove('hidden');
            }
        }
        
        return isValid;
    },
    
    validarFormulario() {
        const form = document.getElementById('form-resposta-cotacao');
        const campos = form.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        campos.forEach(campo => {
            if (!this.validarCampo(campo)) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    // ==================== ENVIO ====================
    
    async enviarResposta() {
        if (!this.validarFormulario()) {
            this.mostrarErro('Por favor, corrija os erros no formulário');
            return;
        }
        
        const btn = document.getElementById('btn-enviar-resposta');
        const textoOriginal = btn.innerHTML;
        
        try {
            // Loading
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
            
            // Coletar dados
            const dados = this.coletarDadosFormulario();
            
            // Enviar via API
            const response = await API.responderCotacao(this.cotacaoAtual.id, dados);
            
            if (response.success) {
                this.mostrarSucesso('Resposta enviada com sucesso!');
                this.fechar();
                
                // Recarregar lista de cotações
                if (window.CotacoesManager) {
                    window.CotacoesManager.carregarCotacoes();
                }
            } else {
                throw new Error(response.message || 'Erro ao enviar resposta');
            }
            
        } catch (error) {
            console.error('Erro ao enviar resposta:', error);
            this.mostrarErro('Erro ao enviar resposta: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = textoOriginal;
        }
    },
    
    coletarDadosFormulario() {
        const form = document.getElementById('form-resposta-cotacao');
        const formData = new FormData(form);
        
        const dados = {
            valor_frete: this.extrairValorMonetario(formData.get('valor_frete')),
            prazo_entrega: parseInt(formData.get('prazo_entrega')),
            empresa_prestadora: formData.get('empresa_prestadora'),
            tipo_servico: formData.get('tipo_servico'),
            seguro_incluso: formData.get('seguro_incluso') === 'sim',
            observacoes_resposta: formData.get('observacoes_resposta')
        };
        
        return dados;
    },
    
    // ==================== FUNÇÕES AUXILIARES ====================
    
    criarModalBase() {
        const existente = document.getElementById('modal-resposta-melhorado');
        if (existente) {
            existente.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'modal-resposta-melhorado';
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        return modal;
    },
    
    mostrarModal() {
        const modal = document.getElementById('modal-resposta-melhorado');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },
    
    fechar() {
        const modal = document.getElementById('modal-resposta-melhorado');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },
    
    async carregarEmpresas() {
        try {
            if (window.API && typeof API.getEmpresas === 'function') {
                const response = await API.getEmpresas();
                this.empresas = response.data || [];
            } else {
                // Empresas padrão
                this.empresas = [
                    { id: 1, nome: 'BRCargo Transportes' },
                    { id: 2, nome: 'Logística Express' },
                    { id: 3, nome: 'TransBrasil' }
                ];
            }
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
            this.empresas = [];
        }
    },
    
    renderizarOpcoesEmpresas(selecionada) {
        return this.empresas.map(empresa => 
            `<option value="${empresa.nome}" ${empresa.nome === selecionada ? 'selected' : ''}>
                ${empresa.nome}
            </option>`
        ).join('');
    },
    
    getModalidadeDisplay(modalidade) {
        const map = {
            'brcargo_rodoviario': 'BRCargo Rodoviário',
            'brcargo_maritimo': 'BRCargo Marítimo',
            'frete_aereo': 'Frete Aéreo'
        };
        return map[modalidade] || modalidade;
    },
    
    formatarEndereco(cotacao, tipo) {
        const cidade = cotacao[`${tipo}_cidade`];
        const estado = cotacao[`${tipo}_estado`];
        const porto = cotacao[`${tipo}_porto`];
        
        if (porto) return porto;
        if (cidade && estado) return `${cidade}/${estado}`;
        return 'N/A';
    },
    
    extrairValorMonetario(valor) {
        if (!valor) return 0;
        return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    },
    
    configurarEventListeners() {
        // Event listeners específicos já configurados
    },
    
    mostrarErro(mensagem) {
        alert(mensagem); // Substituir por sistema de notificações
    },
    
    mostrarSucesso(mensagem) {
        alert(mensagem); // Substituir por sistema de notificações
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    ModalRespostaMelhorado.init();
});

// Exportar para uso global
window.ModalRespostaMelhorado = ModalRespostaMelhorado;
