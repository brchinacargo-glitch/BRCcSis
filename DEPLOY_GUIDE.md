# 🚀 Guia de Deploy - BRCcSis v1.3.5

## 📋 **Pré-requisitos**

### **Ambiente de Produção**
- **Python 3.8+**
- **pip** (gerenciador de pacotes Python)
- **Servidor web** (Nginx recomendado)
- **Supervisor** ou **systemd** para gerenciamento de processo
- **SSL Certificate** para HTTPS

### **Banco de Dados**
- **SQLite** (desenvolvimento) ou **PostgreSQL** (produção recomendado)

---

## 🔧 **Configuração do Ambiente**

### **1. Clonar Repositório**
```bash
git clone [URL_DO_REPOSITORIO]
cd BRCcSis
```

### **2. Criar Ambiente Virtual**
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

### **3. Instalar Dependências**
```bash
pip install -r requirements.txt
```

### **4. Configurar Variáveis de Ambiente**
Criar arquivo `.env`:
```bash
cp .env.example .env
```

Editar `.env`:
```env
# Configurações de Produção
FLASK_ENV=production
SECRET_KEY=sua_chave_secreta_muito_segura_aqui
DATABASE_URL=sqlite:///app.db
# ou para PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/brccsisdb

# Configurações de Segurança
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_SAMESITE=Lax

# Configurações de Email (se necessário)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha_app
```

---

## 🗄️ **Configuração do Banco de Dados**

### **Para SQLite (Desenvolvimento)**
```bash
cd src
python3 -c "
from main import app, db
with app.app_context():
    db.create_all()
    print('Banco de dados criado com sucesso!')
"
```

### **Para PostgreSQL (Produção)**
```bash
# 1. Criar banco de dados
sudo -u postgres createdb brccsisdb

# 2. Executar migrações
cd src
python3 -c "
from main import app, db
with app.app_context():
    db.create_all()
    print('Banco de dados PostgreSQL configurado!')
"
```

---

## 🚀 **Deploy com Gunicorn**

### **1. Instalar Gunicorn**
```bash
pip install gunicorn
```

### **2. Configurar Gunicorn**
Arquivo `gunicorn.conf.py` já está configurado no projeto.

### **3. Testar Gunicorn**
```bash
cd src
gunicorn -c ../gunicorn.conf.py main:app
```

### **4. Configurar Systemd (Linux)**
Criar arquivo `/etc/systemd/system/brccsisdb.service`:
```ini
[Unit]
Description=BRCcSis Flask Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/BRCcSis/src
Environment="PATH=/path/to/BRCcSis/venv/bin"
ExecStart=/path/to/BRCcSis/venv/bin/gunicorn -c ../gunicorn.conf.py main:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Ativar serviço:
```bash
sudo systemctl daemon-reload
sudo systemctl enable brccsisdb
sudo systemctl start brccsisdb
sudo systemctl status brccsisdb
```

---

## 🌐 **Configuração do Nginx**

### **1. Instalar Nginx**
```bash
sudo apt update
sudo apt install nginx
```

### **2. Configurar Virtual Host**
Criar arquivo `/etc/nginx/sites-available/brccsisdb`:
```nginx
server {
    listen 80;
    server_name seu_dominio.com www.seu_dominio.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu_dominio.com www.seu_dominio.com;
    
    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Static files
    location /static {
        alias /path/to/BRCcSis/src/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### **3. Ativar Site**
```bash
sudo ln -s /etc/nginx/sites-available/brccsisdb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 **Configuração de SSL**

### **Usando Let's Encrypt (Certbot)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu_dominio.com -d www.seu_dominio.com
```

### **Renovação Automática**
```bash
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 **Monitoramento e Logs**

### **1. Logs do Sistema**
```bash
# Logs do Gunicorn
sudo journalctl -u brccsisdb -f

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **2. Monitoramento de Performance**
```bash
# Status do serviço
sudo systemctl status brccsisdb

# Uso de recursos
htop
df -h
```

---

## 🔄 **Backup e Recuperação**

### **1. Backup do Banco de Dados**
```bash
# SQLite
cp src/database/app.db backup/app_$(date +%Y%m%d_%H%M%S).db

# PostgreSQL
pg_dump brccsisdb > backup/brccsisdb_$(date +%Y%m%d_%H%M%S).sql
```

### **2. Script de Backup Automático**
Criar arquivo `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco
cp /path/to/BRCcSis/src/database/app.db $BACKUP_DIR/app_$DATE.db

# Backup dos arquivos estáticos
tar -czf $BACKUP_DIR/static_$DATE.tar.gz /path/to/BRCcSis/src/static

# Manter apenas últimos 30 backups
find $BACKUP_DIR -name "app_*.db" -mtime +30 -delete
find $BACKUP_DIR -name "static_*.tar.gz" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

Agendar no crontab:
```bash
sudo crontab -e
# Backup diário às 2h da manhã
0 2 * * * /path/to/backup.sh
```

---

## 🚨 **Troubleshooting**

### **Problemas Comuns**

#### **1. Erro 502 Bad Gateway**
```bash
# Verificar se Gunicorn está rodando
sudo systemctl status brccsisdb

# Verificar logs
sudo journalctl -u brccsisdb -n 50
```

#### **2. Erro de Permissões**
```bash
# Ajustar permissões
sudo chown -R www-data:www-data /path/to/BRCcSis
sudo chmod -R 755 /path/to/BRCcSis
```

#### **3. Erro de Banco de Dados**
```bash
# Verificar conexão
cd src
python3 -c "
from main import app, db
with app.app_context():
    try:
        db.engine.execute('SELECT 1')
        print('Banco OK')
    except Exception as e:
        print(f'Erro: {e}')
"
```

---

## ✅ **Checklist de Deploy**

### **Pré-Deploy**
- [ ] Código testado em ambiente de desenvolvimento
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do banco de dados atual
- [ ] Certificado SSL válido

### **Deploy**
- [ ] Código atualizado no servidor
- [ ] Dependências instaladas/atualizadas
- [ ] Migrações de banco executadas
- [ ] Serviços reiniciados
- [ ] Nginx recarregado

### **Pós-Deploy**
- [ ] Site acessível via HTTPS
- [ ] Login funcionando
- [ ] Funcionalidades principais testadas
- [ ] Logs sem erros críticos
- [ ] Backup pós-deploy realizado

---

## 📞 **Suporte**

Em caso de problemas durante o deploy:

1. **Verificar logs** do sistema
2. **Consultar** este guia
3. **Testar** em ambiente de desenvolvimento
4. **Documentar** o problema para análise

**Sistema BRCcSis v1.3.5 - Deploy Guide**
*Última atualização: 17/10/2025*
