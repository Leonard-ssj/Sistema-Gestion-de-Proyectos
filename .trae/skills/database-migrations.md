# Database Migrations - ProGest

Guia para crear y aplicar migraciones de base de datos con Flask-Migrate.

## Cuando Crear una Migracion

Crear migracion cuando:
- Agregas un nuevo campo a un modelo
- Eliminas un campo de un modelo
- Cambias el tipo de un campo
- Agregas una nueva tabla (modelo)
- Eliminas una tabla
- Cambias indices o constraints
- Cambias relaciones entre modelos

## Workflow de Migraciones

### 1. Modificar el Modelo

```python
# app/models/user.py
class User(db.Model):
    # ... campos existentes ...
    
    # Nuevo campo
    email_verified = db.Column(db.Boolean, default=False)
```

### 2. Crear la Migracion

```bash
cd project-management-backend
python manage_migrations.py migrate "Add email_verified to User"
```

Esto genera un archivo en `migrations/versions/xxxx_add_email_verified_to_user.py`

### 3. Revisar el Archivo Generado

SIEMPRE revisar el archivo antes de aplicar:

```python
def upgrade():
    # Agregar columna
    op.add_column('users', 
        sa.Column('email_verified', sa.Boolean(), nullable=True)
    )
    
    # Opcional: Establecer valor por defecto para registros existentes
    op.execute("UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL")
    
    # Opcional: Hacer NOT NULL despues de establecer valores
    op.alter_column('users', 'email_verified', nullable=False)

def downgrade():
    # Revertir cambio
    op.drop_column('users', 'email_verified')
```

### 4. Aplicar la Migracion

```bash
python manage_migrations.py upgrade
```

### 5. Verificar en Base de Datos

```bash
mysql -u root -p project_management_db_mysql
DESCRIBE users;
exit;
```

## Tipos de Migraciones

### Agregar Campo

```python
# Modelo
class Task(db.Model):
    estimated_hours = db.Column(db.Integer, nullable=True)

# Migracion generada
def upgrade():
    op.add_column('tasks', 
        sa.Column('estimated_hours', sa.Integer(), nullable=True)
    )

def downgrade():
    op.drop_column('tasks', 'estimated_hours')
```

### Eliminar Campo

```python
# Eliminar campo del modelo
# class Task(db.Model):
#     old_field = db.Column(db.String(100))  # Eliminar esta linea

# Migracion
def upgrade():
    op.drop_column('tasks', 'old_field')

def downgrade():
    op.add_column('tasks',
        sa.Column('old_field', sa.String(100), nullable=True)
    )
```

### Cambiar Tipo de Campo

```python
# Modelo - Cambiar de String a Text
class Task(db.Model):
    description = db.Column(db.Text)  # Era String(500)

# Migracion
def upgrade():
    op.alter_column('tasks', 'description',
        existing_type=sa.String(500),
        type_=sa.Text(),
        existing_nullable=True
    )

def downgrade():
    op.alter_column('tasks', 'description',
        existing_type=sa.Text(),
        type_=sa.String(500),
        existing_nullable=True
    )
```

### Agregar Tabla Nueva

```python
# Modelo nuevo
class FeatureFlag(db.Model):
    __tablename__ = 'feature_flags'
    
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    enabled = db.Column(db.Boolean, default=False)

# Migracion generada automaticamente
def upgrade():
    op.create_table('feature_flags',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('feature_flags')
```

## Migraciones de Datos

Flask-Migrate solo genera cambios de ESQUEMA. Para migrar DATOS, editar manualmente:

```python
def upgrade():
    # 1. Cambio de esquema (auto-generado)
    op.add_column('tasks', 
        sa.Column('status_new', sa.String(20), nullable=True)
    )
    
    # 2. Migracion de datos (MANUAL)
    # Copiar datos de status viejo a status nuevo
    op.execute("""
        UPDATE tasks 
        SET status_new = CASE 
            WHEN status = 0 THEN 'pending'
            WHEN status = 1 THEN 'in_progress'
            WHEN status = 2 THEN 'done'
            ELSE 'pending'
        END
    """)
    
    # 3. Eliminar columna vieja
    op.drop_column('tasks', 'status')
    
    # 4. Renombrar columna nueva
    op.alter_column('tasks', 'status_new', new_column_name='status')

def downgrade():
    # Revertir en orden inverso
    op.alter_column('tasks', 'status', new_column_name='status_new')
    op.add_column('tasks', sa.Column('status', sa.Integer()))
    op.execute("""
        UPDATE tasks 
        SET status = CASE 
            WHEN status_new = 'pending' THEN 0
            WHEN status_new = 'in_progress' THEN 1
            WHEN status_new = 'done' THEN 2
            ELSE 0
        END
    """)
    op.drop_column('tasks', 'status_new')
```

## Comandos Utiles

```bash
# Ver version actual
python manage_migrations.py current

# Ver historial
python manage_migrations.py history

# Revertir ultima migracion
python manage_migrations.py downgrade

# Aplicar migraciones pendientes
python manage_migrations.py upgrade

# Marcar BD con version actual (sin ejecutar migraciones)
python manage_migrations.py stamp head
```

## Buenas Practicas

### 1. Mensajes Descriptivos

```bash
# ❌ MAL
python manage_migrations.py migrate "update"

# ✅ BIEN
python manage_migrations.py migrate "Add email_verified field to User model"
```

### 2. Migraciones Atomicas

Una migracion = un cambio logico

```bash
# ❌ MAL - Muchos cambios en una migracion
python manage_migrations.py migrate "Add fields and change types and add table"

# ✅ BIEN - Migraciones separadas
python manage_migrations.py migrate "Add email_verified to User"
python manage_migrations.py migrate "Change description to Text type"
python manage_migrations.py migrate "Add FeatureFlag model"
```

### 3. Valores por Defecto

Siempre establecer valores por defecto para campos nuevos:

```python
def upgrade():
    # Agregar columna nullable
    op.add_column('users', 
        sa.Column('email_verified', sa.Boolean(), nullable=True)
    )
    
    # Establecer valor por defecto para registros existentes
    op.execute("UPDATE users SET email_verified = FALSE")
    
    # Hacer NOT NULL
    op.alter_column('users', 'email_verified', nullable=False)
```

### 4. Indices

Agregar indices para campos frecuentemente consultados:

```python
def upgrade():
    op.add_column('tasks', sa.Column('status', sa.String(20)))
    
    # Agregar indice
    op.create_index('ix_tasks_status', 'tasks', ['status'])

def downgrade():
    op.drop_index('ix_tasks_status', 'tasks')
    op.drop_column('tasks', 'status')
```

## Errores Comunes

### Error: "Target database is not up to date"

Hay migraciones pendientes:

```bash
python manage_migrations.py upgrade
```

### Error: "Can't locate revision"

Archivos de migracion faltantes o inconsistentes:

```bash
# Ver que migraciones tiene la BD
python manage_migrations.py current

# Ver que migraciones hay en archivos
python manage_migrations.py history

# Si es necesario, marcar BD con version correcta
python manage_migrations.py stamp <revision_id>
```

### Error: "Column already exists"

La migracion ya fue aplicada parcialmente:

1. Revertir: `python manage_migrations.py downgrade`
2. Corregir archivo de migracion
3. Aplicar: `python manage_migrations.py upgrade`

## Testing de Migraciones

Antes de aplicar en produccion:

1. **Backup de BD**
```bash
mysqldump -u root -p project_management_db_mysql > backup.sql
```

2. **Aplicar migracion en desarrollo**
```bash
python manage_migrations.py upgrade
```

3. **Verificar que funciona**
```bash
python app.py
# Probar funcionalidad afectada
```

4. **Si hay problemas, revertir**
```bash
python manage_migrations.py downgrade
```

5. **Restaurar backup si es necesario**
```bash
mysql -u root -p project_management_db_mysql < backup.sql
```

## Checklist de Migracion

Antes de hacer commit:

- [ ] Modelo modificado correctamente
- [ ] Migracion creada con mensaje descriptivo
- [ ] Archivo de migracion revisado
- [ ] Valores por defecto establecidos
- [ ] Migracion aplicada en desarrollo
- [ ] Funcionalidad probada
- [ ] Downgrade probado (opcional)
- [ ] Documentacion actualizada si es necesario

## Recordatorios

- SIEMPRE revisar archivo generado antes de aplicar
- SIEMPRE hacer backup antes de migraciones en produccion
- SIEMPRE probar downgrade en desarrollo
- NUNCA editar migraciones ya aplicadas en produccion
- NUNCA eliminar archivos de migraciones del repositorio
- SIEMPRE commitear archivos de migraciones en Git
