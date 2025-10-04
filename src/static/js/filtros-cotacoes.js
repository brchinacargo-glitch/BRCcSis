// ==================== SISTEMA DE FILTROS AVANÇADOS ====================
// Filtros por status, cliente, datas, operador, modalidade

const FiltrosCotacoes = {
    // Estado dos filtros
    filtrosAtivos: {
        status: '',
        modalidade: '',
        operador: '',
        cliente: '',
        dataInicio: '',
        dataFim: '',
        valorMin: '',
        valorMax: ''
    },
    
    // Dados para dropdowns
    operadores: [],
    clientes: [],
    
    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.criarInterfaceFiltros();
        this.setupEventListeners();
        this.carregarDadosFiltros();
        
        // Mostrar mensagem inicial
        this.mostrarMensagemInicial();
        
        console.log('✅ Sistema de Filtros inicializado');
    },
    
    mostrarMensagemInicial() {
        const container = document.getElementById('lista-cotacoes');
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-filter text-blue-400 text-4xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Sistema de Filtros Ativo</h3>
                <p class="text-gray-500 mb-4">Use os filtros acima para buscar cotações ou clique em "Aplicar" para ver todas.</p>
                <button 
                    onclick="FiltrosCotacoes.aplicarFiltros()" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <i class="fas fa-search mr-2"></i>Carregar Todas as Cotações
                </button>
            </div>
        `;
        
        // Zerar contador
        this.atualizarContador(0, 0);
    },
    
    criarInterfaceFiltros() {
        const container = document.getElementById('filtros-cotacoes');
        if (!container) {
            console.warn('Container de filtros não encontrado');
            return;
        }
        
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                        <i class="fas fa-filter text-blue-600 mr-2"></i>
                        Filtros Avançados
                    </h3>
                    <div class="flex space-x-2">
                        <button id="btn-aplicar-filtros" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-search mr-2"></i>Aplicar
                        </button>
                        <button id="btn-limpar-filtros" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                            <i class="fas fa-times mr-2"></i>Limpar
                        </button>
                        <button id="btn-toggle-filtros" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                            <i class="fas fa-chevron-up mr-2"></i>Ocultar
                        </button>
                    </div>
                </div>
                
                <div id="painel-filtros" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Status -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select id="filtro-status" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Todos os status</option>
                            <option value="solicitada">Solicitada</option>
                            <option value="aceita_operador">Aceita pelo Operador</option>
                            <option value="cotacao_enviada">Cotação Enviada</option>
                            <option value="aceita_consultor">Aceita pelo Consultor</option>
                            <option value="negada_consultor">Negada</option>
                            <option value="finalizada">Finalizada</option>
                        </select>
                    </div>
                    
                    <!-- Modalidade -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Modalidade</label>
                        <select id="filtro-modalidade" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Todas as modalidades</option>
                            <option value="brcargo_rodoviario">BRCargo Rodoviário</option>
                            <option value="brcargo_maritimo">BRCargo Marítimo</option>
                            <option value="frete_aereo">Frete Aéreo</option>
                        </select>
                    </div>
                    
                    <!-- Operador -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Operador</label>
                        <select id="filtro-operador" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Todos os operadores</option>
                            <!-- Preenchido dinamicamente -->
                        </select>
                    </div>
                    
                    <!-- Cliente -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                        <input 
                            type="text" 
                            id="filtro-cliente" 
                            placeholder="Nome ou CNPJ do cliente..."
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                    </div>
                    
                    <!-- Data Início -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                        <input 
                            type="date" 
                            id="filtro-data-inicio" 
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                    </div>
                    
                    <!-- Data Fim -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                        <input 
                            type="date" 
                            id="filtro-data-fim" 
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                    </div>
                    
                    <!-- Valor Mínimo -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Valor Mín. Frete</label>
                        <input 
                            type="text" 
                            id="filtro-valor-min" 
                            placeholder="R$ 0,00"
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 campo-monetario"
                        >
                    </div>
                    
                    <!-- Valor Máximo -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Valor Máx. Frete</label>
                        <input 
                            type="text" 
                            id="filtro-valor-max" 
                            placeholder="R$ 0,00"
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 campo-monetario"
                        >
                    </div>
                </div>
                
                <!-- Filtros Ativos -->
                <div id="filtros-ativos" class="mt-4 hidden">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-tags text-blue-600 mr-2"></i>
                        <span class="text-sm font-medium text-gray-700">Filtros Ativos:</span>
                    </div>
                    <div id="tags-filtros" class="flex flex-wrap gap-2"></div>
                </div>
            </div>
        `;
    },
    
    setupEventListeners() {
        // Botões principais
        document.getElementById('btn-aplicar-filtros')?.addEventListener('click', () => {
            this.aplicarFiltros();
        });
        
        document.getElementById('btn-limpar-filtros')?.addEventListener('click', () => {
            this.limparFiltros();
        });
        
        document.getElementById('btn-toggle-filtros')?.addEventListener('click', () => {
            this.togglePainelFiltros();
        });
        
        // Formatação monetária
        this.configurarCamposMonetarios();
        
        // Enter para aplicar filtros
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.closest('#painel-filtros')) {
                this.aplicarFiltros();
            }
        });
        
        // Filtros rápidos (mudança imediata)
        document.getElementById('filtro-status')?.addEventListener('change', () => {
            this.aplicarFiltros();
        });
        
        document.getElementById('filtro-modalidade')?.addEventListener('change', () => {
            this.aplicarFiltros();
        });
    },
    
    configurarCamposMonetarios() {
        const camposMonetarios = document.querySelectorAll('.campo-monetario');
        camposMonetarios.forEach(campo => {
            campo.addEventListener('input', (e) => {
                let valor = e.target.value.replace(/\D/g, '');
                if (valor) {
                    valor = (valor / 100).toFixed(2);
                    valor = valor.replace('.', ',');
                    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                    e.target.value = 'R$ ' + valor;
                } else {
                    e.target.value = '';
                }
            });
        });
    },
    
    // ==================== CARREGAMENTO DE DADOS ====================
    
    async carregarDadosFiltros() {
        try {
            // Carregar operadores
            await this.carregarOperadores();
            
            // Carregar clientes (se necessário)
            // await this.carregarClientes();
            
        } catch (error) {
            console.error('Erro ao carregar dados dos filtros:', error);
        }
    },
    
    async carregarOperadores() {
        try {
            if (window.API && typeof API.getOperadores === 'function') {
                console.log('Carregando operadores da API...');
                const response = await API.getOperadores();
                
                if (response.success) {
                    this.operadores = response.data || [];
                    console.log(`${this.operadores.length} operadores carregados`);
                } else {
                    console.error('Erro ao carregar operadores:', response.message);
                    this.operadores = [];
                }
            } else {
                console.warn('API getOperadores não disponível');
                this.operadores = [];
            }
            
            this.preencherDropdownOperadores();
            
        } catch (error) {
            console.error('Erro ao carregar operadores:', error);
            this.operadores = [];
            this.preencherDropdownOperadores();
        }
    },
    
    preencherDropdownOperadores() {
        const select = document.getElementById('filtro-operador');
        if (!select) return;
        
        // Limpar opções existentes (exceto a primeira)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Adicionar operadores
        this.operadores.forEach(operador => {
            const option = document.createElement('option');
            option.value = operador.id;
            option.textContent = operador.nome;
            select.appendChild(option);
        });
    },
    
    // ==================== APLICAÇÃO DE FILTROS ====================
    
    aplicarFiltros() {
        // Coletar valores dos filtros
        this.coletarFiltros();
        
        // Mostrar filtros ativos
        this.mostrarFiltrosAtivos();
        
        // Aplicar filtros na listagem
        this.filtrarCotacoes();
        
        console.log('Filtros aplicados:', this.filtrosAtivos);
    },
    
    coletarFiltros() {
        this.filtrosAtivos = {
            status: document.getElementById('filtro-status')?.value || '',
            modalidade: document.getElementById('filtro-modalidade')?.value || '',
            operador: document.getElementById('filtro-operador')?.value || '',
            cliente: document.getElementById('filtro-cliente')?.value || '',
            dataInicio: document.getElementById('filtro-data-inicio')?.value || '',
            dataFim: document.getElementById('filtro-data-fim')?.value || '',
            valorMin: this.extrairValorMonetario(document.getElementById('filtro-valor-min')?.value || ''),
            valorMax: this.extrairValorMonetario(document.getElementById('filtro-valor-max')?.value || '')
        };
    },
    
    mostrarFiltrosAtivos() {
        const container = document.getElementById('filtros-ativos');
        const tagsContainer = document.getElementById('tags-filtros');
        
        if (!container || !tagsContainer) return;
        
        // Limpar tags existentes
        tagsContainer.innerHTML = '';
        
        let temFiltros = false;
        
        // Criar tags para cada filtro ativo
        Object.entries(this.filtrosAtivos).forEach(([key, value]) => {
            if (value && value !== '') {
                temFiltros = true;
                const tag = this.criarTagFiltro(key, value);
                tagsContainer.appendChild(tag);
            }
        });
        
        // Mostrar/ocultar container
        if (temFiltros) {
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    },
    
    criarTagFiltro(key, value) {
        const tag = document.createElement('span');
        tag.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800';
        
        const label = this.getLabelFiltro(key, value);
        
        tag.innerHTML = `
            ${label}
            <button class="ml-2 text-blue-600 hover:text-blue-800" onclick="FiltrosCotacoes.removerFiltro('${key}')">
                <i class="fas fa-times text-xs"></i>
            </button>
        `;
        
        return tag;
    },
    
    getLabelFiltro(key, value) {
        const labels = {
            status: `Status: ${this.getStatusDisplay(value)}`,
            modalidade: `Modalidade: ${this.getModalidadeDisplay(value)}`,
            operador: `Operador: ${this.getOperadorNome(value)}`,
            cliente: `Cliente: ${value}`,
            dataInicio: `De: ${this.formatarData(value)}`,
            dataFim: `Até: ${this.formatarData(value)}`,
            valorMin: `Valor mín: R$ ${value.toFixed(2).replace('.', ',')}`,
            valorMax: `Valor máx: R$ ${value.toFixed(2).replace('.', ',')}`
        };
        
        return labels[key] || `${key}: ${value}`;
    },
    
    removerFiltro(key) {
        // Limpar filtro específico
        this.filtrosAtivos[key] = '';
        
        // Limpar campo correspondente
        const campo = document.getElementById(`filtro-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
        if (campo) {
            campo.value = '';
        }
        
        // Reaplicar filtros
        this.aplicarFiltros();
    },
    
    async filtrarCotacoes() {
        // Mostrar loading
        this.mostrarLoading();
        
        // Integrar com o sistema de cotações existente
        if (window.Cotacoes && typeof Cotacoes.aplicarFiltros === 'function') {
            console.log('Aplicando filtros via Cotacoes.aplicarFiltros:', this.filtrosAtivos);
            
            // Primeiro carregar as cotações se necessário
            if (!window.Cotacoes.cotacoes || window.Cotacoes.cotacoes.length === 0) {
                console.log('Carregando cotações primeiro...');
                await window.Cotacoes.load();
            }
            
            // Aplicar filtros
            window.Cotacoes.aplicarFiltros(this.filtrosAtivos);
        } else {
            console.warn('Sistema de cotações não encontrado, usando implementação direta');
            await this.filtrarCotacoesDireto();
        }
    },
    
    mostrarLoading() {
        const container = document.getElementById('lista-cotacoes');
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Carregando Cotações...</h3>
                <p class="text-gray-500">Aguarde enquanto buscamos os dados.</p>
            </div>
        `;
    },
    
    async filtrarCotacoesDireto() {
        try {
            // Carregar cotações apenas da API
            let cotacoes = [];
            
            if (window.API && typeof API.getCotacoes === 'function') {
                console.log('Carregando cotações da API...');
                const response = await API.getCotacoes();
                
                if (response.success) {
                    cotacoes = response.data || [];
                    console.log(`${cotacoes.length} cotações carregadas da API`);
                } else {
                    console.error('Erro na resposta da API:', response.message);
                    this.mostrarErroCarregamento('Erro ao carregar cotações: ' + (response.message || 'Erro desconhecido'));
                    return;
                }
            } else {
                console.error('API não disponível');
                this.mostrarErroCarregamento('Sistema de API não está disponível');
                return;
            }
            
            // Aplicar filtros apenas se houver cotações
            if (cotacoes.length > 0) {
                const cotacoesFiltradas = cotacoes.filter(cotacao => {
                    return this.cotacaoPassaFiltros(cotacao);
                });
                
                console.log(`Filtros aplicados: ${cotacoesFiltradas.length} de ${cotacoes.length} cotações`);
                this.renderizarCotacoesFiltradas(cotacoesFiltradas, cotacoes.length);
            } else {
                console.log('Nenhuma cotação encontrada na API');
                this.renderizarCotacoesFiltradas([], 0);
            }
            
        } catch (error) {
            console.error('Erro ao filtrar cotações:', error);
            this.mostrarErroCarregamento('Erro de conexão com o servidor');
        }
    },
    
    cotacaoPassaFiltros(cotacao) {
        const filtros = this.filtrosAtivos;
        
        // Filtro por status
        if (filtros.status && cotacao.status !== filtros.status) {
            return false;
        }
        
        // Filtro por modalidade
        if (filtros.modalidade && cotacao.modalidade !== filtros.modalidade) {
            return false;
        }
        
        // Filtro por operador
        if (filtros.operador && cotacao.operador_id != filtros.operador) {
            return false;
        }
        
        // Filtro por cliente
        if (filtros.cliente) {
            const cliente = filtros.cliente.toLowerCase();
            const nomeCliente = (cotacao.cliente_nome || '').toLowerCase();
            const cnpjCliente = (cotacao.cliente_cnpj || '').toLowerCase();
            
            if (!nomeCliente.includes(cliente) && !cnpjCliente.includes(cliente)) {
                return false;
            }
        }
        
        // Filtro por data
        if (filtros.dataInicio) {
            const dataInicio = new Date(filtros.dataInicio);
            const dataCotacao = new Date(cotacao.data_criacao);
            if (dataCotacao < dataInicio) {
                return false;
            }
        }
        
        if (filtros.dataFim) {
            const dataFim = new Date(filtros.dataFim);
            dataFim.setHours(23, 59, 59); // Incluir o dia inteiro
            const dataCotacao = new Date(cotacao.data_criacao);
            if (dataCotacao > dataFim) {
                return false;
            }
        }
        
        // Filtro por valor
        if (filtros.valorMin && cotacao.valor_frete) {
            const valorFrete = parseFloat(cotacao.valor_frete) || 0;
            if (valorFrete < filtros.valorMin) {
                return false;
            }
        }
        
        if (filtros.valorMax && cotacao.valor_frete) {
            const valorFrete = parseFloat(cotacao.valor_frete) || 0;
            if (valorFrete > filtros.valorMax) {
                return false;
            }
        }
        
        return true;
    },
    
    // ==================== AÇÕES ====================
    
    limparFiltros() {
        // Limpar objeto de filtros
        Object.keys(this.filtrosAtivos).forEach(key => {
            this.filtrosAtivos[key] = '';
        });
        
        // Limpar campos do formulário
        document.getElementById('filtro-status').value = '';
        document.getElementById('filtro-modalidade').value = '';
        document.getElementById('filtro-operador').value = '';
        document.getElementById('filtro-cliente').value = '';
        document.getElementById('filtro-data-inicio').value = '';
        document.getElementById('filtro-data-fim').value = '';
        document.getElementById('filtro-valor-min').value = '';
        document.getElementById('filtro-valor-max').value = '';
        
        // Ocultar filtros ativos
        document.getElementById('filtros-ativos').classList.add('hidden');
        
        // Reaplicar filtros (vazio = mostrar todos)
        this.filtrarCotacoes();
        
        console.log('Filtros limpos');
    },
    
    togglePainelFiltros() {
        const painel = document.getElementById('painel-filtros');
        const btn = document.getElementById('btn-toggle-filtros');
        const icon = btn.querySelector('i');
        
        if (painel.style.display === 'none') {
            painel.style.display = 'grid';
            icon.className = 'fas fa-chevron-up mr-2';
            btn.innerHTML = '<i class="fas fa-chevron-up mr-2"></i>Ocultar';
        } else {
            painel.style.display = 'none';
            icon.className = 'fas fa-chevron-down mr-2';
            btn.innerHTML = '<i class="fas fa-chevron-down mr-2"></i>Mostrar';
        }
    },
    
    // ==================== FUNÇÕES AUXILIARES ====================
    
    extrairValorMonetario(valor) {
        if (!valor) return 0;
        return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    },
    
    formatarData(data) {
        if (!data) return '';
        return new Date(data).toLocaleDateString('pt-BR');
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
    
    getOperadorNome(operadorId) {
        const operador = this.operadores.find(op => op.id == operadorId);
        return operador ? operador.nome : `Operador ${operadorId}`;
    },
    
    mostrarErroCarregamento(mensagem) {
        const container = document.getElementById('lista-cotacoes');
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Erro ao Carregar Cotações</h3>
                <p class="text-gray-500 mb-4">${mensagem}</p>
                <button 
                    onclick="FiltrosCotacoes.recarregarDados()" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <i class="fas fa-sync-alt mr-2"></i>Tentar Novamente
                </button>
            </div>
        `;
        
        // Atualizar contador
        this.atualizarContador(0, 0);
    },
    
    recarregarDados() {
        console.log('Recarregando dados...');
        this.filtrarCotacoesDireto();
    },
    
    renderizarCotacoesFiltradas(cotacoes, total = null) {
        console.log(`Renderizando ${cotacoes.length} cotações filtradas`);
        
        // Atualizar contador
        this.atualizarContador(cotacoes.length, total || cotacoes.length);
        
        // Renderizar lista
        const container = document.getElementById('lista-cotacoes');
        if (!container) {
            console.warn('Container lista-cotacoes não encontrado');
            return;
        }
        
        container.innerHTML = '';
        
        if (cotacoes.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-search text-gray-400 text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma cotação encontrada</h3>
                    <p class="text-gray-500">Tente ajustar os filtros para encontrar mais resultados.</p>
                </div>
            `;
            return;
        }
        
        cotacoes.forEach(cotacao => {
            const card = this.criarCardCotacao(cotacao);
            container.appendChild(card);
        });
        
        // Emitir evento para outros componentes
        document.dispatchEvent(new CustomEvent('cotacoesFiltradas', {
            detail: { cotacoes, total }
        }));
    },
    
    criarCardCotacao(cotacao) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow';
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h4 class="text-lg font-semibold text-gray-900">
                        Cotação #${cotacao.numero_cotacao || cotacao.id}
                    </h4>
                    <p class="text-sm text-gray-600">${cotacao.cliente_nome}</p>
                </div>
                <span class="status-badge status-${cotacao.status}">
                    ${this.getStatusDisplay(cotacao.status)}
                </span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                    <span class="font-medium text-gray-700">Modalidade:</span>
                    <span class="text-gray-600">${this.getModalidadeDisplay(cotacao.modalidade)}</span>
                </div>
                <div>
                    <span class="font-medium text-gray-700">Operador:</span>
                    <span class="text-gray-600">${cotacao.operador_nome || 'N/A'}</span>
                </div>
                <div>
                    <span class="font-medium text-gray-700">Origem:</span>
                    <span class="text-gray-600">${cotacao.origem_cidade}/${cotacao.origem_estado}</span>
                </div>
                <div>
                    <span class="font-medium text-gray-700">Destino:</span>
                    <span class="text-gray-600">${cotacao.destino_cidade}/${cotacao.destino_estado}</span>
                </div>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                    Criada em ${this.formatarData(cotacao.data_criacao)}
                </div>
                <div class="flex space-x-2">
                    <button 
                        onclick="FiltrosCotacoes.verDetalhes(${cotacao.id})"
                        class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                        Ver Detalhes
                    </button>
                </div>
            </div>
        `;
        
        return card;
    },
    
    atualizarContador(filtradas, total) {
        const contador = document.getElementById('contador-cotacoes');
        if (contador) {
            if (filtradas === total) {
                contador.textContent = `${total} cotação${total !== 1 ? 'ões' : ''}`;
            } else {
                contador.textContent = `${filtradas} de ${total} cotação${total !== 1 ? 'ões' : ''}`;
            }
        }
    },
    
    verDetalhes(id) {
        // Integrar com sistema de detalhes
        if (window.CotacaoDetalhes && typeof CotacaoDetalhes.abrirModal === 'function') {
            CotacaoDetalhes.abrirModal(id);
        } else {
            console.log(`Ver detalhes da cotação ${id}`);
            alert(`Funcionalidade de detalhes será implementada para cotação ${id}`);
        }
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    FiltrosCotacoes.init();
});

// Exportar para uso global
window.FiltrosCotacoes = FiltrosCotacoes;
