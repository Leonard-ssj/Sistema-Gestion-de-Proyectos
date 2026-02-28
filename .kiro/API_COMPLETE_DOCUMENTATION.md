# DOCUMENTACION COMPLETA DE API - ProGest

> Documentacion de todos los endpoints de la API REST

---

## INFORMACION GENERAL

**Base URL:** `http://localhost:5000/api`  
**Formato:** JSON  
**Autenticacion:** JWT Bearer Token  
**Total Endpoints:** 43

---

## AUTENTICACION

Todos los endpoints protegidos requieren header:
```
Authorization: Bearer <access_token>
```

### Tokens

- **Access Token:** Expira en 15 minutos
- **Refresh Token:** Expira en 7 dias

---

## RESPUESTAS ESTANDAR

### Exitosa
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje descriptivo",
    "details": { ... }
  }
}
```

---

## 1. AUTH (6 ENDPOINTS)

### 1.1 POST /api/auth/register

Registrar nuevo usuario.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "OWNER"
}
```

**Response (201):**
```json
{
  "success": true,
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "OWNER",
    "status": "active"
  }
}
```

### 1.2 POST /api/auth/login

Iniciar sesion.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { ... },
  "project": { ... }
}
```

### 1.3 POST /api/auth/refresh

Renovar access token.

**Headers:** `Authorization: Bearer <refresh_token>`

**Response (200):**
```json
{
  "success": true,
  "access_token": "eyJ..."
}
```

### 1.4 POST /api/auth/logout

Cerrar sesion.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Sesion cerrada exitosamente"
}
```

### 1.5 POST /api/auth/accept-invite

Aceptar invitacion.

**Request:**
```json
{
  "token": "invite-token",
  "password": "password123",
  "name": "Employee Name"
}
```

**Response (200):**
```json
{
  "success": true,
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { ... },
  "project": { ... }
}
```

### 1.6 GET /api/auth/me

Obtener usuario actual.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "OWNER",
    "avatar": null,
    "status": "active"
  }
}
```

---

## 2. PROJECTS (2 ENDPOINTS)

### 2.1 POST /api/projects

Crear proyecto (solo OWNER).

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "name": "Mi Proyecto",
  "description": "Descripcion del proyecto",
  "category": "software"
}
```

**Response (201):**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "name": "Mi Proyecto",
    "description": "Descripcion del proyecto",
    "category": "software",
    "owner_id": "uuid",
    "status": "active",
    "created_at": "2026-02-24T10:00:00",
    "updated_at": "2026-02-24T10:00:00"
  }
}
```

### 2.2 GET /api/projects/my-project

Obtener mi proyecto.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "project": { ... }
}
```

---

## 3. TASKS (9 ENDPOINTS)

### 3.1 POST /api/tasks

Crear tarea (solo OWNER).

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "title": "Nueva tarea",
  "description": "Descripcion de la tarea",
  "priority": "high",
  "assigned_to": "user-uuid",
  "due_date": "2026-12-31T23:59:59",
  "tags": ["frontend", "urgente"]
}
```

**Response (201):**
```json
{
  "success": true,
  "task": {
    "id": "uuid",
    "project_id": "uuid",
    "title": "Nueva tarea",
    "description": "Descripcion de la tarea",
    "status": "pending",
    "priority": "high",
    "assigned_to": "user-uuid",
    "created_by": "user-uuid",
    "due_date": "2026-12-31T23:59:59",
    "tags": ["frontend", "urgente"],
    "created_at": "2026-02-24T10:00:00"
  }
}
```

### 3.2 GET /api/tasks

Listar tareas del proyecto.

**Headers:** `Authorization: Bearer <access_token>`

**Query Params:**
- `status` - Filtrar por estado
- `priority` - Filtrar por prioridad
- `assigned_to` - Filtrar por asignado

**Response (200):**
```json
{
  "success": true,
  "tasks": [ ... ],
  "total": 10
}
```

### 3.3 GET /api/tasks/:id

Obtener tarea especifica.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "task": { ... }
}
```

### 3.4 PATCH /api/tasks/:id

Actualizar tarea.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "title": "Titulo actualizado",
  "status": "in_progress",
  "priority": "urgent"
}
```

**Response (200):**
```json
{
  "success": true,
  "task": { ... }
}
```

### 3.5 DELETE /api/tasks/:id

Eliminar tarea (solo OWNER).

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Tarea eliminada exitosamente"
}
```

### 3.6 GET /api/tasks/my-tasks

Obtener mis tareas asignadas.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "tasks": [ ... ]
}
```

### 3.7 PATCH /api/tasks/:id/assign

Asignar tarea a usuario.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "assigned_to": "user-uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "task": { ... }
}
```

### 3.8 PATCH /api/tasks/:id/status

Cambiar estado de tarea.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "status": "done"
}
```

**Response (200):**
```json
{
  "success": true,
  "task": { ... }
}
```

### 3.9 GET /api/tasks/stats

Obtener estadisticas de tareas.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "total": 20,
    "by_status": {
      "pending": 5,
      "in_progress": 8,
      "blocked": 2,
      "done": 5
    },
    "by_priority": {
      "low": 3,
      "medium": 10,
      "high": 5,
      "urgent": 2
    }
  }
}
```

---

## 4. INVITES (5 ENDPOINTS)

### 4.1 POST /api/invites

Crear invitacion (solo OWNER).

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "email": "employee@example.com",
  "job_title": "Developer",
  "description": "Frontend developer",
  "shift": "morning",
  "department": "Engineering"
}
```

**Response (201):**
```json
{
  "success": true,
  "invite": {
    "id": "uuid",
    "project_id": "uuid",
    "email": "employee@example.com",
    "token": "secure-token",
    "status": "pending",
    "job_title": "Developer",
    "expires_at": "2026-03-03T10:00:00"
  }
}
```

### 4.2 GET /api/invites

Listar invitaciones del proyecto.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "invites": [ ... ]
}
```

### 4.3 DELETE /api/invites/:id

Cancelar invitacion.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Invitacion cancelada"
}
```

### 4.4 GET /api/invites/validate/:token

Validar token de invitacion.

**Response (200):**
```json
{
  "success": true,
  "invite": {
    "email": "employee@example.com",
    "project_name": "Mi Proyecto",
    "invited_by_name": "Owner Name"
  }
}
```

### 4.5 POST /api/invites/:id/resend

Reenviar invitacion.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Invitacion reenviada",
  "invite": { ... }
}
```

---

## 5. MEMBERS (3 ENDPOINTS)

### 5.1 GET /api/members

Listar miembros del proyecto.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "members": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "project_id": "uuid",
      "role": "EMPLOYEE",
      "status": "active",
      "user": {
        "id": "uuid",
        "name": "Employee Name",
        "email": "employee@example.com",
        "job_title": "Developer",
        "department": "Engineering"
      }
    }
  ]
}
```

### 5.2 PATCH /api/members/:id/deactivate

Desactivar miembro (solo OWNER).

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Miembro desactivado",
  "membership": { ... }
}
```

### 5.3 PATCH /api/members/:user_id/profile

Actualizar perfil de miembro.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "job_title": "Senior Developer",
  "description": "Full stack developer",
  "skills": "React, Node.js, Python",
  "shift": "flexible",
  "department": "Engineering",
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

## 6. NOTIFICATIONS (5 ENDPOINTS)

### 6.1 GET /api/notifications

Listar notificaciones del usuario.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "type": "task_assigned",
      "message": "Te asignaron una nueva tarea",
      "read": false,
      "entity_type": "task",
      "entity_id": "task-uuid",
      "created_at": "2026-02-24T10:00:00"
    }
  ]
}
```

### 6.2 GET /api/notifications/unread-count

Obtener contador de no leidas.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "count": 5
}
```

### 6.3 PATCH /api/notifications/:id/read

Marcar notificacion como leida.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "notification": { ... }
}
```

### 6.4 PATCH /api/notifications/read-all

Marcar todas como leidas.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leidas"
}
```

### 6.5 DELETE /api/notifications/:id

Eliminar notificacion.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Notificacion eliminada"
}
```

---

## 7. COMMENTS (4 ENDPOINTS)

### 7.1 GET /api/tasks/:task_id/comments

Listar comentarios de una tarea.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "comments": [
    {
      "id": "uuid",
      "task_id": "task-uuid",
      "user_id": "user-uuid",
      "content": "Este es un comentario",
      "created_at": "2026-02-24T10:00:00",
      "user": {
        "name": "User Name",
        "avatar": null
      }
    }
  ]
}
```

### 7.2 POST /api/tasks/:task_id/comments

Crear comentario.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "content": "Este es un nuevo comentario"
}
```

**Response (201):**
```json
{
  "success": true,
  "comment": { ... }
}
```

### 7.3 PATCH /api/tasks/:task_id/comments/:id

Actualizar comentario (solo autor).

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "content": "Comentario actualizado"
}
```

**Response (200):**
```json
{
  "success": true,
  "comment": { ... }
}
```

### 7.4 DELETE /api/tasks/:task_id/comments/:id

Eliminar comentario (solo autor o OWNER).

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Comentario eliminado"
}
```

---

## 8. ADMIN (7 ENDPOINTS)

Solo accesibles por SUPERADMIN.

### 8.1 GET /api/admin/users

Listar todos los usuarios.

**Headers:** `Authorization: Bearer <access_token>`

**Query Params:**
- `role` - Filtrar por rol
- `status` - Filtrar por estado

**Response (200):**
```json
{
  "success": true,
  "users": [ ... ],
  "total": 50
}
```

### 8.2 GET /api/admin/projects

Listar todos los proyectos.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "projects": [ ... ],
  "total": 20
}
```

### 8.3 GET /api/admin/audit-logs

Obtener logs de auditoria.

**Headers:** `Authorization: Bearer <access_token>`

**Query Params:**
- `user_id` - Filtrar por usuario
- `action` - Filtrar por accion
- `limit` - Limite de resultados

**Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "action": "task_created",
      "entity_type": "task",
      "entity_id": "task-uuid",
      "details": { ... },
      "created_at": "2026-02-24T10:00:00"
    }
  ]
}
```

### 8.4 PATCH /api/admin/users/:id/status

Cambiar estado de usuario.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "status": "disabled"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

### 8.5 PATCH /api/admin/projects/:id/status

Cambiar estado de proyecto.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "status": "disabled"
}
```

**Response (200):**
```json
{
  "success": true,
  "project": { ... }
}
```

### 8.6 GET /api/admin/stats

Obtener estadisticas globales.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "total_users": 100,
    "total_projects": 25,
    "total_tasks": 500,
    "users_by_role": {
      "OWNER": 25,
      "EMPLOYEE": 74,
      "SUPERADMIN": 1
    }
  }
}
```

### 8.7 GET /api/admin/health

Health check del sistema.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-02-24T10:00:00"
}
```

---

## CODIGOS DE ERROR

### 400 Bad Request
- `VALIDATION_ERROR` - Datos invalidos
- `MISSING_FIELD` - Campo requerido faltante

### 401 Unauthorized
- `TOKEN_EXPIRED` - Token expirado
- `INVALID_TOKEN` - Token invalido
- `MISSING_TOKEN` - Token no proporcionado
- `AUTHENTICATION_ERROR` - Credenciales incorrectas

### 403 Forbidden
- `FORBIDDEN` - Sin permisos para la accion
- `NO_PROJECT` - Usuario sin proyecto asignado

### 404 Not Found
- `NOT_FOUND` - Recurso no encontrado

### 409 Conflict
- `ALREADY_EXISTS` - Recurso ya existe
- `DUPLICATE_EMAIL` - Email ya registrado

### 500 Internal Server Error
- `INTERNAL_ERROR` - Error interno del servidor

---

**Ultima actualizacion:** 24 de febrero de 2026  
**Version:** 2.0.0
