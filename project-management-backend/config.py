import os
from dotenv import load_dotenv, find_dotenv
from datetime import timedelta

_dotenv_path = find_dotenv('.env.local', usecwd=True)
if _dotenv_path:
    load_dotenv(_dotenv_path)

def _normalize_database_url(raw_url: str | None) -> str | None:
    if not raw_url:
        return None
    url = raw_url.strip().strip('"').strip("'")
    if not url:
        return None
    if url.startswith('(') or 'External Database URL' in url or 'Render' in url and 'postgres' in url and '://' not in url:
        return None
    if url.startswith('postgres://'):
        url = 'postgresql+psycopg2://' + url[len('postgres://'):]
    elif url.startswith('postgresql://'):
        url = 'postgresql+psycopg2://' + url[len('postgresql://'):]
    return url


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_NAME = os.getenv('DB_NAME')
    
    SQLALCHEMY_DATABASE_URI = _normalize_database_url(os.getenv('DATABASE_URL'))
    if not SQLALCHEMY_DATABASE_URI and DB_HOST and DB_USER and DB_PASSWORD and DB_NAME:
        port = DB_PORT or '5432'
        SQLALCHEMY_DATABASE_URI = f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{port}/{DB_NAME}'
    if not SQLALCHEMY_DATABASE_URI:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.getenv('SQLALCHEMY_ECHO', 'false').lower() == 'true'
    
    # JWT Configuration
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)  # 15 minutos
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)  # 7 días
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # Optional: JWT Blacklist (para logout)
    JWT_BLACKLIST_ENABLED = False  # Por ahora deshabilitado
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']


class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    SQLALCHEMY_ECHO = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
