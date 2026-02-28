from marshmallow import Schema, fields, validate


class ProjectCreateSchema(Schema):
    """Schema para crear proyecto"""
    name = fields.Str(required=True, validate=validate.Length(min=3, max=255), error_messages={
        'required': 'El nombre del proyecto es requerido',
        'invalid': 'El nombre debe tener entre 3 y 255 caracteres'
    })
    description = fields.Str(required=False, allow_none=True, validate=validate.Length(max=5000))
    category = fields.Str(required=False, allow_none=True, validate=validate.Length(max=100))


class ProjectUpdateSchema(Schema):
    """Schema para actualizar proyecto"""
    name = fields.Str(required=False, validate=validate.Length(min=3, max=255))
    description = fields.Str(required=False, allow_none=True, validate=validate.Length(max=5000))
    category = fields.Str(required=False, allow_none=True, validate=validate.Length(max=100))
    status = fields.Str(required=False, validate=validate.OneOf(['active', 'disabled']))


class ProjectSchema(Schema):
    """Schema para serializar proyecto (respuesta)"""
    id = fields.Str(dump_only=True)
    name = fields.Str(dump_only=True)
    description = fields.Str(dump_only=True, allow_none=True)
    category = fields.Str(dump_only=True, allow_none=True)
    owner_id = fields.Str(dump_only=True)
    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True, allow_none=True)


class ProjectWithStatsSchema(ProjectSchema):
    """Schema para proyecto con estadísticas"""
    total_members = fields.Int(dump_only=True)
    active_members = fields.Int(dump_only=True)
    total_tasks = fields.Int(dump_only=True)
    pending_invites = fields.Int(dump_only=True)
