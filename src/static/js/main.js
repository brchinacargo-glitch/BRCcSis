// ==================== ARQUIVO PRINCIPAL ====================
// Inicializa a aplicação e coordena os módulos

// Aguardar carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('BRCcSis v1.3.4 - Sistema Iniciado');
    
    // Inicializar módulos
    UI.init();
    Dashboard.init();
    Empresas.init();
    Cotacoes.init();
    Analytics.init();
    
    // Carregar dashboard inicial
    UI.showSection('dashboard');
    
    // Configurar formatação automática de números
    setupNumberFormatting();
    
    // Configurar modais
    setupModals();
});

/**
 * Configura formatação automática de números
 */
function setupNumberFormatting() {
    // Selecionar campos monetários
    const camposMonetarios = document.querySelectorAll('input[name*="valor_mercadoria"], input[name*="valor"], input[name*="preco"]');
    
    camposMonetarios.forEach(campo => {
        campo.addEventListener('input', function(e) {
            formatarValorMonetario(e.target);
        });
    });
    
    // Selecionar campos numéricos
    const camposNumericos = document.querySelectorAll('input[type="number"]:not([name*="cnpj"]):not([name*="cep"]):not([name*="telefone"])');
    
    camposNumericos.forEach(campo => {
        campo.addEventListener('input', function(e) {
            if (campo.name && (campo.name.includes('peso') || campo.name.includes('weight'))) {
                formatarPeso(e.target);
            } else {
                formatarNumeroNormal(e.target);
            }
        });
    });
}

/**
 * Formata valor monetário no padrão brasileiro
 * @param {HTMLInputElement} input - Campo de input
 */
function formatarValorMonetario(input) {
    let valor = input.value;
    
    // Remove tudo que não é dígito
    valor = valor.replace(/\D/g, '');
    
    if (!valor) {
        input.value = '';
        input.dataset.valorNumerico = '';
        return;
    }
    
    // Converte para centavos
    const numero = parseInt(valor);
    const valorDecimal = numero / 100;
    
    // Formata no padrão brasileiro (4.000,00)
    const formatado = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valorDecimal);
    
    input.value = formatado;
    input.dataset.valorNumerico = valorDecimal.toString();
}

/**
 * Formata número normal
 * @param {HTMLInputElement} input - Campo de input
 */
function formatarNumeroNormal(input) {
    let valor = input.value;
    
    // Remove tudo que não é número, ponto ou vírgula
    valor = valor.replace(/[^\d.,]/g, "");
    
    if (!valor) {
        input.value = "";
        return;
    }
    
    // Substitui vírgula por ponto para facilitar a conversão
    let valorNumerico = parseFloat(valor.replace(".", "").replace(",", "."));
    
    if (isNaN(valorNumerico)) {
        input.value = "";
        return;
    }
    
    // Formata no padrão brasileiro
    let casasDecimais = (input.name && input.name.includes("cubagem")) ? 3 : 2;
    
    const formatado = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: casasDecimais,
        maximumFractionDigits: casasDecimais
    }).format(valorNumerico);
    
    input.value = formatado;
}

/**
 * Formata peso
 * @param {HTMLInputElement} input - Campo de input
 */
function formatarPeso(input) {
    let valor = input.value;
    
    // Remove tudo que não é número, ponto ou vírgula
    valor = valor.replace(/[^\d.,]/g, '');
    
    if (!valor) {
        input.value = '';
        return;
    }
    
    formatarNumeroNormal(input);
}

/**
 * Configura modais
 */
function setupModals() {
    // Fechar modais ao clicar fora
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Botões de fechar
    const closeBtns = document.querySelectorAll('.modal .close, .modal [data-close]');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });
}

// Exportar funções globais necessárias para compatibilidade
window.showSection = (section) => UI.showSection(section);
window.editarEmpresa = (id) => Empresas.edit(id);
window.verDetalhes = (id) => Empresas.viewDetails(id);
window.deletarEmpresa = (id) => Empresas.delete(id);

console.log('BRCcSis v1.3.4 - Todos os módulos carregados com sucesso');
