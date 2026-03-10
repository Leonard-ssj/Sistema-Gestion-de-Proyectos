# Frontend Conventions - ProGest

Convenciones de codigo para el frontend Next.js 14 de ProGest.

## Estructura de Componentes

```
app/
├── (marketing)/          # Rutas publicas
│   ├── page.tsx         # Landing page
│   └── layout.tsx       # Layout marketing
├── auth/                # Autenticacion
│   ├── login/
│   └── register/
└── app/                 # Rutas protegidas
    ├── dashboard/
    ├── tasks/
    └── team/

components/
├── ui/                  # Componentes shadcn/ui
├── layout/              # Layouts
└── features/            # Componentes de funcionalidad

services/                # Servicios de API
├── authService.ts
├── taskService.ts
└── projectService.ts
```

## Componentes de Pagina

Usar 'use client' para componentes interactivos:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { requireAuth } from '@/lib/guards'

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    const result = await taskService.getTasks()
    if (result.success) {
      setTasks(result.data)
    }
    setLoading(false)
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div>
      {/* Contenido */}
    </div>
  )
}

export default requireAuth(TasksPage)
```

## Servicios de API

Todos los servicios siguen este patron:

```typescript
// services/taskService.ts
import { api } from '@/lib/api'

export async function getTasks(filters?: any) {
  try {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/tasks?${params}`)
    return { success: true, data: response }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Error al obtener tareas'
    }
  }
}

export async function createTask(data: any) {
  try {
    const response = await api.post('/tasks', data)
    return { success: true, data: response }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

## Manejo de Estados

### Loading State

```typescript
const [loading, setLoading] = useState(false)

const handleSubmit = async () => {
  setLoading(true)
  try {
    const result = await taskService.createTask(data)
    if (result.success) {
      toast.success('Tarea creada exitosamente')
    }
  } finally {
    setLoading(false)
  }
}

return (
  <Button disabled={loading}>
    {loading ? 'Guardando...' : 'Guardar'}
  </Button>
)
```

### Error State

```typescript
const [error, setError] = useState<string | null>(null)

const loadData = async () => {
  setError(null)
  const result = await taskService.getTasks()
  
  if (!result.success) {
    setError(result.error)
    return
  }
  
  setData(result.data)
}

return (
  <>
    {error && (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}
  </>
)
```

### Empty State

```typescript
if (tasks.length === 0) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">No hay tareas</p>
      <Button onClick={() => setShowCreateDialog(true)}>
        Crear primera tarea
      </Button>
    </div>
  )
}
```

## Componentes shadcn/ui

Usar componentes de shadcn/ui para UI consistente:

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem } from '@/components/ui/select'
import { toast } from 'sonner'

// Botones
<Button variant="default">Guardar</Button>
<Button variant="destructive">Eliminar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Cerrar</Button>

// Inputs
<Input 
  type="text" 
  placeholder="Titulo de la tarea"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>

// Toasts
toast.success('Operacion exitosa')
toast.error('Error al guardar')
toast.info('Informacion importante')
```

## Formularios

Usar React Hook Form + Zod para validacion:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, 'Titulo requerido'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
})

type TaskFormData = z.infer<typeof taskSchema>

function TaskForm() {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      priority: 'medium'
    }
  })

  const onSubmit = async (data: TaskFormData) => {
    const result = await taskService.createTask(data)
    if (result.success) {
      toast.success('Tarea creada')
      form.reset()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Campos del formulario */}
    </form>
  )
}
```

## Proteccion de Rutas

Usar el guard requireAuth para rutas protegidas:

```typescript
// lib/guards.ts
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function requireAuth(Component: any) {
  return function ProtectedRoute(props: any) {
    const router = useRouter()
    const { user, loading } = useAuthStore()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth/login')
      }
    }, [user, loading, router])

    if (loading) return <LoadingScreen />
    if (!user) return null

    return <Component {...props} />
  }
}
```

## Estado Global con Zustand

```typescript
// stores/authStore.ts
import { create } from 'zustand'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null })
  }
}))

// Usar en componentes
function Header() {
  const { user, logout } = useAuthStore()
  
  return (
    <div>
      <span>{user?.name}</span>
      <Button onClick={logout}>Cerrar sesion</Button>
    </div>
  )
}
```

## Responsive Design

Usar clases de Tailwind para responsive:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Contenido */}
</div>

<div className="hidden md:block">
  {/* Solo visible en desktop */}
</div>

<div className="block md:hidden">
  {/* Solo visible en mobile */}
</div>
```

## Optimizacion de Imagenes

Usar next/image para imagenes:

```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="ProGest Logo"
  width={200}
  height={50}
  priority
/>
```

## Navegacion

Usar next/navigation para navegacion:

```typescript
import { useRouter } from 'next/navigation'

function TaskItem({ task }) {
  const router = useRouter()
  
  const handleClick = () => {
    router.push(`/app/tasks/${task.id}`)
  }
  
  return <div onClick={handleClick}>{task.title}</div>
}
```

## Nombres de Archivos y Componentes

- **Componentes**: PascalCase (TaskCard.tsx, UserProfile.tsx)
- **Servicios**: camelCase (taskService.ts, authService.ts)
- **Hooks**: camelCase con 'use' (useAuth.ts, useTasks.ts)
- **Utils**: camelCase (formatDate.ts, validators.ts)
- **Stores**: camelCase con 'Store' (authStore.ts, taskStore.ts)

## Estructura de Componente

```typescript
'use client'

// 1. Imports de React
import { useState, useEffect } from 'react'

// 2. Imports de Next.js
import { useRouter } from 'next/navigation'

// 3. Imports de UI
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// 4. Imports de servicios
import { taskService } from '@/services/taskService'

// 5. Imports de stores
import { useAuthStore } from '@/stores/authStore'

// 6. Imports de tipos
import type { Task } from '@/types'

// 7. Componente
function TaskList() {
  // Estados
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  
  // Hooks
  const router = useRouter()
  const { user } = useAuthStore()
  
  // Effects
  useEffect(() => {
    loadTasks()
  }, [])
  
  // Funciones
  const loadTasks = async () => {
    // ...
  }
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}

export default TaskList
```

## Comentarios

Agregar comentarios para logica compleja:

```typescript
// Filtrar tareas por estado y prioridad
const filteredTasks = tasks.filter(task => {
  // Filtro de estado
  if (statusFilter && task.status !== statusFilter) {
    return false
  }
  
  // Filtro de prioridad
  if (priorityFilter && task.priority !== priorityFilter) {
    return false
  }
  
  return true
})
```

## Recordatorios

- SIEMPRE usar 'use client' en componentes interactivos
- SIEMPRE manejar loading, error y empty states
- SIEMPRE usar componentes de shadcn/ui
- SIEMPRE validar formularios con Zod
- SIEMPRE proteger rutas con requireAuth
- SIEMPRE usar toast para feedback al usuario
- SIEMPRE hacer responsive design
- NUNCA hacer fetch directo, usar servicios
