## E2E Team Scenarios (Playwright)

Este flujo crea un proyecto completo con:
- 1 owner + 10 empleados (por invitación)
- 4 sprints
- 15 tareas con tags y checklist
- Cambios de estatus (incluye “En Revisión”) y comentarios

Al finalizar, guarda credenciales en un JSON dentro de `playwright-tests/`.

### Requisitos (local)

- Backend corriendo (por defecto en `http://127.0.0.1:5000`)
- Frontend corriendo en `http://localhost:3000`

Ejemplo:

```powershell
cd C:\Monorepo_gestion_proyectos_saas\project-management-backend
python app.py
```

```powershell
cd C:\Monorepo_gestion_proyectos_saas\project-management-frontend
npm run dev
```

### Ejecutar escenarios (local)

Desde el root:

```powershell
cd C:\Monorepo_gestion_proyectos_saas
npm run e2e:team -- marketing 500
```

Escenarios disponibles:
- `marketing`
- `consultora`
- `legal`
- `base`

Ejemplos:

```powershell
npm run e2e:team -- consultora 500
npm run e2e:team -- legal 500
npm run e2e:team -- base 500
```

### Ejecutar con navegador visible (headed)

```powershell
npm run e2e:team -- marketing 500 -- --headed
```

### Ejecutar contra una URL externa (staging/prod)

Puedes pasar la URL como argumento extra:

```powershell
npm run e2e:team -- marketing 500 https://sistema-gestion-de-proyectos-dev.vercel.app
```

O como flag:

```powershell
npm run e2e:team -- marketing 500 -- --base-url=https://sistema-gestion-de-proyectos-dev.vercel.app
```

Notas:
- En URL externa no se depende del clipboard para invitaciones; el script intenta leer el token desde la respuesta del API.
- Si tu despliegue tiene protecciones (CORS, rate limit, captchas), la prueba puede fallar.

### Output de credenciales

Cada corrida guarda un archivo:

`playwright-tests/team-credentials.<escenario>.<timestamp>.json`

Incluye:
- owner (email/password)
- empleados (email/password)
- baseUrl

