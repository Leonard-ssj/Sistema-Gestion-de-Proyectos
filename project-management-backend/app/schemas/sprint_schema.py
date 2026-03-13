from marshmallow import Schema, fields, validate, validates_schema, ValidationError

SPRINT_COLORS = [
    'slate',
    'gray',
    'zinc',
    'stone',
    'red',
    'orange',
    'amber',
    'lime',
    'green',
    'emerald',
    'teal',
    'blue'
]


class SprintCreateSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=120), error_messages={
        'required': 'El nombre del sprint es requerido',
        'invalid': 'El nombre del sprint debe tener entre 1 y 120 caracteres'
    })
    color = fields.Str(required=False, validate=validate.OneOf(SPRINT_COLORS), load_default='blue')
    start_date = fields.DateTime(required=True, error_messages={'required': 'La fecha de inicio es requerida'})
    end_date = fields.DateTime(required=True, error_messages={'required': 'La fecha de fin es requerida'})
    status = fields.Str(required=False, validate=validate.OneOf(['planned', 'active', 'closed']), load_default='planned')

    @validates_schema
    def validate_dates(self, data, **kwargs):
        if data.get('start_date') and data.get('end_date') and data['end_date'] <= data['start_date']:
            raise ValidationError({'end_date': ['La fecha de fin debe ser posterior a la fecha de inicio']})


class SprintUpdateSchema(Schema):
    name = fields.Str(required=False, validate=validate.Length(min=1, max=120))
    color = fields.Str(required=False, validate=validate.OneOf(SPRINT_COLORS))
    start_date = fields.DateTime(required=False)
    end_date = fields.DateTime(required=False)
    status = fields.Str(required=False, validate=validate.OneOf(['planned', 'active', 'closed']))

    @validates_schema
    def validate_dates(self, data, **kwargs):
        if data.get('start_date') and data.get('end_date') and data['end_date'] <= data['start_date']:
            raise ValidationError({'end_date': ['La fecha de fin debe ser posterior a la fecha de inicio']})


class SprintSchema(Schema):
    id = fields.Str(dump_only=True)
    project_id = fields.Str(dump_only=True)
    name = fields.Str(dump_only=True)
    color = fields.Str(dump_only=True)
    start_date = fields.DateTime(dump_only=True)
    end_date = fields.DateTime(dump_only=True)
    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True, allow_none=True)
