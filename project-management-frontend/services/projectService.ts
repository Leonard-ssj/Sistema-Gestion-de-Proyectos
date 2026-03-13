import { api } from '@/lib/api'
import type { TenantStatus } from '@/mock/types'

export interface CreateProjectData {
  name: string
  description: string
  category: string
  timezone: string
  date_format: string
  state: string
  tasks_retention_days?: number
  sprint_enabled?: boolean
  sprint_length_days?: number
}

export interface ProjectResponse {
  id: string
  name: string
  description: string | null
  category: string | null
  timezone: string
  date_format: string
  state: string | null
  tasks_retention_days: number
  sprint_enabled: boolean
  sprint_length_days: number
  owner_id: string
  status: TenantStatus
  created_at: string
  updated_at: string
}

export async function createProjectService(data: CreateProjectData): Promise<{ success: boolean; project?: ProjectResponse; error?: string }> {
  try {
    const result = await api.post<{ project: ProjectResponse }>('/projects', data)
    return { success: true, project: result.project }
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

export async function getProjectSettingsService(): Promise<{ success: boolean; project?: ProjectResponse; error?: string }> {
  try {
    const result = await api.get<{ project: ProjectResponse }>('/projects/settings')
    return { success: true, project: result.project }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProjectSettingsService(
  data: Partial<Pick<ProjectResponse, 'name' | 'description' | 'category' | 'timezone' | 'date_format' | 'state' | 'tasks_retention_days' | 'sprint_enabled' | 'sprint_length_days'>>
): Promise<{ success: boolean; project?: ProjectResponse; error?: string }> {
  try {
    const result = await api.patch<{ project: ProjectResponse }>('/projects/settings', data)
    return { success: true, project: result.project }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
