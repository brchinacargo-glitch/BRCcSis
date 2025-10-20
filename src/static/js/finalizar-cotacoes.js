// ==================== SISTEMA DE FINALIZAÇÃO ====================
// Sistema para consultores aprovarem/recusarem respostas de cotações

console.log('✅ Sistema Finalização v1.0');

const FinalizarCotacoes = {
    cotacaoAtual: null,
    
    init() {
        console.log('🚀 Inicializando sistema de finalização...');
        this.setupEventListeners();
        this.createModals();
    },
    
    setupEventListeners() {
        // Event delegation para botões de finalização
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="aprovar-cotacao"]')) {
                const cotacaoId = parseInt(e.target.dataset.cotacaoId);
                this.abrirModalAprovar(cotacaoId);
            }
            
            if (e.target.matches('[data-action="recusar-cotacao"]')) {
                const cotacaoId = parseInt(e.target.dataset.cotacaoId);
                this.abrirModalRecusar(cotacaoId);
            }
            
            if (e.target.matches('[data-action="ver-resposta"]')) {
                const cotacaoId = parseInt(e.target.dataset.cotacaoId);
                this.verResposta(cotacaoId);
            }
        });
    },
    
    createModals() {
        // Modal de Aprovação
        const modalAprovar = document.createElement('div');
        modalAprovar.id = 'modal-aprovar-cotacao';
        modalAprovar.className = 'modal';
        modalAprovar.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                <div class="modal-header bg-green-600 text-white p-4 rounded-t-lg">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">
                            <i class="fas fa-check-circle mr-2"></i>Aprovar Cotação
                        </h3>
                        <button class="modal-close text-white hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="modal-body p-6">
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4">Resumo da Cotação</h4>
                        <div id="resumo-aprovar" class="bg-gray-50 p-4 rounded-lg mb-4">
                            <!-- Será preenchido dinamicamente -->
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4">Resposta do Operador</h4>
                        <div id="resposta-operador" class="bg-blue-50 p-4 rounded-lg mb-4">
                            <!-- Será preenchido dinamicamente -->
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Observações da Aprovação (opcional)
                        </label>
                        <textarea 
                            id="observacoes-aprovacao" 
                            rows="3" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Comentários sobre a aprovação..."
                            maxlength="300"
                        ></textarea>
                        <div class="text-right text-sm text-gray-500 mt-1">
                            <span id="contador-aprovacao">0</span>/300 caracteres
                        </div>
                    </div>
                    
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p class="text-sm text-green-800">
                            <i class="fas fa-info-circle mr-2"></i>
                            Ao aprovar, a cotação será finalizada e o cliente será notificado com os valores e prazos.
                        </p>
                    </div>
                </div>
                <div class="modal-footer p-4 border-t flex justify-end gap-3">
                    <button id="btn-cancelar-aprovacao" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                        Cancelar
                    </button>
                    <button id="btn-confirmar-aprovacao" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-check mr-2"></i>Aprovar e Finalizar
                    </button>
                </div>
            </div>
        `;
        
        // Modal de Recusa
        const modalRecusar = document.createElement('div');
        modalRecusar.id = 'modal-recusar-cotacao';
        modalRecusar.className = 'modal';
        modalRecusar.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                <div class="modal-header bg-red-600 text-white p-4 rounded-t-lg">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">
                            <i class="fas fa-times-circle mr-2"></i>Recusar Resposta
                        </h3>
                        <button class="modal-close text-white hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="modal-body p-6">
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4">Resumo da Cotação</h4>
                        <div id="resumo-recusar" class="bg-gray-50 p-4 rounded-lg mb-4">
                            <!-- Será preenchido dinamicamente -->
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4">Resposta do Operador</h4>
                        <div id="resposta-operador-recusar" class="bg-blue-50 p-4 rounded-lg mb-4">
                            <!-- Será preenchido dinamicamente -->
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Motivo da Recusa *
                        </label>
                        <select id="motivo-recusa" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3">
                            <option value="">Selecione um motivo</option>
                            <option value="valor_alto">Valor muito alto</option>
                            <option value="prazo_longo">Prazo muito longo</option>
                            <option value="empresa_inadequada">Empresa prestadora inadequada</option>
                            <option value="informacoes_incompletas">Informações incompletas</option>
                            <option value="cliente_cancelou">Cliente cancelou a solicitação</option>
                            <option value="outros">Outros motivos</option>
                        </select>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Observações da Recusa *
                        </label>
                        <textarea 
                            id="observacoes-recusa" 
                            rows="4" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Explique o motivo da recusa e orientações para o operador..."
                            maxlength="500"
                            required
                        ></textarea>
                        <div class="text-right text-sm text-gray-500 mt-1">
                            <span id="contador-recusa">0</span>/500 caracteres
                        </div>
                    </div>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p class="text-sm text-yellow-800">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            Ao recusar, a cotação voltará para o operador para nova resposta. O cliente não será notificado.
                        </p>
                    </div>
                </div>
                <div class="modal-footer p-4 border-t flex justify-end gap-3">
                    <button id="btn-cancelar-recusa" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                        Cancelar
                    </button>
                    <button id="btn-confirmar-recusa" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <i class="fas fa-times mr-2"></i>Recusar Resposta
                    </button>
                </div>
            </div>
        `;
        
        // Modal de Visualização de Resposta
        const modalVerResposta = document.createElement('div');
        modalVerResposta.id = 'modal-ver-resposta';
        modalVerResposta.className = 'modal';
        modalVerResposta.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4">
                <div class="modal-header bg-blue-600 text-white p-4 rounded-t-lg">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">
                            <i class="fas fa-eye mr-2"></i>Visualizar Resposta
                        </h3>
                        <button class="modal-close text-white hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="modal-body p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 class="text-lg font-semibold text-gray-800 mb-4">Dados da Cotação</h4>
                            <div id="dados-cotacao-visualizar" class="bg-gray-50 p-4 rounded-lg">
                                <!-- Será preenchido dinamicamente -->
                            </div>
                        </div>
                        <div>
                            <h4 class="text-lg font-semibold text-gray-800 mb-4">Resposta do Operador</h4>
                            <div id="resposta-visualizar" class="bg-blue-50 p-4 rounded-lg">
                                <!-- Será preenchido dinamicamente -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer p-4 border-t flex justify-end gap-3">
                    <button class="modal-close px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                        Fechar
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar modais ao body
        document.body.appendChild(modalAprovar);
        document.body.appendChild(modalRecusar);
        document.body.appendChild(modalVerResposta);
        
        this.setupModalListeners();
    },
    
    setupModalListeners() {
        // Modal Aprovar
        document.getElementById('btn-cancelar-aprovacao')?.addEventListener('click', () => {
            this.fecharModal('modal-aprovar-cotacao');
        });
        
        document.getElementById('btn-confirmar-aprovacao')?.addEventListener('click', () => {
            this.confirmarAprovacao();
        });
        
        // Modal Recusar
        document.getElementById('btn-cancelar-recusa')?.addEventListener('click', () => {
            this.fecharModal('modal-recusar-cotacao');
        });
        
        document.getElementById('btn-confirmar-recusa')?.addEventListener('click', () => {
            this.confirmarRecusa();
        });
        
        // Contadores de caracteres
        document.getElementById('observacoes-aprovacao')?.addEventListener('input', (e) => {
            this.atualizarContador(e.target, 'contador-aprovacao');
        });
        
        document.getElementById('observacoes-recusa')?.addEventListener('input', (e) => {
            this.atualizarContador(e.target, 'contador-recusa');
        });
        
        // Fechar modais - APENAS pelo botão X
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close')) {
                const modal = e.target.closest('.modal');
                if (modal && modal.id.includes('finalizar')) {
                    this.fecharModal(modal.id);
                }
            }
            
            // REMOVIDO: Fechar ao clicar fora do modal
            // Modal só deve fechar pelo botão X
        });
    },
    
    abrirModalAprovar(cotacaoId) {
        const cotacao = this.getCotacao(cotacaoId);
        if (!cotacao || cotacao.status !== 'cotacao_enviada') {
            alert('Esta cotação não pode ser aprovada no momento');
            return;
        }
        
        this.cotacaoAtual = cotacaoId;
        this.preencherResumoAprovacao(cotacao);
        this.limparCamposAprovacao();
        this.abrirModal('modal-aprovar-cotacao');
    },
    
    abrirModalRecusar(cotacaoId) {
        const cotacao = this.getCotacao(cotacaoId);
        if (!cotacao || cotacao.status !== 'cotacao_enviada') {
            alert('Esta cotação não pode ser recusada no momento');
            return;
        }
        
        this.cotacaoAtual = cotacaoId;
        this.preencherResumoRecusa(cotacao);
        this.limparCamposRecusa();
        this.abrirModal('modal-recusar-cotacao');
    },
    
    verResposta(cotacaoId) {
        const cotacao = this.getCotacao(cotacaoId);
        if (!cotacao || !cotacao.resposta) {
            alert('Resposta não encontrada');
            return;
        }
        
        this.preencherVisualizacao(cotacao);
        this.abrirModal('modal-ver-resposta');
    },
    
    preencherResumoAprovacao(cotacao) {
        const resumo = document.getElementById('resumo-aprovar');
        const resposta = document.getElementById('resposta-operador');
        
        resumo.innerHTML = this.gerarResumoHTML(cotacao);
        resposta.innerHTML = this.gerarRespostaHTML(cotacao.resposta);
    },
    
    preencherResumoRecusa(cotacao) {
        const resumo = document.getElementById('resumo-recusar');
        const resposta = document.getElementById('resposta-operador-recusar');
        
        resumo.innerHTML = this.gerarResumoHTML(cotacao);
        resposta.innerHTML = this.gerarRespostaHTML(cotacao.resposta);
    },
    
    preencherVisualizacao(cotacao) {
        const dados = document.getElementById('dados-cotacao-visualizar');
        const resposta = document.getElementById('resposta-visualizar');
        
        dados.innerHTML = this.gerarResumoHTML(cotacao);
        resposta.innerHTML = this.gerarRespostaHTML(cotacao.resposta);
    },
    
    gerarResumoHTML(cotacao) {
        return `
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="font-medium">Cotação:</span>
                    <span>${cotacao.numero}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Cliente:</span>
                    <span>${cotacao.cliente}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Modalidade:</span>
                    <span>${this.getModalidadeLabel(cotacao.modalidade)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Origem:</span>
                    <span>${cotacao.origem}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Destino:</span>
                    <span>${cotacao.destino}</span>
                </div>
            </div>
        `;
    },
    
    gerarRespostaHTML(resposta) {
        if (!resposta) return '<p class="text-gray-500">Nenhuma resposta encontrada</p>';
        
        return `
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="font-medium">Valor do Frete:</span>
                    <span class="text-green-600 font-bold">R$ ${resposta.valor_frete.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Prazo:</span>
                    <span>${resposta.prazo_entrega} dias úteis</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Empresa:</span>
                    <span>${this.getEmpresaLabel(resposta.empresa_prestadora)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Tipo de Serviço:</span>
                    <span>${this.getTipoServicoLabel(resposta.tipo_servico)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium">Seguro:</span>
                    <span>${resposta.seguro_incluso ? 'Incluso' : 'Não incluso'}</span>
                </div>
                ${resposta.observacoes ? `
                    <div>
                        <span class="font-medium">Observações:</span>
                        <p class="text-sm text-gray-600 mt-1">${resposta.observacoes}</p>
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    confirmarAprovacao() {
        const observacoes = document.getElementById('observacoes-aprovacao').value;
        
        const cotacao = this.getCotacao(this.cotacaoAtual);
        if (cotacao) {
            cotacao.status = 'finalizada';
            cotacao.aprovacao = {
                data: new Date().toLocaleDateString(),
                observacoes: observacoes
            };
            
            this.salvarEAtualizar();
            this.fecharModal('modal-aprovar-cotacao');
            this.mostrarSucesso('Cotação aprovada e finalizada! Cliente será notificado.');
        }
    },
    
    confirmarRecusa() {
        const motivo = document.getElementById('motivo-recusa').value;
        const observacoes = document.getElementById('observacoes-recusa').value;
        
        if (!motivo) {
            alert('Por favor, selecione um motivo para a recusa.');
            return;
        }
        
        if (!observacoes.trim()) {
            alert('Por favor, adicione observações sobre a recusa.');
            return;
        }
        
        const cotacao = this.getCotacao(this.cotacaoAtual);
        if (cotacao) {
            cotacao.status = 'aceita_operador'; // Volta para o operador
            cotacao.recusa_consultor = {
                data: new Date().toLocaleDateString(),
                motivo: motivo,
                observacoes: observacoes
            };
            
            this.salvarEAtualizar();
            this.fecharModal('modal-recusar-cotacao');
            this.mostrarSucesso('Resposta recusada. Operador será notificado para nova resposta.');
        }
    },
    
    limparCamposAprovacao() {
        document.getElementById('observacoes-aprovacao').value = '';
        this.atualizarContador(document.getElementById('observacoes-aprovacao'), 'contador-aprovacao');
    },
    
    limparCamposRecusa() {
        document.getElementById('motivo-recusa').value = '';
        document.getElementById('observacoes-recusa').value = '';
        this.atualizarContador(document.getElementById('observacoes-recusa'), 'contador-recusa');
    },
    
    atualizarContador(textarea, contadorId) {
        const contador = document.getElementById(contadorId);
        if (contador) {
            contador.textContent = textarea.value.length;
        }
    },
    
    salvarEAtualizar() {
        if (window.Cotacoes) {
            Cotacoes.saveToStorage();
            Cotacoes.render();
            
            // Atualizar dashboard
            if (window.Dashboard && typeof Dashboard.refresh === 'function') {
                Dashboard.refresh();
            }
        }
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
    
    getEmpresaLabel(empresa) {
        const labels = {
            'transportadora-a': 'Transportadora A',
            'transportadora-b': 'Transportadora B',
            'transportadora-c': 'Transportadora C',
            'logistica-express': 'Logística Express',
            'cargo-rapido': 'Cargo Rápido'
        };
        return labels[empresa] || empresa;
    },
    
    getTipoServicoLabel(tipo) {
        const labels = {
            'normal': 'Normal',
            'expresso': 'Expresso',
            'economico': 'Econômico'
        };
        return labels[tipo] || tipo;
    },
    
    abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    },
    
    fecharModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
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
window.FinalizarCotacoes = FinalizarCotacoes;

console.log('✅ Sistema de finalização carregado');
