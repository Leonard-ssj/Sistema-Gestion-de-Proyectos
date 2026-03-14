# Módulo Empleado: Timeline (`/work/timeline`)

## Objetivo

Vista cronológica (tipo Gantt simple) para visualizar las tareas del empleado con:
- `start_date` (inicio)
- `due_date` (vencimiento)

## UX / Reglas

- Solo tareas asignadas al empleado.
- Si no hay `start_date`, mostrar estado vacío (“No tienes tareas con fecha de inicio.”).
- Filtros mínimos:
  - Buscar por título/descripcion.
  - Mostrar solo tareas con fecha de inicio vs todas (toggle opcional).

## Componentes / Archivos (frontend)

Página actual:
- [work/timeline/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/work/timeline/page.tsx)

Referencia (Owner):
- [app/timeline/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/app/timeline/page.tsx)

Servicios a usar:
- [taskService.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/services/taskService.ts)
  - `fetchMyTasks()`

## Endpoints / Backend

Ya existe:
- `GET /api/tasks/my-tasks`

Recomendación:
- No crear endpoint nuevo; filtrar por `start_date` en frontend.
- Si el volumen crece, agregar server-side filtering/paginación.

## Lógica a implementar / completar

1) Data
- Cargar `fetchMyTasks()` y quedarse con tareas con `start_date`.
- Ordenar por inicio ascendente.

2) Render
- Reusar el mismo componente visual del timeline del Owner si aplica.
- Links a detalle `/work/my-tasks/<id>`.

3) Estados
- Loading skeleton
- Empty state
- Error state con retry

## Pruebas

Manual:
1) Login empleado.
2) Verificar que al menos una tarea tenga inicio (si no, el Owner debe crear tareas con start_date).
3) Confirmar que las barras/elementos corresponden a las fechas.

