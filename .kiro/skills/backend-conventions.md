# Backend Conventions - ProGest

Convenciones de codigo para el backend Flask de ProGest.

## Arquitectura en Capas

Toda funcionalidad sigue esta estructura:

```
Request → Route → Service → Model → Database
         ↓         ↓         ↓
      Validacion  Logica   Datos
```

### 1. Routes (app/routes/)
- Reciben el request HTTP
- Validan JWT y permisos
- Llaman al service correspondiente
- Retornan respuesta JSON

### 2. Services (app/services/)
- Contienen la logica de negocio
- No conocen detalles de HTTP
- Retornan datos, no responses

### 3. Models (app/models/)
- Definen estructura de datos
- Metodos de acceso a BD
- Relaciones entre entidades

## Formato de Respuestas JSON

SIEMPRE usar este formato estandar:

```python
# Exito
return jsonify({
    'success': True,
    'data': resultado
}), 200

# Error
return jsonify({
    'success': False,
    'error': {
        'code': 'ERROR_CODE',
        'message': 'Descripcion del error'
    }
}), codigo_http
```

## Decoradores Obligatorios

Todos los endpoints protegidos DEBEN usar:

```python
from flask_jwt_extended import jwt_required
from app.utils.decorators import require_project_access

@tasks_bp.route('/api/tasks', methods=['GET'])
@jwt_required()                    # Valida JWT
@require_project_access()          # Valida acceso al proyecto
def list_tasks():
    pass
```

## Validacion con Marshmallow

Usar schemas para validar datos de entrada:

```python
from app.schemas.task_schema import TaskSchema

schema = TaskSchema()
try:
    data = schema.load(request.get_json())
except ValidationError as e:
    return jsonify({
        'success': False,
        'error': {
            'code': 'VALIDATION_ERROR',
            'message': 'Datos invalidos',
            'details': e.messages
        }
    }), 400
```

## Manejo de Errores

Siempre usar try-except para operaciones de BD:

```python
try:
    task = Task.query.get(task_id)
    if not task:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NOT_FOUND',
                'message': 'Tarea no encontrada'
            }
        }), 404
    
    # Operacion exitosa
    return jsonify({'success': True, 'task': task.to_dict()}), 200
    
except Exception as e:
    db.session.rollback()
    return jsonify({
        'success': False,
        'error': {
            'code': 'INTERNAL_ERROR',
            'message': str(e)
        }
    }), 500
```

## Estructura de Archivos

Al crear nueva funcionalidad:

```
app/
├── models/
│   └── nueva_entidad.py          # 1. Crear modelo
├── schemas/
│   └── nueva_entidad_schema.py   # 2. Crear schema
├── services/
│   └── nueva_entidad_service.py  # 3. Crear service
└── routes/
    └── nueva_entidad.py          # 4. Crear routes
```

## Importaciones

Orden de importaciones:

```python
# 1. Librerias estandar de Python
import os
from datetime import datetime

# 2. Librerias de terceros
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

# 3. Imports del proyecto
from app import db
from app.models import Task, User
from app.schemas.task_schema import TaskSchema
from app.utils.decorators import require_project_access
```

## Nombres de Variables

- **Rutas**: `nombre_bp` (ej: `tasks_bp`, `auth_bp`)
- **Funciones**: `snake_case` (ej: `get_task`, `create_project`)
- **Clases**: `PascalCase` (ej: `Task`, `User`, `TaskSchema`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `MAX_TASKS`, `DEFAULT_STATUS`)

## Commits de Cambios Backend

Cuando modifiques backend, actualizar:

1. Modelo si cambias estructura de datos
2. Schema si cambias validacion
3. Service si cambias logica
4. Route si cambias endpoint
5. Crear migracion si cambias modelo
6. Actualizar documentacion API
7. Actualizar coleccion Postman

## Ejemplo Completo

```python
# app/routes/tasks.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.task_service import create_task, get_tasks
from app.schemas.task_schema import TaskSchema
from app.utils.decorators import require_project_access

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/api/tasks', methods=['POST'])
@jwt_required()
@require_project_access()
def create_task_endpoint():
    """Crear nueva tarea"""
    try:
        # Validar datos
        schema = TaskSchema()
        data = schema.load(request.get_json())
        
        # Obtener usuario actual
        current_user_id = get_jwt_identity()
        
        # Llamar al service
        task = create_task(data, current_user_id)
        
        # Retornar respuesta
        return jsonify({
            'success': True,
            'task': task.to_dict()
        }), 201
        
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Datos invalidos',
                'details': e.messages
            }
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': str(e)
            }
        }), 500
```

## Recordatorios Importantes

- NUNCA exponer informacion sensible en errores
- SIEMPRE validar permisos antes de operaciones
- SIEMPRE filtrar por project_id (multitenancy)
- SIEMPRE usar transacciones para operaciones multiples
- SIEMPRE hacer rollback en caso de error
