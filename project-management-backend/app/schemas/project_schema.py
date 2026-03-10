from marshmallow import Schema, fields, validate, validates_schema, ValidationError

MEXICO_TIMEZONES = [
    'America/Mexico_City',
    'America/Cancun',
    'America/Mazatlan',
    'America/Hermosillo',
    'America/Tijuana'
]

MEXICO_STATES = [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Ciudad de Mexico',
    'Coahuila',
    'Colima',
    'Durango',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'Mexico',
    'Michoacan',
    'Morelos',
    'Nayarit',
    'Nuevo Leon',
    'Oaxaca',
    'Puebla',
    'Queretaro',
    'Quintana Roo',
    'San Luis Potosi',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatan',
    'Zacatecas'
]

MEXICO_STATES_BY_TIMEZONE = {
    'America/Mexico_City': [
        'Aguascalientes',
        'Chiapas',
        'Ciudad de Mexico',
        'Coahuila',
        'Colima',
        'Guanajuato',
        'Guerrero',
        'Hidalgo',
        'Jalisco',
        'Mexico',
        'Michoacan',
        'Morelos',
        'Nuevo Leon',
        'Oaxaca',
        'Puebla',
        'Queretaro',
        'San Luis Potosi',
        'Tabasco',
        'Tamaulipas',
        'Tlaxcala',
        'Veracruz',
        'Zacatecas'
    ],
    'America/Cancun': ['Campeche', 'Quintana Roo', 'Yucatan'],
    'America/Mazatlan': ['Baja California Sur', 'Chihuahua', 'Durango', 'Nayarit', 'Sinaloa'],
    'America/Hermosillo': ['Sonora'],
    'America/Tijuana': ['Baja California']
}


class ProjectCreateSchema(Schema):
    """Schema para crear proyecto"""
    name = fields.Str(required=True, validate=validate.Length(min=3, max=255), error_messages={
        'required': 'El nombre del proyecto es requerido',
        'invalid': 'El nombre debe tener entre 3 y 255 caracteres'
    })
    description = fields.Str(required=True, allow_none=False, validate=validate.Length(min=20, max=5000), error_messages={
        'required': 'La descripción del proyecto es requerida',
        'invalid': 'La descripción debe tener entre 20 y 5000 caracteres'
    })
    category = fields.Str(required=True, allow_none=False, validate=validate.Length(min=2, max=100), error_messages={
        'required': 'La categoría del proyecto es requerida',
        'invalid': 'La categoría debe tener entre 2 y 100 caracteres'
    })
    timezone = fields.Str(required=False, allow_none=False, load_default='America/Mexico_City', validate=validate.OneOf(MEXICO_TIMEZONES), error_messages={
        'invalid': 'Zona horaria inválida'
    })
    date_format = fields.Str(required=False, load_default='dd/MM/yyyy', validate=validate.Length(max=32))
    state = fields.Str(required=True, allow_none=False, validate=validate.OneOf(MEXICO_STATES), error_messages={
        'required': 'El estado del proyecto es requerido',
        'invalid': 'Estado inválido'
    })

    @validates_schema
    def validate_timezone_state(self, data, **kwargs):
        tz = data.get('timezone', 'America/Mexico_City')
        st = data.get('state')
        allowed = MEXICO_STATES_BY_TIMEZONE.get(tz)
        if allowed and st and st not in allowed:
            raise ValidationError({'state': ['El estado no corresponde a la zona horaria seleccionada']})


class ProjectUpdateSchema(Schema):
    """Schema para actualizar proyecto"""
    name = fields.Str(required=False, validate=validate.Length(min=3, max=255))
    description = fields.Str(required=False, allow_none=True, validate=validate.Length(max=5000))
    category = fields.Str(required=False, allow_none=True, validate=validate.Length(max=100))
    timezone = fields.Str(required=False, allow_none=True, validate=validate.OneOf(MEXICO_TIMEZONES))
    date_format = fields.Str(required=False, allow_none=True, validate=validate.Length(max=32))
    state = fields.Str(required=False, allow_none=True, validate=validate.OneOf(MEXICO_STATES))
    status = fields.Str(required=False, validate=validate.OneOf(['active', 'disabled']))

    @validates_schema
    def validate_timezone_state(self, data, **kwargs):
        tz = data.get('timezone')
        st = data.get('state')
        if not tz or not st:
            return
        allowed = MEXICO_STATES_BY_TIMEZONE.get(tz)
        if allowed and st not in allowed:
            raise ValidationError({'state': ['El estado no corresponde a la zona horaria seleccionada']})


class ProjectSchema(Schema):
    """Schema para serializar proyecto (respuesta)"""
    id = fields.Str(dump_only=True)
    name = fields.Str(dump_only=True)
    description = fields.Str(dump_only=True, allow_none=True)
    category = fields.Str(dump_only=True, allow_none=True)
    timezone = fields.Str(dump_only=True)
    date_format = fields.Str(dump_only=True)
    state = fields.Str(dump_only=True, allow_none=True)
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
