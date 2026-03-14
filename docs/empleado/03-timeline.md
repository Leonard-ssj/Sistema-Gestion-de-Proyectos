# Módulo Empleado: Timeline (`/work/timeline`)

## Responsable del módulo

La persona a cargo de este módulo debe implementar:
- Carga de tareas del empleado con fechas.
- Render cronológico (timeline).
- Integración con endpoints.
- Manejo de estados (loading/empty/error).

La UI puede ya existir; el foco es la **lógica y conexión**.

## Nota sobre el estado actual del frontend

Actualmente estas pantallas se apoyan en `useDataStore` (datos mock) y deben migrarse a datos del backend.
No tomar como “conectado” el comportamiento actual.

## Objetivo

Vista cronológica para visualizar tareas del empleado con:
- `start_date` (inicio)
- `due_date` (vencimiento)

## UX / Reglas

- Solo tareas asignadas al empleado.
- Si no hay `start_date`, mostrar estado vacío.
- No hay edición de fechas por empleado (MVP).

## Endpoints a usar (Backend)

- `GET /api/tasks/my-tasks`
  - Filtrar por `start_date` en frontend (MVP).

Backend:
- [tasks.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/tasks.py)

## Frontend (qué debe tocar)

Ruta de UI:
- [work/timeline/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/work/timeline/page.tsx)

Referencia Owner:
- [app/timeline/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/app/timeline/page.tsx)

Servicio:
- [taskService.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/services/taskService.ts)

## Lista de tareas (actividades)

1) Data
- Consumir `fetchMyTasks()` (también en refresh).
- Filtrar tareas con `start_date`.
- Ordenar por `start_date` ascendente.
 
Criterio de aceptación:
- Al recargar (F5) en `/work/timeline` la información debe mantenerse (vía refetch), sin depender de datos mock.

2) Render
- Reusar patrón visual del timeline del Owner si aplica.
- Links a detalle `/work/my-tasks/<id>`.

3) Estados
- Loading skeleton
- Empty state
- Error state con retry

## Cómo probar

Manual:
1) Login empleado.
2) Ir a `/work/timeline`.
3) Verificar tareas con fechas de inicio/vencimiento (si no hay, crear tareas con start_date desde Owner).
4) Recargar (F5) y confirmar que el timeline se vuelve a poblar.
