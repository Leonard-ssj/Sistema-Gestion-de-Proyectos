from marshmallow import Schema, fields, validate

class TeamMessageSchema(Schema):
    id = fields.Str(dump_only=True)
    project_id = fields.Str(dump_only=True)
    user_id = fields.Str(dump_only=True)
    task_id = fields.Str(dump_only=True)
    mentioned_user_id = fields.Str(dump_only=True)
    content = fields.Str(required=True, validate=validate.Length(min=1))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class TeamMessageWithUserSchema(TeamMessageSchema):
    user_name = fields.Str(dump_only=True)
    user_email = fields.Str(dump_only=True)
    user_avatar = fields.Str(dump_only=True)
    task_title = fields.Str(dump_only=True)
    mentioned_user_name = fields.Str(dump_only=True)

class TeamMessageCreateSchema(Schema):
    content = fields.Str(required=True, validate=validate.Length(min=1, error="El contenido no puede estar vacío"))
    task_id = fields.Str(required=False, allow_none=True)
    mentioned_user_id = fields.Str(required=False, allow_none=True)
