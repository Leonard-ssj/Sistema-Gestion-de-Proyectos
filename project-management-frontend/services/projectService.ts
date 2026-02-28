import { api } from '@/lib/api'

export interface CreateProjectData {
  name: string
  description?: string
  category?: string
}

export interface ProjectResponse {
  id: number
  name: string
  description: string | null
  category: string | null
  owner_id: number
  status: string
  created_at: string
  updated_at: string
}

export async function createProjectService(data: CreateProjectData) {
  try {
    const result = await api.post<{ project: ProjectResponse }>('/projects', data)
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getMyProjectService() {
  try {
    const result = await api.get<{ project: ProjectResponse }>('/projects/my-project')
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
