import { api } from '@/lib/api'
import type { BackendComment } from '@/lib/api-types'
import type { Comment } from '@/mock/types'

// ============================================
// MAPEO DE COMENTARIO
// ============================================

function mapCommentFromBackend(comment: BackendComment): Comment {
  return {
    id: comment.id,
    task_id: comment.task_id,
    user_id: comment.user_id,
    user_name: comment.user_name,
    text: comment.text || (comment as any).content, // Backend puede devolver 'content' o 'text'
    created_at: comment.created_at,
  }
}

// ============================================
// LIST COMMENTS (Listar comentarios de una tarea)
// ============================================

export async function listComments(taskId: string): Promise<Comment[]> {
  try {
    const response = await api.get<BackendComment[]>(`/tasks/${taskId}/comments`)
    // El backend devuelve un array directamente en data
    if (Array.isArray(response)) {
      return response.map(mapCommentFromBackend)
    }
    console.warn('Unexpected response format for listComments:', response)
    return []
  } catch (error) {
    console.error('Error listing comments:', error)
    return []
  }
}

// ============================================
// CREATE COMMENT (Crear comentario)
// ============================================

export async function createComment(
  taskId: string, 
  content: string
): Promise<Comment | null> {
  try {
    const response = await api.post<BackendComment>(`/tasks/${taskId}/comments`, { 
      content 
    })
    return mapCommentFromBackend(response)
  } catch (error) {
    console.error('Error creating comment:', error)
    return null
  }
}

// ============================================
// UPDATE COMMENT (Actualizar comentario)
// ============================================

export async function updateComment(
  taskId: string,
  commentId: string,
  content: string
): Promise<Comment | null> {
  try {
    const response = await api.patch<BackendComment>(
      `/tasks/${taskId}/comments/${commentId}`, 
      { content }
    )
    return mapCommentFromBackend(response)
  } catch (error) {
    console.error('Error updating comment:', error)
    return null
  }
}

// ============================================
// DELETE COMMENT (Eliminar comentario)
// ============================================

export async function deleteComment(
  taskId: string,
  commentId: string
): Promise<boolean> {
  try {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`)
    return true
  } catch (error) {
    console.error('Error deleting comment:', error)
    return false
  }
}
