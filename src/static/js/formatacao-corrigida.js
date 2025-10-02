// ==================== FORMATAÇÃO CORRIGIDA ====================
// Corrige o problema de campos numéricos que não aceitam digitação

/**
 * Formata número normal (peso, dimensões, etc.) - VERSÃO CORRIGIDA
 * Permite digitação livre e só formata no blur
 * @param {HTMLInputElement} input - Campo de input
 */
function formatarNumeroNormal(input) {
    let valor = input.value;
    
    // Permitir digitação livre - apenas remover caracteres inválidos
    // MAS NÃO LIMPAR O CAMPO se estiver vazio ou incompleto
    valor = valor.replace(/[^\d.,]/g, "");
    
    // Se estiver vazio, apenas limpar
    if (!valor) {
        input.value = "";
        return;
    }
    
    // Permitir digitação parcial (ex: "12", "12,", "12,5")
    // Só formatar se tiver um número completo
    input.value = valor;
}

/**
 * Formata número no blur (quando sai do campo) - VERSÃO CORRIGIDA
 * @param {HTMLInputElement} input - Campo de input
 */
function formatarNumeroNoBlur(input) {
    let valor = input.value;
    
    // Remove tudo que não é número, ponto ou vírgula
    valor = valor.replace(/[^\d.,]/g, "");
    
    if (!valor) {
        return;
    }
    
    // Substitui vírgula por ponto para facilitar a conversão
    let valorNumerico = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    
    if (isNaN(valorNumerico)) {
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
 * Formata peso - VERSÃO CORRIGIDA
 * @param {HTMLInputElement} input - Campo de input
 */
function formatarPeso(input) {
    let valor = input.value;
    
    // Permitir digitação livre
    valor = valor.replace(/[^\d.,]/g, '');
    
    if (!valor) {
        input.value = '';
        return;
    }
    
    // Apenas limpar caracteres inválidos, não formatar durante digitação
    input.value = valor;
}

/**
 * Formata peso no blur - VERSÃO CORRIGIDA
 * @param {HTMLInputElement} input - Campo de input
 */
function formatarPesoNoBlur(input) {
    formatarNumeroNoBlur(input);
}

/**
 * Formata valor monetário - VERSÃO CORRIGIDA
 * Permite digitação mais natural
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
 * Converte valor formatado para número
 * @param {string} valor - Valor formatado
 * @returns {number}
 */
function converterParaNumero(valor) {
    if (!valor) return 0;
    
    // Remove símbolos de moeda
    valor = valor.replace(/^(R\$|US\$|\$)\s*/, '');
    
    // Remove pontos e substitui vírgula por ponto
    return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
}

// ==================== APLICAÇÃO DA FORMATAÇÃO ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicando formatação corrigida aos campos...');
    
    // Campos monetários
    const camposMonetarios = document.querySelectorAll('input[name*="valor_mercadoria"], input[name*="valor"], input[name*="preco"]');
    
    camposMonetarios.forEach(campo => {
        campo.addEventListener('input', function(e) {
            formatarValorMonetario(e.target);
        });
    });
    
    // Campos numéricos (peso, dimensões, etc.)
    const camposNumericos = document.querySelectorAll('input[type="number"]:not([name*="cnpj"]):not([name*="cep"]):not([name*="telefone"]):not([name*="valor_mercadoria"]):not([name*="valor"]):not([name*="preco"])');
    
    camposNumericos.forEach(campo => {
        // Durante a digitação: apenas limpar caracteres inválidos
        if (campo.name && (campo.name.includes('peso') || campo.name.includes('weight'))) {
            campo.addEventListener('input', function(e) {
                formatarPeso(e.target);
            });
            campo.addEventListener('blur', function(e) {
                formatarPesoNoBlur(e.target);
            });
        } else {
            campo.addEventListener('input', function(e) {
                formatarNumeroNormal(e.target);
            });
            campo.addEventListener('blur', function(e) {
                formatarNumeroNoBlur(e.target);
            });
        }
    });
    
    console.log(`Formatação aplicada a ${camposMonetarios.length} campos monetários e ${camposNumericos.length} campos numéricos`);
});

// Exportar funções para uso global
window.formatarNumeroNormal = formatarNumeroNormal;
window.formatarNumeroNoBlur = formatarNumeroNoBlur;
window.formatarPeso = formatarPeso;
window.formatarPesoNoBlur = formatarPesoNoBlur;
window.formatarValorMonetario = formatarValorMonetario;
window.converterParaNumero = converterParaNumero;
