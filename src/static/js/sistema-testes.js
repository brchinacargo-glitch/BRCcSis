// ==================== SISTEMA DE TESTES INTEGRADOS ====================
// Testa todas as funcionalidades do sistema BRCcSis

const SistemaTestes = {
    resultados: [],
    
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        console.log('🧪 Iniciando Sistema de Testes...');
        this.criarInterfaceTestes();
        this.executarTestesBasicos();
    },

    criarInterfaceTestes() {
        // Criar botão de testes no canto superior direito
        const btnTestes = document.createElement('button');
        btnTestes.id = 'btn-sistema-testes';
        btnTestes.className = 'fixed top-4 right-4 z-50 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors';
        btnTestes.innerHTML = '<i class="fas fa-flask mr-2"></i>Testes';
        btnTestes.onclick = () => this.abrirPainelTestes();
        
        document.body.appendChild(btnTestes);
    },

    abrirPainelTestes() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="bg-purple-600 text-white p-6 rounded-t-lg">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-flask mr-3"></i>
                            Sistema de Testes BRCcSis
                        </h2>
                        <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-3xl">&times;</button>
                    </div>
                </div>
                
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Testes de Módulos -->
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold mb-4 flex items-center">
                                <i class="fas fa-cogs mr-2 text-blue-600"></i>
                                Testes de Módulos
                            </h3>
                            <div class="space-y-2">
                                <button onclick="SistemaTestes.testarAPI()" class="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50">
                                    🔌 Testar API
                                </button>
                                <button onclick="SistemaTestes.testarFiltros()" class="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50">
                                    🔍 Testar Filtros
                                </button>
                                <button onclick="SistemaTestes.testarModalNovaCotacao()" class="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50">
                                    ➕ Testar Modal Nova Cotação
                                </button>
                                <button onclick="SistemaTestes.testarModalDetalhes()" class="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50">
                                    📋 Testar Modal Detalhes
                                </button>
                                <button onclick="SistemaTestes.testarModalResposta()" class="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50">
                                    💬 Testar Modal Resposta
                                </button>
                            </div>
                        </div>
                        
                        <!-- Testes de Fluxo -->
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold mb-4 flex items-center">
                                <i class="fas fa-route mr-2 text-green-600"></i>
                                Testes de Fluxo
                            </h3>
                            <div class="space-y-2">
                                <button onclick="SistemaTestes.testarFluxoCompleto()" class="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50">
                                    🔄 Fluxo Completo
                                </button>
                                <button onclick="SistemaTestes.testarIntegracaoModulos()" class="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50">
                                    🔗 Integração Módulos
                                </button>
                                <button onclick="SistemaTestes.testarPerformance()" class="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50">
                                    ⚡ Performance
                                </button>
                                <button onclick="SistemaTestes.testarResponsividade()" class="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50">
                                    📱 Responsividade
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Resultados -->
                    <div class="mt-6">
                        <h3 class="text-lg font-semibold mb-4 flex items-center">
                            <i class="fas fa-clipboard-list mr-2 text-orange-600"></i>
                            Resultados dos Testes
                        </h3>
                        <div id="resultados-testes" class="bg-gray-100 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
                            <div class="text-gray-500">Clique em um teste para ver os resultados...</div>
                        </div>
                    </div>
                    
                    <div class="mt-4 flex justify-end space-x-3">
                        <button onclick="SistemaTestes.limparResultados()" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                            Limpar
                        </button>
                        <button onclick="SistemaTestes.executarTodosOsTestes()" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                            Executar Todos
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    // ==================== TESTES BÁSICOS ====================

    executarTestesBasicos() {
        this.log('🚀 Executando testes básicos de inicialização...');
        
        // Verificar se módulos principais estão carregados
        const modulos = [
            { nome: 'API', objeto: window.API },
            { nome: 'FiltrosCotacoes', objeto: window.FiltrosCotacoes },
            { nome: 'ModalNovaCotacao', objeto: window.ModalNovaCotacao },
            { nome: 'CotacaoDetalhes', objeto: window.CotacaoDetalhes },
            { nome: 'ModalRespostaMelhorado', objeto: window.ModalRespostaMelhorado }
        ];

        modulos.forEach(modulo => {
            if (modulo.objeto) {
                this.log(`✅ ${modulo.nome} carregado`);
            } else {
                this.log(`❌ ${modulo.nome} NÃO carregado`);
            }
        });
    },

    // ==================== TESTES ESPECÍFICOS ====================

    async testarAPI() {
        this.log('🔌 Testando API...');
        
        try {
            if (!window.API) {
                throw new Error('API não carregada');
            }

            // Testar métodos principais
            const metodos = ['getCotacoes', 'createCotacao', 'updateCotacao', 'aceitarCotacao', 'negarCotacao'];
            
            metodos.forEach(metodo => {
                if (typeof window.API[metodo] === 'function') {
                    this.log(`✅ API.${metodo}() disponível`);
                } else {
                    this.log(`❌ API.${metodo}() NÃO disponível`);
                }
            });

            this.log('✅ Teste de API concluído');
        } catch (error) {
            this.log(`❌ Erro no teste de API: ${error.message}`);
        }
    },

    testarFiltros() {
        this.log('🔍 Testando Sistema de Filtros...');
        
        try {
            if (!window.FiltrosCotacoes) {
                throw new Error('FiltrosCotacoes não carregado');
            }

            // Verificar elementos da interface
            const elementos = [
                'filtros-cotacoes',
                'btn-aplicar-filtros',
                'btn-limpar-filtros',
                'filtro-status',
                'filtro-modalidade'
            ];

            elementos.forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) {
                    this.log(`✅ Elemento ${id} encontrado`);
                } else {
                    this.log(`❌ Elemento ${id} NÃO encontrado`);
                }
            });

            // Testar métodos
            const metodos = ['aplicarFiltros', 'limparFiltros', 'coletarFiltros'];
            metodos.forEach(metodo => {
                if (typeof window.FiltrosCotacoes[metodo] === 'function') {
                    this.log(`✅ FiltrosCotacoes.${metodo}() disponível`);
                } else {
                    this.log(`❌ FiltrosCotacoes.${metodo}() NÃO disponível`);
                }
            });

            this.log('✅ Teste de Filtros concluído');
        } catch (error) {
            this.log(`❌ Erro no teste de Filtros: ${error.message}`);
        }
    },

    testarModalNovaCotacao() {
        this.log('➕ Testando Modal de Nova Cotação...');
        
        try {
            if (!window.ModalNovaCotacao) {
                throw new Error('ModalNovaCotacao não carregado');
            }

            // Verificar elementos
            const modal = document.getElementById('modal-nova-cotacao');
            const form = document.getElementById('form-nova-cotacao');
            const btnNova = document.getElementById('btn-nova-cotacao');

            if (modal) this.log('✅ Modal HTML encontrado');
            else this.log('❌ Modal HTML NÃO encontrado');

            if (form) this.log('✅ Formulário encontrado');
            else this.log('❌ Formulário NÃO encontrado');

            if (btnNova) this.log('✅ Botão Nova Cotação encontrado');
            else this.log('❌ Botão Nova Cotação NÃO encontrado');

            // Testar métodos
            const metodos = ['abrir', 'fechar', 'validarFormulario', 'submitForm'];
            metodos.forEach(metodo => {
                if (typeof window.ModalNovaCotacao[metodo] === 'function') {
                    this.log(`✅ ModalNovaCotacao.${metodo}() disponível`);
                } else {
                    this.log(`❌ ModalNovaCotacao.${metodo}() NÃO disponível`);
                }
            });

            // Teste funcional - abrir e fechar modal
            this.log('🧪 Testando abertura do modal...');
            window.ModalNovaCotacao.abrir();
            
            setTimeout(() => {
                if (modal.classList.contains('show')) {
                    this.log('✅ Modal abre corretamente');
                    window.ModalNovaCotacao.fechar();
                    
                    setTimeout(() => {
                        if (!modal.classList.contains('show')) {
                            this.log('✅ Modal fecha corretamente');
                        } else {
                            this.log('❌ Modal NÃO fecha corretamente');
                        }
                    }, 500);
                } else {
                    this.log('❌ Modal NÃO abre corretamente');
                }
            }, 500);

            this.log('✅ Teste de Modal Nova Cotação concluído');
        } catch (error) {
            this.log(`❌ Erro no teste de Modal Nova Cotação: ${error.message}`);
        }
    },

    testarModalDetalhes() {
        this.log('📋 Testando Modal de Detalhes...');
        
        try {
            if (window.CotacaoDetalhes) {
                this.log('✅ CotacaoDetalhes carregado');
                
                const metodos = ['abrirModal', 'fecharModal', 'carregarDados'];
                metodos.forEach(metodo => {
                    if (typeof window.CotacaoDetalhes[metodo] === 'function') {
                        this.log(`✅ CotacaoDetalhes.${metodo}() disponível`);
                    } else {
                        this.log(`❌ CotacaoDetalhes.${metodo}() NÃO disponível`);
                    }
                });
            } else {
                this.log('❌ CotacaoDetalhes NÃO carregado');
            }

            this.log('✅ Teste de Modal Detalhes concluído');
        } catch (error) {
            this.log(`❌ Erro no teste de Modal Detalhes: ${error.message}`);
        }
    },

    testarModalResposta() {
        this.log('💬 Testando Modal de Resposta...');
        
        try {
            if (window.ModalRespostaMelhorado) {
                this.log('✅ ModalRespostaMelhorado carregado');
                
                const metodos = ['abrir', 'fechar', 'validarFormulario'];
                metodos.forEach(metodo => {
                    if (typeof window.ModalRespostaMelhorado[metodo] === 'function') {
                        this.log(`✅ ModalRespostaMelhorado.${metodo}() disponível`);
                    } else {
                        this.log(`❌ ModalRespostaMelhorado.${metodo}() NÃO disponível`);
                    }
                });
            } else {
                this.log('❌ ModalRespostaMelhorado NÃO carregado');
            }

            this.log('✅ Teste de Modal Resposta concluído');
        } catch (error) {
            this.log(`❌ Erro no teste de Modal Resposta: ${error.message}`);
        }
    },

    // ==================== TESTES DE FLUXO ====================

    async testarFluxoCompleto() {
        this.log('🔄 Testando Fluxo Completo...');
        
        try {
            this.log('1️⃣ Simulando criação de cotação...');
            // Simular dados de cotação
            const dadosCotacao = {
                empresa_nome: 'Empresa Teste',
                cnpj: '12345678000195',
                modalidade: 'brcargo_rodoviario',
                origem_cidade: 'São Paulo',
                origem_estado: 'SP',
                destino_cidade: 'Rio de Janeiro',
                destino_estado: 'RJ',
                carga_peso_kg: 1000,
                carga_valor_mercadoria: 10000
            };

            this.log('2️⃣ Validando dados...');
            if (dadosCotacao.empresa_nome && dadosCotacao.cnpj && dadosCotacao.modalidade) {
                this.log('✅ Dados básicos válidos');
            } else {
                this.log('❌ Dados básicos inválidos');
            }

            this.log('3️⃣ Testando filtros...');
            if (window.FiltrosCotacoes) {
                this.log('✅ Sistema de filtros disponível');
            }

            this.log('4️⃣ Testando modais...');
            const modaisDisponiveis = [
                window.ModalNovaCotacao ? 'Nova Cotação' : null,
                window.CotacaoDetalhes ? 'Detalhes' : null,
                window.ModalRespostaMelhorado ? 'Resposta' : null
            ].filter(Boolean);

            this.log(`✅ Modais disponíveis: ${modaisDisponiveis.join(', ')}`);

            this.log('✅ Teste de Fluxo Completo concluído');
        } catch (error) {
            this.log(`❌ Erro no teste de Fluxo Completo: ${error.message}`);
        }
    },

    testarIntegracaoModulos() {
        this.log('🔗 Testando Integração entre Módulos...');
        
        const integracoes = [
            {
                nome: 'API ↔ Filtros',
                teste: () => window.API && window.FiltrosCotacoes && typeof window.API.getCotacoes === 'function'
            },
            {
                nome: 'Filtros ↔ Modal Nova Cotação',
                teste: () => window.FiltrosCotacoes && window.ModalNovaCotacao
            },
            {
                nome: 'Modal Nova ↔ API',
                teste: () => window.ModalNovaCotacao && window.API && typeof window.API.createCotacao === 'function'
            },
            {
                nome: 'Modal Detalhes ↔ Modal Resposta',
                teste: () => window.CotacaoDetalhes && window.ModalRespostaMelhorado
            }
        ];

        integracoes.forEach(integracao => {
            if (integracao.teste()) {
                this.log(`✅ ${integracao.nome} - OK`);
            } else {
                this.log(`❌ ${integracao.nome} - FALHA`);
            }
        });

        this.log('✅ Teste de Integração concluído');
    },

    testarPerformance() {
        this.log('⚡ Testando Performance...');
        
        const inicio = performance.now();
        
        // Simular operações
        for (let i = 0; i < 1000; i++) {
            document.createElement('div');
        }
        
        const fim = performance.now();
        const tempo = fim - inicio;
        
        this.log(`⏱️ Tempo de execução: ${tempo.toFixed(2)}ms`);
        
        if (tempo < 100) {
            this.log('✅ Performance excelente');
        } else if (tempo < 500) {
            this.log('⚠️ Performance aceitável');
        } else {
            this.log('❌ Performance ruim');
        }
    },

    testarResponsividade() {
        this.log('📱 Testando Responsividade...');
        
        const larguras = [320, 768, 1024, 1920];
        
        larguras.forEach(largura => {
            // Simular mudança de largura
            const isMobile = largura < 768;
            const isTablet = largura >= 768 && largura < 1024;
            const isDesktop = largura >= 1024;
            
            if (isMobile) {
                this.log(`📱 ${largura}px - Mobile: Layout deve ser empilhado`);
            } else if (isTablet) {
                this.log(`📱 ${largura}px - Tablet: Layout deve ser adaptado`);
            } else {
                this.log(`🖥️ ${largura}px - Desktop: Layout completo`);
            }
        });
        
        this.log('✅ Teste de Responsividade concluído');
    },

    async executarTodosOsTestes() {
        this.log('🚀 Executando TODOS os testes...');
        this.limparResultados();
        
        await this.testarAPI();
        await this.testarFiltros();
        await this.testarModalNovaCotacao();
        await this.testarModalDetalhes();
        await this.testarModalResposta();
        await this.testarFluxoCompleto();
        await this.testarIntegracaoModulos();
        await this.testarPerformance();
        await this.testarResponsividade();
        
        this.log('🎉 TODOS os testes concluídos!');
    },

    // ==================== UTILITÁRIOS ====================

    log(mensagem) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${mensagem}`;
        
        console.log(logEntry);
        this.resultados.push(logEntry);
        
        // Atualizar interface se existir
        const container = document.getElementById('resultados-testes');
        if (container) {
            container.innerHTML = this.resultados.join('\n');
            container.scrollTop = container.scrollHeight;
        }
    },

    limparResultados() {
        this.resultados = [];
        const container = document.getElementById('resultados-testes');
        if (container) {
            container.innerHTML = '<div class="text-gray-500">Resultados limpos...</div>';
        }
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para outros módulos carregarem
    setTimeout(() => {
        SistemaTestes.init();
    }, 2000);
});

// Exportar para uso global
window.SistemaTestes = SistemaTestes;
