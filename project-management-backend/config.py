import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv('../.env.local')

class Config:
    # Secret Keys - DEBEN estar en .env.local
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    
    # MySQL Database Configuration - DEBEN estar en .env.local
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_NAME = os.getenv('DB_NAME')
    
    # Construir URI de base de datos
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True  # Para ver las queries SQL en desarrollo
    
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
