# Script de Creacion de Equipo

Script automatizado para crear un equipo completo en ProGest con datos realistas de consultoria financiera.

## Que crea

- 1 Owner (Carlos Mendez)
- 1 Proyecto (Auditoria Financiera Q1 2024)
- 3 Empleados (Ana Rodriguez, Miguel Torres, Laura Garcia)
- 5 Tareas de auditoria financiera

## Requisitos

1. Backend corriendo en http://localhost:5000
2. Frontend corriendo en http://localhost:3000
3. MySQL activo con base de datos creada

## Como ejecutar

```bash
npx playwright test playwright-tests/create-team.spec.ts --headed
```

Opciones:
- `--headed`: Ver el navegador (recomendado)
- Sin `--headed`: Modo headless (mas rapido)
- `--debug`: Modo debug paso a paso

## Resultado

El script genera un archivo `team-credentials.json` con:

```json
{
  "timestamp": "2026-02-24T18:30:00.000Z",
  "owner": {
    "email": "carlos.mendez.XXXXXXXXXX@acmeconsulting.com",
    "password": "SecurePass2024!",
    "name": "Carlos Mendez",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "project": {
      "id": "uuid",
      "name": "Auditoria Financiera Q1 2024",
      "description": "Proyecto de auditoria y revision..."
    }
  },
  "employees": [
    {
      "email": "ana.rodriguez.XXXXXXXXXX@acmeconsulting.com",
      "password": "SecurePass2024!",
      "name": "Ana Rodriguez",
      "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "user_id": "uuid"
    }
    // ... 2 empleados mas
  ],
  "tasks": [
    {
      "id": "uuid",
      "title": "Revision de balance general",
      "description": "Analizar y validar el balance general...",
      "priority": "urgent",
      "assigned_to": "uuid-empleado",
      "assigned_to_name": "Ana Rodriguez"
    }
    // ... 4 tareas mas
  ]
}
```

## Ver credenciales

Windows:
```bash
type playwright-tests\team-credentials.json
```

Linux/Mac:
```bash
cat playwright-tests/team-credentials.json
```

## Usar las credenciales

Abre http://localhost:3000/auth/login y usa:

**Owner:**
```
Email: carlos.mendez.XXXXXXXXXX@acmeconsulting.com
Password: SecurePass2024!
```

**Empleado 1:**
```
Email: ana.rodriguez.XXXXXXXXXX@acmeconsulting.com
Password: SecurePass2024!
```

Los emails exactos estan en el archivo JSON.

## Datos del equipo

**Proyecto:** Auditoria Financiera Q1 2024
- Tipo: Consultoria financiera
- Descripcion: Auditoria y revision de estados financieros

**Owner:** Carlos Mendez
- Rol: Director de auditoria

**Empleados:**
1. Ana Rodriguez - Analista senior
2. Miguel Torres - Analista de flujo de efectivo
3. Laura Garcia - Especialista en cuentas por cobrar

**Tareas:**
1. Revision de balance general (Urgente) - Ana Rodriguez
2. Analisis de flujo de efectivo (Alta) - Miguel Torres
3. Validacion de cuentas por cobrar (Alta) - Laura Garcia
4. Preparar informe ejecutivo (Media) - Ana Rodriguez
5. Revision de cumplimiento fiscal (Media) - Sin asignar

## Troubleshooting

**Error: Backend no esta corriendo**
```bash
cd project-management-backend
python app.py
```

**Error: Frontend no esta corriendo**
```bash
cd project-management-frontend
npm run dev
```

**Error: Timeout**
- Aumenta el timeout en el script
- Verifica que backend y frontend respondan rapido

## Regenerar equipo

Para crear un nuevo equipo con datos frescos:

```bash
npx playwright test playwright-tests/create-team.spec.ts --headed
```

Se generaran nuevos emails con timestamp diferente.
El archivo team-credentials.json se sobrescribira.
