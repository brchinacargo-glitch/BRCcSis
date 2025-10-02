# Instruções de Integração - BRCcSis v1.3.4 Corrigido

## Como Integrar os Módulos ao HTML Existente

### Passo 1: Atualizar o <head> do HTML

Remova a segunda importação do Chart.js e adicione o link para o CSS:

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BRCcSis</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Chart.js para gráficos (APENAS UMA VEZ) -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
    <!-- Bibliotecas para exportação -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    
    <!-- CSS Customizado -->
    <link href="css/styles.css" rel="stylesheet">
</head>
```

### Passo 2: Remover o <style> inline

Remova todo o bloco `<style>` do HTML, pois os estilos agora estão em `css/styles.css`.

### Passo 3: Remover estilos inline dos canvas

Encontre todos os elementos `<canvas>` e remova o atributo `style`:

**Antes:**
```html
<canvas id="chart-empresas-regiao" width="400" height="300" style="width: 100%; height: 300px;"></canvas>
```

**Depois:**
```html
<div class="chart-container">
    <canvas id="chart-empresas-regiao"></canvas>
</div>
```

### Passo 4: Remover todo o JavaScript inline

Encontre e remova todo o bloco `<script>` que contém o JavaScript (geralmente no final do arquivo, antes do `</body>`).

### Passo 5: Adicionar imports dos módulos

Adicione os imports dos módulos JavaScript no final do `<body>`, **ANTES** do `</body>`:

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
</body>
</html>
```

### Passo 6: Unificar footers

Se houver dois elementos `<footer>`, mantenha apenas um:

```html
<footer class="gradient-bg text-white py-6 mt-12">
    <div class="container mx-auto px-6 text-center">
        <p>&copy; 2024 BRCcSis - Sistema de Gestão Logística</p>
        <p class="text-sm text-green-200 mt-2">Desenvolvido por BRChina</p>
    </div>
</footer>
```

### Passo 7: Adicionar classes aos botões de cotação

Adicione a classe `btn-cotacao` aos botões de cotação para garantir a cor laranja:

```html
<button id="btn-solicitar-cotacao" class="btn-cotacao flex items-center justify-center p-4 text-white rounded-lg transition-colors">
    <i class="fas fa-calculator mr-2"></i>
    Solicitar Cotação
</button>
```

## Estrutura Final de Diretórios

```
src/static/
├── index.html (HTML refatorado)
├── logo-brchina.png
├── css/
│   └── styles.css
└── js/
    ├── api.js
    ├── utils.js
    ├── ui.js
    ├── dashboard.js
    ├── empresas.js
    ├── cotacoes.js
    ├── analytics.js
    └── main.js
```

## Verificação

Após a integração, verifique:

1. ✅ Console do navegador sem erros
2. ✅ Dashboard carrega corretamente
3. ✅ Navegação entre seções funciona
4. ✅ Botões de cotação estão laranja
5. ✅ Gráficos são renderizados
6. ✅ Formulários funcionam

## Solução de Problemas

### Problema: "API is not defined"
**Solução**: Verifique se `api.js` está sendo carregado antes dos outros módulos.

### Problema: "Utils is not defined"
**Solução**: Verifique se `utils.js` está sendo carregado antes dos módulos que o utilizam.

### Problema: Botões de cotação não estão laranja
**Solução**: Adicione a classe `btn-cotacao` aos botões ou verifique se `styles.css` está sendo carregado.

### Problema: Gráficos não aparecem
**Solução**: Verifique se Chart.js está carregado e se os canvas estão dentro de `.chart-container`.

## Suporte

Para dúvidas, consulte o README.md ou entre em contato com a equipe de desenvolvimento.
