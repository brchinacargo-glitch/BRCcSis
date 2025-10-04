// ==================== SISTEMA DE MENSAGENS E REATRIBUIÇÃO ====================
// Sistema completo para reatribuir cotações e trocar mensagens entre operadores

const SistemaMensagens = {
    // Estado
    conversaAtual: null,
    operadores: [],
    mensagens: [],
    
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.carregarOperadores();
        this.setupEventListeners();
        console.log('✅ Sistema de Mensagens inicializado');
    },
    
    setupEventListeners() {
        // Escutar eventos de reatribuição
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-reatribuir')) {
                const cotacaoId = e.target.dataset.cotacaoId;
                this.abrirModalReatribuicao(cotacaoId);
            }
        });
    },
    
    // ==================== MODAL DE REATRIBUIÇÃO ====================
    
    async abrirModalReatribuicao(cotacaoId) {
        try {
            // Carregar dados da cotação
            const response = await API.getCotacaoById(cotacaoId);
            const cotacao = response.data || response;
            
            this.renderizarModalReatribuicao(cotacao);
            this.mostrarModal();
            
        } catch (error) {
            console.error('Erro ao abrir modal de reatribuição:', error);
            this.mostrarErro('Erro ao carregar dados da cotação');
        }
    },
    
    renderizarModalReatribuicao(cotacao) {
        const modal = this.criarModalBase();
        
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="modal-header bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold">
                                <i class="fas fa-exchange-alt mr-3"></i>
                                Reatribuir Cotação #${cotacao.numero_cotacao || cotacao.id}
                            </h2>
                            <p class="text-purple-100 mt-1">Transferir responsabilidade para outro operador</p>
                        </div>
                        <button class="fechar-modal-mensagens text-white hover:text-gray-200 text-3xl font-bold">
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
                        
                        <!-- Formulário de Reatribuição -->
                        <div class="lg:col-span-2">
                            ${this.renderizarFormularioReatribuicao(cotacao)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.configurarEventListeners(cotacao);
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
                        <span class="text-gray-600">Status:</span>
                        <span class="status-badge status-${cotacao.status}">${this.getStatusDisplay(cotacao.status)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Modalidade:</span>
                        <span class="font-medium">${this.getModalidadeDisplay(cotacao.modalidade)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Operador Atual:</span>
                        <span class="font-medium text-purple-600">${cotacao.operador_nome || 'Não atribuído'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Data Criação:</span>
                        <span class="font-medium">${this.formatarData(cotacao.data_criacao)}</span>
                    </div>
                </div>
                
                <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 class="font-medium text-blue-800 mb-2">Origem → Destino</h4>
                    <p class="text-sm text-blue-700">
                        ${this.formatarEndereco(cotacao, 'origem')} 
                        <i class="fas fa-arrow-right mx-2"></i>
                        ${this.formatarEndereco(cotacao, 'destino')}
                    </p>
                </div>
                
                <!-- Histórico de Reatribuições -->
                <div class="mt-6">
                    <h4 class="font-medium text-gray-800 mb-3">Histórico de Reatribuições</h4>
                    <div id="historico-reatribuicoes" class="space-y-2 max-h-32 overflow-y-auto">
                        ${this.renderizarHistoricoReatribuicoes(cotacao)}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderizarFormularioReatribuicao(cotacao) {
        return `
            <form id="form-reatribuicao" class="space-y-6">
                <!-- Seleção do Operador -->
                <div class="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-user-friends text-purple-600 mr-2"></i>
                        Novo Operador Responsável
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Selecionar Operador *
                            </label>
                            <select 
                                name="novo_operador" 
                                id="novo_operador"
                                required
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="">Selecione um operador...</option>
                                ${this.renderizarOpcoesOperadores(cotacao.operador_id)}
                            </select>
                            <div class="error-message text-red-600 text-sm mt-1 hidden"></div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Prioridade
                            </label>
                            <select 
                                name="prioridade" 
                                id="prioridade"
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="normal">Normal</option>
                                <option value="alta">Alta</option>
                                <option value="urgente">Urgente</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Mensagem -->
                <div class="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-comment-alt text-blue-600 mr-2"></i>
                        Mensagem para o Operador
                    </h3>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Motivo da Reatribuição *
                        </label>
                        <textarea 
                            name="motivo_reatribuicao" 
                            id="motivo_reatribuicao"
                            required
                            rows="4"
                            maxlength="500"
                            placeholder="Explique o motivo da reatribuição e instruções especiais..."
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        ></textarea>
                        <div class="flex justify-between mt-1">
                            <div class="error-message text-red-600 text-sm hidden"></div>
                            <div class="text-sm text-gray-500">
                                <span id="contador-motivo">0</span>/500 caracteres
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Instruções Adicionais
                        </label>
                        <textarea 
                            name="instrucoes" 
                            id="instrucoes"
                            rows="3"
                            maxlength="300"
                            placeholder="Instruções específicas, prazos, observações..."
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        ></textarea>
                        <div class="text-sm text-gray-500 mt-1">
                            <span id="contador-instrucoes">0</span>/300 caracteres
                        </div>
                    </div>
                </div>
                
                <!-- Configurações -->
                <div class="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-cog text-gray-600 mr-2"></i>
                        Configurações da Reatribuição
                    </h3>
                    
                    <div class="space-y-4">
                        <div class="flex items-center">
                            <input 
                                type="checkbox" 
                                id="notificar_email" 
                                name="notificar_email"
                                checked
                                class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            >
                            <label for="notificar_email" class="ml-2 block text-sm text-gray-700">
                                Enviar notificação por email
                            </label>
                        </div>
                        
                        <div class="flex items-center">
                            <input 
                                type="checkbox" 
                                id="manter_historico" 
                                name="manter_historico"
                                checked
                                class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            >
                            <label for="manter_historico" class="ml-2 block text-sm text-gray-700">
                                Manter no histórico de conversas
                            </label>
                        </div>
                        
                        <div class="flex items-center">
                            <input 
                                type="checkbox" 
                                id="prazo_resposta" 
                                name="prazo_resposta"
                                class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            >
                            <label for="prazo_resposta" class="ml-2 block text-sm text-gray-700">
                                Definir prazo para resposta
                            </label>
                        </div>
                        
                        <div id="campo-prazo" class="ml-6 hidden">
                            <input 
                                type="datetime-local" 
                                name="prazo_limite" 
                                id="prazo_limite"
                                class="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                        </div>
                    </div>
                </div>
                
                <!-- Botões de Ação -->
                <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button 
                        type="button" 
                        class="fechar-modal-mensagens px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        id="btn-reatribuir"
                        class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                        <i class="fas fa-exchange-alt mr-2"></i>
                        Reatribuir Cotação
                    </button>
                </div>
            </form>
        `;
    },
    
    // ==================== CONFIGURAÇÕES ====================
    
    configurarEventListeners(cotacao) {
        // Contador de caracteres
        this.configurarContadores();
        
        // Checkbox de prazo
        document.getElementById('prazo_resposta').addEventListener('change', (e) => {
            const campoPrazo = document.getElementById('campo-prazo');
            if (e.target.checked) {
                campoPrazo.classList.remove('hidden');
                // Definir prazo padrão para 24h
                const agora = new Date();
                agora.setHours(agora.getHours() + 24);
                document.getElementById('prazo_limite').value = agora.toISOString().slice(0, 16);
            } else {
                campoPrazo.classList.add('hidden');
            }
        });
        
        // Submit do formulário
        document.getElementById('form-reatribuicao').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processarReatribuicao(cotacao);
        });
        
        // Fechar modal
        document.addEventListener('click', (e) => {
            if (e.target.id === 'modal-mensagens' || e.target.classList.contains('fechar-modal-mensagens')) {
                this.fecharModal();
            }
        });
    },
    
    configurarContadores() {
        const motivo = document.getElementById('motivo_reatribuicao');
        const instrucoes = document.getElementById('instrucoes');
        const contadorMotivo = document.getElementById('contador-motivo');
        const contadorInstrucoes = document.getElementById('contador-instrucoes');
        
        motivo.addEventListener('input', () => {
            contadorMotivo.textContent = motivo.value.length;
        });
        
        instrucoes.addEventListener('input', () => {
            contadorInstrucoes.textContent = instrucoes.value.length;
        });
    },
    
    // ==================== PROCESSAMENTO ====================
    
    async processarReatribuicao(cotacao) {
        if (!this.validarFormulario()) {
            return;
        }
        
        const btn = document.getElementById('btn-reatribuir');
        const textoOriginal = btn.innerHTML;
        
        try {
            // Loading
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';
            
            // Coletar dados
            const dados = this.coletarDadosReatribuicao(cotacao);
            
            // Enviar via API
            const response = await API.reatribuirCotacao(cotacao.id, dados);
            
            if (response.success) {
                this.mostrarSucesso('Cotação reatribuída com sucesso!');
                this.fecharModal();
                
                // Recarregar dados
                if (window.CotacoesManager) {
                    window.CotacoesManager.carregarCotacoes();
                }
                
                // Abrir chat se solicitado
                if (dados.manter_historico) {
                    setTimeout(() => {
                        this.abrirChatReatribuicao(cotacao.id, dados.novo_operador);
                    }, 1000);
                }
                
            } else {
                throw new Error(response.message || 'Erro ao reatribuir cotação');
            }
            
        } catch (error) {
            console.error('Erro ao reatribuir cotação:', error);
            this.mostrarErro('Erro ao reatribuir cotação: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = textoOriginal;
        }
    },
    
    coletarDadosReatribuicao(cotacao) {
        const form = document.getElementById('form-reatribuicao');
        const formData = new FormData(form);
        
        return {
            cotacao_id: cotacao.id,
            operador_anterior: cotacao.operador_id,
            novo_operador: formData.get('novo_operador'),
            prioridade: formData.get('prioridade'),
            motivo_reatribuicao: formData.get('motivo_reatribuicao'),
            instrucoes: formData.get('instrucoes'),
            notificar_email: formData.get('notificar_email') === 'on',
            manter_historico: formData.get('manter_historico') === 'on',
            prazo_resposta: formData.get('prazo_resposta') === 'on',
            prazo_limite: formData.get('prazo_limite') || null,
            data_reatribuicao: new Date().toISOString()
        };
    },
    
    // ==================== CHAT DE REATRIBUIÇÃO ====================
    
    abrirChatReatribuicao(cotacaoId, operadorId) {
        const modal = this.criarModalBase('modal-chat-reatribuicao');
        
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <!-- Header -->
                <div class="modal-header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold">
                            <i class="fas fa-comments mr-2"></i>
                            Conversa sobre Cotação #${cotacaoId}
                        </h3>
                        <button class="fechar-chat text-white hover:text-gray-200 text-2xl font-bold">
                            &times;
                        </button>
                    </div>
                </div>
                
                <!-- Mensagens -->
                <div id="chat-mensagens" class="h-96 overflow-y-auto p-4 bg-gray-50">
                    <div class="text-center text-gray-500 text-sm">
                        Conversa iniciada sobre a reatribuição da cotação
                    </div>
                </div>
                
                <!-- Input de mensagem -->
                <div class="p-4 border-t border-gray-200">
                    <div class="flex space-x-2">
                        <input 
                            type="text" 
                            id="nova-mensagem"
                            placeholder="Digite sua mensagem..."
                            class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                        <button 
                            id="enviar-mensagem"
                            class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners do chat
        this.configurarChat(cotacaoId, operadorId);
        
        // Mostrar modal
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    },
    
    configurarChat(cotacaoId, operadorId) {
        const input = document.getElementById('nova-mensagem');
        const btnEnviar = document.getElementById('enviar-mensagem');
        
        // Enviar mensagem
        const enviarMensagem = () => {
            const mensagem = input.value.trim();
            if (mensagem) {
                this.adicionarMensagem(mensagem, 'enviada');
                input.value = '';
                
                // Simular resposta (em produção, seria via WebSocket)
                setTimeout(() => {
                    this.adicionarMensagem('Mensagem recebida, vou analisar a cotação.', 'recebida');
                }, 2000);
            }
        };
        
        btnEnviar.addEventListener('click', enviarMensagem);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                enviarMensagem();
            }
        });
        
        // Fechar chat
        document.querySelector('.fechar-chat').addEventListener('click', () => {
            document.getElementById('modal-chat-reatribuicao').remove();
        });
    },
    
    adicionarMensagem(texto, tipo) {
        const container = document.getElementById('chat-mensagens');
        const mensagem = document.createElement('div');
        
        const isEnviada = tipo === 'enviada';
        mensagem.className = `mb-3 ${isEnviada ? 'text-right' : 'text-left'}`;
        
        mensagem.innerHTML = `
            <div class="inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isEnviada 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-800 border border-gray-200'
            }">
                ${texto}
            </div>
            <div class="text-xs text-gray-500 mt-1">
                ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
        `;
        
        container.appendChild(mensagem);
        container.scrollTop = container.scrollHeight;
    },
    
    // ==================== FUNÇÕES AUXILIARES ====================
    
    async carregarOperadores() {
        try {
            if (window.API && typeof API.getOperadores === 'function') {
                const response = await API.getOperadores();
                this.operadores = response.operadores || [];
            } else {
                // Operadores padrão
                this.operadores = [
                    { id: 1, nome: 'João Silva', email: 'joao@empresa.com' },
                    { id: 2, nome: 'Maria Santos', email: 'maria@empresa.com' },
                    { id: 3, nome: 'Pedro Costa', email: 'pedro@empresa.com' },
                    { id: 4, nome: 'Ana Oliveira', email: 'ana@empresa.com' }
                ];
            }
        } catch (error) {
            console.error('Erro ao carregar operadores:', error);
            this.operadores = [];
        }
    },
    
    renderizarOpcoesOperadores(operadorAtualId) {
        return this.operadores
            .filter(op => op.id != operadorAtualId)
            .map(operador => `
                <option value="${operador.id}">${operador.nome}</option>
            `).join('');
    },
    
    renderizarHistoricoReatribuicoes(cotacao) {
        // Em produção, viria da API
        const historico = cotacao.historico_reatribuicoes || [];
        
        if (historico.length === 0) {
            return '<p class="text-sm text-gray-500">Nenhuma reatribuição anterior</p>';
        }
        
        return historico.map(item => `
            <div class="text-xs p-2 bg-white rounded border">
                <div class="font-medium">${item.operador_anterior} → ${item.operador_novo}</div>
                <div class="text-gray-500">${this.formatarData(item.data)}</div>
            </div>
        `).join('');
    },
    
    criarModalBase(id = 'modal-mensagens') {
        const existente = document.getElementById(id);
        if (existente) {
            existente.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        return modal;
    },
    
    mostrarModal() {
        const modal = document.getElementById('modal-mensagens');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },
    
    fecharModal() {
        const modal = document.getElementById('modal-mensagens');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },
    
    validarFormulario() {
        const novoOperador = document.getElementById('novo_operador').value;
        const motivo = document.getElementById('motivo_reatribuicao').value.trim();
        
        if (!novoOperador) {
            this.mostrarErro('Selecione um operador para reatribuição');
            return false;
        }
        
        if (!motivo) {
            this.mostrarErro('Informe o motivo da reatribuição');
            return false;
        }
        
        return true;
    },
    
    getStatusDisplay(status) {
        const statusMap = {
            'solicitada': 'Solicitada',
            'aceita_operador': 'Aceita pelo Operador',
            'cotacao_enviada': 'Cotação Enviada',
            'aceita_consultor': 'Aceita pelo Consultor',
            'negada_consultor': 'Negada',
            'finalizada': 'Finalizada'
        };
        return statusMap[status] || status;
    },
    
    getModalidadeDisplay(modalidade) {
        const modalidadeMap = {
            'brcargo_rodoviario': 'BRCargo Rodoviário',
            'brcargo_maritimo': 'BRCargo Marítimo',
            'frete_aereo': 'Frete Aéreo'
        };
        return modalidadeMap[modalidade] || modalidade;
    },
    
    formatarData(data) {
        if (!data) return 'N/A';
        return new Date(data).toLocaleDateString('pt-BR');
    },
    
    formatarEndereco(cotacao, tipo) {
        const cidade = cotacao[`${tipo}_cidade`];
        const estado = cotacao[`${tipo}_estado`];
        const porto = cotacao[`${tipo}_porto`];
        
        if (porto) return porto;
        if (cidade && estado) return `${cidade}/${estado}`;
        return 'N/A';
    },
    
    mostrarSucesso(mensagem) {
        alert(mensagem); // Substituir por sistema de notificações
    },
    
    mostrarErro(mensagem) {
        alert(mensagem); // Substituir por sistema de notificações
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    SistemaMensagens.init();
});

// Exportar para uso global
window.SistemaMensagens = SistemaMensagens;
