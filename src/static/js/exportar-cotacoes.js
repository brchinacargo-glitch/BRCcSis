// ==================== SISTEMA DE EXPORTAÇÃO DE COTAÇÕES ====================
// Exporta cotações filtradas em diferentes formatos

const ExportarCotacoes = {
    
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.setupEventListeners();
        console.log('✅ Sistema de Exportação inicializado');
    },
    
    setupEventListeners() {
        const btnExportar = document.getElementById('btn-exportar-cotacoes');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => {
                this.mostrarOpcoesExportacao();
            });
        }
    },
    
    // ==================== INTERFACE DE EXPORTAÇÃO ====================
    
    mostrarOpcoesExportacao() {
        const modal = this.criarModalExportacao();
        document.body.appendChild(modal);
        
        // Mostrar modal
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    },
    
    criarModalExportacao() {
        const modal = document.createElement('div');
        modal.id = 'modal-exportacao';
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="modal-header bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-bold">
                            <i class="fas fa-download mr-2"></i>
                            Exportar Cotações
                        </h2>
                        <button class="fechar-modal-exportacao text-white hover:text-gray-200 text-2xl font-bold">
                            &times;
                        </button>
                    </div>
                </div>
                
                <div class="modal-body p-6">
                    <p class="text-gray-600 mb-4">Escolha o formato de exportação:</p>
                    
                    <div class="space-y-3">
                        <button 
                            onclick="ExportarCotacoes.exportarCSV()" 
                            class="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                        >
                            <div class="flex items-center">
                                <i class="fas fa-file-csv text-green-600 text-2xl mr-3"></i>
                                <div class="text-left">
                                    <div class="font-semibold">CSV (Excel)</div>
                                    <div class="text-sm text-gray-500">Planilha para análise</div>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </button>
                        
                        <button 
                            onclick="ExportarCotacoes.exportarJSON()" 
                            class="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                            <div class="flex items-center">
                                <i class="fas fa-code text-blue-600 text-2xl mr-3"></i>
                                <div class="text-left">
                                    <div class="font-semibold">JSON</div>
                                    <div class="text-sm text-gray-500">Dados estruturados</div>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </button>
                        
                        <button 
                            onclick="ExportarCotacoes.exportarPDF()" 
                            class="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all"
                        >
                            <div class="flex items-center">
                                <i class="fas fa-file-pdf text-red-600 text-2xl mr-3"></i>
                                <div class="text-left">
                                    <div class="font-semibold">PDF</div>
                                    <div class="text-sm text-gray-500">Relatório formatado</div>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </button>
                    </div>
                    
                    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center text-sm text-gray-600">
                            <i class="fas fa-info-circle mr-2"></i>
                            <span id="info-exportacao">Serão exportadas as cotações atualmente filtradas</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('fechar-modal-exportacao')) {
                this.fecharModal();
            }
        });
        
        return modal;
    },
    
    fecharModal() {
        const modal = document.getElementById('modal-exportacao');
        if (modal) {
            modal.remove();
        }
    },
    
    // ==================== EXPORTAÇÃO CSV ====================
    
    exportarCSV() {
        try {
            const cotacoes = this.obterCotacoesFiltradas();
            const csv = this.gerarCSV(cotacoes);
            
            this.downloadArquivo(csv, 'cotacoes.csv', 'text/csv');
            this.fecharModal();
            this.mostrarSucesso(`${cotacoes.length} cotações exportadas em CSV`);
            
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            this.mostrarErro('Erro ao exportar CSV');
        }
    },
    
    gerarCSV(cotacoes) {
        const headers = [
            'ID',
            'Número',
            'Status',
            'Modalidade',
            'Cliente',
            'CNPJ',
            'Origem',
            'Destino',
            'Peso (kg)',
            'Cubagem (m³)',
            'Valor Mercadoria',
            'Valor Frete',
            'Prazo (dias)',
            'Operador',
            'Data Criação',
            'Data Resposta'
        ];
        
        let csv = headers.join(',') + '\n';
        
        cotacoes.forEach(cotacao => {
            const linha = [
                cotacao.id || '',
                cotacao.numero_cotacao || '',
                this.getStatusDisplay(cotacao.status),
                this.getModalidadeDisplay(cotacao.modalidade),
                this.escaparCSV(cotacao.cliente_nome || ''),
                cotacao.cliente_cnpj || '',
                this.escaparCSV(this.formatarEndereco(cotacao, 'origem')),
                this.escaparCSV(this.formatarEndereco(cotacao, 'destino')),
                cotacao.carga_peso_kg || '',
                cotacao.carga_cubagem || '',
                cotacao.carga_valor_mercadoria || '',
                cotacao.valor_frete || '',
                cotacao.prazo_entrega || '',
                cotacao.operador_nome || '',
                this.formatarDataCSV(cotacao.data_criacao),
                this.formatarDataCSV(cotacao.data_resposta)
            ];
            
            csv += linha.join(',') + '\n';
        });
        
        return csv;
    },
    
    escaparCSV(texto) {
        if (!texto) return '';
        texto = texto.toString();
        if (texto.includes(',') || texto.includes('"') || texto.includes('\n')) {
            return '"' + texto.replace(/"/g, '""') + '"';
        }
        return texto;
    },
    
    // ==================== EXPORTAÇÃO JSON ====================
    
    exportarJSON() {
        try {
            const cotacoes = this.obterCotacoesFiltradas();
            const json = JSON.stringify(cotacoes, null, 2);
            
            this.downloadArquivo(json, 'cotacoes.json', 'application/json');
            this.fecharModal();
            this.mostrarSucesso(`${cotacoes.length} cotações exportadas em JSON`);
            
        } catch (error) {
            console.error('Erro ao exportar JSON:', error);
            this.mostrarErro('Erro ao exportar JSON');
        }
    },
    
    // ==================== EXPORTAÇÃO PDF ====================
    
    exportarPDF() {
        try {
            const cotacoes = this.obterCotacoesFiltradas();
            this.gerarPDF(cotacoes);
            this.fecharModal();
            
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            this.mostrarErro('Erro ao exportar PDF');
        }
    },
    
    gerarPDF(cotacoes) {
        // Implementação básica usando window.print()
        // Em uma implementação real, usaria uma biblioteca como jsPDF
        
        const conteudoPDF = this.gerarHTMLParaPDF(cotacoes);
        
        // Abrir nova janela para impressão
        const janelaImpressao = window.open('', '_blank');
        janelaImpressao.document.write(conteudoPDF);
        janelaImpressao.document.close();
        janelaImpressao.print();
        
        this.mostrarSucesso(`Relatório PDF gerado com ${cotacoes.length} cotações`);
    },
    
    gerarHTMLParaPDF(cotacoes) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Relatório de Cotações</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #ea580c; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                    .status-solicitada { background-color: #fef3c7; color: #92400e; }
                    .status-aceita_operador { background-color: #dbeafe; color: #1e40af; }
                    .status-cotacao_enviada { background-color: #e0e7ff; color: #5b21b6; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>Relatório de Cotações</h1>
                <p><strong>Data de Geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <p><strong>Total de Cotações:</strong> ${cotacoes.length}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Status</th>
                            <th>Modalidade</th>
                            <th>Origem</th>
                            <th>Destino</th>
                            <th>Valor Frete</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cotacoes.map(cotacao => `
                            <tr>
                                <td>${cotacao.numero_cotacao || cotacao.id}</td>
                                <td>${cotacao.cliente_nome || 'N/A'}</td>
                                <td><span class="status status-${cotacao.status}">${this.getStatusDisplay(cotacao.status)}</span></td>
                                <td>${this.getModalidadeDisplay(cotacao.modalidade)}</td>
                                <td>${this.formatarEndereco(cotacao, 'origem')}</td>
                                <td>${this.formatarEndereco(cotacao, 'destino')}</td>
                                <td>${cotacao.valor_frete || 'Não informado'}</td>
                                <td>${this.formatarData(cotacao.data_criacao)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
    },
    
    // ==================== FUNÇÕES AUXILIARES ====================
    
    obterCotacoesFiltradas() {
        // Tentar obter cotações do sistema principal
        if (window.Cotacoes && window.Cotacoes.aplicarTodosFiltros) {
            return window.Cotacoes.aplicarTodosFiltros();
        }
        
        // Fallback para dados globais
        return window.cotacoesData || [];
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
    },
    
    formatarDataCSV(data) {
        if (!data) return '';
        return new Date(data).toLocaleString('pt-BR');
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
    
    mostrarSucesso(mensagem) {
        // Implementar sistema de notificações
        alert(mensagem);
    },
    
    mostrarErro(mensagem) {
        // Implementar sistema de notificações
        alert(mensagem);
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    ExportarCotacoes.init();
});

// Exportar para uso global
window.ExportarCotacoes = ExportarCotacoes;
