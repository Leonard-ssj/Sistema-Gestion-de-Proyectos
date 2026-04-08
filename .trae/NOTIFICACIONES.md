# Notificaciones In‑App (Owner + Empleado)

Este documento describe cómo funcionan las notificaciones dentro de ProGest (solo in‑app), qué eventos las generan, cómo se muestran en el frontend (campana + página), y cómo se almacenan en base de datos (persistencia).

## Alcance

- In‑app únicamente (sin email/SMS).
- Multi‑tenant: scoping por `project_id` (proyecto activo).
- Compatible con dark/light theme (tokens de shadcn/ui).

## Qué ve el usuario

### 1) Campana (preview)

En el header hay un icono de campana con un badge:
- El badge muestra el número de notificaciones no leídas.
- Al hacer click, se abre un preview (dropdown) con las más recientes.
- Acciones:
  - “Marcar todas leídas”
  - “Ver todas”

### 2) Página de notificaciones

Ruta:
- Owner: `/app/notifications`
- Employee: `/work/notifications`

La página lista notificaciones del usuario actual:
- Orden descendente por fecha.
- Estado visual distinto si está no leída.
- Acciones:
  - Marcar como leída (individual)
  - Marcar todas leídas
  - Eliminar
  - Navegar al recurso relacionado (tarea, equipo, etc.)

## Persistencia y multi‑tenant

Todas las notificaciones se guardan en la tabla `notifications` y tienen:
- `user_id` (destinatario)
- `project_id` (tenant)
- `type` (tipo de evento)
- `message` (texto)
- `read` (leída/no leída)
- `entity_type` + `entity_id` (referencia al recurso)
- timestamps

Para evitar mezclar proyectos:
- El backend debe filtrar notificaciones por `project_id` del proyecto activo del usuario (o por un `project_id` explícito validado).

## Tipos de notificación (MVP)

- `task_assigned`: “Te han asignado la tarea …”
- `task_updated`: “X actualizó …”
- `status_change`: “X cambió el estado de … a …”
- `comment`: “X comentó en la tarea …”
- `invite_accepted`: “X aceptó tu invitación”
- `member_deactivated`: “Tu acceso fue desactivado …”
- `member_reactivated`: “Tu acceso fue reactivado …”

Tipos futuros (no MVP):
- `mention`
- `task_due_soon` / `task_overdue`
- preferencias por usuario
- notificaciones por email

## Eventos que generan notificaciones (por página)

### Owner → Employee

#### `/app/tasks`

- Owner asigna una tarea a un empleado → `task_assigned` al empleado.
- Owner reasigna una tarea a otro empleado → `task_assigned` al nuevo empleado (y opcional `task_unassigned` al anterior).
- Owner cambia estatus de una tarea asignada → `status_change` al empleado asignado.
- Owner edita una tarea asignada (cualquier campo) → `task_updated` al empleado asignado.
- Owner comenta en una tarea asignada → `comment` al empleado asignado.
- Owner cambia fechas de una tarea asignada → notificación opcional (futuro).

#### `/app/board`

- Drag & drop = cambio de estatus → `status_change` al empleado asignado.

#### `/app/timeline` y `/app/calendar`

- Cambios de fechas en tareas asignadas → notificación opcional (futuro).

#### `/app/team`

- Invitación aceptada → `invite_accepted` al owner.
- Owner desactiva empleado → `member_deactivated` al empleado.
- Owner reactiva empleado → `member_reactivated` al empleado.

### Employee → Owner

#### `/work/my-tasks` y `/work/board`

- Empleado cambia estatus de su tarea → `status_change` al owner.
- Empleado edita una tarea → `task_updated` al owner.
- Empleado comenta en una tarea → `comment` al owner.

#### `/work/timeline`

- Solo lectura (MVP), no genera eventos.

## Backend: API de notificaciones

Endpoints:
- `GET /api/notifications?unread_only=true|false&limit=N&offset=M`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/<id>/read`
- `PATCH /api/notifications/read-all`
- `DELETE /api/notifications/<id>`
- `GET /api/notifications/stream?token=<access_token>` (SSE)

Notas:
- `limit/offset` se usa para paginación y preview en campana.
- El response debe mantenerse en el formato estándar `{ success, data, error }`.
- SSE se usa para “tiempo real” (sin recargar). El payload del evento incluye `notification` con `entity_type/entity_id`.

## Backend: creación de notificaciones (eventos)

### 1) Comentarios (ya implementado)

Al crear comentario:
- Si comenta Owner y existe asignado → notificar asignado.
- Si comenta asignado → notificar creador (normalmente Owner).

### 2) Cambio de estatus

Al cambiar estatus:
- Si Owner cambia estatus de una tarea asignada → notificar asignado.
- Si Employee cambia estatus de su tarea → notificar Owner del proyecto.

### 3) Asignación de tareas

Al asignar tarea:
- Owner asigna a employee → notificar employee.

## Frontend: integración y UI (theme)

Reglas de estilo:
- No usar colores hardcode; usar tokens:
  - `bg-background`, `bg-muted`, `text-muted-foreground`, `border-border`
- No leída:
  - `bg-primary/5` + `border-primary/30`

Iconos (por tipo):
- `task_assigned`: Bell
- `comment`: MessageSquare
- `status_change`: ArrowRightLeft
- `task_updated`: Bell
- `invite_accepted`: UserPlus

### Tiempo real y sonido

- El frontend se conecta por SSE cuando hay sesión y actualiza:
  - contador (badge campana)
  - preview del dropdown
  - páginas `/app/notifications` y `/work/notifications` (si están cargadas)
  - badges del nav por sección
- El sonido se controla por preferencia del usuario:
  - Owner: `/app/settings` → switch “Sonido”
  - Employee: `/work/profile` → switch “Sonido de notificaciones”
- Por políticas del navegador, el audio se habilita tras una interacción del usuario (por ejemplo, abrir la campana o togglear el switch).

## Checklist de aceptación (MVP)

- Owner asigna tarea → Employee ve notificación (badge + página).
- Employee cambia estatus → Owner ve notificación.
- Owner comenta → Employee ve notificación.
- Employee comenta → Owner ve notificación.
- Campana muestra preview y contador real.
- Marcar leída y marcar todas leídas funciona y persiste en DB.
- El listado no mezcla proyectos (scoping por `project_id`).
