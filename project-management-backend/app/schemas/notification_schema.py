from marshmallow import Schema, fields, validate


class NotificationSchema(Schema):
    """Schema para serializar notificaciones"""
    id = fields.Str(dump_only=True)
    user_id = fields.Str(dump_only=True)
    project_id = fields.Str(dump_only=True)
    type = fields.Str(dump_only=True)
    message = fields.Str(dump_only=True)
    read = fields.Bool(dump_only=True)
    entity_type = fields.Str(dump_only=True)
    entity_id = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    read_at = fields.DateTime(dump_only=True)


class NotificationUpdateSchema(Schema):
    """Schema para actualizar notificación (marcar como leída)"""
    read = fields.Bool(required=True)
