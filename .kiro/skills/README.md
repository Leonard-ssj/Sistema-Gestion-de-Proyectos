# Skills de ProGest

Este directorio contiene skills (habilidades) que Kiro carga automaticamente para ayudarte a mantener consistencia en el proyecto.

## Que son las Skills

Las skills son instrucciones especializadas que se cargan en el contexto de Kiro cuando son relevantes. Funcionan como "conocimiento adicional" que la IA usa para dar mejores sugerencias y mantener consistencia.

## Como Funcionan

Kiro carga las skills automaticamente basandose en:

1. **Archivos que estas editando** - Si editas un archivo Python, carga `backend-conventions.md`
2. **Palabras clave en tu pregunta** - Si mencionas "migracion", carga `database-migrations.md`
3. **Contexto de la conversacion** - Si estas trabajando con Git, carga `git-workflow.md`

**No necesitas hacer nada especial** - Kiro las carga automaticamente cuando las necesita.

## Skills Disponibles

### 1. backend-conventions.md
**Cuando se activa:** Al trabajar con archivos Python del backend

**Que incluye:**
- Arquitectura en capas (Routes → Services → Models)
- Formato de respuestas JSON
- Decoradores obligatorios (@jwt_required, @require_project_access)
- Validacion con Marshmallow
- Manejo de errores
- Estructura de archivos
- Ejemplos completos

**Ejemplo de uso:**
```
Tu: "Crea un endpoint para filtrar tareas por prioridad"
Kiro: [Carga backend-conventions.md]
      [Genera codigo siguiendo las convenciones]
      - Usa decoradores correctos
      - Formato JSON estandar
      - Validacion con schema
      - Manejo de errores apropiado
```

### 2. security-multitenancy.md
**Cuando se activa:** Al trabajar con queries de base de datos o permisos

**Que incluye:**
- Regla de oro: SIEMPRE filtrar por project_id
- Sistema de permisos (SUPERADMIN, OWNER, EMPLOYEE)
- Queries seguras
- Validacion de acceso
- Auditoria de operaciones
- Checklist de seguridad

**Ejemplo de uso:**
```
Tu: "Crea una funcion para obtener todas las tareas"
Kiro: [Carga security-multitenancy.md]
      [Genera codigo con filtro de project_id]
      def get_tasks(project_id):
          return Task.query.filter_by(project_id=project_id).all()
```

### 3. frontend-conventions.md
**Cuando se activa:** Al trabajar con archivos TypeScript/React

**Que incluye:**
- Estructura de componentes
- Uso de servicios para API calls
- Manejo de estados (loading, error, empty)
- Componentes shadcn/ui
- Formularios con React Hook Form + Zod
- Proteccion de rutas
- Estado global con Zustand

**Ejemplo de uso:**
```
Tu: "Crea un componente para listar tareas"
Kiro: [Carga frontend-conventions.md]
      [Genera componente con:]
      - 'use client' directive
      - Loading state
      - Error handling
      - Empty state
      - Uso de componentes shadcn/ui
```

### 4. database-migrations.md
**Cuando se activa:** Al modificar modelos SQLAlchemy o mencionar migraciones

**Que incluye:**
- Cuando crear migraciones
- Workflow completo (modificar → crear → revisar → aplicar)
- Tipos de migraciones (agregar campo, eliminar, cambiar tipo)
- Migraciones de datos
- Comandos utiles
- Buenas practicas
- Troubleshooting

**Ejemplo de uso:**
```
Tu: "Agrega un campo email_verified al modelo User"
Kiro: [Carga database-migrations.md]
      [Genera codigo del modelo]
      [Te recuerda:]
      "No olvides crear la migracion:
       python manage_migrations.py migrate 'Add email_verified to User'"
```

### 5. documentation-standards.md
**Cuando se activa:** Al crear nuevas funcionalidades o mencionar documentacion

**Que incluye:**
- Archivos de documentacion del proyecto
- Cuando actualizar cada archivo
- Formato de documentacion
- Checklist completo
- Ejemplos de documentacion

**Ejemplo de uso:**
```
Tu: "Cree un nuevo endpoint para estadisticas"
Kiro: [Carga documentation-standards.md]
      [Te recuerda actualizar:]
      - API_COMPLETE_DOCUMENTATION.md
      - Regenerar API_ENDPOINTS.md
      - Actualizar Postman collection
      - Actualizar DOCUMENTACION_CONSOLIDADA.md
```

### 6. git-workflow.md
**Cuando se activa:** Al mencionar Git, commits, branches o pull requests

**Que incluye:**
- Formato de commits (Conventional Commits)
- Nombres de branches
- Workflow completo (branch → commit → PR → merge)
- Resolucion de conflictos
- Comandos utiles
- Buenas practicas

**Ejemplo de uso:**
```
Tu: "Como hago un commit de estos cambios?"
Kiro: [Carga git-workflow.md]
      [Sugiere:]
      git add .
      git commit -m "feat(tasks): add priority filter endpoint"
```

## Ubicacion de Skills

Las skills pueden estar en dos lugares:

### Skills del Proyecto (Compartidas)
**Ubicacion:** `.kiro/skills/`

Estas skills son para TODO el equipo. Se commitean en Git y todos los desarrolladores las usan.

**Ejemplo:** Las 6 skills de ProGest estan aqui.

### Skills Personales (Solo tu)
**Ubicacion:** `~/.kiro/skills/`

Estas skills son solo para ti. No se commitean en Git.

**Ejemplo:** Podrias tener una skill personal con tus preferencias de codigo.

## Como Agregar Nuevas Skills

1. Crear archivo `.md` en `.kiro/skills/`
2. Usar formato claro y conciso
3. Incluir ejemplos practicos
4. Commitear en Git para compartir con el equipo

**Ejemplo de estructura:**

```markdown
# Nombre de la Skill

Descripcion breve de que hace.

## Cuando Usar

Explicar cuando aplicar esta skill.

## Reglas

- Regla 1
- Regla 2

## Ejemplos

```python
# Ejemplo de codigo
```

## Recordatorios

- Recordatorio importante 1
- Recordatorio importante 2
```

## Beneficios de las Skills

1. **Consistencia** - Todo el equipo sigue las mismas convenciones
2. **Menos errores** - La IA detecta problemas comunes
3. **Mejor codigo** - Sugerencias mas precisas y contextuales
4. **Menos repeticion** - No necesitas explicar las mismas cosas
5. **Onboarding rapido** - Nuevos devs aprenden las convenciones automaticamente

## Ejemplos de Uso Real

### Ejemplo 1: Crear Endpoint

```
Tu: "Crea un endpoint GET /api/tasks/stats"

Kiro carga automaticamente:
- backend-conventions.md (estructura de codigo)
- security-multitenancy.md (filtro por project_id)
- documentation-standards.md (que documentar)

Resultado:
- Codigo con estructura correcta
- Filtro de project_id incluido
- Recordatorio de actualizar docs
```

### Ejemplo 2: Modificar Modelo

```
Tu: "Agrega campo priority_level a Task"

Kiro carga automaticamente:
- backend-conventions.md (como definir campos)
- database-migrations.md (como crear migracion)
- documentation-standards.md (actualizar data-model.md)

Resultado:
- Campo agregado correctamente
- Instrucciones para crear migracion
- Recordatorio de actualizar documentacion
```

### Ejemplo 3: Crear Componente Frontend

```
Tu: "Crea componente para filtrar tareas"

Kiro carga automaticamente:
- frontend-conventions.md (estructura de componente)
- documentation-standards.md (documentar componente)

Resultado:
- Componente con estructura correcta
- Loading/error/empty states
- Uso de componentes shadcn/ui
```

## Mantenimiento de Skills

### Actualizar Skills

Cuando cambien las convenciones del proyecto:

1. Editar archivo de skill correspondiente
2. Actualizar ejemplos si es necesario
3. Commitear cambios
4. Informar al equipo

### Agregar Nuevas Skills

Si identificas un patron que se repite:

1. Crear nueva skill
2. Documentar el patron
3. Agregar ejemplos
4. Compartir con el equipo

## Preguntas Frecuentes

**P: Necesito activar las skills manualmente?**
R: No, Kiro las carga automaticamente cuando son relevantes.

**P: Puedo desactivar una skill?**
R: Si, eliminando o renombrando el archivo (cambiar extension a .txt por ejemplo).

**P: Las skills afectan el performance?**
R: No, Kiro solo carga las skills relevantes para tu contexto actual.

**P: Puedo tener skills personales?**
R: Si, creandolas en `~/.kiro/skills/` (no se commitean en Git).

**P: Como se que skill esta activa?**
R: Kiro las carga silenciosamente. Si sigues las convenciones, estan funcionando.

## Recursos Adicionales

- [WORKFLOW.md](../WORKFLOW.md) - Workflow completo de desarrollo
- [development-guide.md](../development-guide.md) - Guia de desarrollo
- [INDEX.md](../INDEX.md) - Indice de toda la documentacion

---

**Ultima actualizacion:** 24 de febrero de 2026  
**Skills activas:** 6
