"""
Script de verificación para Fase 4.1 y 4.2
Verifica que todos los módulos se importen correctamente
"""

print("=" * 60)
print("Verificación de Fase 4.1 y 4.2")
print("=" * 60)

# Verificar importaciones de servicios
print("\n1. Verificando servicios...")
try:
    from app.services.notification_service import NotificationService
    print("   ✅ NotificationService importado correctamente")
except Exception as e:
    print(f"   ❌ Error al importar NotificationService: {e}")

try:
    from app.services.comment_service import CommentService
    print("   ✅ CommentService importado correctamente")
except Exception as e:
    print(f"   ❌ Error al importar CommentService: {e}")

# Verificar importaciones de rutas
print("\n2. Verificando rutas...")
try:
    from app.routes.notifications import notifications_bp
    print("   ✅ notifications_bp importado correctamente")
except Exception as e:
    print(f"   ❌ Error al importar notifications_bp: {e}")

try:
    from app.routes.comments import comments_bp
    print("   ✅ comments_bp importado correctamente")
except Exception as e:
    print(f"   ❌ Error al importar comments_bp: {e}")

# Verificar importaciones de schemas
print("\n3. Verificando schemas...")
try:
    from app.schemas.notification_schema import NotificationSchema
    print("   ✅ NotificationSchema importado correctamente")
except Exception as e:
    print(f"   ❌ Error al importar NotificationSchema: {e}")

try:
    from app.schemas.comment_schema import CommentCreateSchema, CommentSchema
    print("   ✅ CommentSchema importado correctamente")
except Exception as e:
    print(f"   ❌ Error al importar CommentSchema: {e}")

# Verificar modelos
print("\n4. Verificando modelos...")
try:
    from app.models.notification import Notification
    print("   ✅ Notification model importado correctamente")
except Exception as e:
    print(f"   ❌ Error al importar Notification: {e}")

try:
    from app.models.comment import Comment
    print("   ✅ Comment model importado correctamente")
except Exception as e:
    print(f"   ❌ Error al importar Comment: {e}")

# Verificar métodos de servicios
print("\n5. Verificando métodos de servicios...")
try:
    methods = [
        'get_user_notifications',
        'get_unread_count',
        'mark_as_read',
        'mark_all_as_read',
        'delete_notification'
    ]
    for method in methods:
        if hasattr(NotificationService, method):
            print(f"   ✅ NotificationService.{method} existe")
        else:
            print(f"   ❌ NotificationService.{method} NO existe")
except Exception as e:
    print(f"   ❌ Error al verificar NotificationService: {e}")

try:
    methods = [
        'get_task_comments',
        'create_comment',
        'update_comment',
        'delete_comment',
        'can_user_access_task'
    ]
    for method in methods:
        if hasattr(CommentService, method):
            print(f"   ✅ CommentService.{method} existe")
        else:
            print(f"   ❌ CommentService.{method} NO existe")
except Exception as e:
    print(f"   ❌ Error al verificar CommentService: {e}")

print("\n" + "=" * 60)
print("Verificación completada")
print("=" * 60)
print("\nSi todos los checks son ✅, el backend está listo para iniciar.")
print("Para iniciar el backend, ejecuta: python app.py")
print("=" * 60)
