# Módulos de Empleado (/work)

Esta carpeta define las indicaciones para implementar y/o completar los módulos de **Empleado** en ProGest.

Importante:
- La **UI actual** en `/work/*` puede existir parcial o completa, pero **no es requisito conectarla todavía**.
- El objetivo inmediato es que cada compañero implemente su módulo con la lógica correcta y usando los endpoints definidos.

## Estado actual observado (bug/pendiente)

En los módulos de empleado (`/work/*`) puede ocurrir que:
- Se ven tareas asignadas al navegar dentro de la app.
- Pero al recargar (F5) desaparecen y quedan vacías.

Criterio de aceptación transversal:
- En `/work/my-tasks`, `/work/board` y `/work/timeline` las tareas deben cargarse desde backend en cada entrada/refresh.

Causa probable:
- `useDataStore` inicia con datos mock (`mock/seed`) y algunas pantallas dependen de ese estado en vez de disparar `fetchMyTasks()` en `useEffect` al montar.
- [dataStore.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/stores/dataStore.ts)

Estado actual del proyecto (para evitar confusión durante desarrollo):
- El store de datos (`useDataStore`) se resetea al iniciar sesión/cambiar usuario, para que `/work/*` no muestre tareas “prestadas” desde flujos del owner.
- Esto refuerza que los módulos de empleado se deben conectar de forma explícita con los endpoints listados.

Acción requerida (por el responsable de cada módulo):
- En cada página `/work/*`, disparar `fetchMyTasks()` al montar (después de `hydrate()`), y renderizar desde ese resultado (local state o store dedicado a backend).

## Alcance (MVP)

Rutas base del empleado:
- `/work/my-tasks` (Mis Tareas)
- `/work/board` (Board)
- `/work/timeline` (Timeline)
- `/work/profile` (Perfil)

Nota: Notificaciones existen como ruta (`/work/notifications`) pero todavía no están en el nav del empleado. Se verá después.

## Layout / UI compartida (misma experiencia que Owner)

El layout de Owner y Empleado usa el mismo contenedor:
- Frontend: [private-layout.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/components/layout/private-layout.tsx)
- Sidebar (nav por rol): [app-sidebar.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/components/layout/app-sidebar.tsx)
- Header: [topbar.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/components/layout/topbar.tsx)

Objetivo:
- Header y sidebar se ven igual, pero el **nav** y **permisos** cambian por rol.

## Backend (permisos y endpoints)

Permisos:
- Backend: [permissions.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/config/permissions.py)

Endpoints que consumirá el empleado (MVP):
- Tareas asignadas:
  - `GET /api/tasks/my-tasks` (solo EMPLOYEE) — [tasks.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/tasks.py)
  - `GET /api/tasks/<id>` (detalle; EMPLOYEE solo si assigned_to == current_user)
  - `PATCH /api/tasks/<id>/status` (cambiar estatus; EMPLOYEE solo sus tareas)
- Comentarios:
  - `GET /api/comments/<task_id>/comments`
  - `POST /api/comments/<task_id>/comments`
  - `PATCH /api/comments/<task_id>/comments/<comment_id>`
  - `DELETE /api/comments/<task_id>/comments/<comment_id>`
- Perfil:
  - `GET /api/auth/me`
  - `PATCH /api/auth/me`

## Documentos por módulo

- Mis Tareas: [01-my-tasks.md](file:///c:/Monorepo_gestion_proyectos_saas/docs/empleado/01-my-tasks.md)
- Board: [02-board.md](file:///c:/Monorepo_gestion_proyectos_saas/docs/empleado/02-board.md)
- Timeline: [03-timeline.md](file:///c:/Monorepo_gestion_proyectos_saas/docs/empleado/03-timeline.md)
- Perfil: [04-profile.md](file:///c:/Monorepo_gestion_proyectos_saas/docs/empleado/04-profile.md)

## Cómo probar (rápido)

1) Genera un equipo con el script E2E:
- [GUIA-E2E-TEAM.md](file:///c:/Monorepo_gestion_proyectos_saas/playwright-tests/GUIA-E2E-TEAM.md)

2) Usa el JSON de credenciales generado en `playwright-tests/` para iniciar sesión como empleado.

3) Validaciones mínimas:
- El empleado solo ve tareas asignadas.
- El empleado puede cambiar estatus de sus tareas.
- El empleado puede comentar en sus tareas.
- El header (Topbar) y sidebar funcionan igual que en Owner.

## Pruebas E2E requeridas (por el equipo)

Cada módulo debe aportar al menos 1 prueba Playwright y agregarla a la ejecución:
- Crear spec por módulo bajo `playwright-tests/employee/` (carpeta sugerida):
  - `playwright-tests/employee/my-tasks.spec.ts`
  - `playwright-tests/employee/board.spec.ts`
  - `playwright-tests/employee/timeline.spec.ts`
  - `playwright-tests/employee/profile.spec.ts`

Fuente de credenciales:
- Usar el archivo generado `playwright-tests/team-credentials.<scenario>.<timestamp>.json` o una variable de entorno que apunte a ese path.
