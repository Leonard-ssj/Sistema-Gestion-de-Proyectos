# Módulo Empleado: Perfil (`/work/profile`)

## Objetivo

Pantalla para que el empleado administre su perfil:
- Ver nombre y email (email no editable).
- Actualizar nombre (si el producto lo permite).
- Seleccionar avatar.

## UX / Reglas

- Email siempre disabled.
- Nombre:
  - Min: 3 chars
  - Max: 60 chars
  - Sin caracteres raros (definir regex)
- Avatar:
  - Mostrar catálogo de avatares (p.ej. Dicebear).
  - Al guardar, el avatar se refleja inmediatamente en:
    - Topbar
    - Board del empleado
    - Comentarios

## Componentes / Archivos (frontend)

Página actual:
- [work/profile/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/work/profile/page.tsx)

Referencias (Owner):
- [app/profile/page.tsx](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/app/app/profile/page.tsx)

Servicios:
- Auth / perfil:
  - [authService.ts](file:///c:/Monorepo_gestion_proyectos_saas/project-management-frontend/services/authService.ts)
  - `updateMeService(...)` (si existe) o endpoint equivalente.

State:
- `useAuthStore` debe actualizar `session.user` tras guardar.

## Endpoints / Backend

Requeridos:
- `GET /api/auth/me` (o equivalente) para cargar sesión.
- `PATCH /api/auth/me` (o equivalente) para actualizar nombre/avatar.

Notas de seguridad:
- El empleado solo puede actualizar su propio perfil.

## Lógica a implementar / completar

1) Carga
- Tomar datos desde `useAuthStore().session`.
- Preseleccionar avatar actual.

2) Guardado
- Validar nombre.
- Enviar update a backend.
- En success:
  - Actualizar `useAuthStore` (para que topbar cambie).
  - Mostrar `toast`.

3) Consistencia de avatar
- Asegurar que todas las vistas usen `normalizeAvatarUrl(...)`.

## Pruebas

Manual:
1) Login empleado.
2) Cambiar avatar y guardar.
3) Verificar que topbar muestra el avatar nuevo.

