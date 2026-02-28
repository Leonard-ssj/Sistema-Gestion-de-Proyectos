# MODELO DE DATOS - ProGest

> Documentacion completa del modelo de datos del sistema ProGest

---

## VISION GENERAL

El sistema ProGest utiliza MySQL como base de datos relacional con SQLAlchemy como ORM. El modelo de datos esta diseñado para soportar multitenant, con aislamiento de datos por proyecto.

### Caracteristicas del Modelo

- **8 entidades principales**
- **Relaciones bien definidas** con foreign keys
- **Indices optimizados** para queries frecuentes
- **UUIDs como primary keys** para escalabilidad
- **Timestamps automaticos** (created_at, updated_at)
- **Enums para estados** (validacion a nivel de BD)

---

## DIAGRAMA ENTIDAD-RELACION

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ email       │◄──────────┐
│ password    │           │
│ name        │           │
│ role        │           │
│ status      │           │
│ ...         │           │
└─────────────┘           │
      │                   │
      │ 1:1               │ N:1
      │                   │
      ▼                   │
┌─────────────┐     ┌─────────────┐
│   Project   │     │ Membership  │
│─────────────│     │─────────────│
│ id (PK)     │◄────│ id (PK)     │
│ name        │ 1:N │ user_id (FK)│
│ owner_id(FK)│─────│ project_id  │
│ category    │     │ role        │
│ status      │     │ status      │
└─────────────┘     └─────────────┘
      │
      │ 1:N
      │
      ▼
┌─────────────┐     ┌─────────────┐
│    Task     │     │   Comment   │
│─────────────│     │─────────────│
│ id (PK)     │◄────│ id (PK)     │
│ project_id  │ 1:N │ task_id (FK)│
│ title       │─────│ user_id (FK)│
│ status      │     │ content     │
│ priority    │     └─────────────┘
│ assigned_to │
│ created_by  │
│ due_date    │
│ tags        │
└─────────────┘

┌─────────────┐     ┌──────────────┐
│   Invite    │     │ Notification │
│─────────────│     │──────────────│
│ id (PK)     │     │ id (PK)      │
│ project_id  │     │ user_id (FK) │
│ email       │     │ project_id   │
│ token       │     │ type         │
│ status      │     │ message      │
│ invited_by  │     │ read         │
│ expires_at  │     └──────────────┘
│ ...         │
└─────────────┘

┌─────────────┐
│  AuditLog   │
│─────────────│
│ id (PK)     │
│ user_id (FK)│
│ action      │
│ entity_type │
│ entity_id   │
│ details     │
│ ip_address  │
└─────────────┘
```

---

## ENTIDADES PRINCIPALES

### 1. USER

Usuarios del sistema con tres roles posibles.

**Tabla:** `users`

**Campos:**
```python
id              String(36)      PK, UUID
email           String(255)     UNIQUE, NOT NULL, INDEXED
password_hash   String(255)     NOT NULL
name            String(255)     NOT NULL
role            ENUM            NOT NULL (OWNER, EMPLOYEE, SUPERADMIN)
avatar          String(500)     NULL
status          ENUM            NOT NULL (active, disabled)

# Perfil enriquecido para empleados
job_title       String(100)     NULL
description     Text            NULL
responsibilities Text           NULL
skills          Text            NULL
shift           ENUM            NULL (morning, afternoon, night, flexible)
department      String(100)     NULL
phone           String(20)      NULL

created_at      DateTime        NOT NULL
updated_at      DateTime        NULL
```

**Relaciones:**
- `owned_project` - 1:1 con Project (como owner)
- `memberships` - 1:N con Membership
- `created_tasks` - 1:N con Task (como creador)
- `assigned_tasks` - 1:N con Task (como asignado)
- `sent_invites` - 1:N con Invite
- `notifications` - 1:N con Notification
- `comments` - 1:N con Comment
- `audit_logs` - 1:N con AuditLog

**Reglas de Negocio:**
- Email debe ser unico
- Password siempre hasheado con bcrypt
- OWNER puede tener solo 1 proyecto
- EMPLOYEE puede pertenecer a multiples proyectos
- SUPERADMIN tiene acceso a todo

---

### 2. PROJECT

Proyectos del sistema (1 por OWNER).

**Tabla:** `projects`

**Campos:**
```python
id              String(36)      PK, UUID
name            String(255)     NOT NULL
description     Text            NULL
category        String(100)     NULL
owner_id        String(36)      FK(users.id), UNIQUE, NOT NULL, INDEXED
status          ENUM            NOT NULL (active, disabled)
created_at      DateTime        NOT NULL
updated_at      DateTime        NULL
```

**Relaciones:**
- `owner` - N:1 con User
- `memberships` - 1:N con Membership
- `tasks` - 1:N con Task
- `invites` - 1:N con Invite
- `notifications` - 1:N con Notification
- `audit_logs` - 1:N con AuditLog

**Reglas de Negocio:**
- Un OWNER solo puede tener 1 proyecto (owner_id UNIQUE)
- Todos los datos del proyecto estan aislados (multitenant)
- Al eliminar proyecto, se eliminan en cascada: memberships, tasks, invites

---

### 3. MEMBERSHIP

Relacion N:M entre User y Project.

**Tabla:** `memberships`

**Campos:**
```python
id              String(36)      PK, UUID
user_id         String(36)      FK(users.id), NOT NULL, INDEXED
project_id      String(36)      FK(projects.id), NOT NULL, INDEXED
role            ENUM            NOT NULL (OWNER, EMPLOYEE)
status          ENUM            NOT NULL (active, disabled)
joined_at       DateTime        NOT NULL
```

**Constraints:**
- UNIQUE(user_id, project_id) - Un usuario solo puede tener una membresia por proyecto

**Relaciones:**
- `user` - N:1 con User
- `project` - N:1 con Project

**Reglas de Negocio:**
- OWNER automaticamente tiene membresia en su proyecto
- EMPLOYEE se agrega via invitacion
- Desactivar membresia no elimina el registro (soft delete)

---

### 4. TASK

Tareas del proyecto.

**Tabla:** `tasks`

**Campos:**
```python
id              String(36)      PK, UUID
project_id      String(36)      FK(projects.id), NOT NULL, INDEXED
title           String(255)     NOT NULL
description     Text            NULL
status          ENUM            NOT NULL (pending, in_progress, blocked, done)
priority        ENUM            NOT NULL (low, medium, high, urgent)
assigned_to     String(36)      FK(users.id), NULL, INDEXED
created_by      String(36)      FK(users.id), NOT NULL, INDEXED
due_date        DateTime        NULL
start_date      DateTime        NULL
completed_at    DateTime        NULL
tags            JSON            NULL
created_at      DateTime        NOT NULL
updated_at      DateTime        NULL
```

**Relaciones:**
- `project` - N:1 con Project
- `assignee` - N:1 con User (assigned_to)
- `creator` - N:1 con User (created_by)
- `comments` - 1:N con Comment

**Reglas de Negocio:**
- Solo OWNER puede crear tareas
- EMPLOYEE puede ver solo tareas asignadas a el
- due_date es obligatorio
- tags es un array JSON de strings
- Al cambiar a 'done', se actualiza completed_at

---

### 5. INVITE

Invitaciones por email con token.

**Tabla:** `invites`

**Campos:**
```python
id              String(36)      PK, UUID
project_id      String(36)      FK(projects.id), NOT NULL, INDEXED
invited_by      String(36)      FK(users.id), NOT NULL, INDEXED
email           String(255)     NOT NULL, INDEXED
token           String(255)     UNIQUE, NOT NULL, INDEXED
status          ENUM            NOT NULL (pending, accepted, expired, cancelled)
resend_count    Integer         NOT NULL, DEFAULT 0

# Datos de perfil para el empleado invitado
job_title       String(100)     NULL
description     Text            NULL
responsibilities Text           NULL
skills          Text            NULL
shift           ENUM            NULL (morning, afternoon, night, flexible)
department      String(100)     NULL
phone           String(20)      NULL

created_at      DateTime        NOT NULL
expires_at      DateTime        NOT NULL (created_at + 7 dias)
accepted_at     DateTime        NULL
updated_at      DateTime        NULL
```

**Relaciones:**
- `project` - N:1 con Project
- `inviter` - N:1 con User

**Reglas de Negocio:**
- Token generado automaticamente (secrets.token_urlsafe(32))
- Expira en 7 dias
- Puede reenviarse hasta 3 veces
- Al aceptar, se crea User y Membership
- Datos de perfil se copian al User al aceptar

---

### 6. NOTIFICATION

Notificaciones del sistema.

**Tabla:** `notifications`

**Campos:**
```python
id              String(36)      PK, UUID
user_id         String(36)      FK(users.id), NOT NULL, INDEXED
project_id      String(36)      FK(projects.id), NULL, INDEXED
type            String(50)      NOT NULL
message         Text            NOT NULL
read            Boolean         NOT NULL, DEFAULT False, INDEXED
entity_type     String(50)      NULL
entity_id       String(36)      NULL
created_at      DateTime        NOT NULL
read_at         DateTime        NULL
```

**Relaciones:**
- `user` - N:1 con User
- `project` - N:1 con Project

**Tipos de Notificacion:**
- `task_assigned` - Tarea asignada
- `task_comment` - Nuevo comentario en tarea
- `task_status_changed` - Estado de tarea cambiado
- `invite_accepted` - Invitacion aceptada
- `member_added` - Nuevo miembro agregado

**Reglas de Negocio:**
- Solo el usuario dueño puede ver sus notificaciones
- Al marcar como leida, se actualiza read_at
- entity_type y entity_id apuntan al recurso relacionado

---

### 7. COMMENT

Comentarios en tareas.

**Tabla:** `comments`

**Campos:**
```python
id              String(36)      PK, UUID
task_id         String(36)      FK(tasks.id), NOT NULL, INDEXED
user_id         String(36)      FK(users.id), NOT NULL, INDEXED
content         Text            NOT NULL
created_at      DateTime        NOT NULL
updated_at      DateTime        NULL
```

**Relaciones:**
- `task` - N:1 con Task
- `user` - N:1 con User

**Reglas de Negocio:**
- Solo miembros del proyecto pueden comentar
- Solo el autor puede editar/eliminar su comentario
- OWNER puede eliminar cualquier comentario

---

### 8. AUDITLOG

Registro de auditoria de acciones.

**Tabla:** `audit_logs`

**Campos:**
```python
id              String(36)      PK, UUID
user_id         String(36)      FK(users.id), NULL, INDEXED
project_id      String(36)      FK(projects.id), NULL, INDEXED
action          String(100)     NOT NULL
entity_type     String(50)      NULL
entity_id       String(36)      NULL
details         JSON            NULL
ip_address      String(45)      NULL
user_agent      Text            NULL
created_at      DateTime        NOT NULL
```

**Relaciones:**
- `user` - N:1 con User
- `project` - N:1 con Project

**Acciones Registradas:**
- `user_created`, `user_updated`, `user_deleted`
- `project_created`, `project_updated`
- `task_created`, `task_updated`, `task_deleted`
- `invite_sent`, `invite_accepted`
- `permission_denied_*`

**Reglas de Negocio:**
- Solo SUPERADMIN puede ver todos los logs
- OWNER puede ver logs de su proyecto
- details es JSON con informacion adicional

---

## INDICES

### Indices Principales

**users**
- PRIMARY KEY (id)
- UNIQUE INDEX (email)

**projects**
- PRIMARY KEY (id)
- UNIQUE INDEX (owner_id)
- INDEX (status)

**memberships**
- PRIMARY KEY (id)
- UNIQUE INDEX (user_id, project_id)
- INDEX (user_id)
- INDEX (project_id)
- INDEX (status)

**tasks**
- PRIMARY KEY (id)
- INDEX (project_id)
- INDEX (assigned_to)
- INDEX (created_by)
- INDEX (status)
- INDEX (due_date)

**invites**
- PRIMARY KEY (id)
- UNIQUE INDEX (token)
- INDEX (project_id)
- INDEX (email)
- INDEX (status)

**notifications**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (project_id)
- INDEX (read)

**comments**
- PRIMARY KEY (id)
- INDEX (task_id)
- INDEX (user_id)

**audit_logs**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (project_id)
- INDEX (created_at)

---

## MIGRACIONES

### Migraciones Aplicadas

1. **Creacion inicial de tablas**
   - Todas las 8 tablas principales
   - Relaciones y foreign keys

2. **add_resend_count_to_invites.sql**
   - Agregar campo resend_count a invites

3. **fix_invite_status_enum.sql**
   - Corregir enum de estados de invites

4. **add_employee_enrichment_fields.sql**
   - Agregar campos de perfil enriquecido a users e invites

5. **add_responsibilities_field.sql**
   - Agregar campo responsibilities a users

### Como Aplicar Migraciones

```bash
cd project-management-backend

# Opcion 1: Ejecutar SQL directamente
mysql -u root -p progest_db < migrations/nombre_migracion.sql

# Opcion 2: Usar Flask-Migrate (futuro)
flask db migrate -m "Descripcion"
flask db upgrade
```

---

## REGLAS DE INTEGRIDAD

### Foreign Keys

Todas las foreign keys tienen:
- `ON DELETE CASCADE` - Eliminar en cascada
- `ON UPDATE CASCADE` - Actualizar en cascada

**Excepciones:**
- `tasks.assigned_to` - ON DELETE SET NULL (tarea queda sin asignar)
- `tasks.created_by` - ON DELETE RESTRICT (no se puede eliminar creador)

### Constraints

**UNIQUE:**
- users.email
- projects.owner_id
- memberships(user_id, project_id)
- invites.token

**NOT NULL:**
- Todos los campos obligatorios del negocio
- Foreign keys principales

**CHECK:**
- Enums validados a nivel de base de datos
- Fechas: expires_at > created_at

---

## OPTIMIZACIONES

### Queries Frecuentes Optimizadas

1. **Obtener tareas de un proyecto**
```sql
SELECT * FROM tasks WHERE project_id = ? ORDER BY due_date;
-- Optimizado con INDEX(project_id, due_date)
```

2. **Obtener tareas asignadas a un usuario**
```sql
SELECT * FROM tasks WHERE assigned_to = ? AND status != 'done';
-- Optimizado con INDEX(assigned_to, status)
```

3. **Obtener notificaciones no leidas**
```sql
SELECT * FROM notifications WHERE user_id = ? AND read = false;
-- Optimizado con INDEX(user_id, read)
```

4. **Buscar invitacion por token**
```sql
SELECT * FROM invites WHERE token = ?;
-- Optimizado con UNIQUE INDEX(token)
```

### Recomendaciones Futuras

1. **Particionamiento**
   - Particionar audit_logs por fecha
   - Particionar notifications por fecha

2. **Archivado**
   - Mover tareas completadas a tabla de archivo
   - Mover logs antiguos a tabla de archivo

3. **Indices Compuestos**
   - INDEX(project_id, status, due_date) en tasks
   - INDEX(user_id, read, created_at) en notifications

---

**Ultima actualizacion:** 24 de febrero de 2026  
**Version:** 2.0.0
