from marshmallow import Schema, fields


class MembershipSchema(Schema):
    """Schema para serializar membresía (respuesta)"""
    id = fields.Str(dump_only=True)
    user_id = fields.Str(dump_only=True)
    project_id = fields.Str(dump_only=True)
    role = fields.Str(dump_only=True)
    status = fields.Str(dump_only=True)
    joined_at = fields.DateTime(dump_only=True)


class MemberWithUserSchema(MembershipSchema):
    """Schema para membresía con información del usuario"""
    user_name = fields.Str(dump_only=True)
    user_email = fields.Str(dump_only=True)
    user_avatar = fields.Str(dump_only=True, allow_none=True)
