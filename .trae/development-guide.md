# GUIA DE DESARROLLO - ProGest

> Guia completa para desarrolladores

---

## REQUISITOS DEL SISTEMA

### Software Requerido

**Backend:**
- Python 3.10 o superior
- pip (gestor de paquetes Python)
- MySQL 8.0 o superior

**Frontend:**
- Node.js 18 o superior
- npm (incluido con Node.js)

**Herramientas Opcionales:**
- Git
- Postman (para testing de API)
- MySQL Workbench (para gestion de BD)
- VS Code (editor recomendado)

---

## SETUP INICIAL

### 1. Clonar Repositorio

```bash
git clone <repository-url>
cd Monorepo_gestion_proyectos_saas
```

### 2. Configurar Base de Datos

**Crear base de datos en MySQL:**

```sql
CREATE DATABASE progest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Verificar conexion:**

```bash
mysql -u root -p
# Ingresar password
USE progest_db;
SHOW TABLES;
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raiz del proyecto:

```bash
# Backend
SECRET_KEY=tu-secret-key-cambiar-en-produccion
JWT_SECRET_KEY=tu-jwt-secret-key-cambiar-en-produccion

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=progest_db

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# CORS
FRONTEND_URL=http://localhost:3000
```

**Generar secret keys:**

```python
import secrets
print(secrets.token_urlsafe(32))  # Para SECRET_KEY
print(secrets.token_urlsafe(32))  # Para JWT_SECRET_KEY
```

### 4. Setup Backend

```bash
cd project-management-backend

# Crear entorno virtual
python -m venv backend-env

# Activar entorno virtual
# Windows:
backend-env\Scripts\activate
# Linux/Mac:
source backend-env/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor (crea tablas automaticamente)
python app.py
```

El servidor estara disponible en: http://localhost:5000

### 5. Setup Frontend

```bash
cd project-management-frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicacion estara disponible en: http://localhost:3000

---

## ESTRUCTURA DE DESARROLLO

### Workflow Recomendado

1. **Backend primero**: Implementar endpoint en backend
2. **Testing con Postman**: Probar endpoint
3. **Frontend**: Implementar UI y conectar con endpoint
4. **Testing E2E**: Probar flujo completo

### Branches

```
main          - Produccion
develop       - Desarrollo
feature/*     - Nuevas funcionalidades
bugfix/*      - Correcciones de bugs
hotfix/*      - Correcciones urgentes
```

### Commits

Usar conventional commits:

```
feat: agregar endpoint de comentarios
fix: corregir validacion de fecha en tareas
docs: actualizar README
refactor: mejorar estructura de servicios
test: agregar tests para auth
```

---

## DESARROLLO BACKEND

### Agregar Nuevo Endpoint

1. **Crear ruta en blueprint**

```python
# app/routes/tasks.py
@tasks_bp.route('/new-endpoint', methods=['POST'])
@jwt_required()
@require_permission('task:create')
def new_endpoint():
    data = request.get_json()
    # Logica del endpoint
    return jsonify({'success': True, 'data': result}), 200
```

2. **Crear schema de validacion**

```python
# app/schemas/task_schema.py
class NewEndpointSchema(Schema):
    field1 = fields.Str(required=True)
    field2 = fields.Int(validate=validate.Range(min=1))
```

3. **Implementar logica en service**

```python
# app/services/task_service.py
def new_service_function(data):
    # Logica de negocio
    return result
```

4. **Probar con Postman**

### Agregar Nuevo Modelo

1. **Crear modelo**

```python
# app/models/new_model.py
from app import db
import uuid

class NewModel(db.Model):
    __tablename__ = 'new_models'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat()
        }
```

2. **Importar en __init__.py**

```python
# app/models/__init__.py
from .new_model import NewModel
```

3. **Crear tablas**

```python
python app.py
# Las tablas se crean automaticamente
```

### Migraciones Automaticas

El proyecto usa Flask-Migrate (Alembic) para gestionar migraciones de base de datos automaticamente.

**Comandos disponibles:**

```bash
# Ver version actual
python manage_migrations.py current

# Crear nueva migracion (detecta cambios automaticamente)
python manage_migrations.py migrate "Descripcion del cambio"

# Aplicar migraciones pendientes
python manage_migrations.py upgrade

# Revertir ultima migracion
python manage_migrations.py downgrade

# Ver historial
python manage_migrations.py history
```

**Flujo de trabajo:**

1. Modificar modelo en `app/models/`
2. Crear migracion: `python manage_migrations.py migrate "Add new field"`
3. Revisar archivo generado en `migrations/versions/`
4. Aplicar: `python manage_migrations.py upgrade`

**Ejemplo - Agregar campo:**

```python
# app/models/user.py
class User(db.Model):
    # ... campos existentes ...
    email_verified = db.Column(db.Boolean, default=False)  # Nuevo
```

```bash
python manage_migrations.py migrate "Add email_verified to users"
python manage_migrations.py upgrade
```

Ver `MIGRATIONS_README.md` para documentacion completa.

---

## DESARROLLO FRONTEND

### Agregar Nueva Pagina

1. **Crear archivo de ruta**

```typescript
// app/app/new-page/page.tsx
'use client'

import { requireAuth } from '@/lib/guards'

function NewPage() {
  return (
    <div>
      <h1>Nueva Pagina</h1>
    </div>
  )
}

export default requireAuth(NewPage)
```

2. **Agregar link en sidebar**

```typescript
// components/layout/sidebar.tsx
<Link href="/app/new-page">Nueva Pagina</Link>
```

### Agregar Nuevo Servicio

1. **Crear servicio**

```typescript
// services/newService.ts
import { api } from '@/lib/api'

export async function getNewData() {
  try {
    const response = await api.get('/new-endpoint')
    return { success: true, data: response }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

2. **Usar en componente**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getNewData } from '@/services/newService'

export function NewComponent() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    async function fetchData() {
      const result = await getNewData()
      if (result.success) {
        setData(result.data)
      }
    }
    fetchData()
  }, [])
  
  return <div>{/* render data */}</div>
}
```

### Agregar Nuevo Componente UI

1. **Usar shadcn/ui CLI**

```bash
npx shadcn-ui@latest add <component-name>
```

2. **O crear manualmente**

```typescript
// components/ui/new-component.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface NewComponentProps {
  className?: string
  children?: React.ReactNode
}

export function NewComponent({ className, children }: NewComponentProps) {
  return (
    <div className={cn('base-styles', className)}>
      {children}
    </div>
  )
}
```

---

## DEBUGGING

### Backend

**Logging:**

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug('Debug message')
logger.info('Info message')
logger.error('Error message')
```

**Breakpoints con pdb:**

```python
import pdb

def my_function():
    pdb.set_trace()  # Breakpoint
    # codigo
```

**Ver queries SQL:**

```python
# config.py
SQLALCHEMY_ECHO = True  # Imprime todas las queries
```

### Frontend

**Console logging:**

```typescript
console.log('Debug:', data)
console.error('Error:', error)
console.table(array)
```

**React DevTools:**

Instalar extension de Chrome/Firefox para inspeccionar componentes.

**Network tab:**

Inspeccionar requests HTTP en DevTools del navegador.

---

## TESTING

### Backend Testing

**Unit tests con pytest:**

```python
# tests/test_auth.py
import pytest
from app import create_app, db

@pytest.fixture
def client():
    app = create_app('testing')
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_register(client):
    response = client.post('/api/auth/register', json={
        'email': 'test@test.com',
        'password': 'password123',
        'name': 'Test User'
    })
    assert response.status_code == 201
```

**Ejecutar tests:**

```bash
pytest
pytest tests/test_auth.py
pytest -v  # Verbose
pytest --cov  # Con coverage
```

### Frontend Testing

**Component tests con Jest:**

```typescript
// __tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

**Ejecutar tests:**

```bash
npm test
npm test -- --watch
npm test -- --coverage
```

---

## CONVENCIONES DE CODIGO

### Python (Backend)

**PEP 8:**
- Indentacion: 4 espacios
- Lineas: max 79 caracteres
- Nombres: snake_case para funciones y variables
- Nombres: PascalCase para clases

**Formateo automatico:**

```bash
black app/
flake8 app/
```

### TypeScript (Frontend)

**Nombres:**
- camelCase para variables y funciones
- PascalCase para componentes y tipos
- UPPER_CASE para constantes

**Formateo automatico:**

```bash
npm run lint
npm run lint -- --fix
```

---

## HERRAMIENTAS UTILES

### VS Code Extensions

**Backend:**
- Python
- Pylance
- Python Test Explorer

**Frontend:**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier

**General:**
- GitLens
- Thunder Client (alternativa a Postman)
- MySQL (para ver BD)

### Scripts Utiles

**Backend:**

```bash
# Generar password hash
python generate_password_hash.py

# Listar endpoints
python list_endpoints.py

# Ver rutas
python show_routes.py
```

**Frontend:**

```bash
# Limpiar cache
rm -rf .next node_modules
npm install

# Build de produccion
npm run build
npm run start
```

---

## TROUBLESHOOTING

### Problemas Comunes

**Backend no inicia:**
- Verificar que MySQL este corriendo
- Verificar credenciales en .env.local
- Verificar que el puerto 5000 este libre

**Frontend no conecta con backend:**
- Verificar NEXT_PUBLIC_API_URL en .env.local
- Verificar CORS en backend
- Verificar que backend este corriendo

**Errores de autenticacion:**
- Verificar que JWT_SECRET_KEY sea el mismo en backend
- Limpiar localStorage del navegador
- Verificar expiracion de tokens

**Errores de base de datos:**
- Verificar que las tablas existan
- Aplicar migraciones pendientes
- Verificar foreign keys

---

## DEPLOYMENT

### Preparacion para Produccion

**Backend:**

1. Cambiar DEBUG a False
2. Usar Gunicorn como WSGI server
3. Configurar Nginx como reverse proxy
4. Usar variables de entorno seguras
5. Configurar SSL/TLS

**Frontend:**

1. Build de produccion: `npm run build`
2. Usar servidor de produccion (no `npm run dev`)
3. Configurar variables de entorno de produccion
4. Optimizar imagenes y assets
5. Configurar CDN

### Variables de Entorno de Produccion

```bash
# Backend
SECRET_KEY=<strong-random-key>
JWT_SECRET_KEY=<strong-random-key>
DB_HOST=<production-db-host>
DB_USER=<production-db-user>
DB_PASSWORD=<strong-password>
DB_NAME=progest_production

# Frontend
NEXT_PUBLIC_API_URL=https://api.progest.com
```

---

**Ultima actualizacion:** 24 de febrero de 2026  
**Version:** 2.0.0
