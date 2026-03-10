# Documento de Diseño

## Introducción

Este documento especifica el diseño técnico para la integración de datos del backend API en las páginas Board y Task Detail, incluyendo soporte completo para persistencia de checklists en el backend. El diseño cubre cambios en el esquema de base de datos, modificaciones de API, actualizaciones de frontend, y flujos de datos para todas las operaciones de tareas y checklists.

## Glosario Técnico

- **Migration**: Script de Alembic para modificar el esquema de base de datos
- **JSON Column**: Columna PostgreSQL de tipo JSON para almacenar datos estructurados
- **Schema Validation**: Validación de datos usando Marshmallow en el backend
- **Optimistic UI**: Actualización inmediata de UI antes de confirmación del servidor
- **Rollback**: Reversión de cambios optimistas cuando falla la operación del servidor
- **Service Layer**: Capa de lógica de negocio que maneja operaciones de datos
- **Mapper Function**: Función que transforma datos entre formatos backend y frontend
- **Toast Component**: Componente de notificación temporal para feedback al usuario

## Arquitectura General

### Flujo de Datos

```
Frontend (React/Next.js)
    ↓
Service Layer (taskService.ts)
    ↓
API Client (lib/api.ts)
    ↓
Backend API (FastAPI)
    ↓
Service Layer (task_service.py)
    ↓
Database (PostgreSQL)
```

### Componentes Afectados

**Backend:**
- `app/models/task.py` - Modelo de base de datos
- `app/schemas/task_schema.py` - Esquemas de validación
- `app/services/task_service.py` - Lógica de negocio
- `app/routes/tasks.py` - Endpoints API
- Nueva migración Alembic

**Frontend:**
- `app/app/board/page.tsx` - Página del tablero kanban
- `app/app/tasks/[id]/page.tsx` - Página de detalle de tarea
- `app/app/tasks/page.tsx` - Formulario de creación de tarea
- `services/taskService.ts` - Servicio de API de tareas
- `lib/mappers.ts` - Funciones de transformación de datos
- `components/ui/toast.tsx` - Componente de notificaciones (si no existe)

## Diseño de Base de Datos

### Cambios en el Modelo Task

**Archivo:** `project-management-backend/app/models/task.py`

**Campo Nuevo:**
```python
checklist = db.Column(db.JSON, nullable=True, default=list)
```

**Estructura del JSON:**
```json
[
  {
    "id": "uuid-string",
    "text": "Item text",
    "completed": false
  }
]
```

**Actualización del método to_dict():**
```python
def to_dict(self):
    return {
        # ... campos existentes ...
        'checklist': self.checklist if self.checklist else []
    }
```

### Migración de Base de Datos

**Comando para crear migración:**
```bash
cd project-management-backend
python -m flask db migrate -m "Add checklist field to tasks table"
python -m flask db upgrade
```

**Contenido esperado de la migración:**
```python
def upgrade():
    op.add_column('tasks', sa.Column('checklist', sa.JSON(), nullable=True))

def downgrade():
    op.drop_column('tasks', 'checklist')
```

### Propiedades de Datos

**Invariantes:**
- Cada checklist item DEBE tener un ID único
- Cada checklist item DEBE tener un campo text no vacío
- Cada checklist item DEBE tener un campo completed booleano
- El campo checklist DEBE ser una lista (array), nunca null

**Validaciones:**
- Longitud máxima de text: 500 caracteres
- Máximo de items en checklist: 50
- ID debe ser UUID válido

## Diseño de API Backend

### Esquemas de Validación

**Archivo:** `project-management-backend/app/schemas/task_schema.py`

**Nuevo Schema para Checklist Item:**
```python
class ChecklistItemSchema(Schema):
    """Schema para item de checklist"""
    id = fields.Str(required=True, validate=validate.Length(equal=36))
    text = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    completed = fields.Bool(required=True)
    
    @validates('id')
    def validate_id(self, value):
        """Validar que el ID sea un UUID válido"""
        try:
            uuid.UUID(value)
        except ValueError:
            raise ValidationError('El ID debe ser un UUID válido')
```

**Actualización de TaskCreateSchema:**
```python
class TaskCreateSchema(Schema):
    # ... campos existentes ...
    checklist = fields.List(
        fields.Nested(ChecklistItemSchema),
        required=False,
        allow_none=True,
        validate=validate.Length(max=50)
    )
```

**Actualización de TaskUpdateSchema:**
```python
class TaskUpdateSchema(Schema):
    # ... campos existentes ...
    checklist = fields.List(
        fields.Nested(ChecklistItemSchema),
        required=False,
        allow_none=True,
        validate=validate.Length(max=50)
    )
```

**Actualización de TaskSchema (respuesta):**
```python
class TaskSchema(Schema):
    # ... campos existentes ...
    checklist = fields.List(fields.Nested(ChecklistItemSchema), dump_only=True)
```

### Modificaciones en Endpoints

**Archivo:** `project-management-backend/app/routes/tasks.py`

**Endpoints afectados:**
1. `POST /api/projects/{project_id}/tasks` - Crear tarea con checklist
2. `PUT /api/projects/{project_id}/tasks/{task_id}` - Actualizar tarea incluyendo checklist
3. `GET /api/projects/{project_id}/tasks/{task_id}` - Obtener tarea con checklist
4. `GET /api/projects/{project_id}/tasks` - Listar tareas con checklist

**No se requieren cambios en el código de los endpoints**, ya que los schemas manejan la validación automáticamente.

### Lógica de Permisos para Checklist

**Archivo:** `project-management-backend/app/services/task_service.py`

**Reglas de permisos:**

1. **Crear tarea con checklist:** Solo Owner
2. **Agregar/Editar/Eliminar items:** Solo Owner
3. **Toggle completed status:** Owner y Employee (cualquier usuario del proyecto)

**Implementación de validación:**
```python
def validate_checklist_modification(task, user, old_checklist, new_checklist):
    """
    Valida si el usuario puede modificar el checklist.
    
    Returns:
        - True si solo se modificó el campo 'completed' (toggle)
        - False si se modificó estructura (agregar/eliminar/editar text)
    """
    # Si el usuario es Owner, permitir cualquier cambio
    if user.role == 'owner':
        return True
    
    # Si el usuario es Employee, solo permitir toggle de completed
    if len(old_checklist) != len(new_checklist):
        return False  # Se agregaron o eliminaron items
    
    for old_item, new_item in zip(old_checklist, new_checklist):
        if old_item['id'] != new_item['id']:
            return False  # Se reordenaron items
        if old_item['text'] != new_item['text']:
            return False  # Se editó el texto
        # Permitir cambio en 'completed'
    
    return True
```

**Integración en update_task:**
```python
def update_task(project_id, task_id, data, user_id):
    # ... código existente ...
    
    # Validar permisos de checklist si se está modificando
    if 'checklist' in data:
        old_checklist = task.checklist or []
        new_checklist = data['checklist']
        
        if not validate_checklist_modification(task, user, old_checklist, new_checklist):
            raise PermissionError('Solo el Owner puede modificar la estructura del checklist')
    
    # ... resto del código ...
```

## Diseño de Frontend

### Tipos TypeScript

**Archivo:** `project-management-frontend/types/task.ts` (o donde estén definidos)

**Nuevo tipo:**
```typescript
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  // ... campos existentes ...
  checklist?: ChecklistItem[];
}
```

### Mappers de Datos

**Archivo:** `project-management-frontend/lib/mappers.ts`

**Actualización de mapTaskFromBackend:**
```typescript
export function mapTaskFromBackend(backendTask: any): Task {
  return {
    // ... campos existentes ...
    checklist: backendTask.checklist || []
  };
}
```

**Actualización de mapTaskToBackend:**
```typescript
export function mapTaskToBackend(task: Partial<Task>): any {
  return {
    // ... campos existentes ...
    checklist: task.checklist || []
  };
}
```

### Servicio de Tareas

**Archivo:** `project-management-frontend/services/taskService.ts`

**No se requieren cambios**, ya que los métodos existentes (`createTask`, `updateTask`, `getTask`) ya manejan todos los campos del objeto Task, incluyendo el nuevo campo checklist.

### Componente: Formulario de Creación de Tarea

**Archivo:** `project-management-frontend/app/app/tasks/page.tsx`

**Estado local nuevo:**
```typescript
const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
const [checklistInput, setChecklistInput] = useState('');
```

**Funciones helper:**
```typescript
const addChecklistItem = () => {
  if (checklistInput.trim()) {
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: checklistInput.trim(),
      completed: false
    };
    setChecklistItems([...checklistItems, newItem]);
    setChecklistInput('');
  }
};

const removeChecklistItem = (id: string) => {
  setChecklistItems(checklistItems.filter(item => item.id !== id));
};
```

**UI del checklist en el formulario:**
```tsx
<div className="space-y-2">
  <Label>Checklist (opcional)</Label>
  <div className="flex gap-2">
    <Input
      value={checklistInput}
      onChange={(e) => setChecklistInput(e.target.value)}
      placeholder="Agregar item..."
      onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
    />
    <Button type="button" onClick={addChecklistItem}>
      Agregar
    </Button>
  </div>
  {checklistItems.length > 0 && (
    <ul className="space-y-1">
      {checklistItems.map(item => (
        <li key={item.id} className="flex items-center justify-between">
          <span>{item.text}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeChecklistItem(item.id)}
          >
            ×
          </Button>
        </li>
      ))}
    </ul>
  )}
</div>
```

**Actualización del submit:**
```typescript
const handleSubmit = async (formData) => {
  const taskData = {
    // ... campos existentes ...
    checklist: checklistItems
  };
  
  await taskService.createTask(projectId, taskData);
  // ... resto del código ...
};
```

### Componente: Página de Detalle de Tarea

**Archivo:** `project-management-frontend/app/app/tasks/[id]/page.tsx`

**Estado local para checklist:**
```typescript
const [isEditingChecklist, setIsEditingChecklist] = useState(false);
const [checklistInput, setChecklistInput] = useState('');
```

**Función para toggle de item:**
```typescript
const toggleChecklistItem = async (itemId: string) => {
  const updatedChecklist = task.checklist.map(item =>
    item.id === itemId ? { ...item, completed: !item.completed } : item
  );
  
  // Optimistic update
  setTask({ ...task, checklist: updatedChecklist });
  
  try {
    await taskService.updateTask(projectId, taskId, { checklist: updatedChecklist });
    toast.success('Checklist actualizado');
  } catch (error) {
    // Rollback
    setTask(task);
    toast.error('Error al actualizar checklist');
  }
};
```

**Función para agregar item (solo Owner):**
```typescript
const addChecklistItem = async () => {
  if (!checklistInput.trim()) return;
  
  const newItem: ChecklistItem = {
    id: crypto.randomUUID(),
    text: checklistInput.trim(),
    completed: false
  };
  
  const updatedChecklist = [...(task.checklist || []), newItem];
  
  try {
    await taskService.updateTask(projectId, taskId, { checklist: updatedChecklist });
    setTask({ ...task, checklist: updatedChecklist });
    setChecklistInput('');
    toast.success('Item agregado');
  } catch (error) {
    toast.error('Error al agregar item');
  }
};
```

**Función para eliminar item (solo Owner):**
```typescript
const removeChecklistItem = async (itemId: string) => {
  const updatedChecklist = task.checklist.filter(item => item.id !== itemId);
  
  try {
    await taskService.updateTask(projectId, taskId, { checklist: updatedChecklist });
    setTask({ ...task, checklist: updatedChecklist });
    toast.success('Item eliminado');
  } catch (error) {
    toast.error('Error al eliminar item');
  }
};
```

**UI del checklist:**
```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold">Checklist</h3>
    {isOwner && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditingChecklist(!isEditingChecklist)}
      >
        {isEditingChecklist ? 'Cancelar' : 'Editar'}
      </Button>
    )}
  </div>
  
  {isOwner && isEditingChecklist && (
    <div className="flex gap-2">
      <Input
        value={checklistInput}
        onChange={(e) => setChecklistInput(e.target.value)}
        placeholder="Nuevo item..."
        onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
      />
      <Button onClick={addChecklistItem}>Agregar</Button>
    </div>
  )}
  
  <ul className="space-y-2">
    {task.checklist?.map(item => (
      <li key={item.id} className="flex items-center gap-2">
        <Checkbox
          checked={item.completed}
          onCheckedChange={() => toggleChecklistItem(item.id)}
        />
        <span className={item.completed ? 'line-through text-gray-500' : ''}>
          {item.text}
        </span>
        {isOwner && isEditingChecklist && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeChecklistItem(item.id)}
          >
            ×
          </Button>
        )}
      </li>
    ))}
  </ul>
  
  {(!task.checklist || task.checklist.length === 0) && (
    <p className="text-gray-500 text-sm">No hay items en el checklist</p>
  )}
</div>
```

### Componente: Página del Board

**Archivo:** `project-management-frontend/app/app/board/page.tsx`

**No se requieren cambios visuales**, pero el checklist se cargará automáticamente con los datos de la tarea cuando se llame a `taskService.fetchTasks()`.

**Opcional:** Mostrar indicador de progreso del checklist en las tarjetas:
```tsx
{task.checklist && task.checklist.length > 0 && (
  <div className="text-xs text-gray-500">
    ✓ {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
  </div>
)}
```

## Manejo de Errores

### Errores de Backend

**Códigos de error esperados:**

1. **400 Bad Request:**
   - Checklist item sin ID
   - Checklist item con text vacío
   - Más de 50 items en checklist
   - Text de item mayor a 500 caracteres

2. **403 Forbidden:**
   - Employee intenta agregar/eliminar/editar items
   - Usuario sin permisos en el proyecto

3. **404 Not Found:**
   - Tarea no existe

**Mensajes de error:**
```python
{
  "success": false,
  "error": {
    "code": "CHECKLIST_PERMISSION_DENIED",
    "message": "Solo el Owner puede modificar la estructura del checklist"
  }
}
```

### Manejo en Frontend

**Estrategia:**
1. Mostrar toast con mensaje de error
2. Realizar rollback de cambios optimistas
3. Registrar error en consola para debugging

**Ejemplo:**
```typescript
try {
  await taskService.updateTask(projectId, taskId, { checklist: updatedChecklist });
} catch (error) {
  if (error.response?.status === 403) {
    toast.error('No tienes permisos para modificar el checklist');
  } else if (error.response?.status === 400) {
    toast.error(error.response.data.error.message);
  } else {
    toast.error('Error al actualizar checklist');
  }
  // Rollback
  setTask(originalTask);
}
```

## Flujos de Datos Detallados

### Flujo 1: Crear Tarea con Checklist

```
1. Usuario completa formulario y agrega items al checklist
2. Usuario hace clic en "Crear Tarea"
3. Frontend valida datos localmente
4. Frontend llama taskService.createTask() con checklist
5. API valida datos con TaskCreateSchema
6. API crea registro en base de datos con campo checklist
7. API retorna tarea creada con ID
8. Frontend muestra toast de éxito
9. Frontend navega a página de detalle de tarea
```

### Flujo 2: Toggle Checklist Item (Employee)

```
1. Employee hace clic en checkbox de item
2. Frontend aplica optimistic update (marca como completado)
3. Frontend llama taskService.updateTask() con checklist actualizado
4. Backend valida que solo cambió el campo 'completed'
5. Backend actualiza registro en base de datos
6. Backend retorna tarea actualizada
7. Frontend confirma cambio con toast
```

### Flujo 3: Agregar Checklist Item (Owner)

```
1. Owner hace clic en "Editar" en sección de checklist
2. Owner escribe texto y hace clic en "Agregar"
3. Frontend genera UUID para nuevo item
4. Frontend llama taskService.updateTask() con checklist actualizado
5. Backend valida que usuario es Owner
6. Backend valida estructura del nuevo item
7. Backend actualiza registro en base de datos
8. Backend retorna tarea actualizada
9. Frontend muestra toast de éxito
10. Frontend limpia input de texto
```

### Flujo 4: Eliminar Checklist Item (Owner)

```
1. Owner hace clic en botón "×" junto a item
2. Frontend llama taskService.updateTask() con checklist sin el item
3. Backend valida que usuario es Owner
4. Backend actualiza registro en base de datos
5. Backend retorna tarea actualizada
6. Frontend muestra toast de éxito
```

### Flujo 5: Employee Intenta Modificar Estructura

```
1. Employee intenta agregar/eliminar item (UI no debería permitirlo)
2. Si logra hacer la llamada API, Backend valida permisos
3. Backend detecta cambio en estructura (no solo 'completed')
4. Backend retorna 403 Forbidden
5. Frontend muestra toast: "Solo el Owner puede modificar el checklist"
6. Frontend realiza rollback si hubo optimistic update
```

## Propiedades de Correctness

### Propiedad 1: Round-Trip de Checklist

**Descripción:** Para cualquier tarea con checklist válido, crear y luego recuperar la tarea debe retornar el mismo checklist.

**Test:**
```python
def test_checklist_round_trip(client, auth_headers, project_id):
    # Crear tarea con checklist
    checklist = [
        {"id": str(uuid.uuid4()), "text": "Item 1", "completed": False},
        {"id": str(uuid.uuid4()), "text": "Item 2", "completed": True}
    ]
    
    response = client.post(
        f'/api/projects/{project_id}/tasks',
        json={'title': 'Test', 'due_date': '2025-12-31', 'checklist': checklist},
        headers=auth_headers
    )
    task_id = response.json['data']['id']
    
    # Recuperar tarea
    response = client.get(
        f'/api/projects/{project_id}/tasks/{task_id}',
        headers=auth_headers
    )
    
    assert response.json['data']['checklist'] == checklist
```

### Propiedad 2: Invariante de Longitud

**Descripción:** Después de toggle de completed, la longitud del checklist debe permanecer igual.

**Test:**
```typescript
test('toggle preserves checklist length', async () => {
  const originalLength = task.checklist.length;
  await toggleChecklistItem(task.checklist[0].id);
  expect(task.checklist.length).toBe(originalLength);
});
```

### Propiedad 3: Idempotencia de Toggle

**Descripción:** Toggle dos veces debe retornar al estado original.

**Test:**
```typescript
test('double toggle returns to original state', async () => {
  const originalState = task.checklist[0].completed;
  await toggleChecklistItem(task.checklist[0].id);
  await toggleChecklistItem(task.checklist[0].id);
  expect(task.checklist[0].completed).toBe(originalState);
});
```

### Propiedad 4: Permisos de Employee

**Descripción:** Employee solo puede modificar campo 'completed', no estructura.

**Test:**
```python
def test_employee_cannot_add_checklist_item(client, employee_headers, project_id, task_id):
    response = client.put(
        f'/api/projects/{project_id}/tasks/{task_id}',
        json={'checklist': [{"id": str(uuid.uuid4()), "text": "New", "completed": False}]},
        headers=employee_headers
    )
    
    assert response.status_code == 403
```

## Consideraciones de Rendimiento

### Base de Datos

- **Índices:** No se requieren índices adicionales para el campo JSON
- **Tamaño:** Límite de 50 items × 500 caracteres = ~25KB máximo por tarea
- **Queries:** El campo checklist se carga automáticamente con la tarea, sin queries adicionales

### Frontend

- **Optimistic Updates:** Mejoran la percepción de velocidad
- **Debouncing:** No necesario para toggle (operación rápida)
- **Memoization:** Considerar useMemo para lista de checklist si hay muchos items

## Plan de Testing

### Tests de Backend

1. **Test de migración:** Verificar que la columna se agrega correctamente
2. **Test de validación:** Checklist con datos inválidos debe fallar
3. **Test de permisos:** Employee no puede modificar estructura
4. **Test de round-trip:** Crear y recuperar tarea con checklist
5. **Test de límites:** Más de 50 items debe fallar

### Tests de Frontend

1. **Test de formulario:** Agregar y eliminar items en formulario de creación
2. **Test de toggle:** Toggle cambia estado de completed
3. **Test de permisos:** UI oculta controles de edición para Employee
4. **Test de rollback:** Error en API revierte cambios optimistas
5. **Test de validación:** Input vacío no agrega item

### Tests de Integración

1. **Test E2E:** Owner crea tarea con checklist y Employee la ve
2. **Test E2E:** Employee puede toggle items pero no agregar/eliminar
3. **Test E2E:** Checklist persiste después de recargar página

## Cronograma de Implementación

### Fase 1: Backend (Estimado: 2-3 horas)

1. Crear migración de base de datos
2. Actualizar modelo Task
3. Crear ChecklistItemSchema
4. Actualizar TaskCreateSchema y TaskUpdateSchema
5. Implementar validación de permisos en task_service.py
6. Ejecutar tests de backend

### Fase 2: Frontend - Tipos y Mappers (Estimado: 1 hora)

1. Definir tipos TypeScript
2. Actualizar mappers
3. Verificar que taskService funciona sin cambios

### Fase 3: Frontend - Formulario de Creación (Estimado: 2 horas)

1. Agregar estado local para checklist
2. Implementar UI de checklist
3. Actualizar función de submit
4. Tests unitarios

### Fase 4: Frontend - Página de Detalle (Estimado: 3 horas)

1. Implementar toggle de items
2. Implementar agregar/eliminar items (Owner)
3. Implementar lógica de permisos en UI
4. Agregar manejo de errores
5. Tests unitarios

### Fase 5: Testing e Integración (Estimado: 2 horas)

1. Tests E2E con Playwright
2. Verificar flujos completos
3. Ajustes de UI/UX
4. Documentación

**Total estimado: 10-11 horas**

## Notas de Implementación

### Consideraciones de Seguridad

- Validar siempre permisos en backend, no confiar en frontend
- Sanitizar texto de checklist items para prevenir XSS
- Limitar tamaño de checklist para prevenir ataques de denegación de servicio

### Consideraciones de UX

- Mostrar indicador de carga durante operaciones de checklist
- Usar optimistic updates para mejor percepción de velocidad
- Mostrar mensajes claros cuando Employee intenta modificar estructura
- Considerar agregar confirmación antes de eliminar items

### Mejoras Futuras

1. **Reordenamiento:** Drag and drop para reordenar items
2. **Edición inline:** Editar texto de item sin eliminar y recrear
3. **Subtareas:** Convertir checklist items en subtareas completas
4. **Progreso visual:** Barra de progreso mostrando % completado
5. **Filtros:** Filtrar tareas por progreso de checklist en el board

