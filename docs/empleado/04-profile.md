# Módulo Empleado: Perfil (`/work/profile`)

## Responsable del módulo

La persona a cargo de este módulo debe implementar:
- Validaciones de formulario.
- Guardado de nombre/avatar.
- Actualización de sesión en frontend.
- Verificar consistencia del avatar en UI (header, comentarios, etc.).

La UI puede ya existir; el foco es la **lógica y conexión**.

## Nota sobre el estado actual del frontend

Actualmente esta pantalla se muestra, pero el guardado está marcado como pendiente: falta conectar `PATCH /api/auth/me` y refrescar `useAuthStore`.
No tomar como “completo” el comportamiento actual hasta agregar conexión y pruebas.

## Objetivo

Pantalla para que el empleado administre su perfil:
- Ver nombre y email (email no editable).
- Actualizar nombre (si se permite).
- Seleccionar avatar.

## UX / Reglas

- Email siempre disabled.
- Nombre:
  - Min: 3 chars
  - Max: 60 chars
- Avatar:
  - Mostrar catálogo.
  - Guardar y reflejar inmediatamente en topbar y vistas.

## Endpoints a usar (Backend)

- `GET /api/auth/me`
- `PATCH /api/auth/me` (campos esperados: `name`, `avatar`)

Backend:
- [auth.py](file:///c:/Monorepo_gestion_proyectos_saas/project-management-backend/app/routes/auth.py)

## Frontend (qué debe tocar)

Ruta UI:
- [work/profile/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/work/profile/page.tsx)

Referencia Owner:
- [app/profile/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/app/profile/page.tsx)

Servicios:
- [authService.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/services/authService.ts)

Store:
- [authStore.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/stores/authStore.ts)

## Lista de tareas (actividades)

1) Carga
- Tomar datos de `session.user`.
- Preseleccionar avatar actual.

2) Validación
- Validar nombre antes de llamar API.
- Mostrar errores en el form.

3) Guardado
- Llamar a `PATCH /api/auth/me`.
- En success:
  - Actualizar `useAuthStore` para que topbar cambie.
  - `toast` de confirmación.
  - Confirmar que al recargar (F5) el avatar permanece (por hydrate + getMe).

4) Consistencia avatar
- Asegurar que vistas usen `normalizeAvatarUrl(...)` donde corresponda.

## Cómo probar

Manual:
1) Login empleado.
2) Cambiar avatar y guardar.
3) Confirmar que topbar refleja el nuevo avatar.
4) Recargar (F5) y confirmar que el avatar/nombre siguen actualizados.
