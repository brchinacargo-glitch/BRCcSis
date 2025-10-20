// ==================== SISTEMA ACEITAR/NEGAR COTAÇÕES ====================
// Sistema profissional para aceitar e negar cotações

console.log('✅ Sistema Aceitar/Negar Cotações v1.0');

const AceitarNegarCotacoes = {
    init() {
        console.log('🚀 Inicializando sistema aceitar/negar...');
        this.setupEventListeners();
        this.createModals();
    },
    
    setupEventListeners() {
        // Event delegation para botões dinâmicos
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="aceitar-cotacao"]')) {
                const cotacaoId = parseInt(e.target.dataset.cotacaoId);
                this.abrirModalAceitar(cotacaoId);
            }
            
            if (e.target.matches('[data-action="negar-cotacao"]')) {
                const cotacaoId = parseInt(e.target.dataset.cotacaoId);
                this.abrirModalNegar(cotacaoId);
            }
        });
    },
    
    createModals() {
        // Modal de Aceitar
        const modalAceitar = document.createElement('div');
        modalAceitar.id = 'modal-aceitar-cotacao';
        modalAceitar.className = 'modal';
        modalAceitar.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="modal-header bg-green-600 text-white p-4 rounded-t-lg">
                    <h3 class="text-lg font-semibold">Aceitar Cotação</h3>
                    <button class="modal-close float-right text-white hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body p-6">
                    <div class="mb-4">
                        <i class="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
                        <p class="text-gray-700 mb-4">Você está prestes a aceitar esta cotação:</p>
                        <div id="resumo-aceitar" class="bg-gray-50 p-4 rounded-lg mb-4">
                            <!-- Resumo será preenchido dinamicamente -->
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Observações (opcional)
                            </label>
                            <textarea 
                                id="observacoes-aceitar" 
                                rows="3" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Adicione observações sobre a aceitação..."
                            ></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer p-4 border-t flex justify-end gap-3">
                    <button id="btn-cancelar-aceitar" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                        Cancelar
                    </button>
                    <button id="btn-confirmar-aceitar" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-check mr-2"></i>Aceitar Cotação
                    </button>
                </div>
            </div>
        `;
        
        // Modal de Negar
        const modalNegar = document.createElement('div');
        modalNegar.id = 'modal-negar-cotacao';
        modalNegar.className = 'modal';
        modalNegar.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="modal-header bg-red-600 text-white p-4 rounded-t-lg">
                    <h3 class="text-lg font-semibold">Negar Cotação</h3>
                    <button class="modal-close float-right text-white hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body p-6">
                    <div class="mb-4">
                        <i class="fas fa-times-circle text-red-500 text-4xl mb-4"></i>
                        <p class="text-gray-700 mb-4">Você está prestes a negar esta cotação:</p>
                        <div id="resumo-negar" class="bg-gray-50 p-4 rounded-lg mb-4">
                            <!-- Resumo será preenchido dinamicamente -->
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Motivo da negação *
                            </label>
                            <select id="motivo-negacao" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3">
                                <option value="">Selecione um motivo</option>
                                <option value="fora_area">Fora da nossa área de atuação</option>
                                <option value="capacidade">Sem capacidade disponível</option>
                                <option value="tipo_carga">Tipo de carga não atendido</option>
                                <option value="prazo">Prazo incompatível</option>
                                <option value="valor">Valor não viável</option>
                                <option value="outros">Outros motivos</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Observações *
                            </label>
                            <textarea 
                                id="observacoes-negar" 
                                rows="3" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder="Explique o motivo da negação..."
                                required
                            ></textarea>
                        </div>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p class="text-sm text-yellow-800">
                                <i class="fas fa-exclamation-triangle mr-2"></i>
                                O cliente será notificado automaticamente sobre a negação.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer p-4 border-t flex justify-end gap-3">
                    <button id="btn-cancelar-negar" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                        Cancelar
                    </button>
                    <button id="btn-confirmar-negar" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <i class="fas fa-times mr-2"></i>Negar Cotação
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar estilos CSS para os modais
        this.addModalStyles();
        
        // Adicionar modais ao body
        document.body.appendChild(modalAceitar);
        document.body.appendChild(modalNegar);
        
        // Setup event listeners dos modais
        this.setupModalListeners();
    },
    
    setupModalListeners() {
        // Modal Aceitar
        const modalAceitar = document.getElementById('modal-aceitar-cotacao');
        const btnCancelarAceitar = document.getElementById('btn-cancelar-aceitar');
        const btnConfirmarAceitar = document.getElementById('btn-confirmar-aceitar');
        
        btnCancelarAceitar?.addEventListener('click', () => this.fecharModal('modal-aceitar-cotacao'));
        btnConfirmarAceitar?.addEventListener('click', () => this.confirmarAceitacao());
        
        // Modal Negar
        const modalNegar = document.getElementById('modal-negar-cotacao');
        const btnCancelarNegar = document.getElementById('btn-cancelar-negar');
        const btnConfirmarNegar = document.getElementById('btn-confirmar-negar');
        
        btnCancelarNegar?.addEventListener('click', () => this.fecharModal('modal-negar-cotacao'));
        btnConfirmarNegar?.addEventListener('click', () => this.confirmarNegacao());
        
        // Fechar modais - APENAS pelo botão X
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close')) {
                const modal = e.target.closest('.modal');
                if (modal) this.fecharModal(modal.id);
            }
            
            // REMOVIDO: Fechar ao clicar fora do modal
            // Modal só deve fechar pelo botão X
        });
    },
    
    abrirModalAceitar(cotacaoId) {
        const cotacao = this.getCotacao(cotacaoId);
        if (!cotacao) return;
        
        // Preencher resumo
        const resumo = document.getElementById('resumo-aceitar');
        resumo.innerHTML = `
            <p><strong>Cotação:</strong> ${cotacao.numero}</p>
            <p><strong>Cliente:</strong> ${cotacao.cliente}</p>
            <p><strong>Modalidade:</strong> ${cotacao.modalidade}</p>
            <p><strong>Origem:</strong> ${cotacao.origem}</p>
            <p><strong>Destino:</strong> ${cotacao.destino}</p>
        `;
        
        // Armazenar ID da cotação
        this.cotacaoAtual = cotacaoId;
        
        // Abrir modal
        this.abrirModal('modal-aceitar-cotacao');
    },
    
    abrirModalNegar(cotacaoId) {
        const cotacao = this.getCotacao(cotacaoId);
        if (!cotacao) return;
        
        // Preencher resumo
        const resumo = document.getElementById('resumo-negar');
        resumo.innerHTML = `
            <p><strong>Cotação:</strong> ${cotacao.numero}</p>
            <p><strong>Cliente:</strong> ${cotacao.cliente}</p>
            <p><strong>Modalidade:</strong> ${cotacao.modalidade}</p>
            <p><strong>Origem:</strong> ${cotacao.origem}</p>
            <p><strong>Destino:</strong> ${cotacao.destino}</p>
        `;
        
        // Limpar campos
        document.getElementById('motivo-negacao').value = '';
        document.getElementById('observacoes-negar').value = '';
        
        // Armazenar ID da cotação
        this.cotacaoAtual = cotacaoId;
        
        // Abrir modal
        this.abrirModal('modal-negar-cotacao');
    },
    
    confirmarAceitacao() {
        const observacoes = document.getElementById('observacoes-aceitar').value;
        
        // Aceitar cotação
        if (window.Cotacoes && typeof Cotacoes.accept === 'function') {
            // Usar sistema existente mas sem confirm
            const cotacao = this.getCotacao(this.cotacaoAtual);
            if (cotacao) {
                cotacao.status = 'aceita_operador';
                cotacao.observacoes_aceitacao = observacoes;
                Cotacoes.saveToStorage();
                Cotacoes.render();
                
                // Atualizar dashboard
                if (window.Dashboard && typeof Dashboard.refresh === 'function') {
                    Dashboard.refresh();
                }
                
                console.log('✅ Cotação aceita via modal:', this.cotacaoAtual);
            }
        }
        
        this.fecharModal('modal-aceitar-cotacao');
        
        // Mostrar sucesso
        this.mostrarSucesso('Cotação aceita com sucesso!');
    },
    
    confirmarNegacao() {
        const motivo = document.getElementById('motivo-negacao').value;
        const observacoes = document.getElementById('observacoes-negar').value;
        
        // Validar campos obrigatórios
        if (!motivo) {
            alert('Por favor, selecione um motivo para a negação.');
            return;
        }
        
        if (!observacoes.trim()) {
            alert('Por favor, adicione observações sobre a negação.');
            return;
        }
        
        // Negar cotação
        const cotacao = this.getCotacao(this.cotacaoAtual);
        if (cotacao) {
            cotacao.status = 'negada';
            cotacao.motivo_negacao = motivo;
            cotacao.observacoes_negacao = observacoes;
            Cotacoes.saveToStorage();
            Cotacoes.render();
            
            // Atualizar dashboard
            if (window.Dashboard && typeof Dashboard.refresh === 'function') {
                Dashboard.refresh();
            }
            
            console.log('✅ Cotação negada via modal:', this.cotacaoAtual);
        }
        
        this.fecharModal('modal-negar-cotacao');
        
        // Mostrar sucesso
        this.mostrarSucesso('Cotação negada. Cliente será notificado.');
    },
    
    getCotacao(id) {
        if (window.Cotacoes && window.Cotacoes.cotacoes) {
            return window.Cotacoes.cotacoes.find(c => c.id === id);
        }
        return null;
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
    
    addModalStyles() {
        // Verificar se os estilos já existem
        if (document.getElementById('aceitar-negar-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'aceitar-negar-styles';
        style.textContent = `
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                backdrop-filter: blur(2px);
            }
            
            .modal.show {
                display: flex !important;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-out;
            }
            
            .modal-content {
                animation: slideIn 0.3s ease-out;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { 
                    opacity: 0; 
                    transform: translateY(-50px) scale(0.95); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0) scale(1); 
                }
            }
        `;
        
        document.head.appendChild(style);
    },

    mostrarSucesso(mensagem) {
        // Criar toast de sucesso
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.innerHTML = `<i class="fas fa-check mr-2"></i>${mensagem}`;
        
        document.body.appendChild(toast);
        
        // Remover após 3 segundos
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
};

// Exportar globalmente
window.AceitarNegarCotacoes = AceitarNegarCotacoes;

console.log('✅ Sistema aceitar/negar carregado');
