// ==================== COTAÇÕES SIMPLES ====================
// CRUD básico e funcional - SEM over-engineering

console.log('📋 Cotações Simples v2.0');

const Cotacoes = {
    cotacoes: [],
    filtros: {
        cliente: '',
        status: '',
        modalidade: ''
    },
    
    init() {
        console.log('🚀 Inicializando cotações simples...');
        this.setupEventListeners();
        this.loadData();
    },
    
    setupEventListeners() {
        // Botão de nova cotação
        const btnNova = document.getElementById('btn-nova-cotacao');
        if (btnNova) {
            btnNova.addEventListener('click', () => this.showNewModal());
        }
        
        // Fechar modal
        const btnFechar = document.getElementById('fechar-modal-cotacao');
        if (btnFechar) {
            btnFechar.addEventListener('click', () => this.hideModal());
        }
        
        const btnCancelar = document.getElementById('cancelar-cotacao');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => this.hideModal());
        }
        
        // Submeter formulário
        const form = document.getElementById('form-cotacao');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Fechar modal clicando fora
        const modal = document.getElementById('modal-nova-cotacao');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
        
        // Filtros
        this.setupFiltros();
    },
    
    setupFiltros() {
        // Busca por cliente (com debounce)
        const buscaCliente = document.getElementById('busca-cliente');
        if (buscaCliente) {
            let timeout;
            buscaCliente.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.filtros.cliente = e.target.value.toLowerCase();
                    this.aplicarFiltros();
                }, 300);
            });
        }
        
        // Filtro por status
        const filtroStatus = document.getElementById('filtro-status');
        if (filtroStatus) {
            filtroStatus.addEventListener('change', (e) => {
                this.filtros.status = e.target.value;
                this.aplicarFiltros();
            });
        }
        
        // Filtro por modalidade
        const filtroModalidade = document.getElementById('filtro-modalidade');
        if (filtroModalidade) {
            filtroModalidade.addEventListener('change', (e) => {
                this.filtros.modalidade = e.target.value;
                this.aplicarFiltros();
            });
        }
        
        // Botão aplicar filtros
        const btnAplicar = document.getElementById('btn-aplicar-filtros');
        if (btnAplicar) {
            btnAplicar.addEventListener('click', () => {
                this.aplicarFiltros();
            });
        }
        
        // Botão limpar filtros
        const btnLimpar = document.getElementById('btn-limpar-filtros');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                this.limparFiltros();
            });
        }
    },
    
    loadData() {
        // Tentar API primeiro
        if (window.API && typeof API.getCotacoes === 'function') {
            this.loadFromAPI();
        } else {
            // Fallback: localStorage
            this.loadFromStorage();
        }
    },
    
    async loadFromAPI() {
        try {
            const response = await API.getCotacoes();
            if (response.success) {
                this.cotacoes = response.cotacoes || response.data || [];
                this.render();
                console.log('✅ Cotações carregadas da API:', this.cotacoes.length);
            } else {
                this.loadFromStorage();
            }
        } catch (error) {
            console.log('📋 API não disponível, usando localStorage');
            this.loadFromStorage();
        }
    },
    
    loadFromStorage() {
        const saved = localStorage.getItem('cotacoes');
        if (saved) {
            this.cotacoes = JSON.parse(saved);
        } else {
            // Dados de exemplo
            this.cotacoes = [
                {
                    id: 1,
                    numero: 'COT-001',
                    cliente: 'Empresa ABC Ltda',
                    status: 'solicitada',
                    modalidade: 'rodoviario',
                    origem: 'São Paulo - SP',
                    destino: 'Rio de Janeiro - RJ',
                    data: new Date().toLocaleDateString()
                },
                {
                    id: 2,
                    numero: 'COT-002',
                    cliente: 'Transportes XYZ',
                    status: 'aceita_operador',
                    modalidade: 'maritimo',
                    origem: 'Santos - SP',
                    destino: 'Salvador - BA',
                    data: new Date().toLocaleDateString()
                },
                {
                    id: 3,
                    numero: 'COT-003',
                    cliente: 'Logística 123',
                    status: 'finalizada',
                    modalidade: 'rodoviario',
                    origem: 'Belo Horizonte - MG',
                    destino: 'Brasília - DF',
                    data: new Date().toLocaleDateString()
                },
                {
                    id: 4,
                    numero: 'COT-004',
                    cliente: 'Comércio Global',
                    status: 'solicitada',
                    modalidade: 'aereo',
                    origem: 'Guarulhos - SP',
                    destino: 'Manaus - AM',
                    data: new Date().toLocaleDateString()
                },
                {
                    id: 5,
                    numero: 'COT-005',
                    cliente: 'Empresa ABC Ltda',
                    status: 'negada',
                    modalidade: 'maritimo',
                    origem: 'Rio Grande - RS',
                    destino: 'Fortaleza - CE',
                    data: new Date().toLocaleDateString()
                },
                {
                    id: 6,
                    numero: 'COT-006',
                    cliente: 'Indústria Beta',
                    status: 'cotacao_enviada',
                    modalidade: 'rodoviario',
                    origem: 'Curitiba - PR',
                    destino: 'Florianópolis - SC',
                    data: new Date().toLocaleDateString(),
                    resposta: {
                        valor_frete: 1850.00,
                        prazo_entrega: 5,
                        empresa_prestadora: 'transportadora-a',
                        tipo_servico: 'normal',
                        seguro_incluso: true,
                        observacoes: 'Frete inclui seguro total da carga.'
                    }
                },
                {
                    id: 7,
                    numero: 'COT-007',
                    cliente: 'Comércio Sul',
                    status: 'finalizada',
                    modalidade: 'maritimo',
                    origem: 'Porto de Santos - SP',
                    destino: 'Porto de Itajaí - SC',
                    data: new Date().toLocaleDateString(),
                    resposta: {
                        valor_frete: 4200.00,
                        prazo_entrega: 12,
                        empresa_prestadora: 'logistica-express',
                        tipo_servico: 'normal',
                        seguro_incluso: false,
                        observacoes: 'Transporte marítimo com seguro opcional.'
                    }
                }
            ];
            this.saveToStorage();
        }
        this.render();
        console.log('✅ Cotações carregadas do localStorage:', this.cotacoes.length);
    },
    
    saveToStorage() {
        localStorage.setItem('cotacoes', JSON.stringify(this.cotacoes));
    },
    
    render() {
        const container = document.getElementById('lista-cotacoes');
        if (!container) {
            console.warn('Container lista-cotacoes não encontrado');
            return;
        }
        
        container.innerHTML = '';
        
        // Aplicar filtros
        const cotacoesFiltradas = this.filtrarCotacoes();
        
        if (cotacoesFiltradas.length === 0) {
            const mensagem = this.cotacoes.length === 0 ? 
                'Nenhuma cotação encontrada' : 
                'Nenhuma cotação corresponde aos filtros aplicados';
                
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <p>${mensagem}</p>
                    ${this.cotacoes.length === 0 ? `
                        <button onclick="Cotacoes.showNewModal()" class="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
                            <i class="fas fa-plus mr-2"></i>Criar Nova Cotação
                        </button>
                    ` : `
                        <button onclick="Cotacoes.limparFiltros()" class="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                            <i class="fas fa-eraser mr-2"></i>Limpar Filtros
                        </button>
                    `}
                </div>
            `;
            return;
        }
        
        cotacoesFiltradas.forEach(cotacao => {
            const card = this.createCard(cotacao);
            container.appendChild(card);
        });
        
        console.log('✅ Lista renderizada:', this.cotacoes.length, 'cotações');
        this.atualizarContador();
    },
    
    aplicarFiltros() {
        console.log('🔍 Aplicando filtros:', this.filtros);
        this.render();
    },
    
    limparFiltros() {
        // Resetar filtros
        this.filtros = {
            cliente: '',
            status: '',
            modalidade: ''
        };
        
        // Limpar campos da interface
        const buscaCliente = document.getElementById('busca-cliente');
        const filtroStatus = document.getElementById('filtro-status');
        const filtroModalidade = document.getElementById('filtro-modalidade');
        
        if (buscaCliente) buscaCliente.value = '';
        if (filtroStatus) filtroStatus.value = '';
        if (filtroModalidade) filtroModalidade.value = '';
        
        // Re-renderizar
        this.render();
        console.log('✅ Filtros limpos');
    },
    
    filtrarCotacoes() {
        return this.cotacoes.filter(cotacao => {
            // Filtro por cliente
            if (this.filtros.cliente) {
                const cliente = cotacao.cliente.toLowerCase();
                if (!cliente.includes(this.filtros.cliente)) {
                    return false;
                }
            }
            
            // Filtro por status
            if (this.filtros.status) {
                if (cotacao.status !== this.filtros.status) {
                    return false;
                }
            }
            
            // Filtro por modalidade
            if (this.filtros.modalidade) {
                if (cotacao.modalidade !== this.filtros.modalidade) {
                    return false;
                }
            }
            
            return true;
        });
    },
    
    atualizarContador() {
        const cotacoesFiltradas = this.filtrarCotacoes();
        const total = this.cotacoes.length;
        const filtradas = cotacoesFiltradas.length;
        
        // Criar ou atualizar contador
        let contador = document.getElementById('contador-resultados');
        if (!contador) {
            contador = document.createElement('div');
            contador.id = 'contador-resultados';
            contador.className = 'text-sm text-gray-600 mb-4';
            
            const container = document.getElementById('lista-cotacoes');
            if (container && container.parentNode) {
                container.parentNode.insertBefore(contador, container);
            }
        }
        
        if (filtradas === total) {
            contador.textContent = `${total} cotação${total !== 1 ? 'ões' : ''} encontrada${total !== 1 ? 's' : ''}`;
        } else {
            contador.textContent = `${filtradas} de ${total} cotação${total !== 1 ? 'ões' : ''} encontrada${filtradas !== 1 ? 's' : ''}`;
        }
    },
    
    createCard(cotacao) {
        const statusColors = {
            'solicitada': 'bg-yellow-100 text-yellow-800',
            'aceita_operador': 'bg-blue-100 text-blue-800',
            'cotacao_enviada': 'bg-green-100 text-green-800',
            'finalizada': 'bg-green-100 text-green-800',
            'negada': 'bg-red-100 text-red-800'
        };
        
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-6 mb-4';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold">${cotacao.numero}</h3>
                    <p class="text-gray-600">${cotacao.cliente}</p>
                </div>
                <span class="px-2 py-1 rounded-full text-sm ${statusColors[cotacao.status] || 'bg-gray-100 text-gray-800'}">
                    ${this.getStatusText(cotacao.status)}
                </span>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                <div><strong>Modalidade:</strong> ${cotacao.modalidade}</div>
                <div><strong>Data:</strong> ${cotacao.data}</div>
                <div><strong>Origem:</strong> ${cotacao.origem}</div>
                <div><strong>Destino:</strong> ${cotacao.destino}</div>
            </div>
            <div class="flex space-x-2">
                <button onclick="Cotacoes.viewDetails(${cotacao.id})" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Ver Detalhes
                </button>
                ${this.getActionButtons(cotacao)}
            </div>
        `;
        return card;
    },
    
    getStatusText(status) {
        const statusMap = {
            'solicitada': 'Solicitada',
            'aceita_operador': 'Aceita',
            'cotacao_enviada': 'Resposta Enviada',
            'finalizada': 'Finalizada',
            'negada': 'Negada'
        };
        return statusMap[status] || status;
    },
    
    getActionButtons(cotacao) {
        if (cotacao.status === 'solicitada') {
            return `
                <button data-action="aceitar-cotacao" data-cotacao-id="${cotacao.id}" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    <i class="fas fa-check mr-1"></i>Aceitar
                </button>
                <button data-action="negar-cotacao" data-cotacao-id="${cotacao.id}" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    <i class="fas fa-times mr-1"></i>Negar
                </button>
            `;
        }
        
        if (cotacao.status === 'aceita_operador') {
            return `
                <button data-action="responder-cotacao" data-cotacao-id="${cotacao.id}" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <i class="fas fa-reply mr-1"></i>Responder
                </button>
            `;
        }
        
        if (cotacao.status === 'cotacao_enviada') {
            return `
                <button data-action="ver-resposta" data-cotacao-id="${cotacao.id}" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm mr-2">
                    <i class="fas fa-eye mr-1"></i>Ver Resposta
                </button>
                <button data-action="aprovar-cotacao" data-cotacao-id="${cotacao.id}" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm mr-2">
                    <i class="fas fa-check mr-1"></i>Aprovar
                </button>
                <button data-action="recusar-cotacao" data-cotacao-id="${cotacao.id}" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                    <i class="fas fa-times mr-1"></i>Recusar
                </button>
            `;
        }
        
        if (cotacao.status === 'finalizada') {
            return `
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <i class="fas fa-check-circle mr-1"></i>Finalizada
                </span>
            `;
        }
        
        return '';
    },
    
    // Ações básicas
    showNewModal() {
        const modal = document.getElementById('modal-nova-cotacao');
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
            console.log('✅ Modal de nova cotação aberto');
        } else {
            console.warn('Modal não encontrado');
            alert('Modal de nova cotação não encontrado');
        }
    },
    
    hideModal() {
        const modal = document.getElementById('modal-nova-cotacao');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            console.log('✅ Modal fechado');
        }
    },
    
    handleSubmit(e) {
        e.preventDefault();
        console.log('📝 Processando formulário...');
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Extrair dados básicos do formulário
        const data = {
            cliente: formData.get('cliente_nome') || 'Cliente Teste',
            modalidade: formData.get('modalidade') || 'rodoviario',
            origem: this.getOrigemFromForm(formData),
            destino: this.getDestinoFromForm(formData)
        };
        
        console.log('📋 Dados extraídos:', data);
        
        // Validação básica
        if (!data.cliente || !data.origem || !data.destino) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }
        
        // Criar cotação
        const novaCotacao = this.create(data);
        
        // Fechar modal e limpar formulário
        this.hideModal();
        form.reset();
        
        alert(`Cotação ${novaCotacao.numero} criada com sucesso!`);
    },
    
    getOrigemFromForm(formData) {
        // Tentar diferentes campos de origem
        return formData.get('origem_endereco') || 
               formData.get('origem_cidade') || 
               formData.get('porto_origem') || 
               'Origem não informada';
    },
    
    getDestinoFromForm(formData) {
        // Tentar diferentes campos de destino
        return formData.get('destino_endereco') || 
               formData.get('destino_cidade') || 
               formData.get('porto_destino') || 
               'Destino não informado';
    },
    
    viewDetails(id) {
        const cotacao = this.cotacoes.find(c => c.id === id);
        if (cotacao) {
            alert(`Detalhes da Cotação ${cotacao.numero}:\n\nCliente: ${cotacao.cliente}\nStatus: ${this.getStatusText(cotacao.status)}\nOrigem: ${cotacao.origem}\nDestino: ${cotacao.destino}`);
        }
    },
    
    accept(id) {
        if (confirm('Aceitar esta cotação?')) {
            const cotacao = this.cotacoes.find(c => c.id === id);
            if (cotacao) {
                cotacao.status = 'aceita_operador';
                this.saveToStorage();
                this.render();
                
                // Atualizar dashboard
                if (window.Dashboard && typeof Dashboard.refresh === 'function') {
                    Dashboard.refresh();
                }
                
                console.log('✅ Cotação aceita:', id);
            }
        }
    },
    
    reject(id) {
        const motivo = prompt('Motivo da negação:');
        if (motivo) {
            const cotacao = this.cotacoes.find(c => c.id === id);
            if (cotacao) {
                cotacao.status = 'negada';
                cotacao.motivo_negacao = motivo;
                this.saveToStorage();
                this.render();
                
                // Atualizar dashboard
                if (window.Dashboard && typeof Dashboard.refresh === 'function') {
                    Dashboard.refresh();
                }
                
                console.log('✅ Cotação negada:', id, motivo);
            }
        }
    },
    
    // Criar nova cotação
    create(data) {
        const newId = Math.max(...this.cotacoes.map(c => c.id), 0) + 1;
        const newCotacao = {
            id: newId,
            numero: `COT-${String(newId).padStart(3, '0')}`,
            ...data,
            status: 'solicitada',
            data: new Date().toLocaleDateString()
        };
        
        this.cotacoes.push(newCotacao);
        this.saveToStorage();
        this.render();
        
        // Atualizar dashboard
        if (window.Dashboard && typeof Dashboard.refresh === 'function') {
            Dashboard.refresh();
        }
        
        console.log('✅ Nova cotação criada:', newCotacao);
        return newCotacao;
    }
};

// Exportar para uso global
window.Cotacoes = Cotacoes;
