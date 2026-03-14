# Módulo Empleado: Mis Tareas (`/work/my-tasks`)

## Responsable del módulo

La persona a cargo de este módulo debe implementar:
- La lógica de listado/filtrado/búsqueda.
- La navegación a detalle.
- La integración con endpoints.
- Manejo de permisos/errores.

La UI puede ya existir; el foco es la **lógica y conexión**.

## Nota sobre el estado actual del frontend

Actualmente estas pantallas se apoyan en `useDataStore` (datos mock) y deben migrarse a datos del backend.
No tomar como “conectado” el comportamiento actual.

## Objetivo

Pantalla principal del empleado para ver y operar **solo** sus tareas asignadas:
- Listar tareas asignadas al usuario autenticado.
- Filtrar por estatus.
- Buscar por título/descripcion.
- Acceder al detalle de tarea.

## UX / Reglas

- El empleado **no** puede crear tareas, editar título/descripcion, sprint, tags ni checklist global del proyecto.
- El empleado **sí** puede:
  - Cambiar estatus de **sus** tareas asignadas.
  - Agregar / editar / eliminar **sus** comentarios (en el detalle).

Validaciones:
- Búsqueda: 0–120 chars.
- El filtro de estatus debe incluir: `Pendiente`, `En Progreso`, `En Revisión`, `Bloqueada`, `Hecha`.

## Endpoints a usar (Backend)

Tareas del empleado:
- `GET /api/tasks/my-tasks`
  - Query params recomendados (si se implementan): `status`, `search`, `sort_by`, `sort_order`, `include_old_done`.
- `GET /api/tasks/<task_id>` (para detalle; debe validar acceso)
- `PATCH /api/tasks/<task_id>/status` (solo puede actualizar tareas asignadas a él)

Comentarios:
- `GET /api/comments/<task_id>/comments`
- `POST /api/comments/<task_id>/comments`
- `PATCH /api/comments/<task_id>/comments/<comment_id>`
- `DELETE /api/comments/<task_id>/comments/<comment_id>`

Archivos backend relevantes:
- [tasks.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/tasks.py)
- [comments.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/comments.py)
- [permissions.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/config/permissions.py)

## Frontend (qué debe tocar)

Rutas de UI:
- [work/my-tasks/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/work/my-tasks/page.tsx)
- [work/my-tasks/[id]/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/work/my-tasks/%5Bid%5D/page.tsx)

Servicios existentes a reutilizar:
- [taskService.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/services/taskService.ts)
- [commentService.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/services/commentService.ts)

Estado:
- Reusar `useDataStore` si ya está en el patrón del proyecto, pero asegurando que el dataset del empleado proviene de `fetchMyTasks()`.

## Lista de tareas (actividades)

1) Listado
- Implementar `fetchMyTasks()` al entrar y en cada refresh.
- States: loading / empty / error (retry).
 
Criterio de aceptación:
- Al recargar (F5) la lista debe seguir mostrando tareas, sin depender de datos mock.

2) Filtros y búsqueda
- UI: Select de estatus + input search.
- Lógica: filtro client-side o server-side (preferible server-side si el endpoint acepta query params).

3) Navegación a detalle
- Link a `/work/my-tasks/<id>`.
- Bloquear acceso (mostrar error) si backend responde 404 por falta de permisos.

## Cómo probar

Manual:
1) Correr el E2E team.
2) Loguearte con un empleado.
3) Entrar a `/work/my-tasks` y ver tareas asignadas.
4) Abrir una tarea y agregar comentario.
5) Recargar (F5) en `/work/my-tasks` y confirmar que las tareas siguen.

Automatizable (Playwright):
- Login empleado → validar lista → abrir detalle → comentar.
