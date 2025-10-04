// ==================== SISTEMA DE ACEITAR/NEGAR COTAÇÕES ====================
// Funcionalidade para operadores aceitarem ou negarem cotações solicitadas

const AceitarNegarCotacoes = {
    // Estado
    processando: false,
    
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        console.log('✅ Sistema de Aceitar/Negar Cotações inicializado');
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Event delegation para botões dinâmicos
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="aceitar-cotacao"]')) {
                e.preventDefault();
                const cotacaoId = e.target.dataset.cotacaoId;
                this.abrirModalAceitar(cotacaoId);
            }
            
            if (e.target.matches('[data-action="negar-cotacao"]')) {
                e.preventDefault();
                const cotacaoId = e.target.dataset.cotacaoId;
                this.abrirModalNegar(cotacaoId);
            }
        });
    },
    
    // ==================== ACEITAR COTAÇÃO ====================
    
    async abrirModalAceitar(cotacaoId) {
        if (this.processando) {
            console.log('⏳ Já processando uma ação, aguarde...');
            return;
        }
        
        // Buscar dados da cotação
        const cotacao = await this.buscarCotacao(cotacaoId);
        if (!cotacao) {
            this.mostrarErro('Cotação não encontrada');
            return;
        }
        
        // Criar modal de confirmação
        const modalHtml = this.criarModalAceitar(cotacao);
        this.mostrarModal(modalHtml);
        
        // Setup do formulário
        this.setupFormularioAceitar(cotacaoId);
    },
    
    criarModalAceitar(cotacao) {
        return `
            <div id="modal-aceitar-cotacao" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b">
                        <h3 class="text-lg font-semibold text-gray-900">
                            <i class="fas fa-check-circle text-green-600 mr-2"></i>
                            Aceitar Cotação #${cotacao.id}
                        </h3>
                        <button type="button" class="text-gray-400 hover:text-gray-600" onclick="AceitarNegarCotacoes.fecharModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Conteúdo -->
                    <div class="p-6">
                        <!-- Resumo da Cotação -->
                        <div class="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 class="font-medium text-gray-900 mb-2">Resumo da Cotação:</h4>
                            <div class="space-y-1 text-sm text-gray-600">
                                <div><strong>Cliente:</strong> ${cotacao.cliente_nome || 'N/A'}</div>
                                <div><strong>Modalidade:</strong> ${this.getLabelModalidade(cotacao.modalidade)}</div>
                                <div><strong>Origem:</strong> ${cotacao.origem_cidade || cotacao.origem_porto || 'N/A'}</div>
                                <div><strong>Destino:</strong> ${cotacao.destino_cidade || cotacao.destino_porto || 'N/A'}</div>
                                <div><strong>Peso:</strong> ${cotacao.carga_peso_kg ? cotacao.carga_peso_kg + ' kg' : 'N/A'}</div>
                            </div>
                        </div>
                        
                        <!-- Formulário -->
                        <form id="form-aceitar-cotacao">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Observações (opcional)
                                </label>
                                <textarea 
                                    name="observacoes" 
                                    rows="3" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Adicione observações sobre a aceitação..."
                                    maxlength="500"
                                ></textarea>
                                <div class="text-xs text-gray-500 mt-1">
                                    <span id="contador-observacoes">0</span>/500 caracteres
                                </div>
                            </div>
                            
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                <div class="flex items-start">
                                    <i class="fas fa-info-circle text-blue-600 mt-0.5 mr-2"></i>
                                    <div class="text-sm text-blue-800">
                                        <strong>Ao aceitar esta cotação:</strong>
                                        <ul class="mt-1 list-disc list-inside space-y-0.5">
                                            <li>Você se tornará o operador responsável</li>
                                            <li>Deverá responder com valores e prazos</li>
                                            <li>A cotação mudará para status "Aceita"</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Footer -->
                    <div class="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                        <button 
                            type="button" 
                            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            onclick="AceitarNegarCotacoes.fecharModal()"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            form="form-aceitar-cotacao"
                            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            id="btn-confirmar-aceitar"
                        >
                            <i class="fas fa-check mr-2"></i>
                            Aceitar Cotação
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    setupFormularioAceitar(cotacaoId) {
        const form = document.getElementById('form-aceitar-cotacao');
        const textarea = form.querySelector('textarea[name="observacoes"]');
        const contador = document.getElementById('contador-observacoes');
        
        // Contador de caracteres
        textarea.addEventListener('input', () => {
            contador.textContent = textarea.value.length;
        });
        
        // Submit do formulário
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.processarAceitacao(cotacaoId, form);
        });
    },
    
    async processarAceitacao(cotacaoId, form) {
        if (this.processando) return;
        
        this.processando = true;
        const btn = document.getElementById('btn-confirmar-aceitar');
        const originalText = btn.innerHTML;
        
        try {
            // Loading state
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Aceitando...';
            btn.disabled = true;
            
            // Dados do formulário
            const formData = new FormData(form);
            const dados = {
                cotacao_id: cotacaoId,
                observacoes: formData.get('observacoes') || '',
                acao: 'aceitar'
            };
            
            // Chamar API
            const response = await this.aceitarCotacao(dados);
            
            if (response.success) {
                this.mostrarSucesso('Cotação aceita com sucesso!');
                this.fecharModal();
                
                // Atualizar interface
                this.atualizarInterfaceAposAcao(cotacaoId, 'aceita_operador');
                
                // Recarregar lista se necessário
                if (typeof loadCotacoes === 'function') {
                    setTimeout(() => loadCotacoes(), 1000);
                }
            } else {
                throw new Error(response.message || 'Erro ao aceitar cotação');
            }
            
        } catch (error) {
            console.error('Erro ao aceitar cotação:', error);
            this.mostrarErro(error.message || 'Erro ao aceitar cotação');
        } finally {
            this.processando = false;
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },
    
    // ==================== NEGAR COTAÇÃO ====================
    
    async abrirModalNegar(cotacaoId) {
        if (this.processando) {
            console.log('⏳ Já processando uma ação, aguarde...');
            return;
        }
        
        // Buscar dados da cotação
        const cotacao = await this.buscarCotacao(cotacaoId);
        if (!cotacao) {
            this.mostrarErro('Cotação não encontrada');
            return;
        }
        
        // Criar modal de negação
        const modalHtml = this.criarModalNegar(cotacao);
        this.mostrarModal(modalHtml);
        
        // Setup do formulário
        this.setupFormularioNegar(cotacaoId);
    },
    
    criarModalNegar(cotacao) {
        return `
            <div id="modal-negar-cotacao" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b">
                        <h3 class="text-lg font-semibold text-gray-900">
                            <i class="fas fa-times-circle text-red-600 mr-2"></i>
                            Negar Cotação #${cotacao.id}
                        </h3>
                        <button type="button" class="text-gray-400 hover:text-gray-600" onclick="AceitarNegarCotacoes.fecharModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Conteúdo -->
                    <div class="p-6">
                        <!-- Resumo da Cotação -->
                        <div class="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 class="font-medium text-gray-900 mb-2">Resumo da Cotação:</h4>
                            <div class="space-y-1 text-sm text-gray-600">
                                <div><strong>Cliente:</strong> ${cotacao.cliente_nome || 'N/A'}</div>
                                <div><strong>Modalidade:</strong> ${this.getLabelModalidade(cotacao.modalidade)}</div>
                                <div><strong>Origem:</strong> ${cotacao.origem_cidade || cotacao.origem_porto || 'N/A'}</div>
                                <div><strong>Destino:</strong> ${cotacao.destino_cidade || cotacao.destino_porto || 'N/A'}</div>
                            </div>
                        </div>
                        
                        <!-- Formulário -->
                        <form id="form-negar-cotacao">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo da Negação <span class="text-red-500">*</span>
                                </label>
                                <select 
                                    name="motivo" 
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">Selecione o motivo</option>
                                    <option value="fora_area_atuacao">Fora da área de atuação</option>
                                    <option value="capacidade_indisponivel">Capacidade indisponível</option>
                                    <option value="tipo_carga_inadequado">Tipo de carga inadequado</option>
                                    <option value="prazo_insuficiente">Prazo insuficiente</option>
                                    <option value="documentacao_incompleta">Documentação incompleta</option>
                                    <option value="outros">Outros</option>
                                </select>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Observações Adicionais <span class="text-red-500">*</span>
                                </label>
                                <textarea 
                                    name="observacoes" 
                                    rows="3" 
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Explique detalhadamente o motivo da negação..."
                                    maxlength="500"
                                ></textarea>
                                <div class="text-xs text-gray-500 mt-1">
                                    <span id="contador-observacoes-negar">0</span>/500 caracteres
                                </div>
                            </div>
                            
                            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <div class="flex items-start">
                                    <i class="fas fa-exclamation-triangle text-red-600 mt-0.5 mr-2"></i>
                                    <div class="text-sm text-red-800">
                                        <strong>Atenção:</strong> Ao negar esta cotação, o cliente será notificado automaticamente com o motivo informado. Esta ação não pode ser desfeita.
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Footer -->
                    <div class="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                        <button 
                            type="button" 
                            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            onclick="AceitarNegarCotacoes.fecharModal()"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            form="form-negar-cotacao"
                            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            id="btn-confirmar-negar"
                        >
                            <i class="fas fa-times mr-2"></i>
                            Negar Cotação
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    setupFormularioNegar(cotacaoId) {
        const form = document.getElementById('form-negar-cotacao');
        const textarea = form.querySelector('textarea[name="observacoes"]');
        const contador = document.getElementById('contador-observacoes-negar');
        
        // Contador de caracteres
        textarea.addEventListener('input', () => {
            contador.textContent = textarea.value.length;
        });
        
        // Submit do formulário
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.processarNegacao(cotacaoId, form);
        });
    },
    
    async processarNegacao(cotacaoId, form) {
        if (this.processando) return;
        
        this.processando = true;
        const btn = document.getElementById('btn-confirmar-negar');
        const originalText = btn.innerHTML;
        
        try {
            // Loading state
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Negando...';
            btn.disabled = true;
            
            // Dados do formulário
            const formData = new FormData(form);
            const dados = {
                cotacao_id: cotacaoId,
                motivo: formData.get('motivo'),
                observacoes: formData.get('observacoes'),
                acao: 'negar'
            };
            
            // Validação
            if (!dados.motivo || !dados.observacoes.trim()) {
                throw new Error('Todos os campos obrigatórios devem ser preenchidos');
            }
            
            // Chamar API
            const response = await this.negarCotacao(dados);
            
            if (response.success) {
                this.mostrarSucesso('Cotação negada com sucesso!');
                this.fecharModal();
                
                // Atualizar interface
                this.atualizarInterfaceAposAcao(cotacaoId, 'negada');
                
                // Recarregar lista se necessário
                if (typeof loadCotacoes === 'function') {
                    setTimeout(() => loadCotacoes(), 1000);
                }
            } else {
                throw new Error(response.message || 'Erro ao negar cotação');
            }
            
        } catch (error) {
            console.error('Erro ao negar cotação:', error);
            this.mostrarErro(error.message || 'Erro ao negar cotação');
        } finally {
            this.processando = false;
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },
    
    // ==================== FUNÇÕES DE APOIO ====================
    
    async buscarCotacao(cotacaoId) {
        try {
            // Tentar buscar da API
            if (window.API && typeof API.getCotacao === 'function') {
                const response = await API.getCotacao(cotacaoId);
                if (response.success && response.cotacao) {
                    return response.cotacao;
                }
            }
            
            // Fallback: buscar dos dados locais
            if (window.cotacoesData && Array.isArray(window.cotacoesData)) {
                return window.cotacoesData.find(c => c.id == cotacaoId);
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao buscar cotação:', error);
            return null;
        }
    },
    
    async aceitarCotacao(dados) {
        try {
            if (window.API && typeof API.aceitarCotacao === 'function') {
                return await API.aceitarCotacao(dados);
            }
            
            // Fallback para desenvolvimento
            console.log('📝 Simulando aceitação de cotação:', dados);
            return {
                success: true,
                message: 'Cotação aceita com sucesso (simulado)'
            };
        } catch (error) {
            console.error('Erro na API de aceitar cotação:', error);
            throw error;
        }
    },
    
    async negarCotacao(dados) {
        try {
            if (window.API && typeof API.negarCotacao === 'function') {
                return await API.negarCotacao(dados);
            }
            
            // Fallback para desenvolvimento
            console.log('📝 Simulando negação de cotação:', dados);
            return {
                success: true,
                message: 'Cotação negada com sucesso (simulado)'
            };
        } catch (error) {
            console.error('Erro na API de negar cotação:', error);
            throw error;
        }
    },
    
    atualizarInterfaceAposAcao(cotacaoId, novoStatus) {
        // Atualizar card da cotação se estiver visível
        const card = document.querySelector(`[data-cotacao-id="${cotacaoId}"]`);
        if (card) {
            // Atualizar badge de status
            const badge = card.querySelector('.status-badge');
            if (badge) {
                badge.className = `status-badge status-${novoStatus}`;
                badge.textContent = this.getLabelStatus(novoStatus);
            }
            
            // Atualizar botões de ação
            const actionsContainer = card.querySelector('.cotacao-actions');
            if (actionsContainer) {
                if (novoStatus === 'aceita_operador') {
                    actionsContainer.innerHTML = `
                        <button class="btn-action btn-primary" data-action="responder-cotacao" data-cotacao-id="${cotacaoId}">
                            <i class="fas fa-reply"></i> Responder
                        </button>
                        <button class="btn-action btn-secondary" data-action="reatribuir-cotacao" data-cotacao-id="${cotacaoId}">
                            <i class="fas fa-exchange-alt"></i> Reatribuir
                        </button>
                    `;
                } else if (novoStatus === 'negada') {
                    actionsContainer.innerHTML = `
                        <span class="text-red-600 text-sm">
                            <i class="fas fa-times-circle mr-1"></i>
                            Cotação negada
                        </span>
                    `;
                }
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
    
    getLabelModalidade(modalidade) {
        const labels = {
            'brcargo_rodoviario': 'Rodoviário',
            'brcargo_maritimo': 'Marítimo',
            'brcargo_aereo': 'Aéreo'
        };
        return labels[modalidade] || modalidade;
    },
    
    // ==================== INTERFACE ====================
    
    mostrarModal(html) {
        // Remover modal existente
        this.fecharModal();
        
        // Adicionar novo modal
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Focar no modal
        const modal = document.querySelector('[id^="modal-"]');
        if (modal) {
            modal.focus();
        }
    },
    
    fecharModal() {
        const modals = document.querySelectorAll('#modal-aceitar-cotacao, #modal-negar-cotacao');
        modals.forEach(modal => modal.remove());
    },
    
    mostrarSucesso(mensagem) {
        // Implementar notificação de sucesso
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao(mensagem, 'success');
        } else {
            alert(mensagem);
        }
    },
    
    mostrarErro(mensagem) {
        // Implementar notificação de erro
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao(mensagem, 'error');
        } else {
            alert('Erro: ' + mensagem);
        }
    }
};

// Inicialização controlada pelo main.js
// AceitarNegarCotacoes.init() é chamado centralmente

// Exportar para uso global
window.AceitarNegarCotacoes = AceitarNegarCotacoes;
