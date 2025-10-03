// ==================== CORREÇÃO DOS TIPOS DE INPUT ====================
// Converte input[type="number"] para input[type="text"] nos campos que precisam de formatação
// Isso resolve o problema de campos numéricos não aceitarem digitação

/**
 * Corrige os tipos de input para permitir formatação brasileira
 */
function corrigirTiposDeInput() {
    console.log('Corrigindo tipos de input para permitir formatação...');
    
    // Selecionar todos os campos type="number" que precisam de formatação
    const camposParaCorrigir = document.querySelectorAll(`
        input[type="number"][name*="peso"],
        input[type="number"][name*="weight"],
        input[type="number"][name*="cubagem"],
        input[type="number"][name*="comprimento"],
        input[type="number"][name*="largura"],
        input[type="number"][name*="altura"],
        input[type="number"][name*="dimensao"],
        input[type="number"][name*="quantidade"],
        input[type="number"][name*="capacidade"],
        input[type="number"][name*="valor"],
        input[type="number"][name*="preco"],
        input[type="number"][name*="volumetrico"]
    `);
    
    let contador = 0;
    
    camposParaCorrigir.forEach(campo => {
        // Salvar atributos importantes
        const name = campo.name;
        const placeholder = campo.placeholder;
        const required = campo.required;
        const min = campo.min;
        const max = campo.max;
        const step = campo.step;
        const className = campo.className;
        const id = campo.id;
        
        // Mudar para type="text"
        campo.type = 'text';
        
        // Adicionar atributo inputmode para teclado numérico em mobile
        campo.setAttribute('inputmode', 'decimal');
        
        // Adicionar pattern para validação HTML5
        campo.setAttribute('pattern', '[0-9.,]+');
        
        // Adicionar data-original-type para referência
        campo.setAttribute('data-original-type', 'number');
        
        // Adicionar data-min e data-max para validação customizada
        if (min) campo.setAttribute('data-min', min);
        if (max) campo.setAttribute('data-max', max);
        if (step) campo.setAttribute('data-step', step);
        
        contador++;
    });
    
    console.log(`✅ ${contador} campos convertidos de type="number" para type="text"`);
}

/**
 * Aplica validação customizada aos campos convertidos
 */
function aplicarValidacaoCustomizada() {
    const camposConvertidos = document.querySelectorAll('input[data-original-type="number"]');
    
    camposConvertidos.forEach(campo => {
        // Validação ao submeter o formulário
        const form = campo.closest('form');
        if (form) {
            form.addEventListener('submit', function(e) {
                if (!validarCampoNumerico(campo)) {
                    e.preventDefault();
                    campo.focus();
                    return false;
                }
            });
        }
        
        // Validação em tempo real (opcional)
        campo.addEventListener('blur', function() {
            validarCampoNumerico(campo);
        });
    });
}

/**
 * Valida campo numérico convertido
 * @param {HTMLInputElement} campo - Campo a validar
 * @returns {boolean}
 */
function validarCampoNumerico(campo) {
    const valor = campo.value;
    
    // Se não é obrigatório e está vazio, OK
    if (!campo.required && !valor) {
        campo.setCustomValidity('');
        return true;
    }
    
    // Se é obrigatório e está vazio
    if (campo.required && !valor) {
        campo.setCustomValidity('Este campo é obrigatório');
        return false;
    }
    
    // Converter para número
    const numero = converterParaNumero(valor);
    
    // Verificar se é um número válido
    if (isNaN(numero)) {
        campo.setCustomValidity('Digite um número válido');
        return false;
    }
    
    // Validar min
    const min = campo.getAttribute('data-min');
    if (min && numero < parseFloat(min)) {
        campo.setCustomValidity(`O valor mínimo é ${min}`);
        return false;
    }
    
    // Validar max
    const max = campo.getAttribute('data-max');
    if (max && numero > parseFloat(max)) {
        campo.setCustomValidity(`O valor máximo é ${max}`);
        return false;
    }
    
    // Tudo OK
    campo.setCustomValidity('');
    return true;
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
    
    // Remove pontos (separadores de milhares) e substitui vírgula por ponto
    return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
}

// ==================== INICIALIZAÇÃO ====================

// Executar assim que o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        corrigirTiposDeInput();
        aplicarValidacaoCustomizada();
    });
} else {
    // DOM já está pronto
    corrigirTiposDeInput();
    aplicarValidacaoCustomizada();
}

// Exportar funções para uso global
window.corrigirTiposDeInput = corrigirTiposDeInput;
window.validarCampoNumerico = validarCampoNumerico;

console.log('✅ Módulo fix-input-types.js carregado');
