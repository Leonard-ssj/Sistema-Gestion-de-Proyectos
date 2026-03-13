import { api } from "@/lib/api"
import type { Sprint, SprintColor, SprintStatus } from "@/mock/types"

export async function listSprints(status?: SprintStatus): Promise<{ success: boolean; sprints?: Sprint[]; error?: string }> {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : ""
    const result = await api.get<{ sprints: Sprint[] }>(`/sprints${query}`)
    return { success: true, sprints: result.sprints }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createSprint(data: {
  name: string
  color: SprintColor
  start_date: string
  end_date: string
  status?: SprintStatus
}): Promise<{ success: boolean; sprint?: Sprint; error?: string }> {
  try {
    const result = await api.post<{ sprint: Sprint }>("/sprints", data)
    return { success: true, sprint: result.sprint }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateSprint(
  sprintId: string,
  data: Partial<{ name: string; color: SprintColor; start_date: string; end_date: string; status: SprintStatus }>
): Promise<{ success: boolean; sprint?: Sprint; error?: string }> {
  try {
    const result = await api.patch<{ sprint: Sprint }>(`/sprints/${sprintId}`, data)
    return { success: true, sprint: result.sprint }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
