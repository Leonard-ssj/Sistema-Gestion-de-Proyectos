from marshmallow import Schema, fields, validate


class InviteCreateSchema(Schema):
    """Schema para crear invitación con datos enriquecidos"""
    email = fields.Email(required=True, error_messages={
        'required': 'El email es requerido',
        'invalid': 'Email inválido'
    })
    # Employee enrichment fields (optional)
    job_title = fields.Str(required=False, validate=validate.Length(max=100), allow_none=True)
    description = fields.Str(required=False, validate=validate.Length(max=500), allow_none=True)
    responsibilities = fields.Str(required=False, validate=validate.Length(max=1000), allow_none=True)
    skills = fields.Str(required=False, validate=validate.Length(max=500), allow_none=True)
    shift = fields.Str(required=False, validate=validate.OneOf(['morning', 'afternoon', 'night', 'flexible']), allow_none=True)
    department = fields.Str(required=False, validate=validate.Length(max=100), allow_none=True)
    phone = fields.Str(required=False, validate=validate.Length(max=20), allow_none=True)


class InviteSchema(Schema):
    """Schema para serializar invitación (respuesta)"""
    id = fields.Str(dump_only=True)
    project_id = fields.Str(dump_only=True)
    email = fields.Str(dump_only=True)
    token = fields.Str(dump_only=True)
    status = fields.Str(dump_only=True)
    invited_by = fields.Str(dump_only=True)
    resend_count = fields.Int(dump_only=True)
    job_title = fields.Str(dump_only=True, allow_none=True)
    description = fields.Str(dump_only=True, allow_none=True)
    responsibilities = fields.Str(dump_only=True, allow_none=True)
    skills = fields.Str(dump_only=True, allow_none=True)
    shift = fields.Str(dump_only=True, allow_none=True)
    department = fields.Str(dump_only=True, allow_none=True)
    phone = fields.Str(dump_only=True, allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    expires_at = fields.DateTime(dump_only=True)
    accepted_at = fields.DateTime(dump_only=True, allow_none=True)
    updated_at = fields.DateTime(dump_only=True, allow_none=True)


class InviteWithInviterSchema(InviteSchema):
    """Schema para invitación con información del invitador"""
    inviter_name = fields.Str(dump_only=True)
    inviter_email = fields.Str(dump_only=True)


class AcceptInviteSchema(Schema):
    """Schema para aceptar invitación"""
    token = fields.Str(required=True, error_messages={
        'required': 'El token es requerido'
    })
    password = fields.Str(required=True, validate=validate.Length(min=8, max=100), error_messages={
        'required': 'La contraseña es requerida',
        'invalid': 'La contraseña debe tener al menos 8 caracteres'
    })
    name = fields.Str(required=True, validate=validate.Length(min=2, max=255), error_messages={
        'required': 'El nombre es requerido',
        'invalid': 'El nombre debe tener entre 2 y 255 caracteres'
    })
