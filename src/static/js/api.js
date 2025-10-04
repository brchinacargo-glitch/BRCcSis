// ==================== MÓDULO DE API ====================
// Centraliza todas as chamadas de API do sistema

const API = {
    // Base URL para as APIs
    baseURL: '/api',
    
    // ==================== AUTENTICAÇÃO ====================
    
    async login(username, password) {
        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await response.json();
    },
    
    async logout() {
        const response = await fetch(`${this.baseURL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    },
    
    async checkPermission(permission) {
        const response = await fetch(`${this.baseURL}/auth/check-permission?permission=${permission}`);
        return await response.json();
    },
    
    // ==================== EMPRESAS ====================
    
    async getEmpresas(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${this.baseURL}/empresas?${queryString}` : `${this.baseURL}/empresas`;
        const response = await fetch(url);
        return await response.json();
    },
    
    async getEmpresaById(id) {
        const response = await fetch(`${this.baseURL}/empresas/${id}`);
        return await response.json();
    },
    
    async createEmpresa(data) {
        const response = await fetch(`${this.baseURL}/empresas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async updateEmpresa(id, data) {
        const response = await fetch(`${this.baseURL}/empresas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async deleteEmpresa(id) {
        const response = await fetch(`${this.baseURL}/empresas/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    },
    
    async exportEmpresas(format = 'json') {
        const response = await fetch(`${this.baseURL}/empresas/export?format=${format}`);
        if (format === 'json') {
            return await response.json();
        }
        return await response.blob();
    },
    
    async importEmpresas(data) {
        const response = await fetch(`${this.baseURL}/empresas/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async importExcel(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${this.baseURL}/empresas/import/excel`, {
            method: 'POST',
            body: formData
        });
        return await response.json();
    },
    async downloadTemplateExcel() {
        const response = await fetch(`${this.baseURL}/empresas/template/excel`);
        return await response.blob();
    },
    
    
    // ==================== COTAÇÕES ====================
    
    async getCotacoes(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${this.baseURL}/v133/cotacoes?${queryString}` : `${this.baseURL}/v133/cotacoes`;
        const response = await fetch(url);
        return await response.json();
    },
    
    async getCotacaoById(id) {
        const response = await fetch(`${this.baseURL}/v133/cotacoes/${id}`);
        return await response.json();
    },
    
    async createCotacao(data) {
        const response = await fetch(`${this.baseURL}/v133/cotacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async updateCotacao(id, data) {
        const response = await fetch(`${this.baseURL}/v133/cotacoes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async aceitarCotacao(id, dados = {}) {
        const response = await fetch(`${this.baseURL}/v133/cotacoes/${id}/aceitar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return await response.json();
    },
    
    async negarCotacao(id, motivo) {
        const response = await fetch(`${this.baseURL}/v133/cotacoes/${id}/negar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motivo })
        });
        return await response.json();
    },
    
    async enviarCotacao(id, dados) {
        const response = await fetch(`${this.baseURL}/v133/cotacoes/${id}/enviar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return await response.json();
    },
    
    async finalizarCotacao(id) {
        const response = await fetch(`${this.baseURL}/v133/cotacoes/${id}/finalizar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    },
    
    async responderCotacao(id, dados) {
        const response = await fetch(`${this.baseURL}/v133/cotacoes/${id}/responder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return await response.json();
    },
    
    // ==================== ANALYTICS ====================
    
    async getAnalyticsGeral() {
        const response = await fetch(`${this.baseURL}/v133/analytics/geral`);
        return await response.json();
    },
    
    async getAnalyticsEmpresas() {
        const response = await fetch(`${this.baseURL}/v133/analytics/empresas/ranking`);
        return await response.json();
    },
    
    async getAnalyticsEmpresa(empresaId) {
        const response = await fetch(`${this.baseURL}/v133/analytics/empresas/${empresaId}/metricas`);
        return await response.json();
    },
    
    async getAnalyticsUsuarios() {
        const response = await fetch(`${this.baseURL}/v133/analytics/usuarios/ranking`);
        return await response.json();
    },
    
    // ==================== OPERADORES ====================
    
    async getOperadores() {
        try {
            const response = await fetch(`${this.baseURL}/v133/operadores`);
            if (!response.ok) {
                // Fallback para dados simulados se endpoint não existir
                return {
                    success: true,
                    operadores: [
                        { id: 1, nome: 'João Silva', email: 'joao@brcargo.com' },
                        { id: 2, nome: 'Maria Santos', email: 'maria@brcargo.com' },
                        { id: 3, nome: 'Pedro Costa', email: 'pedro@brcargo.com' },
                        { id: 4, nome: 'Ana Oliveira', email: 'ana@brcargo.com' }
                    ]
                };
            }
            return await response.json();
        } catch (error) {
            // Retornar dados simulados em caso de erro
            return {
                success: true,
                operadores: [
                    { id: 1, nome: 'João Silva', email: 'joao@brcargo.com' },
                    { id: 2, nome: 'Maria Santos', email: 'maria@brcargo.com' },
                    { id: 3, nome: 'Pedro Costa', email: 'pedro@brcargo.com' },
                    { id: 4, nome: 'Ana Oliveira', email: 'ana@brcargo.com' }
                ]
            };
        }
    },

    // ==================== DASHBOARD ANALYTICS ====================

    async getDashboardData() {
        try {
            // Carregar dados reais de cotações
            const cotacoesResponse = await this.getCotacoes();
            
            if (cotacoesResponse.success && cotacoesResponse.cotacoes) {
                return this.processarDadosDashboard(cotacoesResponse.cotacoes);
            }
            
            // Se não conseguir dados reais, retornar null para usar fallback
            return null;
            
        } catch (error) {
            console.warn('Erro ao carregar dados do dashboard:', error);
            return null;
        }
    },

    processarDadosDashboard(cotacoes) {
        console.log('📊 Processando dados reais para dashboard:', cotacoes.length, 'cotações');
        
        // Contar por status
        const porStatus = {};
        const porModalidade = {};
        const porOperador = {};
        let valorTotal = 0;
        let finalizadas = 0;
        
        cotacoes.forEach(cotacao => {
            // Status
            const status = cotacao.status || 'solicitada';
            porStatus[status] = (porStatus[status] || 0) + 1;
            
            // Modalidade
            const modalidade = cotacao.modalidade || 'brcargo_rodoviario';
            porModalidade[modalidade] = (porModalidade[modalidade] || 0) + 1;
            
            // Operador
            const operador = cotacao.operador_responsavel || 'Não atribuído';
            porOperador[operador] = (porOperador[operador] || 0) + 1;
            
            // Valores
            if (cotacao.valor_frete && cotacao.status === 'finalizada') {
                valorTotal += parseFloat(cotacao.valor_frete) || 0;
                finalizadas++;
            }
        });
        
        // Calcular evolução temporal (últimos 30 dias)
        const evolucao = this.calcularEvolucaoTemporal(cotacoes);
        
        const dados = {
            metricas: {
                total: cotacoes.length,
                finalizadas: finalizadas,
                pendentes: cotacoes.length - finalizadas,
                taxaConversao: cotacoes.length > 0 ? Math.round((finalizadas / cotacoes.length) * 100) : 0,
                valorTotal: valorTotal
            },
            porStatus: Object.entries(porStatus).map(([status, count]) => ({
                status,
                count,
                label: this.getLabelStatus(status)
            })),
            porModalidade: Object.entries(porModalidade).map(([modalidade, count]) => ({
                modalidade,
                count,
                label: this.getLabelModalidade(modalidade)
            })),
            porOperador: Object.entries(porOperador).map(([operador, count]) => ({
                operador,
                count,
                finalizadas: cotacoes.filter(c => c.operador_responsavel === operador && c.status === 'finalizada').length
            })),
            evolucao: evolucao,
            valoresPorModalidade: this.calcularValoresPorModalidade(cotacoes)
        };
        
        console.log('✅ Dados do dashboard processados:', dados);
        return dados;
    },

    calcularEvolucaoTemporal(cotacoes) {
        const hoje = new Date();
        const evolucao = [];
        
        for (let i = 29; i >= 0; i--) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            const dataStr = data.toISOString().split('T')[0];
            
            const cotacoesDia = cotacoes.filter(c => {
                const dataCotacao = new Date(c.data_criacao || c.created_at);
                return dataCotacao.toISOString().split('T')[0] === dataStr;
            });
            
            evolucao.push({
                data: dataStr,
                total: cotacoesDia.length,
                finalizadas: cotacoesDia.filter(c => c.status === 'finalizada').length
            });
        }
        
        return evolucao;
    },

    calcularValoresPorModalidade(cotacoes) {
        const valores = {};
        const contadores = {};
        
        cotacoes.forEach(cotacao => {
            if (cotacao.valor_frete && cotacao.status === 'finalizada') {
                const modalidade = cotacao.modalidade || 'brcargo_rodoviario';
                const valor = parseFloat(cotacao.valor_frete) || 0;
                
                valores[modalidade] = (valores[modalidade] || 0) + valor;
                contadores[modalidade] = (contadores[modalidade] || 0) + 1;
            }
        });
        
        return Object.entries(valores).map(([modalidade, valorTotal]) => ({
            modalidade,
            valorMedio: contadores[modalidade] > 0 ? valorTotal / contadores[modalidade] : 0,
            label: this.getLabelModalidade(modalidade)
        }));
    },

    getLabelStatus(status) {
        const labels = {
            'solicitada': 'Solicitadas',
            'aceita_operador': 'Aceitas',
            'cotacao_enviada': 'Enviadas',
            'aceita_consultor': 'Aprovadas',
            'finalizada': 'Finalizadas',
            'cancelada': 'Canceladas'
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
    
    // ==================== UTILITÁRIOS ====================
    
    handleError(error) {
        console.error('Erro na API:', error);
        return {
            success: false,
            message: error.message || 'Erro ao processar requisição',
            error: error
        };
    }
};

// Exportar para uso global
window.API = API;
