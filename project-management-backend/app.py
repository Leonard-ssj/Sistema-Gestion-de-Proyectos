from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import text
from dotenv import load_dotenv, find_dotenv
import os
from datetime import datetime

# Cargar variables de entorno
_dotenv_path = find_dotenv('.env.local', usecwd=True)
if _dotenv_path:
    load_dotenv(_dotenv_path)

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
        body = request.get_json(silent=True)
        if isinstance(body, dict) and 'password' in body:
            body = {**body, 'password': '[REDACTED]'}
        print(f'Body: {body}')

# Importar modelos después de inicializar db
from app.models import User, Project, Membership, Task, Sprint, Invite, Notification, Comment, AuditLog

# Importar rutas
from app.routes import auth_bp, projects_bp, invites_bp, members_bp, tasks_bp, sprints_bp, notifications_bp, comments_bp, admin_bp

def ensure_project_schema():
    columns = db.session.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'projects'
    """)).fetchall()
    existing = {row[0] for row in columns}
    
    alters = []
    if 'timezone' not in existing:
        alters.append("ADD COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'America/Mexico_City'")
    if 'date_format' not in existing:
        alters.append("ADD COLUMN date_format VARCHAR(32) NOT NULL DEFAULT 'dd/MM/yyyy'")
    if 'state' not in existing:
        alters.append("ADD COLUMN state VARCHAR(64) NULL")
    if 'tasks_retention_days' not in existing:
        alters.append("ADD COLUMN tasks_retention_days INTEGER NOT NULL DEFAULT 30")
    if 'sprint_enabled' not in existing:
        alters.append("ADD COLUMN sprint_enabled BOOLEAN NOT NULL DEFAULT TRUE")
    if 'sprint_length_days' not in existing:
        alters.append("ADD COLUMN sprint_length_days INTEGER NOT NULL DEFAULT 14")
    
    if alters:
        db.session.execute(text(f"ALTER TABLE projects {', '.join(alters)}"))
        db.session.commit()

    task_columns = db.session.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'tasks'
    """)).fetchall()
    task_existing = {row[0] for row in task_columns}

    task_alters = []
    if 'sprint_id' not in task_existing:
        task_alters.append("ADD COLUMN sprint_id VARCHAR(36) NULL")

    if task_alters:
        db.session.execute(text(f"ALTER TABLE tasks {', '.join(task_alters)}"))
        db.session.commit()

    sprint_columns = db.session.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'sprints'
    """)).fetchall()
    sprint_existing = {row[0] for row in sprint_columns}

    sprint_alters = []
    if 'color' not in sprint_existing:
        sprint_alters.append("ADD COLUMN color VARCHAR(32) NOT NULL DEFAULT 'blue'")

    if sprint_alters:
        db.session.execute(text(f"ALTER TABLE sprints {', '.join(sprint_alters)}"))
        db.session.commit()

    db.session.execute(text("""
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
            IF NOT EXISTS (
              SELECT 1
              FROM pg_enum e
              JOIN pg_type t ON t.oid = e.enumtypid
              WHERE t.typname = 'task_status' AND e.enumlabel = 'in_review'
            ) THEN
              ALTER TYPE task_status ADD VALUE 'in_review';
            END IF;
          END IF;
        END $$;
    """))
    db.session.commit()

    bottts = {
        'Astra': 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Astra&size=64&radius=12',
        'Bolt': 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Bolt&size=64&radius=12',
        'Cobalt': 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Cobalt&size=64&radius=12',
        'Delta': 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Delta&size=64&radius=12',
        'Echo': 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Echo&size=64&radius=12',
        'Flux': 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Flux&size=64&radius=12',
        'Glitch': 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Glitch&size=64&radius=12',
        'Hex': 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Hex&size=64&radius=12',
    }
    legacy_map = {
        '/avatars/owners/owner-01.svg': bottts['Astra'],
        '/avatars/owners/owner-02.svg': bottts['Bolt'],
        '/avatars/owners/owner-03.svg': bottts['Cobalt'],
        '/avatars/owners/owner-04.svg': bottts['Delta'],
        '/avatars/owners/owner-05.svg': bottts['Echo'],
    }
    for old, new in legacy_map.items():
        db.session.execute(text("UPDATE users SET avatar = :new WHERE avatar = :old"), {'new': new, 'old': old})
    db.session.commit()

# Registrar blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(projects_bp)
app.register_blueprint(invites_bp)
app.register_blueprint(members_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(sprints_bp)
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
    return {'message': 'ProGest API - Backend funcionando correctamente', 'database': 'PostgreSQL'}

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
            print('✓ Conexión exitosa a PostgreSQL')
            
            # Crear todas las tablas
            print('\nCreando tablas en la base de datos...')
            db.create_all()
            ensure_project_schema()
            print('✓ Tablas creadas exitosamente\n')
            
            # Mostrar tablas creadas
            print('Tablas creadas:')
            print('  - users')
            print('  - projects')
            print('  - memberships')
            print('  - tasks')
            print('  - sprints')
            print('  - invites')
            print('  - notifications')
            print('  - comments')
            print('  - audit_logs\n')
            
        except Exception as e:
            print(f'✗ Error: {e}')
    
    app.run(debug=True, port=5000)
