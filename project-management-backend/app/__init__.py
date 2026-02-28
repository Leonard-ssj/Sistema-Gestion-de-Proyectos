# Inicialización de la aplicación Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Inicializar SQLAlchemy sin app (se vinculará después)
db = SQLAlchemy()
migrate = Migrate()
