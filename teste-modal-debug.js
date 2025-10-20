// Script de teste para verificar o comportamento do modal de cotação
console.log('🧪 Iniciando testes do modal de cotação...');

// Função para testar o modal
function testarModal() {
    console.log('\n=== TESTE DO MODAL DE COTAÇÃO ===');
    
    // 1. Verificar se o modal existe
    const modal = document.getElementById('modal-cotacao');
    console.log('1. Modal existe:', !!modal);
    
    if (!modal) {
        console.error('❌ Modal não encontrado!');
        return false;
    }
    
    // 2. Verificar se a função abrirModalCotacao existe
    console.log('2. Função abrirModalCotacao existe:', typeof abrirModalCotacao === 'function');
    
    // 3. Verificar botões
    const btnDashboard = document.getElementById('btn-solicitar-cotacao');
    const btnCotacoes = document.getElementById('btn-nova-cotacao');
    
    console.log('3. Botão dashboard existe:', !!btnDashboard);
    console.log('4. Botão cotações existe:', !!btnCotacoes);
    
    // 4. Testar abertura do modal
    console.log('\n--- TESTANDO ABERTURA DO MODAL ---');
    
    if (typeof abrirModalCotacao === 'function') {
        console.log('Abrindo modal...');
        abrirModalCotacao();
        
        // Verificar se modal está visível
        setTimeout(() => {
            const isVisible = modal.classList.contains('show');
            console.log('5. Modal visível após abertura:', isVisible);
            
            if (isVisible) {
                console.log('✅ Modal aberto com sucesso!');
                
                // Testar fechamento
                setTimeout(() => {
                    console.log('\n--- TESTANDO FECHAMENTO DO MODAL ---');
                    if (typeof fecharModalCotacao === 'function') {
                        fecharModalCotacao();
                        
                        setTimeout(() => {
                            const isHidden = !modal.classList.contains('show');
                            console.log('6. Modal fechado:', isHidden);
                            
                            if (isHidden) {
                                console.log('✅ Modal fechado com sucesso!');
                            } else {
                                console.log('❌ Erro ao fechar modal');
                            }
                        }, 100);
                    }
                }, 2000);
            } else {
                console.log('❌ Erro ao abrir modal');
            }
        }, 100);
    }
    
    // 5. Verificar CSS do modal
    console.log('\n--- VERIFICANDO CSS DO MODAL ---');
    const modalStyles = window.getComputedStyle(modal);
    console.log('7. Position:', modalStyles.position);
    console.log('8. Z-index:', modalStyles.zIndex);
    console.log('9. Overflow-y:', modalStyles.overflowY);
    
    // 6. Verificar container do modal
    const modalContainer = modal.querySelector('.bg-white');
    if (modalContainer) {
        const containerStyles = window.getComputedStyle(modalContainer);
        console.log('10. Container max-height:', containerStyles.maxHeight);
        console.log('11. Container overflow-y:', containerStyles.overflowY);
    }
    
    return true;
}

// Função para testar event listeners
function testarEventListeners() {
    console.log('\n=== TESTE DOS EVENT LISTENERS ===');
    
    const btnDashboard = document.getElementById('btn-solicitar-cotacao');
    const btnCotacoes = document.getElementById('btn-nova-cotacao');
    
    if (btnDashboard) {
        console.log('Testando clique no botão dashboard...');
        btnDashboard.click();
    }
    
    setTimeout(() => {
        if (btnCotacoes) {
            console.log('Testando clique no botão cotações...');
            btnCotacoes.click();
        }
    }, 1000);
}

// Executar testes quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            testarModal();
            setTimeout(testarEventListeners, 3000);
        }, 1000);
    });
} else {
    setTimeout(() => {
        testarModal();
        setTimeout(testarEventListeners, 3000);
    }, 1000);
}

// Exportar funções para uso manual
window.testarModal = testarModal;
window.testarEventListeners = testarEventListeners;

console.log('🧪 Script de teste carregado. Use testarModal() e testarEventListeners() para testar manualmente.');
