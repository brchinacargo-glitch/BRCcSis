# Configuração do Gunicorn para produção
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurações básicas
bind = f"{os.getenv('HOST', '0.0.0.0')}:{os.getenv('PORT', '5001')}"
workers = 4
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2

# Configurações de processo
preload_app = True
daemon = False
pidfile = "/tmp/gunicorn.pid"
user = None
group = None
tmp_upload_dir = None

# Configurações de log
accesslog = "logs/access.log"
errorlog = "logs/error.log"
loglevel = os.getenv('LOG_LEVEL', 'info').lower()
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Configurações de segurança
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Configurações de SSL (se necessário)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"

# Função de pré-fork
def on_starting(server):
    """Executado quando o servidor está iniciando"""
    server.log.info("Iniciando servidor BRCcSis...")

def when_ready(server):
    """Executado quando o servidor está pronto"""
    server.log.info("Servidor BRCcSis pronto para receber conexões")

def on_exit(server):
    """Executado quando o servidor está parando"""
    server.log.info("Parando servidor BRCcSis...")

# Configurações de worker
def worker_int(worker):
    """Executado quando worker recebe SIGINT"""
    worker.log.info("Worker interrompido pelo usuário")

def pre_fork(server, worker):
    """Executado antes do fork do worker"""
    server.log.info(f"Worker {worker.pid} sendo criado")

def post_fork(server, worker):
    """Executado após o fork do worker"""
    server.log.info(f"Worker {worker.pid} criado com sucesso")

def worker_abort(worker):
    """Executado quando worker é abortado"""
    worker.log.info(f"Worker {worker.pid} abortado")
