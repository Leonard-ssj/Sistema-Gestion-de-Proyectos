# Módulo Empleado: Board (`/work/board`)

## Objetivo

Kanban del empleado para gestionar **solo sus tareas asignadas** mediante columnas por estatus.

Columnas:
- Pendiente
- En Progreso
- En Revisión
- Bloqueada
- Hecha

## UX / Reglas

- El empleado ve únicamente tareas `assigned_to == current_user`.
- Drag & drop entre columnas cambia estatus (siempre y cuando la tarea sea del empleado).
- No debe existir acción “Crear tarea”.
- El conteo por columna siempre se calcula sobre tareas del empleado.

Validaciones:
- No permitir drop si el usuario no tiene permiso.
- Si el backend responde error, revertir el movimiento y mostrar `toast`.

## Componentes / Archivos (frontend)

Página actual:
- [work/board/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/work/board/page.tsx)

Referencias (Owner):
- [app/board/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/app/board/page.tsx)

Constantes de status/labels:
- [constants.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/lib/constants.ts)

Servicios a usar:
- [taskService.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/services/taskService.ts)
  - `fetchMyTasks()`
  - `updateTaskStatus(taskId, status)`

Recomendación:
- Reusar el mismo comportamiento de drag & drop del Board de Owner, pero con dataset `myTasks`.

## Endpoints / Backend

Ya existen:
- `GET /api/tasks/my-tasks`
- `PATCH /api/tasks/<id>/status`

Backend:
- [tasks.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/tasks.py)

## Lógica a implementar / completar

1) Carga inicial
- En `/work/board`, cargar `fetchMyTasks()` (o usar cache si ya se cargó).
- Separar tareas por estatus y renderizar columnas.

2) Drag & drop
- En `onDrop` ejecutar `updateTaskStatus`.
- Optimistic update:
  - Cambiar estatus en UI inmediatamente.
  - Si falla, regresar a estado anterior.

3) Acceso a detalle
- Link a `/work/my-tasks/<id>` (o un detalle dedicado `/work/tasks/<id>` si se decide).

## Pruebas

Manual:
1) Login empleado.
2) Ir a Board.
3) Arrastrar tarea de “Pendiente” a “En Progreso”.
4) Refrescar y verificar persistencia.

Automatizable (Playwright):
- Localizar una card draggable y moverla.
- Validar que el contador de columna cambió.

