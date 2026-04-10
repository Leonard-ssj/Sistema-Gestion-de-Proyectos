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
allowed_origins = [
    os.getenv('FRONTEND_URL', 'http://localhost:3000'),
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
]
CORS(app, origins=allowed_origins)

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
from app.models import User, Project, Membership, Task, Sprint, Invite, Notification, Comment, AuditLog, TeamMessage

# Importar rutas
from app.routes import auth_bp, projects_bp, invites_bp, members_bp, tasks_bp, sprints_bp, notifications_bp, comments_bp, admin_bp, team_chat_bp

def ensure_user_schema():
    columns = db.session.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'users'
    """)).fetchall()
    existing = {row[0] for row in columns}
    
    if 'preferred_theme' not in existing:
        db.session.execute(text("ALTER TABLE users ADD COLUMN preferred_theme VARCHAR(50) DEFAULT 'barney'"))
        db.session.commit()

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

    team_message_columns = db.session.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'team_messages'
    """)).fetchall()
    team_message_existing = {row[0] for row in team_message_columns}

    team_message_alters = []
    if 'task_id' not in team_message_existing:
        team_message_alters.append("ADD COLUMN task_id VARCHAR(36) NULL REFERENCES tasks(id) ON DELETE SET NULL")

    if team_message_alters:
        db.session.execute(text(f"ALTER TABLE team_messages {', '.join(team_message_alters)}"))
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
app.register_blueprint(team_chat_bp)

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

# Migraciones inline — se ejecutan al arrancar gunicorn.
# Envueltas en try/except para no bloquear el arranque si la DB no está lista.
def _run_inline_migrations():
    from sqlalchemy import inspect as sa_inspect
    import logging
    _logger = logging.getLogger(__name__)
    try:
        with app.app_context():
            inspector = sa_inspect(db.engine)

            # 1. memberships.chat_enabled
            if 'memberships' in inspector.get_table_names():
                columns = [c['name'] for c in inspector.get_columns('memberships')]
                if 'chat_enabled' not in columns:
                    try:
                        db.session.execute(text('ALTER TABLE memberships ADD COLUMN chat_enabled BOOLEAN DEFAULT TRUE NOT NULL;'))
                        db.session.commit()
                        _logger.info("Migración: columna 'chat_enabled' añadida")
                    except Exception as e:
                        _logger.error(f"Error añadiendo 'chat_enabled': {e}")
                        db.session.rollback()

            # 2. team_messages.task_id / mentioned_user_id
            if 'team_messages' in inspector.get_table_names():
                columns = [c['name'] for c in inspector.get_columns('team_messages')]
                try:
                    if 'task_id' not in columns:
                        if db.engine.dialect.name == 'sqlite':
                            db.session.execute(text('ALTER TABLE team_messages ADD COLUMN task_id VARCHAR(36);'))
                        else:
                            db.session.execute(text('ALTER TABLE team_messages ADD COLUMN task_id VARCHAR(36) REFERENCES tasks(id) ON DELETE SET NULL;'))
                    if 'mentioned_user_id' not in columns:
                        if db.engine.dialect.name == 'sqlite':
                            db.session.execute(text('ALTER TABLE team_messages ADD COLUMN mentioned_user_id VARCHAR(36);'))
                        else:
                            db.session.execute(text('ALTER TABLE team_messages ADD COLUMN mentioned_user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL;'))
                    db.session.commit()
                except Exception as e:
                    _logger.error(f"Error en team_messages: {e}")
                    db.session.rollback()

            # 3. users: columnas de perfil
            if 'users' in inspector.get_table_names():
                user_columns = [c['name'] for c in inspector.get_columns('users')]
                try:
                    alters = []
                    for col, definition in [
                        ('preferred_theme', "ADD COLUMN preferred_theme VARCHAR(50) DEFAULT 'barney'"),
                        ('job_title',       "ADD COLUMN job_title VARCHAR(100) NULL"),
                        ('description',     "ADD COLUMN description TEXT NULL"),
                        ('responsibilities',"ADD COLUMN responsibilities TEXT NULL"),
                        ('skills',          "ADD COLUMN skills TEXT NULL"),
                        ('department',      "ADD COLUMN department VARCHAR(100) NULL"),
                        ('phone',           "ADD COLUMN phone VARCHAR(20) NULL"),
                    ]:
                        if col not in user_columns:
                            alters.append(definition)
                    if alters:
                        db.session.execute(text(f"ALTER TABLE users {', '.join(alters)}"))
                        db.session.commit()
                        _logger.info(f"Migración users: {alters}")
                except Exception as e:
                    _logger.error(f"Error en migración users: {e}")
                    db.session.rollback()

                # shift enum (requiere CREATE TYPE separado)
                if 'shift' not in user_columns:
                    try:
                        db.session.execute(text("""
                            DO $$
                            BEGIN
                              IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_shift') THEN
                                CREATE TYPE employee_shift AS ENUM('morning', 'afternoon', 'night', 'flexible');
                              END IF;
                            END $$;
                        """))
                        db.session.execute(text("ALTER TABLE users ADD COLUMN shift employee_shift NULL"))
                        db.session.commit()
                        _logger.info("Migración: columna 'shift' añadida")
                    except Exception as e:
                        _logger.error(f"Error añadiendo 'shift': {e}")
                        db.session.rollback()
    except Exception as e:
        import logging as _log
        _log.getLogger(__name__).warning(f"Migraciones inline omitidas (DB no disponible): {e}")

_run_inline_migrations()

if __name__ == '__main__':
    with app.app_context():
        try:
            # Verificar conexión a la base de datos
            db.session.execute(text('SELECT 1'))
            print('✓ Conexión exitosa a PostgreSQL')
            
            # Crear todas las tablas
            print('\nCreando tablas en la base de datos...')
            db.create_all()
            ensure_user_schema()
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
            print('  - audit_logs')
            print('  - team_messages\n')
            
        except Exception as e:
            print(f'✗ Error: {e}')
    
    app.run(debug=True, port=5000)
