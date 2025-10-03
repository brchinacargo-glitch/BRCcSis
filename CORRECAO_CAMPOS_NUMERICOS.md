# Correção: Campos Numéricos Não Aceitam Digitação

## 🐛 Problema Identificado

Os campos numéricos no formulário de "Solicitar Cotação" não aceitavam digitação, exceto o campo de "Valor da Mercadoria".

### Campos Afetados:
- Peso (kg)
- Dimensões (comprimento, largura, altura)
- Cubagem
- Net Weight / Gross Weight
- Quantidade de containers
- Peso volumétrico
- Prazo desejado

## 🔍 Causa Raiz

O problema estava nas funções de formatação automática que eram aplicadas no evento `input` (durante a digitação):

```javascript
// CÓDIGO PROBLEMÁTICO (linhas 7163-7193)
function formatarNumeroNormal(input) {
    let valor = input.value;
    valor = valor.replace(/[^\d.,]/g, "");
    
    if (!valor) {
        input.value = "";  // ❌ Limpa o campo imediatamente
        return;
    }
    
    let valorNumerico = parseFloat(valor.replace(".", "").replace(",", "."));
    
    if (isNaN(valorNumerico)) {
        input.value = "";  // ❌ Limpa se não for número válido
        return;
    }
    
    // ❌ Formata imediatamente enquanto digita
    const formatado = new Intl.NumberFormat("pt-BR", {...}).format(valorNumerico);
    input.value = formatado;
}

// Aplicado no evento 'input'
campo.addEventListener("input", function(e) {
    formatarNumeroNormal(e.target);  // ❌ Executa a cada tecla digitada
});
```

### Por que isso causava o problema?

1. **Durante a digitação**: Quando você digita "1", a função tenta formatar como "1,00"
2. **Cursor se move**: O cursor vai para o final, depois do "00"
3. **Próxima tecla**: Quando você digita "2", o valor fica "1,002" (inválido)
4. **Campo é limpo**: A função detecta número inválido e limpa o campo
5. **Resultado**: Impossível digitar

### Por que o campo "Valor da Mercadoria" funcionava?

Porque usava uma função diferente (`formatarValorMonetario`) que tinha lógica mais tolerante e trabalhava com centavos.

## ✅ Solução Implementada

Criei um novo arquivo `formatacao-corrigida.js` com funções que:

### 1. Permitem Digitação Livre no Evento `input`

```javascript
// CÓDIGO CORRIGIDO
function formatarNumeroNormal(input) {
    let valor = input.value;
    
    // ✅ Apenas remove caracteres inválidos, NÃO formata
    valor = valor.replace(/[^\d.,]/g, "");
    
    if (!valor) {
        input.value = "";
        return;
    }
    
    // ✅ Mantém o valor como está, permitindo digitação parcial
    input.value = valor;
}
```

### 2. Formatam Apenas no Evento `blur` (quando sai do campo)

```javascript
function formatarNumeroNoBlur(input) {
    let valor = input.value;
    valor = valor.replace(/[^\d.,]/g, "");
    
    if (!valor) return;
    
    let valorNumerico = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    
    if (isNaN(valorNumerico)) return;
    
    // ✅ Formata apenas quando sai do campo
    let casasDecimais = (input.name && input.name.includes("cubagem")) ? 3 : 2;
    const formatado = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: casasDecimais,
        maximumFractionDigits: casasDecimais
    }).format(valorNumerico);
    
    input.value = formatado;
}
```

### 3. Aplicação Correta dos Event Listeners

```javascript
camposNumericos.forEach(campo => {
    // ✅ Durante digitação: apenas limpar caracteres inválidos
    campo.addEventListener('input', function(e) {
        formatarNumeroNormal(e.target);
    });
    
    // ✅ Ao sair do campo: formatar o número
    campo.addEventListener('blur', function(e) {
        formatarNumeroNoBlur(e.target);
    });
});
```

## 📝 Como Aplicar a Correção

### Opção 1: Substituir o Código no HTML

Encontre a seção de formatação no HTML (linhas ~7160-7260) e substitua pelas funções corrigidas.

### Opção 2: Importar o Arquivo Corrigido

Adicione no HTML, **DEPOIS** dos outros scripts:

```html
<!-- Módulos JavaScript -->
<script src="js/api.js"></script>
<script src="js/utils.js"></script>
<script src="js/ui.js"></script>
<script src="js/dashboard.js"></script>
<script src="js/empresas.js"></script>
<script src="js/cotacoes.js"></script>
<script src="js/analytics.js"></script>
<script src="js/main.js"></script>

<!-- Correção de formatação - DEVE VIR POR ÚLTIMO -->
<script src="js/formatacao-corrigida.js"></script>
```

### Opção 3: Remover Event Listeners Duplicados

Se você importar o arquivo `formatacao-corrigida.js`, ele irá **sobrescrever** as funções problemáticas e aplicar os event listeners corretos.

**IMPORTANTE**: Remova ou comente o código de formatação original no HTML (linhas 7160-7260) para evitar conflitos.

## 🧪 Teste

Após aplicar a correção:

1. ✅ Abra o formulário de "Solicitar Cotação"
2. ✅ Tente digitar no campo "Peso (kg)"
3. ✅ Digite "123.45" ou "123,45"
4. ✅ Ao sair do campo (blur), deve formatar para "123,45"
5. ✅ Repita para outros campos numéricos

## 📊 Comparação

| Aspecto | Antes (Problemático) | Depois (Corrigido) |
|---------|---------------------|-------------------|
| **Digitação** | ❌ Impossível digitar | ✅ Digitação livre |
| **Formatação** | ❌ Durante digitação | ✅ Ao sair do campo |
| **Cursor** | ❌ Pula para o final | ✅ Mantém posição |
| **Valores parciais** | ❌ Campo limpo | ✅ Aceita "12", "12,", "12,5" |
| **UX** | ❌ Frustrante | ✅ Natural e intuitivo |

## 🎯 Benefícios

1. **Digitação Natural**: Usuário pode digitar normalmente
2. **Formatação Automática**: Ao sair do campo, número é formatado
3. **Validação Suave**: Aceita valores parciais durante digitação
4. **Padrão Brasileiro**: Formata com vírgula decimal (123,45)
5. **Sem Conflitos**: Não interfere com outros campos

## 🔧 Manutenção Futura

Se precisar adicionar novos campos numéricos:

1. Use `type="number"` no HTML
2. Adicione `name` descritivo (ex: `name="peso_liquido"`)
3. A formatação será aplicada automaticamente
4. Para cubagem, use `name` contendo "cubagem" (3 casas decimais)

## 📌 Notas Importantes

- O arquivo `formatacao-corrigida.js` deve ser carregado **POR ÚLTIMO**
- Remova o código de formatação original do HTML para evitar duplicação
- A formatação monetária continua funcionando como antes
- Campos de CNPJ, CEP e telefone não são afetados

---

**Versão**: 1.3.4 Corrigida
**Data**: 2025-10-02
**Correção**: Campos numéricos não aceitavam digitação
