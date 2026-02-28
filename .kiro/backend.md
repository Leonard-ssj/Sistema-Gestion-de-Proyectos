# DOCUMENTACION DEL BACKEND - ProGest

> Documentacion completa del backend Flask

---

## VISION GENERAL

Backend REST API construido con Flask 3.0, SQLAlchemy y MySQL. Implementa autenticacion JWT, sistema multitenant y arquitectura en capas.

**Tecnologias:**
- Flask 3.0.0
- Flask-JWT-Extended 4.6.0
- SQLAlchemy 3.1.1
- MySQL + PyMySQL
- Marshmallow 3.20.1
- Bcrypt 4.1.2

**Puerto:** 5000  
**Base URL:** http://localhost:5000/api

---

## ESTRUCTURA DEL PROYECTO

```
project-management-backend/
├── app/
│   ├── __init__.py              # Inicializacion de db y migrate
│   ├── config/
│   │   ├── __init__.py
│   │   └── permissions.py       # Matriz de permisos
│   ├── models/                  # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   ├── membership.py
│   │   ├── invite.py
│   │   ├── notification.py
│   │   ├── comment.py
│   │   └── audit_log.py
│   ├── routes/                  # Blueprints (endpoints)
│   │   ├── __init__.py
│   │   ├── auth.py              # 6 endpoints
│   │   ├── projects.py          # 2 endpoints
│   │   ├── tasks.py             # 9 endpoints
│   │   ├── invites.py           # 5 endpoints
│   │   ├── members.py           # 3 endpoints
│   │   ├── notifications.py     # 5 endpoints
│   │   ├── comments.py          # 4 endpoints
│   │   └── admin.py             # 7 endpoints
│   ├── schemas/                 # Validacion Marshmallow
│   │   ├── __init__.py
│   │   ├── user_schema.py
│   │   ├── project_schema.py
│   │   ├── task_schema.py
│   │   ├── membership_schema.py
│   │   ├── invite_schema.py
│   │   ├── notification_schema.py
│   │   ├── comment_schema.py
│   │   └── audit_log_schema.py
│   ├── services/                # Logica de negocio
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── task_service.py
│   │   ├── invite_service.py
│   │   ├── notification_service.py
│   │   ├── comment_service.py
│   │   └── admin_service.py
│   └── utils/                   # Utilidades
│       ├── __init__.py
│       ├── decorators.py        # Decoradores de autorizacion
│       └── permissions.py       # Sistema de permisos
├── migrations/                  # Migraciones Flask-Migrate (Alembic)
│   ├── versions/                # Archivos de migracion
│   ├── alembic.ini             # Configuracion de Alembic
│   ├── env.py                  # Configuracion del entorno
│   └── script.py.mako          # Template para migraciones
├── migrations_manual_sql/       # Migraciones SQL manuales (referencia)
│   ├── add_resend_count_to_invites.sql
│   ├── fix_invite_status_enum.sql
│   ├── add_employee_enrichment_fields.sql
│   └── add_responsibilities_field.sql
├── app.py                       # Punto de entrada
├── wsgi.py                      # Entry point para Flask-Migrate
├── config.py                    # Configuracion
├── manage_migrations.py         # Script de gestion de migraciones
├── MIGRATIONS_README.md         # Documentacion de migraciones
└── requirements.txt             # Dependencias
```

---

## CONFIGURACION

### config.py

```python
class Config:
    # Database
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_NAME = os.getenv('DB_NAME')
    
    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True  # Development only
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY')
```

### Variables de Entorno (.env.local)

```bash
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=progest_db
FRONTEND_URL=http://localhost:3000
```

---

## BLUEPRINTS (RUTAS)

### 1. AUTH (auth.py)

**Prefix:** `/api/auth`

**Endpoints:**
- `POST /register` - Registro de usuarios
- `POST /login` - Inicio de sesion
- `POST /refresh` - Refresh token
- `POST /logout` - Cerrar sesion
- `POST /accept-invite` - Aceptar invitacion
- `GET /me` - Usuario actual

### 2. PROJECTS (projects.py)

**Prefix:** `/api/projects`

**Endpoints:**
- `POST /` - Crear proyecto (OWNER)
- `GET /my-project` - Obtener mi proyecto

### 3. TASKS (tasks.py)

**Prefix:** `/api/tasks`

**Endpoints:**
- `POST /` - Crear tarea
- `GET /` - Listar tareas del proyecto
- `GET /<task_id>` - Obtener tarea
- `PATCH /<task_id>` - Actualizar tarea
- `DELETE /<task_id>` - Eliminar tarea
- `GET /my-tasks` - Mis tareas asignadas
- `PATCH /<task_id>/assign` - Asignar tarea
- `PATCH /<task_id>/status` - Cambiar estado
- `GET /stats` - Estadisticas de tareas

### 4. INVITES (invites.py)

**Prefix:** `/api/invites`

**Endpoints:**
- `POST /` - Crear invitacion
- `GET /` - Listar invitaciones
- `DELETE /<invite_id>` - Cancelar invitacion
- `GET /validate/<token>` - Validar token
- `POST /<invite_id>/resend` - Reenviar invitacion

### 5. MEMBERS (members.py)

**Prefix:** `/api/members`

**Endpoints:**
- `GET /` - Listar miembros
- `PATCH /<membership_id>/deactivate` - Desactivar miembro
- `PATCH /<user_id>/profile` - Actualizar perfil

### 6. NOTIFICATIONS (notifications.py)

**Prefix:** `/api/notifications`

**Endpoints:**
- `GET /` - Listar notificaciones
- `GET /unread-count` - Contador de no leidas
- `PATCH /<notification_id>/read` - Marcar como leida
- `PATCH /read-all` - Marcar todas como leidas
- `DELETE /<notification_id>` - Eliminar notificacion

### 7. COMMENTS (comments.py)

**Prefix:** `/api/tasks`

**Endpoints:**
- `GET /<task_id>/comments` - Listar comentarios
- `POST /<task_id>/comments` - Crear comentario
- `PATCH /<task_id>/comments/<comment_id>` - Actualizar comentario
- `DELETE /<task_id>/comments/<comment_id>` - Eliminar comentario

### 8. ADMIN (admin.py)

**Prefix:** `/api/admin`

**Endpoints:**
- `GET /users` - Listar todos los usuarios
- `GET /projects` - Listar todos los proyectos
- `GET /audit-logs` - Logs de auditoria
- `PATCH /users/<user_id>/status` - Cambiar estado de usuario
- `PATCH /projects/<project_id>/status` - Cambiar estado de proyecto
- `GET /stats` - Estadisticas globales
- `GET /health` - Health check

---

## SERVICIOS

### auth_service.py

**Funciones:**
- `register_user(data)` - Registrar nuevo usuario
- `login_user(email, password)` - Autenticar usuario
- `create_access_token(user)` - Generar access token
- `create_refresh_token(user)` - Generar refresh token
- `accept_invite(token, password, name)` - Aceptar invitacion

### task_service.py

**Funciones:**
- `create_task(data, user_id, project_id)` - Crear tarea
- `get_tasks(project_id, filters)` - Listar tareas
- `update_task(task_id, data)` - Actualizar tarea
- `delete_task(task_id)` - Eliminar tarea
- `assign_task(task_id, user_id)` - Asignar tarea
- `change_status(task_id, status)` - Cambiar estado
- `get_task_stats(project_id)` - Estadisticas

### invite_service.py

**Funciones:**
- `create_invite(data, inviter_id, project_id)` - Crear invitacion
- `validate_token(token)` - Validar token
- `cancel_invite(invite_id)` - Cancelar invitacion
- `resend_invite(invite_id)` - Reenviar invitacion

### notification_service.py

**Funciones:**
- `create_notification(user_id, type, message, data)` - Crear notificacion
- `get_notifications(user_id)` - Obtener notificaciones
- `mark_as_read(notification_id)` - Marcar como leida
- `mark_all_as_read(user_id)` - Marcar todas como leidas

### comment_service.py

**Funciones:**
- `create_comment(task_id, user_id, content)` - Crear comentario
- `get_comments(task_id)` - Obtener comentarios
- `update_comment(comment_id, content)` - Actualizar comentario
- `delete_comment(comment_id)` - Eliminar comentario

### admin_service.py

**Funciones:**
- `get_all_users(filters)` - Listar usuarios
- `get_all_projects(filters)` - Listar proyectos
- `get_audit_logs(filters)` - Obtener logs
- `change_user_status(user_id, status)` - Cambiar estado usuario
- `change_project_status(project_id, status)` - Cambiar estado proyecto
- `get_global_stats()` - Estadisticas globales

---

## DECORADORES DE AUTORIZACION

### @jwt_required()

Requiere token JWT valido.

```python
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    # ...
```

### @require_roles(*roles)

Requiere uno de los roles especificados.

```python
@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@require_roles('SUPERADMIN')
def list_users():
    # Solo SUPERADMIN
```

### @require_permission(permission)

Requiere permiso especifico.

```python
@tasks_bp.route('', methods=['POST'])
@jwt_required()
@require_permission('task:create')
def create_task():
    # Solo quien tenga permiso task:create
```

### @require_project_access

Requiere acceso al proyecto del recurso.

```python
@tasks_bp.route('/<task_id>', methods=['GET'])
@jwt_required()
@require_project_access
def get_task(task_id):
    # Verifica acceso al proyecto de la tarea
```

### @require_resource_owner(resource_type)

Requiere ser dueño del recurso.

```python
@comments_bp.route('/<task_id>/comments/<comment_id>', methods=['DELETE'])
@jwt_required()
@require_resource_owner('comment')
def delete_comment(task_id, comment_id):
    # Solo el autor del comentario
```

---

## SISTEMA DE PERMISOS

### Matriz de Permisos (config/permissions.py)

```python
ROLE_PERMISSIONS = {
    'SUPERADMIN': ['*:*'],  # Todos los permisos
    'OWNER': [
        'task:*',
        'member:*',
        'invite:*',
        'project:*',
        'comment:*',
        'notification:*'
    ],
    'EMPLOYEE': [
        'task:read',
        'task:update',  # Solo sus tareas
        'comment:create',
        'comment:read',
        'comment:update',  # Solo sus comentarios
        'notification:read'
    ]
}
```

### PermissionChecker (utils/permissions.py)

```python
class PermissionChecker:
    @staticmethod
    def has_permission(user_role, permission):
        # Verifica si el rol tiene el permiso
        
    @staticmethod
    def has_resource_access(user_id, user_role, resource_type, resource_id):
        # Verifica acceso a recurso especifico
        
    @staticmethod
    def is_resource_owner(user_id, resource_type, resource_id):
        # Verifica si es dueño del recurso
```

---

## VALIDACION CON MARSHMALLOW

### Schemas

Cada entidad tiene su schema para validacion:

```python
# schemas/task_schema.py
class TaskCreateSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    priority = fields.Str(validate=validate.OneOf(['low', 'medium', 'high', 'urgent']))
    assigned_to = fields.Str(allow_none=True)
    due_date = fields.DateTime(required=True)
    tags = fields.List(fields.Str(), allow_none=True)
```

### Uso en Rutas

```python
@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    schema = TaskCreateSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Datos invalidos',
                'details': err.messages
            }
        }), 400
```

---

## RESPUESTAS ESTANDARIZADAS

### Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid",
      "title": "Tarea 1",
      "status": "pending"
    }
  }
}
```

### Respuesta con Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos invalidos",
    "details": {
      "title": ["Campo requerido"]
    }
  }
}
```

### Codigos de Error Comunes

- `VALIDATION_ERROR` - Datos invalidos
- `AUTHENTICATION_ERROR` - Credenciales incorrectas
- `TOKEN_EXPIRED` - Token expirado
- `INVALID_TOKEN` - Token invalido
- `MISSING_TOKEN` - Token no proporcionado
- `FORBIDDEN` - Sin permisos
- `NOT_FOUND` - Recurso no encontrado
- `ALREADY_EXISTS` - Recurso ya existe

---

## AUDIT LOGGING

### AuditLogger (utils/permissions.py)

```python
class AuditLogger:
    @staticmethod
    def log_permission_denied(user_id, action, resource_type, resource_id, details):
        # Registra intento de acceso denegado
        
    @staticmethod
    def log_access_granted(user_id, action, resource_type, resource_id, details):
        # Registra acceso exitoso
```

### Acciones Registradas

- `user_created`, `user_updated`, `user_deleted`
- `project_created`, `project_updated`
- `task_created`, `task_updated`, `task_deleted`
- `invite_sent`, `invite_accepted`, `invite_cancelled`
- `member_added`, `member_removed`
- `permission_denied_*`

---

## INICIALIZACION

### app.py

```python
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app import db, migrate
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Inicializar extensiones
db.init_app(app)
migrate.init_app(app, db)
jwt = JWTManager(app)
CORS(app, origins=[os.getenv('FRONTEND_URL')])

# Registrar blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(projects_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(invites_bp)
app.register_blueprint(members_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(comments_bp)
app.register_blueprint(admin_bp)

# JWT callbacks
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'success': False, 'error': {...}}), 401

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
```

---

## COMANDOS UTILES

### Iniciar Servidor

```bash
cd project-management-backend
python -m venv backend-env
backend-env\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Crear Tablas

```bash
python app.py
# Las tablas se crean automaticamente con db.create_all()
```

### Aplicar Migraciones

Sistema automatico con Flask-Migrate:

```bash
# Ver version actual
python manage_migrations.py current

# Crear nueva migracion
python manage_migrations.py migrate "Descripcion del cambio"

# Aplicar migraciones pendientes
python manage_migrations.py upgrade

# Revertir ultima migracion
python manage_migrations.py downgrade

# Ver historial
python manage_migrations.py history
```

Ver `MIGRATIONS_README.md` para documentacion completa.

### Generar Password Hash

```bash
python generate_password_hash.py
```

### Listar Endpoints

```bash
python list_endpoints.py
```

---

**Ultima actualizacion:** 24 de febrero de 2026  
**Version:** 2.0.0
