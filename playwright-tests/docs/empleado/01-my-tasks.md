# Módulo Empleado: Mis Tareas (`/work/my-tasks`)

## Objetivo

Pantalla principal del empleado para ver y operar **solo** sus tareas asignadas:
- Listar tareas asignadas al usuario autenticado.
- Filtrar por estatus.
- Buscar por título/descripcion.
- Acceder al detalle de tarea.

## UX / Reglas

- El empleado **no** puede crear tareas, editar título, descripción, sprint, tags, checklist global del proyecto.
- El empleado **sí** puede:
  - Cambiar estatus de **sus** tareas asignadas.
  - Agregar / editar / eliminar **sus** comentarios.
  - Marcar checklist (si se decide habilitar para empleado; definir en permisos).

Validaciones:
- Búsqueda: 0–120 chars.
- El filtro de estatus debe incluir: `Pendiente`, `En Progreso`, `En Revisión`, `Bloqueada`, `Hecha`.

## Componentes / Archivos (frontend)

Página actual:
- [my-tasks/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/work/my-tasks/page.tsx)

Detalle actual (empleado):
- [my-tasks/[id]/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/work/my-tasks/%5Bid%5D/page.tsx)

Layout compartido (sidebar + header):
- [work/layout.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/work/layout.tsx)
- [private-layout.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/components/layout/private-layout.tsx)
- [app-sidebar.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/components/layout/app-sidebar.tsx)
- [topbar.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/components/layout/topbar.tsx)

Servicios ya existentes para usar:
- [taskService.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/services/taskService.ts)
  - `fetchMyTasks()`
  - `updateTaskStatus(taskId, status)`
  - `getTask(taskId)`

State recomendado:
- Reusar `useDataStore` para cache de tareas (ya lo usa Owner), pero poblarlo desde `fetchMyTasks()` al entrar en `/work/*`.

## Endpoints / Backend

Ya existen:
- `GET /api/tasks/my-tasks` (role: EMPLOYEE)
- `GET /api/tasks/<id>` (validar que sea tarea del proyecto y que el empleado tenga acceso)
- `PATCH /api/tasks/<id>/status` (role: OWNER/EMPLOYEE; en employee debe validar `assigned_to == current_user`)

Archivos backend:
- [tasks.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/tasks.py)
- [permissions.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/config/permissions.py)

## Lógica a implementar / completar

1) Carga inicial
- En `/work/my-tasks`, llamar `fetchMyTasks()` y poblar lista.
- Manejar estados: loading, empty, error con retry.

2) Filtros
- Filtro por estatus en frontend (sin requerir nuevo endpoint).
- Búsqueda por título/descripcion en frontend (con debounce opcional).

3) Acciones
- Cambio de estatus:
  - UI: select por estatus (mismo set que Owner).
  - Lógica: `updateTaskStatus(taskId, newStatus)`.
  - Optimistic update + rollback si falla.
  - Mensajes de error con `toast`.

4) Acceso a detalle
- Link a `/work/my-tasks/<id>`.
- El detalle debe cargar desde backend (no desde mocks).

## Pruebas

Manual:
1) Correr script E2E de equipo.
2) Loguearte con un empleado.
3) Confirmar que en Mis Tareas aparecen tareas asignadas.
4) Cambiar estatus a “En Revisión” y validar que aparece en board.

Automatizable (Playwright):
- Login como empleado y validar:
  - Lista no vacía.
  - Cambia estatus de una tarea.
  - Entra al detalle y agrega comentario.

