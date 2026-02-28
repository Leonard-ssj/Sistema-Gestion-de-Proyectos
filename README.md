# 🚀 ProGest - Sistema de Gestión de Proyectos SaaS

<div align="center">

![ProGest Logo](https://via.placeholder.com/200x80/6366f1/ffffff?text=ProGest)

**Sistema completo de gestión de proyectos multitenant con arquitectura moderna**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://www.mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow)](https://www.python.org/)

[Características](#-características-principales) •
[Instalación](#-instalación-rápida) •
[Documentación](#-documentación) •
[API](#-api-rest) •
[Testing](#-testing)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Rápida](#-instalación-rápida)
- [Configuración Detallada](#-configuración-detallada)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API REST](#-api-rest)
- [Testing](#-testing)
- [Documentación](#-documentación)
- [Scripts Útiles](#-scripts-útiles)
- [Troubleshooting](#-troubleshooting)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🎯 Descripción

**ProGest** es un sistema SaaS (Software as a Service) completo para la gestión de proyectos empresariales. Construido con tecnologías modernas, ofrece una arquitectura multitenant robusta que permite a múltiples organizaciones gestionar sus proyectos de forma aislada y segura.

### ¿Qué hace ProGest?

- ✅ Gestión completa de proyectos y tareas
- ✅ Sistema de invitaciones y gestión de equipos
- ✅ Notificaciones en tiempo real
- ✅ Sistema de comentarios y colaboración
- ✅ Panel de administración para superusuarios
- ✅ API REST completa (41 endpoints)
- ✅ Autenticación JWT con refresh tokens
- ✅ Aislamiento multitenant de datos

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- Sistema de autenticación JWT con tokens de acceso y refresh
- Roles de usuario: Owner, Employee, SuperAdmin
- Contraseñas hasheadas con bcrypt
- Aislamiento completo de datos entre proyectos (multitenant)
- Logs de auditoría de todas las acciones importantes

### 📊 Gestión de Proyectos
- Creación y configuración de proyectos
- Categorización de proyectos
- Estadísticas en tiempo real
- Un proyecto por Owner

### ✅ Gestión de Tareas
- CRUD completo de tareas
- Estados: Pending, In Progress, Blocked, Done
- Prioridades: Low, Medium, High, Urgent
- Asignación de tareas a empleados
- Fechas de vencimiento obligatorias
- Tags personalizados
- Checklist integrado
- Filtros y búsqueda avanzada
- Drag & Drop en tablero Kanban

### 👥 Gestión de Equipos
- Invitaciones por email con tokens seguros
- Perfiles enriquecidos de empleados
- Gestión de miembros del equipo
- Desactivación/reactivación de miembros

### 🔔 Sistema de Notificaciones
- Notificaciones en tiempo real
- Contador de notificaciones no leídas
- Tipos: asignación de tareas, comentarios, cambios de estado
- Marcar como leídas/no leídas

### 💬 Sistema de Comentarios
- Comentarios en tareas
- Edición y eliminación de comentarios propios
- Historial completo de conversaciones

### 🛠️ Panel de Administración
- Gestión de todos los usuarios y proyectos
- Estadísticas globales del sistema
- Logs de auditoría completos
- Health check del sistema

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND - Next.js 14 (Port 3000)          │
│  • React 19 + TypeScript                                │
│  • Tailwind CSS + shadcn/ui                             │
│  • Zustand (State Management)                           │
│  • React Hook Form + Zod                                │
└────────────────────┬────────────────────────────────────┘
                     │ REST API (JSON)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND - Flask 3.0 (Port 5000)            │
│  • Python 3.10+                                         │
│  • SQLAlchemy ORM                                       │
│  • Flask-JWT-Extended                                   │
│  • Marshmallow (Validation)                             │
│  • 41 Endpoints REST                                    │
└────────────────────┬────────────────────────────────────┘
                     │ SQL
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE - MySQL 8.0 (Port 3306)           │
│  • 8 Tablas principales                                 │
│  • Relaciones con Foreign Keys                          │
│  • Índices optimizados                                  │
│  • Transacciones ACID                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### Software Requerido

| Software | Versión Mínima | Propósito |
|----------|----------------|-----------|
| **Node.js** | 18.x o 20.x | Runtime para el frontend |
| **npm** | 9.x+ | Gestor de paquetes de Node.js |
| **Python** | 3.10+ | Runtime para el backend |
| **pip** | 23.x+ | Gestor de paquetes de Python |
| **MySQL** | 8.0+ | Base de datos |
| **Git** | 2.x+ | Control de versiones |

### Verificar Instalaciones

```bash
# Verificar Node.js
node --version  # Debe mostrar v18.x o v20.x

# Verificar npm
npm --version   # Debe mostrar 9.x o superior

# Verificar Python
python --version  # Debe mostrar 3.10 o superior

# Verificar pip
pip --version

# Verificar MySQL
mysql --version  # Debe mostrar 8.0 o superior

# Verificar Git
git --version
```

---

## 🚀 Instalación Rápida

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/Leonard-ssj/Sistema-Gestion-de-Proyectos.git
cd Sistema-Gestion-de-Proyectos
```

### Paso 2: Configurar Base de Datos MySQL

1. **Iniciar MySQL** (si no está corriendo):
   ```bash
   # Windows (como servicio)
   net start MySQL80
   
   # O iniciar desde MySQL Workbench
   ```

2. **Crear la base de datos**:
   ```bash
   mysql -u root -p
   ```
   
   Luego ejecuta en el prompt de MySQL:
   ```sql
   CREATE DATABASE project_management_db_mysql CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

3. **Verificar que la base de datos fue creada**:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Windows
copy .env.example .env.local

# Linux/Mac
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# ============================================
# BACKEND CONFIGURATION
# ============================================

# Security Keys (CAMBIAR EN PRODUCCIÓN)
SECRET_KEY=tu-secret-key-super-segura-cambiar-en-produccion
JWT_SECRET_KEY=tu-jwt-secret-key-super-segura-cambiar-en-produccion

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_MYSQL_AQUI
DB_NAME=project_management_db_mysql

# Database URL (construida automáticamente)
DATABASE_URL=mysql+pymysql://root:TU_PASSWORD_MYSQL_AQUI@localhost:3306/project_management_db_mysql

# ============================================
# FRONTEND CONFIGURATION
# ============================================

# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**: Reemplaza `TU_PASSWORD_MYSQL_AQUI` con tu contraseña real de MySQL.

### Paso 4: Instalar Dependencias del Backend

```bash
cd project-management-backend

# Crear entorno virtual de Python
python -m venv backend-env

# Activar entorno virtual
# Windows:
backend-env\Scripts\activate

# Linux/Mac:
source backend-env/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### Paso 5: Inicializar Base de Datos

Con el entorno virtual activado:

```bash
# Inicializar migraciones
python init_migrations.py

# Aplicar migraciones
python manage_migrations.py upgrade
```

### Paso 6: Iniciar el Backend

```bash
# Asegúrate de estar en project-management-backend con el entorno activado
python app.py
```

Deberías ver:
```
 * Running on http://127.0.0.1:5000
 * Restarting with stat
```

✅ **Backend corriendo en:** http://localhost:5000

### Paso 7: Instalar Dependencias del Frontend

Abre una **nueva terminal** (deja el backend corriendo):

```bash
cd project-management-frontend

# Instalar dependencias
npm install
```

### Paso 8: Iniciar el Frontend

```bash
# Asegúrate de estar en project-management-frontend
npm run dev
```

Deberías ver:
```
  ▲ Next.js 14.0.10
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

✅ **Frontend corriendo en:** http://localhost:3000

---

## 🎉 ¡Listo! Accede a la Aplicación

Abre tu navegador y ve a: **http://localhost:3000**

### Crear tu Primera Cuenta

1. Haz clic en "Registrarse"
2. Completa el formulario:
   - Email: tu@email.com
   - Contraseña: mínimo 8 caracteres
   - Nombre completo
3. Serás redirigido al onboarding para crear tu proyecto
4. ¡Comienza a gestionar tus tareas!

---

## ⚙️ Configuración Detallada

### Estructura de Carpetas del Monorepo

```
Sistema-Gestion-de-Proyectos/
├── 📁 project-management-backend/    # Backend Flask
│   ├── app/                          # Código de la aplicación
│   │   ├── models/                   # Modelos SQLAlchemy
│   │   ├── routes/                   # Blueprints de rutas
│   │   ├── services/                 # Lógica de negocio
│   │   ├── schemas/                  # Schemas Marshmallow
│   │   └── utils/                    # Utilidades
│   ├── migrations/                   # Migraciones Alembic
│   ├── backend-env/                  # Entorno virtual (no en Git)
│   ├── app.py                        # Entry point
│   ├── config.py                     # Configuración
│   └── requirements.txt              # Dependencias Python
│
├── 📁 project-management-frontend/   # Frontend Next.js
│   ├── app/                          # App Router de Next.js
│   │   ├── (marketing)/              # Rutas públicas
│   │   ├── auth/                     # Autenticación
│   │   ├── app/                      # Aplicación protegida
│   │   └── admin/                    # Panel admin
│   ├── components/                   # Componentes React
│   │   ├── ui/                       # shadcn/ui components
│   │   └── layout/                   # Layouts
│   ├── services/                     # Servicios de API
│   ├── stores/                       # Zustand stores
│   ├── lib/                          # Utilidades
│   ├── node_modules/                 # Dependencias (no en Git)
│   ├── package.json                  # Dependencias Node.js
│   └── next.config.js                # Configuración Next.js
│
├── 📁 playwright-tests/              # Tests E2E
│   ├── flow-diagrams/                # Diagramas de flujo
│   ├── generated-tests/              # Tests generados
│   └── create-team.spec.ts           # Script de creación de equipo
│
├── 📁 postman/                       # Colecciones Postman
│   ├── ProGest_API_Complete.postman_collection.json
│   └── ProGest_Development.postman_environment.json
│
├── 📁 .kiro/                         # Documentación del proyecto
│   ├── DOCUMENTACION_CONSOLIDADA.md # Documentación completa
│   ├── architecture.md               # Arquitectura del sistema
│   ├── data-model.md                 # Modelo de datos
│   ├── API_COMPLETE_DOCUMENTATION.md # Documentación de API
│   ├── development-guide.md          # Guía de desarrollo
│   ├── TESTING_GUIDE.md              # Guía de testing
│   └── specs/                        # Especificaciones de features
│
├── .env.local                        # Variables de entorno (no en Git)
├── .gitignore                        # Archivos ignorados por Git
├── README.md                         # Este archivo
└── REQUERIMIENTOS_PROGEST.md         # Documento de requerimientos (85+)
```

---

## 🔌 API REST

El backend expone **41 endpoints REST** organizados en 8 categorías:

### Endpoints Disponibles

| Categoría | Endpoints | Descripción |
|-----------|-----------|-------------|
| **Autenticación** | 6 | Registro, login, refresh, logout, aceptar invitación |
| **Proyectos** | 2 | Crear proyecto, obtener mi proyecto |
| **Tareas** | 9 | CRUD completo, asignación, cambio de estado, estadísticas |
| **Invitaciones** | 5 | Enviar, listar, cancelar, reenviar, validar |
| **Miembros** | 3 | Listar, actualizar perfil, desactivar |
| **Notificaciones** | 5 | Listar, contador, marcar leídas, eliminar |
| **Comentarios** | 4 | CRUD completo en tareas |
| **Admin** | 7 | Gestión global, estadísticas, logs, health check |

### Ejemplo de Uso de la API

```bash
# 1. Registrarse
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123",
    "name": "John Doe"
  }'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123"
  }'

# 3. Crear tarea (con token)
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Mi primera tarea",
    "description": "Descripción de la tarea",
    "priority": "high",
    "due_date": "2026-03-01T00:00:00Z"
  }'
```

### Testing con Postman

1. Importa la colección: `postman/ProGest_API_Complete.postman_collection.json`
2. Importa el environment: `postman/ProGest_Development.postman_environment.json`
3. Selecciona el environment "ProGest - Development"
4. ¡Prueba los 41 endpoints!

📖 **Documentación completa de API:** `.kiro/API_COMPLETE_DOCUMENTATION.md`

---

## 🧪 Testing

### Testing con Playwright

El proyecto incluye tests E2E automatizados con Playwright.

#### Crear Equipo Completo Automáticamente

Script que crea un equipo completo con datos realistas:

```bash
# Instalar Playwright (primera vez)
npx playwright install

# Ejecutar script de creación de equipo
npx playwright test playwright-tests/create-team.spec.ts --headed
```

**El script crea:**
- ✅ 1 Owner (Carlos Mendez)
- ✅ 1 Proyecto (Auditoría Financiera Q1 2024)
- ✅ 3 Empleados (Ana Rodríguez, Miguel Torres, Laura García)
- ✅ 5 Tareas de auditoría financiera
- ✅ Archivo `playwright-tests/team-credentials.json` con credenciales

#### Ver Credenciales Generadas

```bash
# Windows
type playwright-tests\team-credentials.json

# Linux/Mac
cat playwright-tests/team-credentials.json
```

📖 **Guía completa de testing:** `playwright-tests/README.md`

---

## 📚 Documentación

El proyecto cuenta con documentación exhaustiva en la carpeta `.kiro/`:

| Documento | Descripción |
|-----------|-------------|
| **INDEX.md** | Índice maestro de toda la documentación |
| **DOCUMENTACION_CONSOLIDADA.md** | Estado completo del proyecto (funcionalidades, métricas, arquitectura) |
| **architecture.md** | Arquitectura detallada del sistema |
| **data-model.md** | Modelo de datos completo (8 entidades, relaciones, índices) |
| **API_COMPLETE_DOCUMENTATION.md** | Documentación de los 41 endpoints |
| **development-guide.md** | Guía para desarrolladores |
| **TESTING_GUIDE.md** | Guía de testing con Postman |
| **WORKFLOW.md** | Workflow completo de desarrollo |
| **frontend.md** | Documentación del frontend |
| **backend.md** | Documentación del backend |

### Documento de Requerimientos

📄 **REQUERIMIENTOS_PROGEST.md** - Documento profesional con **85+ requerimientos** detallados:
- 70 Requerimientos Funcionales (RF-001 a RF-085)
- 40 Requerimientos No Funcionales (RNF-001 a RNF-040)
- Interfaces externas
- Glosario y referencias

---

## 🛠️ Scripts Útiles

### Backend

```bash
cd project-management-backend

# Activar entorno virtual
backend-env\Scripts\activate  # Windows
source backend-env/bin/activate  # Linux/Mac

# Iniciar servidor de desarrollo
python app.py

# Crear migración
python manage_migrations.py migrate "descripcion del cambio"

# Aplicar migraciones
python manage_migrations.py upgrade

# Revertir última migración
python manage_migrations.py downgrade

# Ver historial de migraciones
python manage_migrations.py history

# Listar todos los endpoints
python list_endpoints.py

# Generar hash de contraseña
python generate_password_hash.py
```

### Frontend

```bash
cd project-management-frontend

# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start

# Linter
npm run lint

# Formatear código
npm run format
```

### Playwright

```bash
# Instalar navegadores
npx playwright install

# Ejecutar todos los tests
npx playwright test

# Ejecutar con UI
npx playwright test --ui

# Ejecutar test específico
npx playwright test playwright-tests/create-team.spec.ts

# Ver reporte
npx playwright show-report
```

---

## 🐛 Troubleshooting

### Problema: Error de conexión a MySQL

**Síntoma:**
```
sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError) (2003, "Can't connect to MySQL server")
```

**Solución:**
1. Verifica que MySQL esté corriendo:
   ```bash
   # Windows
   net start MySQL80
   
   # Verificar estado
   sc query MySQL80
   ```

2. Verifica credenciales en `.env.local`
3. Verifica que la base de datos existe:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

### Problema: Puerto 3000 o 5000 ya en uso

**Síntoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:**
```bash
# Windows - Encontrar proceso usando el puerto
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Problema: Módulos de Python no encontrados

**Síntoma:**
```
ModuleNotFoundError: No module named 'flask'
```

**Solución:**
1. Asegúrate de tener el entorno virtual activado:
   ```bash
   backend-env\Scripts\activate
   ```

2. Reinstala dependencias:
   ```bash
   pip install -r requirements.txt
   ```

### Problema: Error de CORS en el frontend

**Síntoma:**
```
Access to fetch at 'http://localhost:5000/api/...' has been blocked by CORS policy
```

**Solución:**
1. Verifica que `FRONTEND_URL` en `.env.local` sea `http://localhost:3000`
2. Reinicia el backend después de cambiar `.env.local`

### Problema: Migraciones fallan

**Síntoma:**
```
alembic.util.exc.CommandError: Can't locate revision identified by 'xxxxx'
```

**Solución:**
```bash
# Eliminar carpeta de migraciones
rm -rf migrations/versions/*

# Reinicializar
python init_migrations.py
python manage_migrations.py migrate "initial migration"
python manage_migrations.py upgrade
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue las convenciones de código existentes
- Escribe tests para nuevas funcionalidades
- Actualiza la documentación según sea necesario
- Asegúrate de que todos los tests pasen antes de hacer PR

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Leonard Pardo**
- GitHub: [@Leonard-ssj](https://github.com/Leonard-ssj)
- Email: pardo0435@gmail.com

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework de React
- [Flask](https://flask.palletsprojects.com/) - Framework de Python
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [SQLAlchemy](https://www.sqlalchemy.org/) - ORM de Python
- [Zustand](https://zustand-demo.pmnd.rs/) - State management

---

## 📊 Estado del Proyecto

- ✅ **Backend:** 41 endpoints implementados y funcionando
- ✅ **Frontend:** Aplicación completa con todas las vistas
- ✅ **Base de Datos:** 8 tablas con relaciones optimizadas
- ✅ **Autenticación:** JWT con refresh tokens
- ✅ **Testing:** Tests E2E con Playwright
- ✅ **Documentación:** Completa y actualizada
- ✅ **API:** Colección Postman con 41 endpoints

**Versión actual:** 2.0.0  
**Estado:** Producción Ready ✨

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub ⭐**

[⬆ Volver arriba](#-progest---sistema-de-gestión-de-proyectos-saas)

</div>
