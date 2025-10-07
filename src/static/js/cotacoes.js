// ==================== COTAÇÕES SIMPLES ====================
// CRUD básico e funcional - SEM over-engineering

console.log('📋 Cotações Simples v2.0');

const Cotacoes = {
    cotacoes: [],
    
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
        
        if (this.cotacoes.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <p>Nenhuma cotação encontrada</p>
                    <button onclick="Cotacoes.showNewModal()" class="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
                        <i class="fas fa-plus mr-2"></i>Criar Nova Cotação
                    </button>
                </div>
            `;
            return;
        }
        
        this.cotacoes.forEach(cotacao => {
            const card = this.createCard(cotacao);
            container.appendChild(card);
        });
        
        console.log('✅ Lista renderizada:', this.cotacoes.length, 'cotações');
    },
    
    createCard(cotacao) {
        const statusColors = {
            'solicitada': 'bg-yellow-100 text-yellow-800',
            'aceita_operador': 'bg-blue-100 text-blue-800',
            'finalizada': 'bg-green-100 text-green-800'
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
            'finalizada': 'Finalizada'
        };
        return statusMap[status] || status;
    },
    
    getActionButtons(cotacao) {
        if (cotacao.status === 'solicitada') {
            return `
                <button onclick="Cotacoes.accept(${cotacao.id})" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Aceitar
                </button>
                <button onclick="Cotacoes.reject(${cotacao.id})" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Negar
                </button>
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
        console.log('✅ Nova cotação criada:', newCotacao);
        return newCotacao;
    }
};

// Exportar para uso global
window.Cotacoes = Cotacoes;
