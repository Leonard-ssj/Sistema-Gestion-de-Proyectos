# Guia de Migraciones Automaticas con Flask-Migrate

## Descripcion

Este proyecto utiliza Flask-Migrate (Alembic) para gestionar las migraciones de base de datos de forma automatica. Las migraciones permiten versionar los cambios en el esquema de la base de datos y aplicarlos de forma controlada.

## Estructura de Archivos

```
project-management-backend/
├── migrations/                    # Carpeta de migraciones (generada por Flask-Migrate)
│   ├── versions/                  # Archivos de migracion
│   ├── alembic.ini               # Configuracion de Alembic
│   ├── env.py                    # Configuracion del entorno
│   └── script.py.mako            # Template para nuevas migraciones
├── migrations_manual_sql/         # Migraciones SQL manuales antiguas (referencia)
├── wsgi.py                       # Entry point para Flask (resuelve conflicto de nombres)
└── manage_migrations.py          # Script de gestion de migraciones
```

## Comandos Disponibles

### 1. Inicializar Migraciones (Solo Primera Vez)

```bash
python manage_migrations.py init
```

Este comando crea la carpeta `migrations/` con la estructura necesaria. Solo se ejecuta una vez al inicio del proyecto.

### 2. Crear Nueva Migracion

Cuando modificas un modelo (agregar/eliminar campos, cambiar tipos, etc.):

```bash
python manage_migrations.py migrate "Descripcion del cambio"
```

Ejemplo:
```bash
python manage_migrations.py migrate "Add email_verified field to users"
```

Este comando:
- Detecta automaticamente los cambios en los modelos
- Genera un archivo de migracion en `migrations/versions/`
- El archivo contiene las operaciones SQL necesarias

### 3. Aplicar Migraciones

Para aplicar todas las migraciones pendientes a la base de datos:

```bash
python manage_migrations.py upgrade
```

### 4. Revertir Migracion

Para revertir la ultima migracion aplicada:

```bash
python manage_migrations.py downgrade
```

### 5. Ver Version Actual

Para ver la version actual de la base de datos:

```bash
python manage_migrations.py current
```

### 6. Ver Historial

Para ver el historial completo de migraciones:

```bash
python manage_migrations.py history
```

## Flujo de Trabajo Tipico

### Escenario 1: Agregar un Nuevo Campo

1. Modificar el modelo en `app/models/`:

```python
# app/models/user.py
class User(db.Model):
    # ... campos existentes ...
    email_verified = db.Column(db.Boolean, default=False)  # Nuevo campo
```

2. Crear la migracion:

```bash
python manage_migrations.py migrate "Add email_verified to users"
```

3. Revisar el archivo generado en `migrations/versions/`

4. Aplicar la migracion:

```bash
python manage_migrations.py upgrade
```

### Escenario 2: Modificar un Campo Existente

1. Modificar el modelo:

```python
# Cambiar tipo de dato
description = db.Column(db.Text)  # Era db.String(500)
```

2. Crear y aplicar migracion:

```bash
python manage_migrations.py migrate "Change description to Text type"
python manage_migrations.py upgrade
```

### Escenario 3: Agregar una Nueva Tabla

1. Crear el nuevo modelo en `app/models/`

2. Importar el modelo en `app/models/__init__.py`

3. Importar el modelo en `app.py`

4. Crear y aplicar migracion:

```bash
python manage_migrations.py migrate "Add new table: feature_flags"
python manage_migrations.py upgrade
```

## Comandos Directos de Flask-Migrate

Si prefieres usar los comandos de Flask directamente:

```bash
# Inicializar
backend-env\Scripts\flask.exe --app wsgi:app db init

# Crear migracion
backend-env\Scripts\flask.exe --app wsgi:app db migrate -m "mensaje"

# Aplicar migraciones
backend-env\Scripts\flask.exe --app wsgi:app db upgrade

# Revertir migracion
backend-env\Scripts\flask.exe --app wsgi:app db downgrade

# Ver version actual
backend-env\Scripts\flask.exe --app wsgi:app db current

# Ver historial
backend-env\Scripts\flask.exe --app wsgi:app db history
```

## Notas Importantes

### 1. Revision Manual

Siempre revisa los archivos de migracion generados antes de aplicarlos. Flask-Migrate es inteligente pero no perfecto.

### 2. Migraciones de Datos

Flask-Migrate solo maneja cambios de esquema. Para migraciones de datos (modificar registros existentes), debes editar manualmente el archivo de migracion.

Ejemplo:

```python
def upgrade():
    # Cambio de esquema (auto-generado)
    op.add_column('users', sa.Column('status', sa.String(20)))
    
    # Migracion de datos (manual)
    op.execute("UPDATE users SET status = 'active' WHERE status IS NULL")

def downgrade():
    op.drop_column('users', 'status')
```

### 3. Entornos Multiples

- Desarrollo: Aplica migraciones con `upgrade`
- Produccion: Aplica las mismas migraciones con `upgrade`
- Mantener sincronizados los archivos de `migrations/versions/`

### 4. Control de Versiones

- Commitear los archivos de `migrations/versions/` en Git
- NO commitear `migrations/__pycache__/`
- Cada desarrollador debe aplicar las migraciones localmente

### 5. Conflictos de Migracion

Si dos desarrolladores crean migraciones simultaneamente:

1. Resolver conflictos en Git
2. Usar `flask db merge` para combinar las ramas de migracion
3. Aplicar con `upgrade`

## Migraciones Manuales Antiguas

Las migraciones SQL manuales antiguas estan en `migrations_manual_sql/` como referencia. Ya no se usan, pero se mantienen por si necesitas consultar cambios historicos.

## Troubleshooting

### Error: "No changes in schema detected"

Causas:
- Los modelos no han cambiado
- Los cambios ya estan en la base de datos
- Los modelos no estan importados en `app.py`

Solucion:
- Verificar que los modelos esten importados
- Verificar que los cambios sean reales

### Error: "Target database is not up to date"

Causa: Hay migraciones pendientes

Solucion:
```bash
python manage_migrations.py upgrade
```

### Error: "Can't locate revision"

Causa: Inconsistencia entre archivos de migracion y base de datos

Solucion:
1. Verificar que todos los archivos de `migrations/versions/` esten presentes
2. Verificar la tabla `alembic_version` en la base de datos
3. En ultimo caso, recrear las migraciones desde cero

## Referencias

- [Flask-Migrate Documentation](https://flask-migrate.readthedocs.io/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
