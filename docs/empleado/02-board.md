# Módulo Empleado: Board (`/work/board`)

## Responsable del módulo

La persona a cargo de este módulo debe implementar:
- Render de columnas por estatus.
- Drag & drop (o alternativa) para cambio de estatus.
- Integración con endpoints.
- Manejo de permisos/errores.

La UI puede ya existir; el foco es la **lógica y conexión**.

## Nota sobre el estado actual del frontend

Actualmente estas pantallas se apoyan en `useDataStore` (datos mock) y deben migrarse a datos del backend.
No tomar como “conectado” el comportamiento actual.

## Objetivo

Kanban del empleado para gestionar **solo sus tareas asignadas** mediante columnas por estatus.

Columnas (MVP):
- Pendiente
- En Progreso
- En Revisión
- Bloqueada
- Hecha

## UX / Reglas

- El empleado ve únicamente tareas `assigned_to == current_user`.
- Cambiar estatus debe persistir en backend.
- No debe existir acción “Crear tarea” ni edición de datos del proyecto.

Validaciones:
- No permitir drop/update si el backend rechaza permisos.
- Si el backend responde error, revertir el movimiento y mostrar `toast`.

## Endpoints a usar (Backend)

- `GET /api/tasks/my-tasks` (dataset base)
- `PATCH /api/tasks/<task_id>/status` (persistir cambio)

Archivos backend:
- [tasks.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/tasks.py)

## Frontend (qué debe tocar)

Ruta de UI:
- [work/board/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/work/board/page.tsx)

Referencias (Owner para UI/UX):
- [app/board/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/app/board/page.tsx)

Constantes:
- [constants.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/lib/constants.ts)

Servicios a reutilizar:
- [taskService.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/services/taskService.ts)

## Lista de tareas (actividades)

1) Carga inicial
- Consumir `fetchMyTasks()` y separar por estatus (también en refresh).
- States: loading / empty / error.
 
Criterio de aceptación:
- Al recargar (F5) en `/work/board` el board debe seguir mostrando tareas.

2) Cambio de estatus
- Implementar drag & drop (ideal) o action menu (fallback).
- Usar `updateTaskStatus(taskId, newStatus)`.
- Optimistic update + rollback si falla.

3) Acceso a detalle
- Link a detalle (recomendado): `/work/my-tasks/<id>`.

## Cómo probar

Manual:
1) Login empleado.
2) Ir a `/work/board`.
3) Cambiar estatus de una tarea.
4) Refrescar y confirmar persistencia.
5) Recargar (F5) y confirmar que la tarea sigue apareciendo.
