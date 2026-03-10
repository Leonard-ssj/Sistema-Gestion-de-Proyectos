# DOCUMENTACION DEL FRONTEND - ProGest

> Documentacion completa del frontend Next.js

---

## VISION GENERAL

Frontend SPA construido con Next.js 14, React 19, TypeScript y Tailwind CSS. Utiliza App Router, shadcn/ui para componentes y Zustand para estado global.

**Tecnologias:**
- Next.js 14
- React 19.2.0
- TypeScript 5.x
- Tailwind CSS 4.x
- shadcn/ui
- Zustand 5.x
- React Hook Form + Zod

**Puerto:** 3000  
**URL:** http://localhost:3000

---

## ESTRUCTURA DEL PROYECTO

```
project-management-frontend/
├── app/                         # App Router (Next.js 14)
│   ├── (marketing)/             # Rutas publicas
│   │   └── page.tsx             # Landing page
│   ├── auth/                    # Autenticacion
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── app/                     # Aplicacion protegida
│   │   ├── dashboard/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── team/page.tsx
│   │   └── profile/page.tsx
│   ├── admin/                   # Panel admin (SUPERADMIN)
│   │   └── page.tsx
│   ├── onboarding/              # Setup inicial proyecto
│   │   └── page.tsx
│   ├── invite/[token]/          # Aceptar invitacion
│   │   └── page.tsx
│   ├── layout.tsx               # Layout raiz
│   └── globals.css              # Estilos globales
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── calendar.tsx
│   │   ├── date-picker.tsx
│   │   ├── pagination.tsx
│   │   └── ...
│   ├── layout/                  # Layouts
│   │   ├── app-layout.tsx
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   └── marketing/               # Marketing components
│       └── hero.tsx
├── services/                    # API services
│   ├── authService.ts
│   ├── projectService.ts
│   ├── taskService.ts
│   ├── inviteService.ts
│   ├── memberService.ts
│   ├── notificationService.ts
│   ├── commentService.ts
│   └── adminService.ts
├── stores/                      # Zustand stores
│   ├── authStore.ts
│   ├── dataStore.ts
│   └── uiStore.ts
├── lib/                         # Utilidades
│   ├── api.ts                   # Cliente API
│   ├── api-types.ts             # Tipos de API
│   ├── mappers.ts               # Transformaciones
│   ├── constants.ts             # Constantes
│   ├── guards.ts                # Guards de rutas
│   └── utils.ts                 # Utilidades
├── hooks/                       # Custom hooks
│   ├── use-toast.ts
│   └── use-mobile.ts
└── package.json
```

---

## RUTAS DE LA APLICACION

### Rutas Publicas

**Landing Page**
- `/` - Pagina de inicio

**Autenticacion**
- `/auth/login` - Inicio de sesion
- `/auth/register` - Registro de usuarios

**Invitaciones**
- `/invite/[token]` - Aceptar invitacion con token

### Rutas Protegidas

Requieren autenticacion (token JWT).

**Onboarding**
- `/onboarding` - Configuracion inicial del proyecto (solo OWNER sin proyecto)

**Aplicacion Principal**
- `/app/dashboard` - Dashboard principal
- `/app/tasks` - Gestion de tareas
- `/app/team` - Gestion de equipo
- `/app/profile` - Perfil de usuario

**Administracion**
- `/admin` - Panel de administracion (solo SUPERADMIN)

---

## SERVICIOS (API CLIENT)

### authService.ts

```typescript
loginService(email, password): Promise<{success, session, error}>
registerService(data): Promise<{success, user, session, error}>
getMeService(): Promise<User | null>
refreshTokenService(): Promise<string | null>
logoutService(): Promise<void>
acceptInviteService(token, password, name): Promise<{success, session, error}>
```

### taskService.ts

```typescript
fetchTasks(projectId?): Promise<Task[]>
fetchMyTasks(): Promise<Task[]>
getTask(taskId): Promise<Task | null>
createTask(data): Promise<Task>
updateTask(taskId, data): Promise<Task>
deleteTaskService(taskId): Promise<boolean>
assignTask(taskId, userId): Promise<Task>
updateTaskStatus(taskId, status): Promise<{taskId, status}>
getTaskStats(): Promise<TaskStatsResponse | null>
```

### projectService.ts

```typescript
createProjectService(data): Promise<{success, data, error}>
getMyProjectService(): Promise<{success, data, error}>
```

### inviteService.ts

```typescript
createInviteService(data): Promise<{success, data, error}>
getInvitesService(): Promise<{success, data, error}>
cancelInviteService(inviteId): Promise<{success, error}>
validateInviteService(token): Promise<{success, data, error}>
resendInviteService(inviteId): Promise<{success, error}>
```

### memberService.ts

```typescript
getMembersService(): Promise<{success, data, error}>
deactivateMemberService(membershipId): Promise<{success, error}>
updateMemberProfileService(userId, data): Promise<{success, data, error}>
```

### notificationService.ts

```typescript
getNotificationsService(): Promise<{success, data, error}>
getUnreadCountService(): Promise<{success, count, error}>
markAsReadService(notificationId): Promise<{success, error}>
markAllAsReadService(): Promise<{success, error}>
deleteNotificationService(notificationId): Promise<{success, error}>
```

---

## CLIENTE API (lib/api.ts)

### APIClient Class

```typescript
class APIClient {
  private baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: any): Promise<T>
  async patch<T>(endpoint: string, data: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
  
  private async request<T>(method, endpoint, data?): Promise<T>
  private getAuthHeaders(): HeadersInit
  private async handleResponse<T>(response): Promise<T>
  private async handleError(error): Promise<never>
}

export const api = new APIClient()
```

### Caracteristicas

- Manejo automatico de tokens JWT en headers
- Refresh automatico de tokens expirados
- Transformacion de respuestas (extrae `data` de `{success, data}`)
- Manejo de errores HTTP
- Interceptores de request/response

---

## ESTADO GLOBAL (ZUSTAND)

### authStore.ts

```typescript
interface AuthStore {
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  setSession: (session: AuthSession | null) => void
  checkAuth: () => Promise<void>
}

const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: async (email, password) => {
    const result = await loginService(email, password)
    if (result.success && result.session) {
      set({ session: result.session, isAuthenticated: true })
    }
  },
  
  // ... otros metodos
}))
```

### dataStore.ts

```typescript
interface DataStore {
  tasks: Task[]
  members: Member[]
  notifications: Notification[]
  
  fetchTasks: () => Promise<void>
  createTask: (data: CreateTaskData) => Promise<void>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  
  fetchMembers: () => Promise<void>
  updateMemberProfile: (userId: string, data: any) => Promise<void>
  
  fetchNotifications: () => Promise<void>
  markNotificationAsRead: (id: string) => Promise<void>
}
```

### uiStore.ts

```typescript
interface UIStore {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}
```

---

## COMPONENTES PRINCIPALES

### UI Components (shadcn/ui)

Componentes reutilizables de shadcn/ui:

- `Button` - Botones con variantes
- `Input` - Campos de texto
- `Select` - Selectores dropdown
- `Dialog` - Modales
- `Calendar` - Calendario
- `DatePicker` - Selector de fechas
- `Table` - Tablas
- `Pagination` - Paginacion
- `Toast` - Notificaciones toast
- `Alert` - Alertas
- `Avatar` - Avatares de usuario
- `Badge` - Badges de estado
- `Card` - Tarjetas
- `Command` - Busqueda con comandos

### Layout Components

**AppLayout**
```typescript
// components/layout/app-layout.tsx
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Sidebar**
- Navegacion principal
- Links a dashboard, tasks, team, profile
- Indicador de notificaciones
- Boton de logout

**Header**
- Avatar de usuario
- Nombre y rol
- Dropdown de perfil
- Notificaciones

---

## MAPPERS (lib/mappers.ts)

Transformaciones entre formato backend y frontend.

### Backend -> Frontend

```typescript
export function mapUserFromBackend(backendUser: BackendUser): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    role: mapRoleFromBackend(backendUser.role),
    avatar: backendUser.avatar,
    status: backendUser.status,
    createdAt: backendUser.created_at,
    // ... otros campos
  }
}

export function mapTaskFromBackend(backendTask: BackendTask): Task {
  return {
    id: backendTask.id,
    title: backendTask.title,
    status: mapTaskStatusFromBackend(backendTask.status),
    priority: backendTask.priority,
    assignedTo: backendTask.assigned_to,
    dueDate: backendTask.due_date,
    // ... otros campos
  }
}
```

### Frontend -> Backend

```typescript
export function mapTaskToBackend(task: Partial<Task>): Partial<BackendTask> {
  return {
    title: task.title,
    description: task.description,
    status: task.status ? mapTaskStatusToBackend(task.status) : undefined,
    priority: task.priority,
    assigned_to: task.assignedTo,
    due_date: task.dueDate,
    tags: task.tags,
  }
}
```

### Mapeo de Estados

```typescript
// Backend: pending, in_progress, blocked, done
// Frontend: todo, in-progress, blocked, done

export function mapTaskStatusFromBackend(status: string): TaskStatus {
  const mapping = {
    'pending': 'todo',
    'in_progress': 'in-progress',
    'blocked': 'blocked',
    'done': 'done'
  }
  return mapping[status] || 'todo'
}

export function mapTaskStatusToBackend(status: TaskStatus): string {
  const mapping = {
    'todo': 'pending',
    'in-progress': 'in_progress',
    'blocked': 'blocked',
    'done': 'done'
  }
  return mapping[status] || 'pending'
}
```

---

## GUARDS DE RUTAS

### requireAuth (lib/guards.ts)

```typescript
export function requireAuth(Component: React.ComponentType) {
  return function ProtectedRoute(props: any) {
    const { isAuthenticated, isLoading } = useAuthStore()
    const router = useRouter()
    
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/auth/login')
      }
    }, [isAuthenticated, isLoading, router])
    
    if (isLoading) {
      return <LoadingSpinner />
    }
    
    if (!isAuthenticated) {
      return null
    }
    
    return <Component {...props} />
  }
}
```

### requireRole

```typescript
export function requireRole(Component: React.ComponentType, allowedRoles: string[]) {
  return function RoleProtectedRoute(props: any) {
    const { session } = useAuthStore()
    const router = useRouter()
    
    useEffect(() => {
      if (session && !allowedRoles.includes(session.user.role)) {
        router.push('/app/dashboard')
      }
    }, [session, router])
    
    if (!session || !allowedRoles.includes(session.user.role)) {
      return <div>No autorizado</div>
    }
    
    return <Component {...props} />
  }
}
```

---

## FORMULARIOS

### React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, 'Titulo requerido'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedTo: z.string().optional(),
  dueDate: z.date({ required_error: 'Fecha requerida' }),
  tags: z.array(z.string()).optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

function TaskForm() {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      priority: 'medium',
      tags: [],
    }
  })
  
  const onSubmit = async (data: TaskFormData) => {
    await createTask(data)
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* campos del formulario */}
    </form>
  )
}
```

---

## ESTILOS

### Tailwind CSS

Configuracion en `tailwind.config.ts`:

```typescript
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... mas colores
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### CSS Variables

Definidas en `app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... mas variables */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... mas variables */
  }
}
```

---

## COMANDOS UTILES

### Desarrollo

```bash
cd project-management-frontend
npm install
npm run dev
```

### Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

---

**Ultima actualizacion:** 24 de febrero de 2026  
**Version:** 2.0.0
