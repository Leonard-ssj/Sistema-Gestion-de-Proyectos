# Git Workflow - ProGest

Convenciones de Git para mantener un historial limpio y colaboracion efectiva.

## Formato de Commits

Usar Conventional Commits:

```
tipo(scope): descripcion corta

Descripcion detallada (opcional)

- Cambio 1
- Cambio 2
```

### Tipos de Commits

- **feat**: Nueva funcionalidad
- **fix**: Correccion de bug
- **docs**: Cambios en documentacion
- **style**: Cambios de formato (espacios, punto y coma, etc)
- **refactor**: Refactorizacion de codigo
- **test**: Agregar o modificar tests
- **chore**: Tareas de mantenimiento (deps, config, etc)
- **perf**: Mejoras de performance
- **ci**: Cambios en CI/CD

### Scope (Opcional)

Indica el modulo o area afectada:

- `auth` - Autenticacion
- `tasks` - Tareas
- `projects` - Proyectos
- `members` - Miembros
- `api` - API general
- `ui` - Interfaz de usuario
- `db` - Base de datos
- `docs` - Documentacion

### Ejemplos de Commits

```bash
# Nueva funcionalidad
git commit -m "feat(tasks): add priority filter to task list"

# Correccion de bug
git commit -m "fix(auth): resolve token expiration issue"

# Documentacion
git commit -m "docs(api): update endpoint documentation for tasks"

# Refactorizacion
git commit -m "refactor(services): extract common validation logic"

# Multiples cambios relacionados
git commit -m "feat(tasks): add task statistics endpoint

- Add GET /api/tasks/stats endpoint
- Add stats calculation in task service
- Update API documentation
- Add Postman request"
```

## Nombres de Branches

### Formato

```
tipo/descripcion-corta
```

### Tipos de Branches

- **feature/** - Nueva funcionalidad
- **fix/** - Correccion de bug
- **hotfix/** - Correccion urgente en produccion
- **docs/** - Cambios solo en documentacion
- **refactor/** - Refactorizacion
- **test/** - Agregar tests

### Ejemplos

```bash
# Nueva funcionalidad
git checkout -b feature/task-priority-filter

# Correccion de bug
git checkout -b fix/login-redirect-issue

# Hotfix
git checkout -b hotfix/security-vulnerability

# Documentacion
git checkout -b docs/update-api-docs

# Refactorizacion
git checkout -b refactor/task-service-cleanup
```

## Workflow Completo

### 1. Crear Branch desde Main Actualizado

```bash
# Asegurarse de estar en main
git checkout main

# Actualizar main
git pull origin main

# Crear nueva branch
git checkout -b feature/nueva-funcionalidad
```

### 2. Hacer Cambios y Commits

```bash
# Ver archivos modificados
git status

# Agregar archivos
git add .

# O agregar archivos especificos
git add app/routes/tasks.py app/services/task_service.py

# Commit con mensaje descriptivo
git commit -m "feat(tasks): add priority filter endpoint"

# Hacer mas cambios...
git add .
git commit -m "feat(tasks): add priority filter UI"

# Ver historial
git log --oneline
```

### 3. Push a Branch Remoto

```bash
# Primera vez
git push -u origin feature/nueva-funcionalidad

# Siguientes veces
git push
```

### 4. Crear Pull Request

En GitHub/GitLab:

1. Ir a la pagina del repositorio
2. Click en "New Pull Request"
3. Seleccionar: `feature/nueva-funcionalidad` → `main`
4. Titulo: Mismo que el primer commit o descripcion general
5. Descripcion:
   ```markdown
   ## Descripcion
   Breve descripcion de los cambios
   
   ## Cambios
   - Cambio 1
   - Cambio 2
   
   ## Testing
   - [ ] Probado en desarrollo
   - [ ] Probado con Postman
   - [ ] Tests pasando
   
   ## Documentacion
   - [ ] API docs actualizada
   - [ ] Postman collection actualizada
   ```
6. Asignar reviewers
7. Crear PR

### 5. Code Review

- Esperar aprobacion de al menos 1 reviewer
- Hacer cambios solicitados:
  ```bash
  # Hacer cambios
  git add .
  git commit -m "fix: address review comments"
  git push
  ```
- Los cambios se agregan automaticamente al PR

### 6. Merge a Main

Una vez aprobado:

**Opcion A: Merge desde GitHub/GitLab (Recomendado)**
- Click en "Merge Pull Request"
- Seleccionar tipo de merge (squash, merge, rebase)
- Confirmar merge

**Opcion B: Merge local**
```bash
git checkout main
git pull origin main
git merge feature/nueva-funcionalidad
git push origin main
```

### 7. Limpiar Branch

```bash
# Eliminar branch local
git branch -d feature/nueva-funcionalidad

# Eliminar branch remoto
git push origin --delete feature/nueva-funcionalidad

# O desde GitHub/GitLab: Click en "Delete branch"
```

## Resolver Conflictos

### Cuando Hay Conflictos

```bash
# Actualizar main
git checkout main
git pull origin main

# Volver a tu branch
git checkout feature/tu-branch

# Hacer rebase con main
git rebase main

# Si hay conflictos, Git te lo indica
# CONFLICT (content): Merge conflict in archivo.py
```

### Resolver Conflictos Manualmente

1. Abrir archivos con conflictos
2. Buscar marcadores:
   ```
   <<<<<<< HEAD
   Tu codigo
   =======
   Codigo de main
   >>>>>>> main
   ```
3. Editar para resolver conflicto
4. Eliminar marcadores
5. Guardar archivo

```bash
# Agregar archivos resueltos
git add archivo-resuelto.py

# Continuar rebase
git rebase --continue

# Si hay mas conflictos, repetir proceso

# Una vez resueltos todos
git push -f origin feature/tu-branch
```

### Abortar Rebase

Si algo sale mal:

```bash
git rebase --abort
```

## Commits Atomicos

Hacer commits pequenos y enfocados:

```bash
# ❌ MAL - Un commit gigante
git add .
git commit -m "feat: add task filters and fix bugs and update docs"

# ✅ BIEN - Commits separados
git add app/routes/tasks.py app/services/task_service.py
git commit -m "feat(tasks): add priority filter endpoint"

git add app/schemas/task_schema.py
git commit -m "feat(tasks): add priority validation"

git add .kiro/API_COMPLETE_DOCUMENTATION.md
git commit -m "docs(api): document priority filter endpoint"
```

## Mensajes de Commit Descriptivos

```bash
# ❌ MAL - Mensaje vago
git commit -m "fix bug"
git commit -m "update"
git commit -m "changes"

# ✅ BIEN - Mensaje descriptivo
git commit -m "fix(auth): resolve token expiration causing logout"
git commit -m "feat(tasks): add due date validation"
git commit -m "docs(api): add examples for task creation"
```

## Comandos Utiles

### Ver Estado

```bash
# Ver archivos modificados
git status

# Ver diferencias
git diff

# Ver diferencias de archivo especifico
git diff app/routes/tasks.py

# Ver diferencias staged
git diff --staged
```

### Historial

```bash
# Ver historial
git log

# Ver historial compacto
git log --oneline

# Ver historial con grafico
git log --oneline --graph --all

# Ver historial de archivo
git log app/routes/tasks.py

# Ver cambios de commit especifico
git show <commit-hash>
```

### Deshacer Cambios

```bash
# Deshacer cambios no staged
git checkout -- archivo.py

# Deshacer todos los cambios no staged
git checkout -- .

# Deshacer cambios staged
git reset HEAD archivo.py

# Deshacer ultimo commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer ultimo commit (eliminar cambios)
git reset --hard HEAD~1
```

### Stash (Guardar Cambios Temporalmente)

```bash
# Guardar cambios
git stash

# Guardar con mensaje
git stash save "WIP: task filter implementation"

# Ver stashes
git stash list

# Aplicar ultimo stash
git stash pop

# Aplicar stash especifico
git stash apply stash@{0}

# Eliminar stash
git stash drop stash@{0}
```

### Branches

```bash
# Ver branches locales
git branch

# Ver todas las branches (local + remoto)
git branch -a

# Cambiar a branch
git checkout nombre-branch

# Crear y cambiar a branch
git checkout -b nueva-branch

# Eliminar branch local
git branch -d nombre-branch

# Eliminar branch remoto
git push origin --delete nombre-branch

# Renombrar branch actual
git branch -m nuevo-nombre
```

## Buenas Practicas

### 1. Commits Frecuentes

Hacer commits pequenos y frecuentes:

```bash
# Cada vez que completes una parte logica
git add .
git commit -m "feat(tasks): add filter by status"

# Continuar trabajando...
git add .
git commit -m "feat(tasks): add filter by priority"
```

### 2. Pull Antes de Push

Siempre actualizar antes de subir cambios:

```bash
git pull origin main
git push origin feature/tu-branch
```

### 3. No Hacer Commit de Archivos Temporales

Agregar a `.gitignore`:

```
# Python
__pycache__/
*.pyc
*.pyo
backend-env/

# Node
node_modules/
.next/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.local

# Logs
*.log
```

### 4. Revisar Antes de Commit

```bash
# Ver que archivos vas a commitear
git status

# Ver cambios especificos
git diff

# Agregar solo lo necesario
git add archivo1.py archivo2.py
```

### 5. No Hacer Force Push a Main

```bash
# ❌ NUNCA hacer esto en main
git push -f origin main

# ✅ Solo en tu branch personal
git push -f origin feature/tu-branch
```

## Checklist de Git

Antes de hacer commit:

- [ ] Codigo funciona correctamente
- [ ] Tests pasan (si aplica)
- [ ] No hay console.logs o prints de debug
- [ ] Archivos temporales no incluidos
- [ ] Mensaje de commit descriptivo
- [ ] Cambios relacionados en un solo commit

Antes de crear PR:

- [ ] Branch actualizado con main
- [ ] Todos los commits tienen mensajes descriptivos
- [ ] Documentacion actualizada
- [ ] Tests agregados/actualizados
- [ ] Postman collection actualizada (si aplica)

## Recordatorios

- SIEMPRE hacer commits atomicos y descriptivos
- SIEMPRE actualizar main antes de crear branch
- SIEMPRE revisar cambios antes de commit
- NUNCA hacer commit de archivos temporales
- NUNCA hacer force push a main
- SIEMPRE resolver conflictos cuidadosamente
- SIEMPRE hacer pull antes de push
