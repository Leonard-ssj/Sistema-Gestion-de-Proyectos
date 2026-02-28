# Security & Multitenancy - ProGest

CRITICO: ProGest es un sistema multitenant. Un error aqui puede exponer datos de un proyecto a otro.

## Regla de Oro del Multitenancy

**SIEMPRE filtrar por project_id en TODAS las queries**

## Aislamiento de Datos

Cada proyecto esta completamente aislado:

```python
# ❌ PELIGRO - Sin filtro de project_id
tasks = Task.query.filter_by(status='pending').all()
# Esto retorna tareas de TODOS los proyectos

# ✅ CORRECTO - Con filtro de project_id
tasks = Task.query.filter_by(
    project_id=current_user.project_id,
    status='pending'
).all()
```

## Validacion de Acceso

Antes de cualquier operacion, verificar:

1. Usuario esta autenticado (JWT valido)
2. Usuario pertenece a un proyecto
3. Recurso pertenece al proyecto del usuario

```python
@jwt_required()
@require_project_access()
def get_task(task_id):
    current_user = get_current_user()
    
    # Obtener tarea CON filtro de project_id
    task = Task.query.filter_by(
        id=task_id,
        project_id=current_user.project_id  # CRITICO
    ).first()
    
    if not task:
        return error_response('NOT_FOUND', 'Tarea no encontrada'), 404
    
    return success_response(task.to_dict())
```

## Sistema de Permisos

ProGest tiene 3 roles:

### SUPERADMIN
- Acceso a TODOS los proyectos
- Panel de administracion
- Gestion de usuarios y proyectos globales

### OWNER
- Dueño del proyecto
- Puede crear/editar/eliminar tareas
- Puede invitar empleados
- Puede desactivar miembros
- Acceso completo a su proyecto

### EMPLOYEE
- Miembro del proyecto
- Puede ver tareas
- Puede actualizar tareas asignadas
- Puede comentar
- NO puede eliminar tareas
- NO puede invitar otros empleados

## Decorador de Permisos

Usar decoradores para validar permisos:

```python
from app.utils.decorators import require_role

@tasks_bp.route('/api/tasks', methods=['POST'])
@jwt_required()
@require_role(['OWNER'])  # Solo OWNER puede crear tareas
def create_task():
    pass

@tasks_bp.route('/api/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
@require_role(['OWNER', 'SUPERADMIN'])  # Solo OWNER o SUPERADMIN
def delete_task(task_id):
    pass
```

## Queries Seguras

### Listar Recursos

```python
# SIEMPRE incluir project_id
def get_all_tasks(project_id, filters=None):
    query = Task.query.filter_by(project_id=project_id)
    
    if filters:
        if 'status' in filters:
            query = query.filter_by(status=filters['status'])
        if 'assigned_to' in filters:
            query = query.filter_by(assigned_to=filters['assigned_to'])
    
    return query.all()
```

### Obtener Recurso Individual

```python
def get_task_by_id(task_id, project_id):
    task = Task.query.filter_by(
        id=task_id,
        project_id=project_id  # NUNCA olvidar esto
    ).first()
    
    if not task:
        raise NotFoundError('Tarea no encontrada')
    
    return task
```

### Actualizar Recurso

```python
def update_task(task_id, project_id, data):
    # Verificar que la tarea pertenece al proyecto
    task = Task.query.filter_by(
        id=task_id,
        project_id=project_id
    ).first()
    
    if not task:
        raise NotFoundError('Tarea no encontrada')
    
    # Actualizar
    for key, value in data.items():
        setattr(task, key, value)
    
    db.session.commit()
    return task
```

### Eliminar Recurso

```python
def delete_task(task_id, project_id):
    task = Task.query.filter_by(
        id=task_id,
        project_id=project_id
    ).first()
    
    if not task:
        raise NotFoundError('Tarea no encontrada')
    
    db.session.delete(task)
    db.session.commit()
```

## Relaciones Entre Entidades

Al acceder a relaciones, verificar project_id:

```python
# Obtener comentarios de una tarea
def get_task_comments(task_id, project_id):
    # Primero verificar que la tarea pertenece al proyecto
    task = Task.query.filter_by(
        id=task_id,
        project_id=project_id
    ).first()
    
    if not task:
        raise NotFoundError('Tarea no encontrada')
    
    # Ahora si, obtener comentarios
    return task.comments
```

## Validacion de Asignaciones

Al asignar recursos, verificar que el usuario pertenece al proyecto:

```python
def assign_task(task_id, user_id, project_id):
    # Verificar tarea
    task = Task.query.filter_by(
        id=task_id,
        project_id=project_id
    ).first()
    
    if not task:
        raise NotFoundError('Tarea no encontrada')
    
    # Verificar que el usuario pertenece al proyecto
    membership = Membership.query.filter_by(
        user_id=user_id,
        project_id=project_id,
        status='active'
    ).first()
    
    if not membership:
        raise ForbiddenError('Usuario no pertenece al proyecto')
    
    # Asignar
    task.assigned_to = user_id
    db.session.commit()
    return task
```

## Seguridad en Respuestas

NUNCA exponer IDs de otros proyectos:

```python
# ❌ MAL - Expone project_id
return jsonify({
    'task': {
        'id': task.id,
        'project_id': task.project_id,  # NO exponer
        'title': task.title
    }
})

# ✅ BIEN - No expone project_id
return jsonify({
    'task': {
        'id': task.id,
        'title': task.title,
        'status': task.status
    }
})
```

## Auditoria

Registrar operaciones criticas en audit_logs:

```python
from app.models import AuditLog

def create_audit_log(user_id, action, entity_type, entity_id, details=None):
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

# Usar en operaciones importantes
def delete_task(task_id, project_id, current_user_id):
    task = get_task_by_id(task_id, project_id)
    
    # Registrar antes de eliminar
    create_audit_log(
        user_id=current_user_id,
        action='task_deleted',
        entity_type='task',
        entity_id=task_id,
        details={'title': task.title}
    )
    
    db.session.delete(task)
    db.session.commit()
```

## Checklist de Seguridad

Antes de hacer commit, verificar:

- [ ] Todas las queries filtran por project_id
- [ ] Permisos validados con decoradores
- [ ] No se exponen IDs de otros proyectos
- [ ] Asignaciones validan membership
- [ ] Operaciones criticas se auditan
- [ ] Errores no exponen informacion sensible
- [ ] Passwords hasheados con bcrypt
- [ ] Tokens JWT validados
- [ ] CORS configurado correctamente

## Casos Especiales

### SUPERADMIN

Solo SUPERADMIN puede acceder sin filtro de project_id:

```python
def get_all_projects_admin(current_user):
    if current_user.role != 'SUPERADMIN':
        raise ForbiddenError('Acceso denegado')
    
    # SUPERADMIN puede ver todos los proyectos
    return Project.query.all()
```

### Invitaciones

Las invitaciones usan tokens, validar que el token es valido:

```python
def validate_invite_token(token):
    invite = Invite.query.filter_by(
        token=token,
        status='pending'
    ).first()
    
    if not invite:
        raise NotFoundError('Invitacion no encontrada')
    
    if invite.expires_at < datetime.utcnow():
        raise ForbiddenError('Invitacion expirada')
    
    return invite
```

## Recordatorios CRITICOS

1. **NUNCA** hacer queries sin project_id (excepto SUPERADMIN)
2. **SIEMPRE** validar que el recurso pertenece al proyecto
3. **SIEMPRE** validar permisos antes de operaciones
4. **NUNCA** exponer project_id en respuestas
5. **SIEMPRE** auditar operaciones criticas
