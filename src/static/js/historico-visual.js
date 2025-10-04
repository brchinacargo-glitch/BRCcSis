// ==================== SISTEMA DE HISTÓRICO VISUAL ====================
// Timeline visual de alterações de status das cotações

const HistoricoVisual = {
    
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.setupEventListeners();
        console.log('✅ Sistema de Histórico Visual inicializado');
    },
    
    setupEventListeners() {
        // Escutar eventos de abertura de detalhes
        document.addEventListener('cotacaoDetalhesAberta', (e) => {
            this.renderizarHistorico(e.detail.cotacao);
        });
    },
    
    // ==================== RENDERIZAÇÃO DO HISTÓRICO ====================
    
    renderizarHistorico(cotacao) {
        const container = document.getElementById('historico-cotacao');
        if (!container) return;
        
        const historico = this.obterHistorico(cotacao);
        
        container.innerHTML = `
            <div class="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-history text-gray-600 mr-2"></i>
                    Histórico de Alterações
                </h3>
                
                <div class="relative">
                    <!-- Linha vertical da timeline -->
                    <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <!-- Items do histórico -->
                    <div class="space-y-6">
                        ${historico.map((item, index) => this.renderizarItemHistorico(item, index, historico.length)).join('')}
                    </div>
                </div>
                
                <!-- Estatísticas do histórico -->
                <div class="mt-6 pt-4 border-t border-gray-200">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div class="text-2xl font-bold text-blue-600">${historico.length}</div>
                            <div class="text-sm text-gray-600">Alterações</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-green-600">${this.calcularTempoTotal(historico)}</div>
                            <div class="text-sm text-gray-600">Tempo Total</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-purple-600">${this.calcularTempoMedio(historico)}</div>
                            <div class="text-sm text-gray-600">Tempo Médio</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-orange-600">${this.contarOperadores(historico)}</div>
                            <div class="text-sm text-gray-600">Operadores</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderizarItemHistorico(item, index, total) {
        const isFirst = index === 0;
        const isLast = index === total - 1;
        const tempoDecorrido = this.calcularTempoDecorrido(item);
        
        return `
            <div class="relative flex items-start">
                <!-- Ícone da timeline -->
                <div class="relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${this.getCorStatus(item.status)} border-4 border-white shadow-lg">
                    <i class="${this.getIconeStatus(item.status)} text-white text-lg"></i>
                </div>
                
                <!-- Conteúdo -->
                <div class="ml-6 flex-1 min-w-0">
                    <div class="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <!-- Header -->
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="text-lg font-semibold text-gray-900">
                                ${this.getStatusDisplay(item.status)}
                            </h4>
                            <span class="text-sm text-gray-500">
                                ${this.formatarDataHora(item.data)}
                            </span>
                        </div>
                        
                        <!-- Descrição -->
                        <p class="text-gray-700 mb-3">${item.descricao}</p>
                        
                        <!-- Detalhes -->
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center space-x-4">
                                ${item.usuario ? `
                                    <span class="flex items-center text-gray-600">
                                        <i class="fas fa-user mr-1"></i>
                                        ${item.usuario}
                                    </span>
                                ` : ''}
                                
                                ${tempoDecorrido ? `
                                    <span class="flex items-center text-blue-600">
                                        <i class="fas fa-clock mr-1"></i>
                                        ${tempoDecorrido}
                                    </span>
                                ` : ''}
                            </div>
                            
                            <!-- Badge de status -->
                            <span class="status-badge status-${item.status}">
                                ${this.getStatusDisplay(item.status)}
                            </span>
                        </div>
                        
                        <!-- Informações adicionais -->
                        ${item.detalhes ? `
                            <div class="mt-3 p-3 bg-white rounded border-l-4 border-blue-500">
                                <div class="text-sm text-gray-700">${item.detalhes}</div>
                            </div>
                        ` : ''}
                        
                        <!-- Anexos ou documentos -->
                        ${item.anexos && item.anexos.length > 0 ? `
                            <div class="mt-3">
                                <div class="text-sm font-medium text-gray-700 mb-2">Anexos:</div>
                                <div class="flex flex-wrap gap-2">
                                    ${item.anexos.map(anexo => `
                                        <a href="${anexo.url}" class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors">
                                            <i class="fas fa-paperclip mr-1"></i>
                                            ${anexo.nome}
                                        </a>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },
    
    // ==================== OBTENÇÃO DE DADOS ====================
    
    obterHistorico(cotacao) {
        // Se a cotação já tem histórico, usar ele
        if (cotacao.historico && cotacao.historico.length > 0) {
            return cotacao.historico.sort((a, b) => new Date(b.data) - new Date(a.data));
        }
        
        // Caso contrário, gerar histórico baseado nos dados da cotação
        return this.gerarHistoricoBasico(cotacao);
    },
    
    gerarHistoricoBasico(cotacao) {
        const historico = [];
        const agora = new Date();
        
        // Criação da cotação
        historico.push({
            id: 1,
            status: 'solicitada',
            descricao: 'Cotação criada pelo cliente',
            data: cotacao.data_criacao || agora.toISOString(),
            usuario: 'Sistema',
            detalhes: `Modalidade: ${this.getModalidadeDisplay(cotacao.modalidade)}`
        });
        
        // Se foi aceita
        if (cotacao.status !== 'solicitada') {
            const dataAceite = cotacao.data_aceite || this.adicionarTempo(cotacao.data_criacao, 2, 'horas');
            historico.push({
                id: 2,
                status: 'aceita_operador',
                descricao: 'Cotação aceita pelo operador',
                data: dataAceite,
                usuario: cotacao.operador_nome || 'Operador',
                detalhes: 'Cotação foi aceita e está sendo processada'
            });
        }
        
        // Se foi respondida
        if (cotacao.valor_frete || cotacao.status === 'cotacao_enviada') {
            const dataResposta = cotacao.data_resposta || this.adicionarTempo(cotacao.data_aceite, 1, 'dia');
            historico.push({
                id: 3,
                status: 'cotacao_enviada',
                descricao: 'Resposta enviada ao cliente',
                data: dataResposta,
                usuario: cotacao.operador_nome || 'Operador',
                detalhes: cotacao.valor_frete ? `Valor: ${cotacao.valor_frete} | Prazo: ${cotacao.prazo_entrega} dias` : 'Cotação respondida'
            });
        }
        
        // Se foi aceita pelo consultor
        if (cotacao.status === 'aceita_consultor' || cotacao.status === 'finalizada') {
            const dataAceiteConsultor = this.adicionarTempo(cotacao.data_resposta, 4, 'horas');
            historico.push({
                id: 4,
                status: 'aceita_consultor',
                descricao: 'Cotação aceita pelo cliente',
                data: dataAceiteConsultor,
                usuario: cotacao.cliente_nome || 'Cliente',
                detalhes: 'Cliente aprovou a cotação'
            });
        }
        
        // Se foi finalizada
        if (cotacao.status === 'finalizada') {
            const dataFinalizacao = cotacao.data_finalizacao || this.adicionarTempo(cotacao.data_resposta, 1, 'dia');
            historico.push({
                id: 5,
                status: 'finalizada',
                descricao: 'Cotação finalizada',
                data: dataFinalizacao,
                usuario: 'Sistema',
                detalhes: 'Processo de cotação concluído com sucesso'
            });
        }
        
        return historico.sort((a, b) => new Date(b.data) - new Date(a.data));
    },
    
    // ==================== FUNÇÕES AUXILIARES ====================
    
    getCorStatus(status) {
        const cores = {
            'solicitada': 'bg-yellow-500',
            'aceita_operador': 'bg-blue-500',
            'cotacao_enviada': 'bg-purple-500',
            'aceita_consultor': 'bg-green-500',
            'negada_consultor': 'bg-red-500',
            'finalizada': 'bg-gray-500'
        };
        return cores[status] || 'bg-gray-400';
    },
    
    getIconeStatus(status) {
        const icones = {
            'solicitada': 'fas fa-plus',
            'aceita_operador': 'fas fa-check',
            'cotacao_enviada': 'fas fa-paper-plane',
            'aceita_consultor': 'fas fa-thumbs-up',
            'negada_consultor': 'fas fa-times',
            'finalizada': 'fas fa-flag-checkered'
        };
        return icones[status] || 'fas fa-circle';
    },
    
    getStatusDisplay(status) {
        const statusMap = {
            'solicitada': 'Cotação Solicitada',
            'aceita_operador': 'Aceita pelo Operador',
            'cotacao_enviada': 'Cotação Enviada',
            'aceita_consultor': 'Aceita pelo Cliente',
            'negada_consultor': 'Negada pelo Cliente',
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
    
    formatarDataHora(data) {
        if (!data) return 'Data não informada';
        
        const dataObj = new Date(data);
        const agora = new Date();
        const diffMs = agora - dataObj;
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDias === 0) {
            return 'Hoje às ' + dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDias === 1) {
            return 'Ontem às ' + dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDias < 7) {
            return `${diffDias} dias atrás`;
        } else {
            return dataObj.toLocaleString('pt-BR');
        }
    },
    
    calcularTempoDecorrido(item) {
        if (!item.data) return null;
        
        const dataItem = new Date(item.data);
        const agora = new Date();
        const diffMs = agora - dataItem;
        
        const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (dias > 0) {
            return `${dias}d ${horas}h atrás`;
        } else if (horas > 0) {
            return `${horas}h atrás`;
        } else {
            const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return `${minutos}min atrás`;
        }
    },
    
    calcularTempoTotal(historico) {
        if (historico.length < 2) return '0h';
        
        const primeiro = new Date(historico[historico.length - 1].data);
        const ultimo = new Date(historico[0].data);
        const diffMs = ultimo - primeiro;
        
        const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (dias > 0) {
            return `${dias}d ${horas}h`;
        } else {
            return `${horas}h`;
        }
    },
    
    calcularTempoMedio(historico) {
        if (historico.length < 2) return '0h';
        
        let tempoTotal = 0;
        for (let i = 0; i < historico.length - 1; i++) {
            const atual = new Date(historico[i].data);
            const anterior = new Date(historico[i + 1].data);
            tempoTotal += atual - anterior;
        }
        
        const tempoMedio = tempoTotal / (historico.length - 1);
        const horas = Math.floor(tempoMedio / (1000 * 60 * 60));
        
        return `${horas}h`;
    },
    
    contarOperadores(historico) {
        const operadores = new Set();
        historico.forEach(item => {
            if (item.usuario && item.usuario !== 'Sistema') {
                operadores.add(item.usuario);
            }
        });
        return operadores.size;
    },
    
    adicionarTempo(dataBase, quantidade, unidade) {
        if (!dataBase) return new Date().toISOString();
        
        const data = new Date(dataBase);
        
        switch (unidade) {
            case 'minutos':
                data.setMinutes(data.getMinutes() + quantidade);
                break;
            case 'horas':
                data.setHours(data.getHours() + quantidade);
                break;
            case 'dia':
            case 'dias':
                data.setDate(data.getDate() + quantidade);
                break;
        }
        
        return data.toISOString();
    },
    
    // ==================== EXPORTAÇÃO DE HISTÓRICO ====================
    
    exportarHistorico(cotacao, formato = 'json') {
        const historico = this.obterHistorico(cotacao);
        
        switch (formato) {
            case 'json':
                this.exportarJSON(historico, `historico-cotacao-${cotacao.id}.json`);
                break;
            case 'csv':
                this.exportarCSV(historico, `historico-cotacao-${cotacao.id}.csv`);
                break;
            case 'pdf':
                this.exportarPDF(historico, cotacao);
                break;
        }
    },
    
    exportarJSON(historico, nomeArquivo) {
        const json = JSON.stringify(historico, null, 2);
        this.downloadArquivo(json, nomeArquivo, 'application/json');
    },
    
    exportarCSV(historico, nomeArquivo) {
        const headers = ['Data', 'Status', 'Descrição', 'Usuário', 'Detalhes'];
        let csv = headers.join(',') + '\n';
        
        historico.forEach(item => {
            const linha = [
                this.formatarDataHora(item.data),
                this.getStatusDisplay(item.status),
                item.descricao,
                item.usuario || '',
                item.detalhes || ''
            ].map(campo => `"${campo.replace(/"/g, '""')}"`);
            
            csv += linha.join(',') + '\n';
        });
        
        this.downloadArquivo(csv, nomeArquivo, 'text/csv');
    },
    
    downloadArquivo(conteudo, nomeArquivo, tipoMime) {
        const blob = new Blob([conteudo], { type: tipoMime });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
};

// Inicialização controlada pelo main.js
// HistoricoVisual.init() é chamado centralmente

// Exportar para uso global
window.HistoricoVisual = HistoricoVisual;
