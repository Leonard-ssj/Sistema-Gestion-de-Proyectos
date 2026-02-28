# Como Usar el Script de Creacion de Equipo

## Paso 1: Preparar el Entorno

Asegurate de tener todo corriendo:

```bash
# Terminal 1: Backend
cd project-management-backend
python app.py

# Terminal 2: Frontend
cd project-management-frontend
npm run dev

# Terminal 3: Tests (este terminal)
```

## Paso 2: Ejecutar el Script

```bash
npx playwright test playwright-tests/create-team.spec.ts --headed
```

El script tardara aproximadamente 2-3 minutos y veras:

```
Iniciando creacion de equipo completo
=====================================

FASE 1: Registrar Owner y Crear Proyecto
-----------------------------------------
Navegando a registro
Registrando owner: Carlos Mendez
Owner registrado correctamente
Creando proyecto: Auditoria Financiera Q1 2024
Proyecto creado correctamente

FASE 2: Crear Invitaciones
---------------------------
Invitacion 1/3: Ana Rodriguez
  Enviando invitacion...
  Invitacion creada en la tabla
  Link copiado: http://localhost:3000/invite/accept?token=...
Invitacion 2/3: Miguel Torres
  ...
Invitacion 3/3: Laura Garcia
  ...

FASE 3: Aceptar Invitaciones
-----------------------------
Empleado 1/3: Ana Rodriguez
  Abriendo link: http://localhost:3000/invite/accept?token=...
  Empleado registrado correctamente
Empleado 2/3: Miguel Torres
  ...
Empleado 3/3: Laura Garcia
  ...

FASE 4: Crear Tareas
--------------------
Tarea 1/5: Revision de balance general
  Asignado a: Ana Rodriguez
  Tarea creada
Tarea 2/5: Analisis de flujo de efectivo
  ...

FASE 5: Guardar Credenciales
-----------------------------
Credenciales guardadas en: playwright-tests/team-credentials.json

RESUMEN:
  Owner: carlos.mendez.1234567890@acmeconsulting.com
  Proyecto: Auditoria Financiera Q1 2024
  Empleados: 3
  Tareas: 5
  Tareas asignadas: 4

=====================================
Equipo creado exitosamente
=====================================
```

## Paso 3: Ver las Credenciales

```bash
# Windows
type playwright-tests\team-credentials.json

# Linux/Mac
cat playwright-tests/team-credentials.json
```

## Paso 4: Probar el Login

### Como Owner

1. Abre http://localhost:3000/auth/login
2. Usa el email del owner del archivo JSON
3. Password: `SecurePass2024!`
4. Veras el dashboard con 5 tareas y 3 empleados

### Como Empleado

1. Abre http://localhost:3000/auth/login
2. Usa el email de cualquier empleado del archivo JSON
3. Password: `SecurePass2024!`
4. Veras tus tareas asignadas

## Paso 5: Explorar el Equipo

### Como Owner puedes:

- Ver todas las tareas en `/app/tasks`
- Ver el equipo en `/app/team`
- Ver el board en `/app/board`
- Ver reportes en `/app/reports`

### Como Empleado puedes:

- Ver tus tareas en `/work/my-tasks`
- Actualizar estado de tareas
- Agregar comentarios

## Troubleshooting

### El script se queda esperando en FASE 2

**Problema:** El script no avanza despues de "Invitacion 1/3: Ana Rodriguez"

**Solucion:**
1. Verifica que el backend este respondiendo: http://localhost:5000/health
2. Verifica que el frontend este cargando: http://localhost:3000
3. Cierra el navegador y vuelve a ejecutar el script

### Error: "Timeout esperando..."

**Problema:** El script tarda mucho en alguna operacion

**Solucion:**
1. Verifica que tu computadora no este lenta
2. Cierra otros programas que consuman recursos
3. Aumenta el timeout en el script (linea `test.setTimeout(300000)`)

### Error: "Email already exists"

**Problema:** Los emails ya existen en la base de datos

**Solucion:**
El script usa timestamps para generar emails unicos. Si ves este error:
1. Espera 1 segundo y vuelve a ejecutar
2. O limpia la base de datos:
```sql
DELETE FROM users WHERE email LIKE '%@acmeconsulting.com';
```

### El navegador se cierra muy rapido

**Problema:** No puedes ver lo que esta pasando

**Solucion:**
El script ya tiene waits largos. Si quieres mas tiempo:
1. Aumenta los `waitForTimeout` en el script
2. O ejecuta en modo debug: `npx playwright test --debug`

## Regenerar el Equipo

Para crear un nuevo equipo desde cero:

```bash
# Ejecutar el script de nuevo
npx playwright test playwright-tests/create-team.spec.ts --headed
```

Se crearan nuevos usuarios con emails diferentes (timestamp nuevo).

## Usar el Equipo para Desarrollo

Una vez creado el equipo, puedes:

1. Probar funcionalidades como owner
2. Probar funcionalidades como empleado
3. Probar asignacion de tareas
4. Probar comentarios
5. Probar notificaciones
6. Probar reportes

Las credenciales estan en `team-credentials.json` para que puedas hacer login cuando quieras.


## Actualización del Calendario (Febrero 2024)

El script ha sido actualizado para funcionar con el nuevo componente de calendario de shadcn/ui basado en react-day-picker v9.

### Cambios en la Interacción con el Calendario

**Antes:**
```typescript
// Usaba botones de preset como "Tomorrow"
await page.click('button:has-text("Tomorrow")');
```

**Ahora:**
```typescript
// 1. Abrir el date picker
await page.click('button:has(svg.lucide-calendar)');

// 2. Esperar a que el calendario sea visible
await page.waitForSelector('[role="dialog"]', { state: 'visible' });

// 3. Calcular la fecha deseada
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowDay = tomorrow.getDate();

// 4. Hacer click en el día específico
await page.click(`button[data-day]:not([data-disabled="true"]):not([data-outside="true"]):has-text("${tomorrowDay}")`);
```

### Selectores del Nuevo Calendario

El nuevo calendario usa los siguientes atributos de datos:
- `data-day`: Fecha completa del día
- `data-selected`: Si el día está seleccionado
- `data-today`: Si es el día actual
- `data-outside`: Si el día está fuera del mes actual
- `data-disabled`: Si el día está deshabilitado

**Ejemplo de selector robusto:**
```typescript
// Seleccionar un día específico que no esté deshabilitado ni fuera del mes
await page.click(`button[data-day]:not([data-disabled="true"]):not([data-outside="true"]):has-text("15")`);
```

### Solución de Problemas con el Calendario

#### El calendario no se abre
- Verifica que el selector `button:has(svg.lucide-calendar)` encuentre el botón correcto
- Aumenta el timeout si la página carga lentamente
- Usa `await page.screenshot({ path: 'debug-calendar.png' })` para depurar

#### No encuentra el día en el calendario
- Asegúrate de que el día no esté fuera del mes actual
- Verifica que el día no esté deshabilitado
- El selector busca el texto del día (1-31) dentro del botón
