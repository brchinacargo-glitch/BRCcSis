from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importar todos os modelos para garantir que sejam registrados
from .usuario import Usuario
from .empresa import Empresa
from .cotacao import Cotacao, StatusCotacao, EmpresaCotacao, HistoricoCotacao
from .notificacao import Notificacao, TipoNotificacao

