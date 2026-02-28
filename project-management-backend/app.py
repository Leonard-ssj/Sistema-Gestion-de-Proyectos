from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import text
from dotenv import load_dotenv
import os
from datetime import datetime

# Cargar variables de entorno
load_dotenv('../.env.local')

# Importar db desde app
from app import db, migrate
from config import Config

app = Flask(__name__)

# Aplicar configuración desde config.py
app.config.from_object(Config)

# Inicializar db con la app
db.init_app(app)

# Inicializar Flask-Migrate
migrate.init_app(app, db)

# Inicializar JWT
jwt = JWTManager(app)

# CORS
CORS(app, origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000')])

# Middleware para logging de requests
@app.before_request
def log_request():
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'\n[{timestamp}] {request.method} {request.path}')
    if request.method in ['POST', 'PUT', 'PATCH']:
        print(f'Body: {request.get_json()}')

# Importar modelos después de inicializar db
from app.models import User, Project, Membership, Task, Invite, Notification, Comment, AuditLog

# Importar rutas
from app.routes import auth_bp, projects_bp, invites_bp, members_bp, tasks_bp, notifications_bp, comments_bp, admin_bp

# Registrar blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(projects_bp)
app.register_blueprint(invites_bp)
app.register_blueprint(members_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(comments_bp)
app.register_blueprint(admin_bp)

# JWT Callbacks
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'success': False,
        'error': {
            'code': 'TOKEN_EXPIRED',
            'message': 'El token ha expirado'
        }
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'success': False,
        'error': {
            'code': 'INVALID_TOKEN',
            'message': 'Token inválido'
        }
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        'success': False,
        'error': {
            'code': 'MISSING_TOKEN',
            'message': 'Token de autorización requerido'
        }
    }), 401

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    # Por ahora no implementamos blacklist
    return False

@app.route('/')
def index():
    return {'message': 'ProGest API - Backend funcionando correctamente', 'database': 'MySQL'}

@app.route('/api/health')
def health():
    try:
        # Intentar conectar a la base de datos
        db.session.execute(text('SELECT 1'))
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {str(e)}'
    
    return {
        'status': 'healthy',
        'service': 'progest-api',
        'database': db_status
    }

if __name__ == '__main__':
    with app.app_context():
        try:
            # Verificar conexión a la base de datos
            db.session.execute(text('SELECT 1'))
            print('✓ Conexión exitosa a MySQL')
            print(f'✓ Base de datos: {Config.DB_NAME}')
            
            # Crear todas las tablas
            print('\nCreando tablas en la base de datos...')
            db.create_all()
            print('✓ Tablas creadas exitosamente\n')
            
            # Mostrar tablas creadas
            print('Tablas creadas:')
            print('  - users')
            print('  - projects')
            print('  - memberships')
            print('  - tasks')
            print('  - invites')
            print('  - notifications')
            print('  - comments')
            print('  - audit_logs\n')
            
        except Exception as e:
            print(f'✗ Error: {e}')
    
    app.run(debug=True, port=5000)
