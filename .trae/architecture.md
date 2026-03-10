# ARQUITECTURA DEL SISTEMA - ProGest

> Documentacion de la arquitectura del sistema ProGest

---

## VISION GENERAL

ProGest es un sistema SaaS multitenant de gestion de proyectos construido con arquitectura cliente-servidor. El sistema separa claramente el frontend (Next.js) del backend (Flask), comunicandose a traves de una API REST.

### Principios Arquitectonicos

1. **Separacion de Responsabilidades**: Frontend y backend completamente desacoplados
2. **Multitenant**: Aislamiento de datos por proyecto
3. **Seguridad por Capas**: Autenticacion JWT + autorizacion basada en roles
4. **API First**: Toda la logica de negocio expuesta via API REST
5. **Escalabilidad**: Arquitectura preparada para escalar horizontalmente

---

## ARQUITECTURA DE ALTO NIVEL

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Next.js 14 Frontend (Port 3000)            │    │
│  │                                                     │    │
│  │  - React 19 Components                             │    │
│  │  - Zustand State Management                        │    │
│  │  - shadcn/ui Components                            │    │
│  │  - Tailwind CSS                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          │ HTTP/REST                         │
│                          │ (JSON)                            │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Flask Backend API (Port 5000)              │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │         Routes (Blueprints)              │     │    │
│  │  │  - auth, projects, tasks, invites        │     │    │
│  │  │  - members, notifications, comments      │     │    │
│  │  │  - admin                                 │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                     │                              │    │
│  │                     ▼                              │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │         Services (Business Logic)        │     │    │
│  │  │  - auth_service, task_service            │     │    │
│  │  │  - invite_service, notification_service  │     │    │
│  │  │  - comment_service, admin_service        │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                     │                              │    │
│  │                     ▼                              │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │         Models (SQLAlchemy ORM)          │     │    │
│  │  │  - User, Project, Task, Membership       │     │    │
│  │  │  - Invite, Notification, Comment         │     │    │
│  │  │  - AuditLog                              │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                     │                              │    │
│  └─────────────────────┼──────────────────────────────┘    │
│                        │                                   │
│                        ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │         MySQL Database (Port 3306)                 │    │
│  │                                                     │    │
│  │  - 8 tablas principales                            │    │
│  │  - Relaciones con foreign keys                     │    │
│  │  - Indices optimizados                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## BACKEND - FLASK

### Estructura de Capas

**1. Routes (Blueprints)**
- Punto de entrada de las peticiones HTTP
- Validacion de datos de entrada (Marshmallow schemas)
- Manejo de errores HTTP
- Respuestas JSON estandarizadas

**2. Services**
- Logica de negocio
- Transacciones de base de datos
- Validaciones de negocio
- Orquestacion de operaciones complejas

**3. Models**
- Definicion de entidades (SQLAlchemy)
- Relaciones entre entidades
- Metodos de instancia
- Representacion de datos

**4. Utils**
- Decoradores de autorizacion
- Helpers y utilidades
- Sistema de permisos
- Audit logging

### Blueprints (Rutas)

```python
# app/routes/__init__.py
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
projects_bp = Blueprint('projects', __name__, url_prefix='/api/projects')
tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')
invites_bp = Blueprint('invites', __name__, url_prefix='/api/invites')
members_bp = Blueprint('members', __name__, url_prefix='/api/members')
notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')
comments_bp = Blueprint('comments', __name__, url_prefix='/api/tasks')
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')
```

### Modelos Principales

**User**
- Usuarios del sistema (OWNER, EMPLOYEE, SUPERADMIN)
- Perfil enriquecido para empleados
- Relaciones: owned_project, memberships, tasks

**Project**
- Proyectos (1 por OWNER)
- Relaciones: owner, memberships, tasks, invites

**Task**
- Tareas del proyecto
- Estados: pending, in_progress, blocked, done
- Prioridades: low, medium, high, urgent

**Membership**
- Relacion N:M entre User y Project
- Roles: OWNER, EMPLOYEE

**Invite**
- Invitaciones por email con token
- Estados: pending, accepted, expired, cancelled

**Notification**
- Notificaciones del sistema
- Estados: unread, read

**Comment**
- Comentarios en tareas

**AuditLog**
- Registro de todas las acciones importantes

### Configuracion (config.py)

```python
class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://user:pass@host:port/db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True  # Development only
    
    # JWT
    JWT_SECRET_KEY = 'secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # Security
    SECRET_KEY = 'secret-key'
```

---

## FRONTEND - NEXT.JS

### Estructura de Capas

**1. Pages/Routes (App Router)**
- Rutas de la aplicacion
- Server Components y Client Components
- Layouts compartidos

**2. Components**
- Componentes reutilizables
- UI components (shadcn/ui)
- Feature components

**3. Services**
- Llamadas a la API
- Transformacion de datos
- Manejo de errores

**4. Stores (Zustand)**
- Estado global de la aplicacion
- authStore, dataStore, uiStore

**5. Lib**
- Cliente API (api.ts)
- Mappers (backend <-> frontend)
- Utilidades y helpers

### Estructura de Directorios

```
project-management-frontend/
├── app/
│   ├── (marketing)/          # Rutas publicas
│   │   └── page.tsx          # Landing page
│   ├── auth/                 # Autenticacion
│   │   ├── login/
│   │   └── register/
│   ├── app/                  # Aplicacion protegida
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── team/
│   │   └── profile/
│   ├── admin/                # Panel admin
│   ├── onboarding/           # Setup inicial
│   └── invite/[token]/       # Aceptar invitacion
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Layouts
│   └── marketing/            # Marketing components
├── services/                 # API services
│   ├── authService.ts
│   ├── taskService.ts
│   ├── projectService.ts
│   └── ...
├── stores/                   # Zustand stores
│   ├── authStore.ts
│   ├── dataStore.ts
│   └── uiStore.ts
└── lib/
    ├── api.ts                # Cliente API
    ├── mappers.ts            # Transformaciones
    └── utils.ts              # Utilidades
```

### Cliente API (lib/api.ts)

```typescript
class APIClient {
  private baseURL: string
  
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: any): Promise<T>
  async patch<T>(endpoint: string, data: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
  
  // Manejo automatico de:
  // - Tokens JWT en headers
  // - Refresh de tokens expirados
  // - Errores HTTP
  // - Transformacion de respuestas
}
```

### Estado Global (Zustand)

**authStore**
```typescript
interface AuthStore {
  session: AuthSession | null
  login: (email, password) => Promise<void>
  logout: () => Promise<void>
  register: (data) => Promise<void>
  refreshToken: () => Promise<void>
}
```

**dataStore**
```typescript
interface DataStore {
  tasks: Task[]
  members: Member[]
  notifications: Notification[]
  
  fetchTasks: () => Promise<void>
  createTask: (data) => Promise<void>
  updateTask: (id, data) => Promise<void>
  deleteTask: (id) => Promise<void>
}
```

---

## AUTENTICACION Y AUTORIZACION

### Flujo de Autenticacion

1. **Registro/Login**
   - Usuario envia credenciales
   - Backend valida y genera JWT
   - Frontend guarda tokens en localStorage
   - Tokens incluyen: user_id, role, project_id

2. **Peticiones Autenticadas**
   - Frontend envia token en header: `Authorization: Bearer <token>`
   - Backend valida token con @jwt_required()
   - Backend extrae claims del token

3. **Refresh de Tokens**
   - Access token expira en 15 minutos
   - Frontend detecta expiracion (401)
   - Frontend usa refresh token para obtener nuevo access token
   - Refresh token expira en 7 dias

### Sistema de Roles

**SUPERADMIN**
- Acceso total al sistema
- Puede ver todos los proyectos y usuarios
- Panel de administracion
- Logs de auditoria

**OWNER**
- Dueño de un proyecto
- Puede crear tareas
- Puede invitar empleados
- Puede gestionar el equipo
- Acceso completo a su proyecto

**EMPLOYEE**
- Miembro de un proyecto
- Puede ver tareas asignadas
- Puede comentar en tareas
- Puede actualizar estado de sus tareas
- Acceso limitado al proyecto

### Sistema de Permisos

**Decoradores de Autorizacion**

```python
@jwt_required()  # Requiere autenticacion
@require_roles('OWNER', 'SUPERADMIN')  # Requiere rol especifico
@require_permission('task:create')  # Requiere permiso especifico
@require_project_access  # Requiere acceso al proyecto
@require_resource_owner('comment')  # Requiere ser dueño del recurso
```

**Matriz de Permisos**

| Recurso | Accion | OWNER | EMPLOYEE | SUPERADMIN |
|---------|--------|-------|----------|------------|
| Task    | create | Si    | No       | Si         |
| Task    | read   | Si    | Si*      | Si         |
| Task    | update | Si    | Si*      | Si         |
| Task    | delete | Si    | No       | Si         |
| Comment | create | Si    | Si       | Si         |
| Comment | delete | Si    | Si**     | Si         |
| Member  | add    | Si    | No       | Si         |
| Member  | remove | Si    | No       | Si         |

\* Solo tareas asignadas  
\** Solo sus propios comentarios

---

## MULTITENANT

### Aislamiento de Datos

**Estrategia: Shared Database, Shared Schema**

- Todos los proyectos comparten la misma base de datos
- Aislamiento mediante `project_id` en las queries
- Verificacion automatica en cada peticion

**Implementacion**

1. **Token JWT incluye project_id**
```python
access_token = create_access_token(
    identity=user.id,
    additional_claims={
        'role': user.role,
        'project_id': project.id
    }
)
```

2. **Queries filtradas automaticamente**
```python
# Obtener tareas del proyecto del usuario
project_id = get_current_project_id()
tasks = Task.query.filter_by(project_id=project_id).all()
```

3. **Verificacion en decoradores**
```python
@project_member_required
def get_tasks():
    # Automaticamente verifica que el usuario pertenezca al proyecto
    pass
```

### Ventajas del Multitenant

- **Aislamiento**: Cada proyecto ve solo sus datos
- **Seguridad**: Imposible acceder a datos de otros proyectos
- **Escalabilidad**: Facil agregar nuevos proyectos
- **Mantenimiento**: Una sola base de datos para mantener

---

## API REST

### Estandar de Respuestas

**Respuesta Exitosa**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "project": {...}
  }
}
```

**Respuesta con Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email ya registrado",
    "details": {...}
  }
}
```

### Codigos HTTP

- `200 OK` - Operacion exitosa
- `201 Created` - Recurso creado
- `400 Bad Request` - Datos invalidos
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No autorizado
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

### Versionado

Actualmente: `/api/...`  
Futuro: `/api/v1/...`, `/api/v2/...`

---

## SEGURIDAD

### Medidas Implementadas

1. **Passwords**
   - Hasheados con bcrypt
   - Salt automatico
   - Nunca se almacenan en texto plano

2. **JWT**
   - Tokens firmados con secret key
   - Expiracion automatica
   - Refresh tokens para renovacion

3. **CORS**
   - Configurado para frontend especifico
   - Headers permitidos controlados

4. **SQL Injection**
   - Prevenido por SQLAlchemy ORM
   - Queries parametrizadas

5. **XSS**
   - React escapa automaticamente
   - Validacion de inputs

6. **CSRF**
   - Tokens JWT en headers (no cookies)
   - SameSite cookies si se usan

7. **Rate Limiting**
   - Pendiente de implementar

### Audit Logging

Todas las acciones importantes se registran:
- Creacion/modificacion de recursos
- Intentos de acceso denegados
- Cambios de permisos
- Login/logout

---

## ESCALABILIDAD

### Estrategias de Escalado

**Horizontal (Recomendado)**
- Multiples instancias del backend
- Load balancer (Nginx, AWS ALB)
- Sesiones stateless (JWT)

**Vertical**
- Aumentar recursos del servidor
- Optimizar queries
- Indices en base de datos

### Optimizaciones Implementadas

1. **Indices en Base de Datos**
   - Foreign keys indexadas
   - Campos de busqueda frecuente

2. **Queries Optimizadas**
   - Eager loading de relaciones
   - Paginacion en listados

3. **Caching** (Pendiente)
   - Redis para sesiones
   - Cache de queries frecuentes

---

## DEPLOYMENT

### Requisitos de Produccion

**Backend**
- Python 3.10+
- Gunicorn (WSGI server)
- Nginx (reverse proxy)
- MySQL 8.0+

**Frontend**
- Node.js 18+
- Next.js build
- Nginx (static files)

### Variables de Entorno

```bash
# Backend
SECRET_KEY=production-secret-key
JWT_SECRET_KEY=production-jwt-secret
DB_HOST=production-db-host
DB_USER=production-db-user
DB_PASSWORD=production-db-password
DB_NAME=progest_production

# Frontend
NEXT_PUBLIC_API_URL=https://api.progest.com
```

### Arquitectura de Produccion

```
Internet
   │
   ▼
Load Balancer (AWS ALB / Nginx)
   │
   ├─► Frontend (Next.js) - Port 3000
   │   └─► Static Files (CDN)
   │
   └─► Backend (Flask + Gunicorn) - Port 5000
       └─► MySQL Database (RDS / Managed)
```

---

## MONITOREO Y LOGS

### Logs del Sistema

**Backend**
- Request logging (metodo, path, body)
- Error logging (excepciones, stack traces)
- Audit logging (acciones de usuarios)

**Frontend**
- Error boundary (errores de React)
- API errors (errores de red)
- User actions (analytics)

### Metricas Recomendadas

- Tiempo de respuesta de API
- Tasa de errores
- Usuarios activos
- Uso de recursos (CPU, memoria)
- Queries lentas de base de datos

---

## PROXIMOS PASOS ARQUITECTONICOS

1. **Implementar Redis**
   - Cache de sesiones
   - Cache de queries
   - Rate limiting

2. **Implementar Celery**
   - Tareas asincronas
   - Envio de emails
   - Procesamiento en background

3. **Implementar WebSockets**
   - Notificaciones en tiempo real
   - Actualizaciones de tareas en vivo

4. **Implementar CDN**
   - Static files del frontend
   - Imagenes y assets

5. **Implementar Monitoring**
   - Sentry para errores
   - DataDog/New Relic para metricas
   - ELK Stack para logs

---

**Ultima actualizacion:** 24 de febrero de 2026  
**Version:** 2.0.0
