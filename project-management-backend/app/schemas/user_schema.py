from marshmallow import Schema, fields, validate, validates, ValidationError
import re


class UserRegisterSchema(Schema):
    """Schema para registro de usuario"""
    email = fields.Email(required=True, error_messages={
        'required': 'El email es requerido',
        'invalid': 'Email inválido'
    })
    password = fields.Str(required=True, validate=validate.Length(min=8, max=100), error_messages={
        'required': 'La contraseña es requerida',
        'invalid': 'La contraseña debe tener al menos 8 caracteres'
    })
    name = fields.Str(required=True, validate=validate.Length(min=2, max=255), error_messages={
        'required': 'El nombre es requerido',
        'invalid': 'El nombre debe tener entre 2 y 255 caracteres'
    })
    role = fields.Str(required=True, validate=validate.OneOf(['OWNER', 'EMPLOYEE']), error_messages={
        'required': 'El rol es requerido',
        'invalid': 'El rol debe ser OWNER o EMPLOYEE'
    })
    avatar = fields.Str(required=False, allow_none=True, validate=validate.Length(max=500))
    
    @validates('password')
    def validate_password(self, value):
        """Validar que la contraseña tenga al menos una mayúscula, una minúscula y un número"""
        if not re.search(r'[A-Z]', value):
            raise ValidationError('La contraseña debe contener al menos una letra mayúscula')
        if not re.search(r'[a-z]', value):
            raise ValidationError('La contraseña debe contener al menos una letra minúscula')
        if not re.search(r'\d', value):
            raise ValidationError('La contraseña debe contener al menos un número')


class UserLoginSchema(Schema):
    """Schema para login de usuario"""
    email = fields.Email(required=True, error_messages={
        'required': 'El email es requerido',
        'invalid': 'Email inválido'
    })
    password = fields.Str(required=True, error_messages={
        'required': 'La contraseña es requerida'
    })


class UserSchema(Schema):
    """Schema para serializar usuario (respuesta)"""
    id = fields.Str(dump_only=True)
    email = fields.Email(dump_only=True)
    name = fields.Str(dump_only=True)
    role = fields.Str(dump_only=True)
    avatar = fields.Str(dump_only=True, allow_none=True)
    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True, allow_none=True)


class UserUpdateSchema(Schema):
    """Schema para actualizar usuario"""
    name = fields.Str(required=False, validate=validate.Length(min=2, max=255))
    avatar = fields.Str(required=False, allow_none=True, validate=validate.Length(max=500))


class UserProfileUpdateSchema(Schema):
    """Schema para actualizar perfil de empleado (Owner puede editar)"""
    name = fields.Str(required=False, validate=validate.Length(min=2, max=255))
    job_title = fields.Str(required=False, validate=validate.Length(max=100), allow_none=True)
    description = fields.Str(required=False, validate=validate.Length(max=500), allow_none=True)
    responsibilities = fields.Str(required=False, validate=validate.Length(max=1000), allow_none=True)
    skills = fields.Str(required=False, validate=validate.Length(max=500), allow_none=True)
    shift = fields.Str(required=False, validate=validate.OneOf(['morning', 'afternoon', 'night', 'flexible']), allow_none=True)
    department = fields.Str(required=False, validate=validate.Length(max=100), allow_none=True)
    phone = fields.Str(required=False, validate=validate.Length(max=20), allow_none=True)
