from marshmallow import Schema, fields, validate, validates, ValidationError
from datetime import datetime, timezone
import uuid


class ChecklistItemSchema(Schema):
    """Schema para item de checklist"""
    id = fields.Str(required=True, validate=validate.Length(equal=36))
    text = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    completed = fields.Bool(required=True)
    
    @validates('id')
    def validate_id(self, value):
        """Validar que el ID sea un UUID válido"""
        try:
            uuid.UUID(value)
        except ValueError:
            raise ValidationError('El ID debe ser un UUID válido')


class TaskCreateSchema(Schema):
    """Schema para crear tarea"""
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255), error_messages={
        'required': 'El título es requerido',
        'invalid': 'El título debe tener entre 1 y 255 caracteres'
    })
    description = fields.Str(required=False, allow_none=True, validate=validate.Length(max=5000))
    status = fields.Str(required=False, validate=validate.OneOf(['pending', 'in_progress', 'blocked', 'done']), missing='pending')
    priority = fields.Str(required=False, validate=validate.OneOf(['low', 'medium', 'high', 'urgent']), missing='medium')
    assigned_to = fields.Str(required=False, allow_none=True)
    due_date = fields.DateTime(required=True, error_messages={
        'required': 'La fecha de vencimiento es requerida'
    })
    tags = fields.List(fields.Str(), required=False, allow_none=True)
    checklist = fields.List(
        fields.Nested(ChecklistItemSchema),
        required=False,
        allow_none=True,
        validate=validate.Length(max=50)
    )

    @validates('due_date')
    def validate_due_date(self, value):
        """Validar que la fecha de vencimiento sea futura"""
        if value:
            # Obtener fecha actual sin hora
            now = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            # Convertir value a fecha sin hora
            due_date = value.replace(hour=0, minute=0, second=0, microsecond=0)
            
            if due_date <= now:
                raise ValidationError('La fecha de vencimiento debe ser posterior a hoy')


class TaskUpdateSchema(Schema):
    """Schema para actualizar tarea"""
    title = fields.Str(required=False, validate=validate.Length(min=1, max=255))
    description = fields.Str(required=False, allow_none=True, validate=validate.Length(max=5000))
    status = fields.Str(required=False, validate=validate.OneOf(['pending', 'in_progress', 'blocked', 'done']))
    priority = fields.Str(required=False, validate=validate.OneOf(['low', 'medium', 'high', 'urgent']))
    assigned_to = fields.Str(required=False, allow_none=True)
    due_date = fields.DateTime(required=False, allow_none=True)
    tags = fields.List(fields.Str(), required=False, allow_none=True)
    checklist = fields.List(
        fields.Nested(ChecklistItemSchema),
        required=False,
        allow_none=True,
        validate=validate.Length(max=50)
    )

    @validates('due_date')
    def validate_due_date(self, value):
        """Validar que la fecha de vencimiento sea futura"""
        if value:
            # Obtener fecha actual sin hora
            now = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            # Convertir value a fecha sin hora
            due_date = value.replace(hour=0, minute=0, second=0, microsecond=0)
            
            if due_date <= now:
                raise ValidationError('La fecha de vencimiento debe ser posterior a hoy')


class TaskSchema(Schema):
    """Schema para serializar tarea (respuesta)"""
    id = fields.Str(dump_only=True)
    project_id = fields.Str(dump_only=True)
    title = fields.Str(dump_only=True)
    description = fields.Str(dump_only=True, allow_none=True)
    status = fields.Str(dump_only=True)
    priority = fields.Str(dump_only=True)
    created_by = fields.Str(dump_only=True)
    assigned_to = fields.Str(dump_only=True, allow_none=True)
    due_date = fields.DateTime(dump_only=True, allow_none=True)
    completed_at = fields.DateTime(dump_only=True, allow_none=True)
    tags = fields.List(fields.Str(), dump_only=True, allow_none=True)
    checklist = fields.List(fields.Nested(ChecklistItemSchema), dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True, allow_none=True)


class TaskWithDetailsSchema(TaskSchema):
    """Schema para tarea con detalles adicionales"""
    creator_name = fields.Str(dump_only=True)
    assignee_name = fields.Str(dump_only=True, allow_none=True)
    comments_count = fields.Int(dump_only=True)
