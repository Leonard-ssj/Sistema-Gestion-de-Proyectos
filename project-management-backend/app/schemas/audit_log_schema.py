from marshmallow import Schema, fields


class AuditLogSchema(Schema):
    """Schema para serializar log de auditoría (respuesta)"""
    id = fields.Str(dump_only=True)
    user_id = fields.Str(dump_only=True)
    project_id = fields.Str(dump_only=True)
    action = fields.Str(dump_only=True)
    entity_type = fields.Str(dump_only=True)
    entity_id = fields.Str(dump_only=True)
    details = fields.Str(dump_only=True, allow_none=True)
    ip_address = fields.Str(dump_only=True, allow_none=True)
    user_agent = fields.Str(dump_only=True, allow_none=True)
    created_at = fields.DateTime(dump_only=True)


class AuditLogWithUserSchema(AuditLogSchema):
    """Schema para log de auditoría con información del usuario"""
    user_name = fields.Str(dump_only=True)
    user_email = fields.Str(dump_only=True)
