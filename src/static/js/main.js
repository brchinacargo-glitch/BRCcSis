// ==================== MAIN SIMPLES ====================
// Inicialização básica e funcional

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 BRCcSis v2.0 - Sistema Simples Iniciado');
    
    // Inicializar apenas módulos essenciais
    if (typeof UI !== 'undefined' && UI.init) {
        UI.init();
        console.log('✅ UI inicializado');
    }
    
    if (typeof Dashboard !== 'undefined' && Dashboard.init) {
        Dashboard.init();
        console.log('✅ Dashboard inicializado');
    }
    
    if (typeof Cotacoes !== 'undefined' && Cotacoes.init) {
        Cotacoes.init();
        console.log('✅ Cotações inicializado');
    }
    
    // Mostrar dashboard inicial
    if (typeof UI !== 'undefined' && UI.showSection) {
        UI.showSection('dashboard');
    }
    
    console.log('✅ Sistema simples carregado com sucesso');
});

// Exportar função essencial para navegação
window.showSection = function(section) {
    if (typeof UI !== 'undefined' && UI.showSection) {
        UI.showSection(section);
    }
};
