import { api } from '@/lib/api';

export interface ChatMessage {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  user_avatar?: string | null;
  task_id?: string | null;
  task_title?: string | null;
  mentioned_user_id?: string | null;
  mentioned_user_name?: string | null;
  content: string;
  created_at: string;
  updated_at?: string;
  is_mine?: boolean; // Campo calculado en el frontend
}

export const chatService = {
  getMessages: async (projectId: string, limit: number = 50): Promise<ChatMessage[]> => {
    const response = await api.get<ChatMessage[]>(`/projects/${projectId}/chat?limit=${limit}`);
    return response || [];
  },

  /**
   * Envía un nuevo mensaje al chat del proyecto
   */
  sendMessage: async (projectId: string, content: string, taskId?: string | null, mentionedUserId?: string | null): Promise<ChatMessage> => {
    try {
      const payload: any = { content }
      if (taskId) {
        payload.task_id = taskId
      }
      if (mentionedUserId) {
        payload.mentioned_user_id = mentionedUserId
      }
      const response = await api.post<ChatMessage>(`/projects/${projectId}/chat`, payload)
      return response
    } catch (error) {
      console.error('Error enviando mensaje de chat:', error)
      throw error
    }
  }
};
