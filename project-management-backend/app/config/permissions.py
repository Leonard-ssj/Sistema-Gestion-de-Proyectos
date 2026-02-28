"""
Sistema de Permisos Centralizado
Define los permisos por rol y por recurso
"""

# Permisos por Rol
# Formato: 'recurso:accion'
# Wildcard: 'recurso:*' = todas las acciones del recurso
# Wildcard total: '*:*' = todos los permisos

ROLE_PERMISSIONS = {
    'SUPERADMIN': [
        '*:*',  # Acceso total a todo
    ],
    
    'OWNER': [
        # Proyectos
        'project:create',
        'project:read',
        'project:update',
        'project:delete',
        'project:list',
        
        # Tareas
        'task:create',
        'task:read',
        'task:update',
        'task:delete',
        'task:assign',
        'task:list',
        
        # Miembros
        'member:add',
        'member:remove',
        'member:list',
        'member:update_role',
        
        # Invitaciones
        'invite:create',
        'invite:cancel',
        'invite:list',
        
        # Comentarios
        'comment:create',
        'comment:read',
        'comment:update_own',
        'comment:delete',  # Puede eliminar cualquier comentario
        'comment:list',
        
        # Notificaciones
        'notification:read',
        'notification:mark_read',
        'notification:delete',
        
        # Audit Logs
        'audit:read',
        'audit:list',
    ],
    
    'EMPLOYEE': [
        # Tareas (limitado)
        'task:read',           # Solo tareas asignadas
        'task:update_status',  # Solo cambiar estado de sus tareas
        'task:list',           # Solo sus tareas
        
        # Comentarios
        'comment:create',
        'comment:read',
        'comment:update_own',  # Solo sus comentarios
        'comment:delete_own',  # Solo sus comentarios
        'comment:list',
        
        # Notificaciones
        'notification:read',
        'notification:mark_read',
        'notification:delete',
        'notification:list',
    ]
}


# Permisos por Recurso
# Define qué roles pueden realizar qué acciones en cada recurso
# Valores especiales:
# - 'OWNER_OF_RESOURCE': El usuario debe ser el dueño del recurso
# - 'EMPLOYEE_OF_RESOURCE': El usuario debe tener acceso al recurso

RESOURCE_PERMISSIONS = {
    'project': {
        'create': ['SUPERADMIN', 'OWNER'],
        'read': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],
        'update': ['SUPERADMIN', 'OWNER'],
        'delete': ['SUPERADMIN'],
        'list': ['SUPERADMIN', 'OWNER'],
    },
    
    'task': {
        'create': ['SUPERADMIN', 'OWNER'],
        'read': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],  # Employee solo sus tareas
        'update': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],  # Employee solo estado
        'delete': ['SUPERADMIN', 'OWNER'],
        'assign': ['SUPERADMIN', 'OWNER'],
        'list': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],
    },
    
    'comment': {
        'create': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],
        'read': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],
        'update': ['SUPERADMIN', 'OWNER', 'OWNER_OF_RESOURCE', 'EMPLOYEE_OF_RESOURCE'],
        'delete': ['SUPERADMIN', 'OWNER', 'OWNER_OF_RESOURCE'],
        'list': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],
    },
    
    'member': {
        'add': ['SUPERADMIN', 'OWNER'],
        'remove': ['SUPERADMIN', 'OWNER'],
        'list': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],
        'update_role': ['SUPERADMIN', 'OWNER'],
    },
    
    'invite': {
        'create': ['SUPERADMIN', 'OWNER'],
        'cancel': ['SUPERADMIN', 'OWNER'],
        'list': ['SUPERADMIN', 'OWNER'],
        'accept': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],
    },
    
    'notification': {
        'read': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],
        'mark_read': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],
        'delete': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],
        'list': ['SUPERADMIN', 'OWNER', 'EMPLOYEE'],
    },
    
    'audit': {
        'read': ['SUPERADMIN', 'OWNER'],
        'list': ['SUPERADMIN', 'OWNER'],
    }
}


# Jerarquía de Roles (de mayor a menor privilegio)
ROLE_HIERARCHY = ['SUPERADMIN', 'OWNER', 'EMPLOYEE']


def get_role_level(role):
    """
    Obtiene el nivel jerárquico de un rol
    
    Args:
        role: Nombre del rol
    
    Returns:
        int: Nivel del rol (0 = más alto, 2 = más bajo)
    """
    try:
        return ROLE_HIERARCHY.index(role)
    except ValueError:
        return len(ROLE_HIERARCHY)  # Rol desconocido = nivel más bajo
