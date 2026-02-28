# WORKFLOW DE DESARROLLO - ProGest

> Guia completa del flujo de trabajo para implementar nuevas funcionalidades

---

## TABLA DE CONTENIDOS

1. [Configuracion Inicial](#configuracion-inicial)
2. [Workflow de Desarrollo](#workflow-de-desarrollo)
3. [Control de Versiones (Git)](#control-de-versiones-git)
4. [Testing](#testing)
5. [Documentacion](#documentacion)
6. [Checklist de Implementacion](#checklist-de-implementacion)

---

## CONFIGURACION INICIAL

### 1. Clonar Repositorio

```bash
git clone <repository-url>
cd Monorepo_gestion_proyectos_saas
```

### 2. Configurar Variables de Entorno

Crear archivo `.env.local` en la raiz del proyecto:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=project_management_db_mysql

# Security
SECRET_KEY=tu_secret_key_aqui
JWT_SECRET_KEY=tu_jwt_secret_key_aqui

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### 3. Configurar Backend

```bash
cd project-management-backend

# Crear entorno virtual
python -m venv backend-env

# Activar entorno virtual
backend-env\Scripts\activate  # Windows
source backend-env/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Crear base de datos
mysql -u root -p
CREATE DATABASE project_management_db_mysql;
exit;

# Aplicar migraciones
python manage_migrations.py upgrade

# Iniciar servidor
python app.py
```

### 4. Configurar Frontend

```bash
cd project-management-frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 5. Verificar Instalacion

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- API Health: http://localhost:5000/api/health

---

## WORKFLOW DE DESARROLLO

### Fase 1: Planificacion

**1.1 Definir Funcionalidad**

- Escribir descripcion clara de la funcionalidad
- Identificar endpoints necesarios
- Definir modelos de datos
- Identificar permisos requeridos

**1.2 Revisar Documentacion Existente**

- `.kiro/architecture.md` - Arquitectura del sistema
- `.kiro/data-model.md` - Modelos de datos
- `.kiro/API_COMPLETE_DOCUMENTATION.md` - Endpoints existentes

**1.3 Crear Branch de Trabajo**

```bash
# Actualizar main
git checkout main
git pull origin main

# Crear branch para la funcionalidad
git checkout -b feature/nombre-funcionalidad

# Ejemplo:
git checkout -b feature/add-task-priority-filter
```

### Fase 2: Backend (API)

**2.1 Modificar/Crear Modelo**

Si necesitas cambios en la base de datos:

```python
# app/models/task.py
class Task(db.Model):
    # ... campos existentes ...
    priority_level = db.Column(db.Integer, default=1)  # Nuevo campo
```

**2.2 Crear Migracion**

```bash
cd project-management-backend

# Crear migracion automatica
python manage_migrations.py migrate "Add priority_level to tasks"

# Revisar archivo generado en migrations/versions/

# Aplicar migracion
python manage_migrations.py upgrade
```

**2.3 Actualizar Schema de Validacion**

```python
# app/schemas/task_schema.py
from marshmallow import Schema, fields

class TaskSchema(Schema):
    # ... campos existentes ...
    priority_level = fields.Integer(required=False)
```

**2.4 Implementar Logica de Negocio**

```python
# app/services/task_service.py
def filter_tasks_by_priority(project_id, priority_level):
    tasks = Task.query.filter_by(
        project_id=project_id,
        priority_level=priority_level
    ).all()
    return [task.to_dict() for task in tasks]
```

**2.5 Crear/Modificar Endpoint**

```python
# app/routes/tasks.py
@tasks_bp.route('/api/tasks', methods=['GET'])
@jwt_required()
@require_project_access()
def list_tasks():
    priority = request.args.get('priority_level', type=int)
    
    if priority:
        tasks = filter_tasks_by_priority(project_id, priority)
    else:
        tasks = get_all_tasks(project_id)
    
    return jsonify({'success': True, 'tasks': tasks}), 200
```

**2.6 Probar Endpoint Manualmente**

```bash
# Iniciar servidor
python app.py

# En otra terminal, probar con curl
curl -X GET "http://localhost:5000/api/tasks?priority_level=2" \
  -H "Authorization: Bearer <token>"
```

### Fase 3: Testing con Postman

**3.1 Abrir Postman**

- Importar coleccion: `postman/ProGest_API_Complete.postman_collection.json`
- Importar environment: `postman/ProGest_Development.postman_environment.json`

**3.2 Configurar Variables**

En el environment, configurar:
- `base_url`: http://127.0.0.1:5000
- `access_token`: (se obtiene automaticamente al hacer login)

**3.3 Probar Endpoint**

1. Ejecutar "Login" para obtener token
2. Probar el nuevo endpoint o modificado
3. Verificar respuesta exitosa
4. Probar casos de error (sin token, datos invalidos, etc.)

**3.4 Agregar Endpoint a Coleccion**

Si es un endpoint nuevo:

```json
{
  "name": "Filter Tasks by Priority",
  "request": {
    "method": "GET",
    "header": [
      {
        "key": "Authorization",
        "value": "Bearer {{access_token}}"
      }
    ],
    "url": {
      "raw": "{{base_url}}/api/tasks?priority_level=2",
      "host": ["{{base_url}}"],
      "path": ["api", "tasks"],
      "query": [
        {
          "key": "priority_level",
          "value": "2"
        }
      ]
    }
  }
}
```

Agregar al archivo `postman/ProGest_API_Complete.postman_collection.json` en la seccion correspondiente.

**3.5 Exportar Coleccion Actualizada**

En Postman:
1. Click derecho en la coleccion
2. Export
3. Guardar en `postman/ProGest_API_Complete.postman_collection.json`

### Fase 4: Frontend (UI)

**4.1 Crear/Actualizar Servicio**

```typescript
// services/taskService.ts
export async function getTasksByPriority(priorityLevel: number) {
  try {
    const response = await api.get(`/tasks?priority_level=${priorityLevel}`)
    return { success: true, data: response }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

**4.2 Actualizar Componente**

```typescript
// app/app/tasks/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { getTasksByPriority } from '@/services/taskService'

export default function TasksPage() {
  const [priority, setPriority] = useState<number>(1)
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    loadTasks()
  }, [priority])

  const loadTasks = async () => {
    const result = await getTasksByPriority(priority)
    if (result.success) {
      setTasks(result.data)
    }
  }

  return (
    <div>
      <select onChange={(e) => setPriority(Number(e.target.value))}>
        <option value="1">Prioridad 1</option>
        <option value="2">Prioridad 2</option>
        <option value="3">Prioridad 3</option>
      </select>
      {/* Renderizar tareas */}
    </div>
  )
}
```

**4.3 Probar en Navegador**

1. Abrir http://localhost:3000
2. Navegar a la pagina modificada
3. Probar la funcionalidad
4. Verificar en DevTools (Network tab) que las peticiones sean correctas

### Fase 5: Testing E2E (Opcional)

**5.1 Crear Test de Playwright**

```typescript
// playwright-tests/generated-tests/task-priority-filter.spec.ts
import { test, expect } from '@playwright/test'

test('Filter tasks by priority', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/auth/login')
  await page.fill('input[name="email"]', 'owner@example.com')
  await page.fill('input[name="password"]', 'Password123')
  await page.click('button[type="submit"]')
  
  // Navegar a tareas
  await page.goto('http://localhost:3000/app/tasks')
  
  // Seleccionar prioridad
  await page.selectOption('select[name="priority"]', '2')
  
  // Verificar que se muestren tareas
  await expect(page.locator('.task-item')).toHaveCount(3)
})
```

**5.2 Ejecutar Test**

```bash
cd playwright-tests
npx playwright test task-priority-filter.spec.ts
```

---

## CONTROL DE VERSIONES (GIT)

### Commits

**Formato de Commits:**

```
tipo(scope): descripcion corta

Descripcion detallada (opcional)

- Cambio 1
- Cambio 2
```

**Tipos de Commits:**

- `feat`: Nueva funcionalidad
- `fix`: Correccion de bug
- `docs`: Cambios en documentacion
- `style`: Cambios de formato (no afectan logica)
- `refactor`: Refactorizacion de codigo
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
git commit -m "feat(tasks): add priority level filter"

git commit -m "fix(auth): resolve token expiration issue"

git commit -m "docs(api): update endpoint documentation"
```

### Workflow de Git

**1. Hacer Commits Frecuentes**

```bash
# Agregar archivos modificados
git add .

# Commit con mensaje descriptivo
git commit -m "feat(tasks): add priority_level field to model"

# Otro commit
git add .
git commit -m "feat(tasks): implement priority filter endpoint"
```

**2. Push a Branch Remoto**

```bash
# Primera vez
git push -u origin feature/nombre-funcionalidad

# Siguientes veces
git push
```

**3. Crear Pull Request**

En GitHub/GitLab:
1. Ir a la pagina del repositorio
2. Click en "New Pull Request"
3. Seleccionar branch: `feature/nombre-funcionalidad` → `main`
4. Agregar titulo y descripcion
5. Asignar reviewers
6. Crear PR

**4. Code Review**

- Esperar aprobacion de al menos 1 reviewer
- Hacer cambios solicitados si es necesario
- Hacer push de cambios adicionales al mismo branch

**5. Merge a Main**

Una vez aprobado:
```bash
# Opcion 1: Merge desde GitHub/GitLab (recomendado)
# Click en "Merge Pull Request"

# Opcion 2: Merge local
git checkout main
git pull origin main
git merge feature/nombre-funcionalidad
git push origin main
```

**6. Limpiar Branch**

```bash
# Eliminar branch local
git branch -d feature/nombre-funcionalidad

# Eliminar branch remoto
git push origin --delete feature/nombre-funcionalidad
```

### Resolver Conflictos

Si hay conflictos al hacer merge:

```bash
# Actualizar main
git checkout main
git pull origin main

# Volver a tu branch
git checkout feature/nombre-funcionalidad

# Hacer rebase
git rebase main

# Resolver conflictos manualmente en los archivos
# Buscar marcadores: <<<<<<< HEAD, =======, >>>>>>>

# Agregar archivos resueltos
git add .

# Continuar rebase
git rebase --continue

# Push forzado (solo en tu branch)
git push -f origin feature/nombre-funcionalidad
```

---

## TESTING

### Testing Backend

**1. Testing Manual con Postman**

- Probar todos los endpoints modificados
- Verificar respuestas exitosas (200, 201)
- Verificar errores (400, 401, 403, 404)
- Probar casos limite

**2. Testing de Migraciones**

```bash
# Aplicar migracion
python manage_migrations.py upgrade

# Verificar en base de datos
mysql -u root -p project_management_db_mysql
DESCRIBE tasks;  # Ver estructura de tabla
exit;

# Si hay problemas, revertir
python manage_migrations.py downgrade
```

**3. Testing de Permisos**

- Probar con usuario OWNER
- Probar con usuario EMPLOYEE
- Probar sin autenticacion
- Verificar que los permisos funcionen correctamente

### Testing Frontend

**1. Testing Manual en Navegador**

- Probar en Chrome DevTools
- Verificar Network tab (peticiones correctas)
- Verificar Console (sin errores)
- Probar diferentes estados (loading, error, success)

**2. Testing de UI**

- Verificar responsive design (mobile, tablet, desktop)
- Probar en diferentes navegadores
- Verificar accesibilidad basica

**3. Testing E2E con Playwright**

```bash
cd playwright-tests

# Ejecutar todos los tests
npx playwright test

# Ejecutar test especifico
npx playwright test nombre-test.spec.ts

# Ejecutar con UI
npx playwright test --ui

# Ver reporte
npx playwright show-report
```

---

## DOCUMENTACION

### 1. Documentar Endpoint en API_COMPLETE_DOCUMENTATION.md

Agregar o actualizar en `.kiro/API_COMPLETE_DOCUMENTATION.md`:

```markdown
### 3.10 GET /api/tasks (con filtro de prioridad)

Listar tareas filtradas por nivel de prioridad.

**Headers:** `Authorization: Bearer <access_token>`

**Query Params:**
- `priority_level` - Nivel de prioridad (1, 2, 3)

**Response (200):**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "uuid",
      "title": "Tarea importante",
      "priority_level": 2
    }
  ]
}
```
```

### 2. Actualizar Coleccion de Postman

Ya cubierto en Fase 3.4 y 3.5

### 3. Actualizar Lista de Endpoints

```bash
# Regenerar lista de endpoints
cd project-management-backend
python list_endpoints.py

# Verificar que el nuevo endpoint aparezca en API_ENDPOINTS.md
```

### 4. Actualizar DOCUMENTACION_CONSOLIDADA.md

Agregar cambios relevantes en `.kiro/DOCUMENTACION_CONSOLIDADA.md`:

```markdown
## Cambios Recientes

### 2026-02-24 - Filtro de Prioridad en Tareas

- Agregado campo `priority_level` al modelo Task
- Implementado filtro por prioridad en GET /api/tasks
- Actualizada UI para seleccionar prioridad
```

### 5. Actualizar README.md (si aplica)

Si la funcionalidad es importante, agregar mencion en `README.md`

### 6. Documentar Migraciones

Si creaste migraciones, documentar en comentarios del archivo de migracion:

```python
# migrations/versions/xxxx_add_priority_level.py
"""Add priority_level to tasks

Revision ID: xxxx
Revises: yyyy
Create Date: 2026-02-24

Descripcion:
- Agrega campo priority_level (INTEGER) a tabla tasks
- Valor por defecto: 1
- Permite filtrar tareas por nivel de prioridad
"""
```

---

## CHECKLIST DE IMPLEMENTACION

### Backend

- [ ] Modelo actualizado/creado
- [ ] Migracion creada y aplicada
- [ ] Schema de validacion actualizado
- [ ] Logica de negocio implementada
- [ ] Endpoint implementado
- [ ] Permisos verificados
- [ ] Probado manualmente con curl/Postman
- [ ] Endpoint agregado a Postman collection

### Frontend

- [ ] Servicio creado/actualizado
- [ ] Componente implementado
- [ ] UI funcional
- [ ] Manejo de errores implementado
- [ ] Loading states implementados
- [ ] Probado en navegador
- [ ] Responsive design verificado

### Testing

- [ ] Testing manual backend (Postman)
- [ ] Testing manual frontend (navegador)
- [ ] Testing de permisos
- [ ] Testing E2E (opcional)
- [ ] Testing en diferentes navegadores (opcional)

### Documentacion

- [ ] API_COMPLETE_DOCUMENTATION.md actualizado
- [ ] Postman collection exportada
- [ ] API_ENDPOINTS.md regenerado
- [ ] DOCUMENTACION_CONSOLIDADA.md actualizado
- [ ] Comentarios en codigo agregados
- [ ] README.md actualizado (si aplica)

### Git

- [ ] Branch creado desde main actualizado
- [ ] Commits con mensajes descriptivos
- [ ] Push a branch remoto
- [ ] Pull Request creado
- [ ] Code review completado
- [ ] Merge a main
- [ ] Branch eliminado

---

## RECURSOS ADICIONALES

### Archivos de Referencia

- `.kiro/INDEX.md` - Indice de toda la documentacion
- `.kiro/architecture.md` - Arquitectura del sistema
- `.kiro/data-model.md` - Modelos de datos
- `.kiro/backend.md` - Documentacion del backend
- `.kiro/frontend.md` - Documentacion del frontend
- `.kiro/development-guide.md` - Guia de desarrollo
- `.kiro/TESTING_GUIDE.md` - Guia de testing
- `project-management-backend/MIGRATIONS_README.md` - Guia de migraciones

### Scripts Utiles

```bash
# Backend
python list_endpoints.py              # Listar todos los endpoints
python manage_migrations.py current   # Ver version de BD
python manage_migrations.py history   # Ver historial de migraciones

# Frontend
npm run dev                           # Servidor de desarrollo
npm run build                         # Build de produccion
npm run lint                          # Linter

# Testing
npx playwright test                   # Tests E2E
npx playwright test --ui              # Tests con UI
```

### Comandos Git Utiles

```bash
git status                            # Ver estado actual
git log --oneline                     # Ver historial de commits
git diff                              # Ver cambios no commiteados
git stash                             # Guardar cambios temporalmente
git stash pop                         # Recuperar cambios guardados
git branch -a                         # Ver todas las branches
git checkout -                        # Volver a branch anterior
```

---

**Ultima actualizacion:** 24 de febrero de 2026  
**Version:** 1.0.0
