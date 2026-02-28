from marshmallow import Schema, fields, validate


class CommentCreateSchema(Schema):
    """Schema para crear comentario"""
    content = fields.Str(required=True, validate=validate.Length(min=1, max=5000), error_messages={
        'required': 'El contenido es requerido',
        'invalid': 'El contenido debe tener entre 1 y 5000 caracteres'
    })


class CommentUpdateSchema(Schema):
    """Schema para actualizar comentario"""
    content = fields.Str(required=True, validate=validate.Length(min=1, max=5000))


class CommentSchema(Schema):
    """Schema para serializar comentario (respuesta)"""
    id = fields.Str(dump_only=True)
    task_id = fields.Str(dump_only=True)
    user_id = fields.Str(dump_only=True)
    content = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True, allow_none=True)


class CommentWithUserSchema(CommentSchema):
    """Schema para comentario con información del usuario"""
    user_name = fields.Str(dump_only=True)
    user_email = fields.Str(dump_only=True)
    user_avatar = fields.Str(dump_only=True, allow_none=True)
