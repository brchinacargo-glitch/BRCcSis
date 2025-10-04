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
    
    // ==================== DASHBOARD ====================
    
    async getDashboardStats() {
        const response = await fetch(`${this.baseURL}/v133/dashboard/stats`);
        return await response.json();
    },
    
    async getDashboardCharts() {
        const response = await fetch(`${this.baseURL}/v133/dashboard/charts`);
        return await response.json();
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
        const response = await fetch(`${this.baseURL}/v133/operadores`);
        return await response.json();
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
