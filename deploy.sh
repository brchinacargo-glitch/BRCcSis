#!/bin/bash

# Script de deploy para BRCcSis
# Uso: ./deploy.sh [production|development]

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logs
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar argumentos
ENVIRONMENT=${1:-development}
if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "development" ]]; then
    error "Ambiente deve ser 'production' ou 'development'"
fi

log "Iniciando deploy para ambiente: $ENVIRONMENT"

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    error "Python 3 não está instalado"
fi

# Verificar se pip está instalado
if ! command -v pip3 &> /dev/null; then
    error "pip3 não está instalado"
fi

# Criar diretórios necessários
log "Criando diretórios necessários..."
mkdir -p logs
mkdir -p src/database
mkdir -p backups

# Instalar dependências
log "Instalando dependências..."
pip3 install -r requirements.txt

# Configurar variáveis de ambiente
if [[ ! -f .env ]]; then
    if [[ -f .env.example ]]; then
        log "Copiando .env.example para .env..."
        cp .env.example .env
        warning "IMPORTANTE: Edite o arquivo .env com suas configurações específicas!"
    else
        error "Arquivo .env.example não encontrado"
    fi
fi

# Configurar banco de dados
log "Configurando banco de dados..."
cd src
python3 -c "
import os
from main import app, db
with app.app_context():
    db.create_all()
    print('✅ Banco de dados configurado com sucesso')
"
cd ..

# Verificar se usuário admin existe
log "Verificando usuário administrador..."
cd src
python3 -c "
from main import app
from models.usuario import Usuario
with app.app_context():
    admin = Usuario.query.filter_by(username='admin').first()
    if admin:
        print('✅ Usuário admin já existe')
    else:
        print('⚠️  Usuário admin será criado na primeira execução')
"
cd ..

# Configurar permissões
log "Configurando permissões..."
chmod +x deploy.sh
chmod 755 src/main.py

# Configurações específicas por ambiente
if [[ "$ENVIRONMENT" == "production" ]]; then
    log "Configurando para produção..."
    
    # Verificar se gunicorn está instalado
    if ! command -v gunicorn &> /dev/null; then
        log "Instalando gunicorn..."
        pip3 install gunicorn
    fi
    
    # Criar script de inicialização para produção
    cat > start_production.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando BRCcSis em modo produção..."
cd src
gunicorn -c ../gunicorn.conf.py main:app
EOF
    chmod +x start_production.sh
    
    success "Deploy de produção configurado!"
    echo ""
    echo "Para iniciar em produção:"
    echo "  ./start_production.sh"
    echo ""
    echo "IMPORTANTE:"
    echo "1. Edite o arquivo .env com suas configurações"
    echo "2. Altere a SECRET_KEY para uma chave forte"
    echo "3. Configure HTTPS se necessário"
    echo "4. Configure backup do banco de dados"
    
else
    log "Configurando para desenvolvimento..."
    
    # Criar script de inicialização para desenvolvimento
    cat > start_development.sh << 'EOF'
#!/bin/bash
echo "🛠️  Iniciando BRCcSis em modo desenvolvimento..."
cd src
python3 main.py
EOF
    chmod +x start_development.sh
    
    success "Deploy de desenvolvimento configurado!"
    echo ""
    echo "Para iniciar em desenvolvimento:"
    echo "  ./start_development.sh"
    echo ""
    echo "Ou diretamente:"
    echo "  cd src && python3 main.py"
fi

echo ""
echo "📋 Informações do sistema:"
echo "  - URL: http://127.0.0.1:5001"
echo "  - Usuário padrão: admin"
echo "  - Senha padrão: admin123"
echo "  - Logs: logs/"
echo "  - Banco: src/database/app.db"

success "Deploy concluído com sucesso! 🎉"
