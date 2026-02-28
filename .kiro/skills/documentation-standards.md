# Documentation Standards - ProGest

Estandares para mantener la documentacion actualizada.

## Archivos de Documentacion

ProGest tiene 11 archivos de documentacion en `.kiro/`:

1. `INDEX.md` - Indice maestro
2. `DOCUMENTACION_CONSOLIDADA.md` - Estado del proyecto
3. `architecture.md` - Arquitectura
4. `data-model.md` - Modelo de datos
5. `API_COMPLETE_DOCUMENTATION.md` - API completa
6. `development-guide.md` - Guia de desarrollo
7. `TESTING_GUIDE.md` - Guia de testing
8. `WORKFLOW.md` - Workflow de desarrollo
9. `frontend.md` - Frontend
10. `backend.md` - Backend
11. `README.md` (raiz) - Inicio rapido

## Cuando Actualizar Documentacion

### Al Crear Nuevo Endpoint

Actualizar:

1. **API_COMPLETE_DOCUMENTATION.md**

Agregar seccion del endpoint:

```markdown
### X.Y METODO /api/ruta

Descripcion del endpoint.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "campo": "valor"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Errores:**
- 400: Datos invalidos
- 401: No autorizado
- 404: No encontrado
```

2. **Regenerar API_ENDPOINTS.md**

```bash
cd project-management-backend
python list_endpoints.py
```

Esto actualiza automaticamente `API_ENDPOINTS.md` con todos los endpoints.

3. **Actualizar Postman Collection**

- Abrir Postman
- Agregar request al folder correspondiente
- Configurar metodo, URL, headers, body
- Probar que funciona
- Export collection
- Guardar en `postman/ProGest_API_Complete.postman_collection.json`

4. **Actualizar DOCUMENTACION_CONSOLIDADA.md**

Agregar en seccion de endpoints:

```markdown
**Modulo (X endpoints)**
- METODO /api/ruta - Descripcion
```

### Al Modificar Modelo

Actualizar:

1. **data-model.md**

Actualizar seccion del modelo:

```markdown
### Entidad

**Tabla:** `nombre_tabla`

**Campos:**
- `id` (String 36) - PK, UUID
- `nuevo_campo` (Tipo) - Descripcion
- `campo_modificado` (Nuevo Tipo) - Descripcion actualizada

**Relaciones:**
- Relacion con otra entidad
```

2. **backend.md**

Si cambia estructura significativa, actualizar seccion de modelos.

### Al Agregar Funcionalidad Frontend

Actualizar:

1. **frontend.md**

Agregar en seccion correspondiente:

```markdown
### Nueva Funcionalidad

**Ruta:** `/app/nueva-ruta`

**Componentes:**
- `NuevoComponente.tsx` - Descripcion

**Servicios:**
- `nuevoService.ts` - Funciones de API
```

2. **DOCUMENTACION_CONSOLIDADA.md**

Agregar en seccion de funcionalidades:

```markdown
### X. Nueva Funcionalidad
- Descripcion de que hace
- Componentes principales
- Integracion con backend
```

### Al Cambiar Arquitectura

Actualizar:

1. **architecture.md**

Actualizar diagramas y descripciones de arquitectura.

2. **DOCUMENTACION_CONSOLIDADA.md**

Actualizar seccion de tecnologias si cambia stack.

### Al Agregar Migracion

Documentar en el archivo de migracion:

```python
"""Add email_verified to User

Revision ID: xxxx
Revises: yyyy
Create Date: 2026-02-24

Descripcion:
- Agrega campo email_verified (Boolean) a tabla users
- Valor por defecto: False
- Permite validar emails de usuarios
"""
```

## Formato de Documentacion

### Titulos

```markdown
# Titulo Principal (H1)

## Seccion (H2)

### Subseccion (H3)
```

### Codigo

Usar bloques de codigo con lenguaje:

```markdown
```python
def funcion():
    pass
```
```

### Listas

```markdown
- Item 1
- Item 2
  - Sub-item 2.1
  - Sub-item 2.2
```

### Tablas

```markdown
| Columna 1 | Columna 2 |
|-----------|-----------|
| Valor 1   | Valor 2   |
```

### Enlaces

```markdown
[Texto del enlace](ruta/al/archivo.md)
```

### Notas Importantes

```markdown
**IMPORTANTE:** Texto importante

**CRITICO:** Texto critico

**Nota:** Texto informativo
```

## Checklist de Documentacion

Al implementar nueva funcionalidad:

### Backend
- [ ] Endpoint documentado en API_COMPLETE_DOCUMENTATION.md
- [ ] API_ENDPOINTS.md regenerado
- [ ] Request agregado a Postman collection
- [ ] Postman collection exportada
- [ ] DOCUMENTACION_CONSOLIDADA.md actualizada
- [ ] data-model.md actualizado (si aplica)
- [ ] backend.md actualizado (si aplica)

### Frontend
- [ ] Componente documentado en frontend.md
- [ ] Ruta agregada a lista de rutas
- [ ] DOCUMENTACION_CONSOLIDADA.md actualizada
- [ ] Servicio documentado (si es nuevo)

### Migraciones
- [ ] Migracion documentada en archivo de migracion
- [ ] data-model.md actualizado
- [ ] MIGRATIONS_README.md actualizado (si cambia proceso)

### General
- [ ] README.md actualizado (si cambia setup)
- [ ] WORKFLOW.md actualizado (si cambia proceso)
- [ ] INDEX.md actualizado (si se agrega archivo)

## Ejemplos de Documentacion

### Endpoint Completo

```markdown
### 3.10 GET /api/tasks/stats

Obtener estadisticas de tareas del proyecto.

**Headers:** `Authorization: Bearer <access_token>`

**Permisos:** OWNER, EMPLOYEE

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "total": 20,
    "by_status": {
      "pending": 5,
      "in_progress": 8,
      "blocked": 2,
      "done": 5
    },
    "by_priority": {
      "low": 3,
      "medium": 10,
      "high": 5,
      "urgent": 2
    }
  }
}
```

**Errores:**
- 401: Token invalido o expirado
- 403: Sin acceso al proyecto
```

### Modelo Completo

```markdown
### Task

**Tabla:** `tasks`

**Descripcion:** Tareas del proyecto

**Campos:**
- `id` (String 36) - PK, UUID
- `project_id` (String 36) - FK a projects
- `title` (String 255) - Titulo de la tarea
- `description` (Text) - Descripcion detallada
- `status` (Enum) - Estado: pending, in_progress, blocked, done
- `priority` (Enum) - Prioridad: low, medium, high, urgent
- `assigned_to` (String 36) - FK a users (nullable)
- `created_by` (String 36) - FK a users
- `due_date` (DateTime) - Fecha de vencimiento
- `created_at` (DateTime) - Fecha de creacion
- `updated_at` (DateTime) - Fecha de actualizacion

**Relaciones:**
- Pertenece a Project (many-to-one)
- Asignada a User (many-to-one, nullable)
- Creada por User (many-to-one)
- Tiene muchos Comments (one-to-many)

**Indices:**
- `ix_tasks_project_id` - Para filtrar por proyecto
- `ix_tasks_status` - Para filtrar por estado
- `ix_tasks_assigned_to` - Para filtrar por asignado
```

### Componente Frontend

```markdown
### TaskList

**Archivo:** `app/app/tasks/page.tsx`

**Descripcion:** Lista de tareas con filtros y paginacion

**Props:** Ninguna (usa route params)

**Estado:**
- `tasks` - Array de tareas
- `loading` - Estado de carga
- `filters` - Filtros aplicados
- `page` - Pagina actual

**Servicios:**
- `taskService.getTasks()` - Obtener tareas
- `taskService.updateTask()` - Actualizar tarea
- `taskService.deleteTask()` - Eliminar tarea

**Componentes Usados:**
- `TaskCard` - Tarjeta de tarea individual
- `TaskFilters` - Filtros de busqueda
- `Pagination` - Paginacion
- `CreateTaskDialog` - Dialog para crear tarea
```

## Mantenimiento de Documentacion

### Revision Mensual

Una vez al mes, revisar:

- [ ] Todos los endpoints estan documentados
- [ ] Postman collection esta actualizada
- [ ] Modelos estan actualizados
- [ ] Rutas frontend estan documentadas
- [ ] README tiene instrucciones correctas
- [ ] WORKFLOW refleja proceso actual

### Al Hacer Release

Antes de cada release:

- [ ] Actualizar version en documentos
- [ ] Actualizar fecha de ultima actualizacion
- [ ] Revisar que toda funcionalidad nueva este documentada
- [ ] Generar changelog si aplica

## Recordatorios

- SIEMPRE actualizar documentacion al hacer cambios
- SIEMPRE regenerar API_ENDPOINTS.md despues de cambios en backend
- SIEMPRE exportar Postman collection despues de cambios
- NUNCA dejar documentacion desactualizada
- NUNCA documentar codigo que no existe
- SIEMPRE usar formato consistente
- SIEMPRE incluir ejemplos de request/response
- NUNCA agregar emojis