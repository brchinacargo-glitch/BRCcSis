// ==================== SISTEMA DE FINALIZAÇÃO DE COTAÇÕES ====================
// Funcionalidade para consultores finalizarem cotações enviadas pelos operadores

const FinalizarCotacoes = {
    // Estado
    processando: false,
    
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        console.log('✅ Sistema de Finalização de Cotações inicializado');
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Event delegation para botões dinâmicos
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="aprovar-cotacao"]')) {
                e.preventDefault();
                const cotacaoId = e.target.dataset.cotacaoId;
                this.abrirModalAprovar(cotacaoId);
            }
            
            if (e.target.matches('[data-action="recusar-cotacao"]')) {
                e.preventDefault();
                const cotacaoId = e.target.dataset.cotacaoId;
                this.abrirModalRecusar(cotacaoId);
            }
            
            if (e.target.matches('[data-action="finalizar-cotacao"]')) {
                e.preventDefault();
                const cotacaoId = e.target.dataset.cotacaoId;
                this.abrirModalFinalizar(cotacaoId);
            }
        });
    },
    
    // ==================== APROVAR COTAÇÃO ====================
    
    async abrirModalAprovar(cotacaoId) {
        if (this.processando) return;
        
        const cotacao = await this.buscarCotacao(cotacaoId);
        if (!cotacao) {
            this.mostrarErro('Cotação não encontrada');
            return;
        }
        
        const modalHtml = this.criarModalAprovar(cotacao);
        this.mostrarModal(modalHtml);
        this.setupFormularioAprovar(cotacaoId);
    },
    
    criarModalAprovar(cotacao) {
        return `
            <div id="modal-aprovar-cotacao" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div class="flex items-center justify-between p-6 border-b">
                        <h3 class="text-lg font-semibold text-gray-900">
                            <i class="fas fa-check-circle text-green-600 mr-2"></i>
                            Aprovar Cotação #${cotacao.id}
                        </h3>
                        <button type="button" class="text-gray-400 hover:text-gray-600" onclick="FinalizarCotacoes.fecharModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        <div class="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 class="font-medium text-gray-900 mb-2">Resumo da Cotação:</h4>
                            <div class="space-y-1 text-sm text-gray-600">
                                <div><strong>Cliente:</strong> ${cotacao.cliente_nome || 'N/A'}</div>
                                <div><strong>Valor:</strong> R$ ${cotacao.valor_frete ? parseFloat(cotacao.valor_frete).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'N/A'}</div>
                                <div><strong>Prazo:</strong> ${cotacao.prazo_entrega || 'N/A'} dias</div>
                                <div><strong>Empresa:</strong> ${cotacao.empresa_prestadora || 'N/A'}</div>
                            </div>
                        </div>
                        
                        <form id="form-aprovar-cotacao">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Observações (opcional)
                                </label>
                                <textarea 
                                    name="observacoes" 
                                    rows="3" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Adicione observações sobre a aprovação..."
                                    maxlength="500"
                                ></textarea>
                            </div>
                            
                            <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                <div class="flex items-start">
                                    <i class="fas fa-info-circle text-green-600 mt-0.5 mr-2"></i>
                                    <div class="text-sm text-green-800">
                                        <strong>Ao aprovar esta cotação:</strong>
                                        <ul class="mt-1 list-disc list-inside space-y-0.5">
                                            <li>O operador será notificado da aprovação</li>
                                            <li>A cotação mudará para status "Aprovada"</li>
                                            <li>O processo poderá prosseguir para finalização</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                        <button 
                            type="button" 
                            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            onclick="FinalizarCotacoes.fecharModal()"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            form="form-aprovar-cotacao"
                            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            id="btn-confirmar-aprovar"
                        >
                            <i class="fas fa-check mr-2"></i>Aprovar Cotação
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    setupFormularioAprovar(cotacaoId) {
        const form = document.getElementById('form-aprovar-cotacao');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.processarAprovacao(cotacaoId, form);
        });
    },
    
    async processarAprovacao(cotacaoId, form) {
        if (this.processando) return;
        
        this.processando = true;
        const btn = document.getElementById('btn-confirmar-aprovar');
        const originalText = btn.innerHTML;
        
        try {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Aprovando...';
            btn.disabled = true;
            
            const formData = new FormData(form);
            const dados = {
                cotacao_id: cotacaoId,
                observacoes: formData.get('observacoes') || '',
                acao: 'aprovar'
            };
            
            const response = await this.aprovarCotacao(dados);
            
            if (response.success) {
                this.mostrarSucesso('Cotação aprovada com sucesso!');
                this.fecharModal();
                this.atualizarInterfaceAposAcao(cotacaoId, 'aceita_consultor');
                
                if (typeof loadCotacoes === 'function') {
                    setTimeout(() => loadCotacoes(), 1000);
                }
            } else {
                throw new Error(response.message || 'Erro ao aprovar cotação');
            }
            
        } catch (error) {
            console.error('Erro ao aprovar cotação:', error);
            this.mostrarErro(error.message || 'Erro ao aprovar cotação');
        } finally {
            this.processando = false;
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },
    
    // ==================== FUNÇÕES DE APOIO ====================
    
    async buscarCotacao(cotacaoId) {
        try {
            if (window.API && typeof API.getCotacao === 'function') {
                const response = await API.getCotacao(cotacaoId);
                if (response.success && response.cotacao) {
                    return response.cotacao;
                }
            }
            
            if (window.cotacoesData && Array.isArray(window.cotacoesData)) {
                return window.cotacoesData.find(c => c.id == cotacaoId);
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao buscar cotação:', error);
            return null;
        }
    },
    
    async aprovarCotacao(dados) {
        try {
            if (window.API && typeof API.aprovarCotacao === 'function') {
                return await API.aprovarCotacao(dados);
            }
            
            console.log('📝 Simulando aprovação de cotação:', dados);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                success: true,
                message: 'Cotação aprovada com sucesso (simulado)'
            };
        } catch (error) {
            console.error('Erro na API de aprovar cotação:', error);
            throw error;
        }
    },
    
    atualizarInterfaceAposAcao(cotacaoId, novoStatus) {
        const card = document.querySelector(`[data-cotacao-id="${cotacaoId}"]`);
        if (card) {
            const badge = card.querySelector('.status-badge');
            if (badge) {
                badge.className = `status-badge status-${novoStatus}`;
                badge.textContent = this.getLabelStatus(novoStatus);
            }
            
            const actionsContainer = card.querySelector('.cotacao-actions');
            if (actionsContainer && novoStatus === 'aceita_consultor') {
                actionsContainer.innerHTML = `
                    <button data-action="finalizar-cotacao" data-cotacao-id="${cotacaoId}" class="btn-action btn-success">
                        <i class="fas fa-flag-checkered"></i>Finalizar
                    </button>
                `;
            }
        }
    },
    
    getLabelStatus(status) {
        const labels = {
            'solicitada': 'Solicitada',
            'aceita_operador': 'Aceita',
            'cotacao_enviada': 'Enviada',
            'aceita_consultor': 'Aprovada',
            'finalizada': 'Finalizada',
            'negada': 'Negada',
            'cancelada': 'Cancelada'
        };
        return labels[status] || status;
    },
    
    // ==================== INTERFACE ====================
    
    mostrarModal(html) {
        this.fecharModal();
        document.body.insertAdjacentHTML('beforeend', html);
    },
    
    fecharModal() {
        const modals = document.querySelectorAll('#modal-aprovar-cotacao, #modal-recusar-cotacao, #modal-finalizar-cotacao');
        modals.forEach(modal => modal.remove());
    },
    
    mostrarSucesso(mensagem) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao(mensagem, 'success');
        } else {
            alert(mensagem);
        }
    },
    
    mostrarErro(mensagem) {
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao(mensagem, 'error');
        } else {
            alert('Erro: ' + mensagem);
        }
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    FinalizarCotacoes.init();
});

// Exportar para uso global
window.FinalizarCotacoes = FinalizarCotacoes;
