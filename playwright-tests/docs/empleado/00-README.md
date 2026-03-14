# Módulos de Empleado (/work)

Esta carpeta define las indicaciones para implementar y/o completar los módulos de **Empleado** en ProGest.

## Alcance actual (MVP)

Rutas base del empleado:
- `/work/my-tasks` (Mis Tareas)
- `/work/board` (Board)
- `/work/timeline` (Timeline)
- `/work/profile` (Perfil)

Nota: Notificaciones existen como ruta (`/work/notifications`) pero todavía no están en el nav del empleado. Se documentará después.

## Layout / UI compartida

El layout de Owner y Empleado usa el mismo contenedor:
- Frontend: [private-layout.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/components/layout/private-layout.tsx)
- Sidebar (nav por rol): [app-sidebar.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/components/layout/app-sidebar.tsx)
- Header: [topbar.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/components/layout/topbar.tsx)

El objetivo es que el empleado tenga la misma experiencia base (sidebar + topbar) pero con permisos y acciones limitadas.

## Backend (permisos y endpoints)

Los permisos de empleado están definidos aquí:
- Backend: [permissions.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/config/permissions.py)

Endpoints clave ya existentes:
- `GET /api/tasks/my-tasks` (solo EMPLOYEE) — [tasks.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/tasks.py)
- `PATCH /api/tasks/<id>/status` (cambiar estatus) — [tasks.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/tasks.py)
- Comentarios de tarea — [comments.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/comments.py)
- Notificaciones — [notifications.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/notifications.py)

## Documentos por módulo

- Mis Tareas: [01-my-tasks.md](file:///c:/Monorepo_gestion_proyectos_saas/playwright-tests/docs/empleado/01-my-tasks.md)
- Board: [02-board.md](file:///c:/Monorepo_gestion_proyectos_saas/playwright-tests/docs/empleado/02-board.md)
- Timeline: [03-timeline.md](file:///c:/Monorepo_gestion_proyectos_saas/playwright-tests/docs/empleado/03-timeline.md)
- Perfil: [04-profile.md](file:///c:/Monorepo_gestion_proyectos_saas/playwright-tests/docs/empleado/04-profile.md)

## Cómo probar (rápido)

1) Genera un equipo con el script E2E:
- [GUIA-E2E-TEAM.md](file:///c:/Monorepo_gestion_proyectos_saas/playwright-tests/GUIA-E2E-TEAM.md)

2) Usa el JSON de credenciales generado en `playwright-tests/` para iniciar sesión como empleado.

3) Valida que:
- El empleado solo vea tareas asignadas.
- El empleado pueda cambiar estatus de sus tareas.
- El empleado pueda comentar en sus tareas.
- El header (Topbar) y sidebar funcionen igual que en Owner.

