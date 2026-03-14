# Playwright Tests

Scripts E2E para crear un equipo completo (Owner + 10 empleados) con sprints, tareas, tags, checklist, cambios de estatus y comentarios.

## Docs

- Guía E2E Team: [GUIA-E2E-TEAM.md](file:///c:/Monorepo_gestion_proyectos_saas/playwright-tests/GUIA-E2E-TEAM.md)
- Especificación módulos Empleado (/work): [docs/empleado/00-README.md](file:///c:/Monorepo_gestion_proyectos_saas/playwright-tests/docs/empleado/00-README.md)

## Ejecutar (local)

Requisitos:
- Backend corriendo (por defecto `http://127.0.0.1:5000`)
- Frontend corriendo en `http://localhost:3000`

Desde el root:

```powershell
cd C:\Monorepo_gestion_proyectos_saas
npm run e2e:team -- marketing 500
```

Escenarios:
- `marketing`
- `consultora`
- `legal`
- `base`

## Headed (ver navegador)

```powershell
npm run e2e:team -- marketing 500 --headed
```

## Ejecutar contra URL externa (staging/prod)

```powershell
npm run e2e:team -- marketing 500 https://sistema-gestion-de-proyectos-dev.vercel.app --headed
```

## Sin artifacts (sin screenshots/video/trace)

```powershell
npm run e2e:team -- marketing 500 https://sistema-gestion-de-proyectos-dev.vercel.app --headed --no-artifacts
```

## Output de credenciales

Cada corrida crea:
- `playwright-tests/team-credentials.<escenario>.<timestamp>.json`
