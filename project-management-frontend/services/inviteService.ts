import { api } from '@/lib/api'
import type { BackendInvite } from '@/lib/api-types'
import type { Invite } from '@/mock/types'

// ============================================
// MAPEO DE INVITACIÓN
// ============================================

function mapInviteFromBackend(invite: BackendInvite): Invite {
  return {
    id: invite.id,
    project_id: invite.project_id,
    email: invite.email,
    token: invite.token,
    status: invite.status,
    invited_by: invite.invited_by,
    resend_count: invite.resend_count || 0,
    job_title: invite.job_title,
    description: invite.description,
    responsibilities: invite.responsibilities,
    skills: invite.skills,
    shift: invite.shift,
    department: invite.department,
    phone: invite.phone,
    created_at: invite.created_at,
    expires_at: invite.expires_at,
  }
}

// ============================================
// CREATE INVITE (Enviar invitación con datos enriquecidos)
// ============================================

export interface InviteEnrichmentData {
  job_title?: string
  description?: string
  responsibilities?: string
  skills?: string
  shift?: 'morning' | 'afternoon' | 'night' | 'flexible'
  department?: string
  phone?: string
}

export async function sendInvite(
  email: string, 
  enrichmentData?: InviteEnrichmentData
): Promise<{ success: boolean; invite?: Invite; error?: string; message?: string }> {
  try {
    const payload = {
      email,
      ...enrichmentData
    }
    const response = await api.post<{ invite: BackendInvite; message: string }>('/invites', payload)
    return {
      success: true,
      invite: mapInviteFromBackend(response.invite),
      message: response.message
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al enviar la invitación'
    }
  }
}

// ============================================
// LIST INVITES (Listar invitaciones)
// ============================================

export async function listInvites(status?: string): Promise<{ success: boolean; invites?: Invite[]; error?: string }> {
  try {
    const query = status ? `?status=${status}` : ''
    const response = await api.get<{ invites: BackendInvite[]; total: number }>(`/invites${query}`)
    return {
      success: true,
      invites: response.invites.map(mapInviteFromBackend)
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al listar invitaciones'
    }
  }
}

// ============================================
// CANCEL INVITE (Cancelar invitación)
// ============================================

export async function cancelInvite(inviteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await api.delete(`/invites/${inviteId}`)
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al cancelar la invitación'
    }
  }
}

// ============================================
// RESEND INVITE (Reenviar invitación)
// ============================================

export async function resendInvite(inviteId: string): Promise<{ success: boolean; invite?: Invite; error?: string; message?: string }> {
  try {
    const response = await api.post<{ invite: BackendInvite; message: string }>(`/invites/${inviteId}/resend`, {})
    return {
      success: true,
      invite: mapInviteFromBackend(response.invite),
      message: response.message
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al reenviar la invitación'
    }
  }
}

// ============================================
// VALIDATE INVITE TOKEN (Validar token de invitación)
// ============================================

export async function validateInviteToken(
  token: string
): Promise<{ success: boolean; email?: string; projectName?: string; error?: string }> {
  try {
    const response = await api.get<{ email: string; project_name: string; expires_at: string; status: string }>(`/invites/validate/${token}`)
    return {
      success: true,
      email: response.email,
      projectName: response.project_name
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Token inválido'
    }
  }
}

// ============================================
// ACCEPT INVITE (Aceptar invitación)
// ============================================

export async function acceptInviteService(token: string): Promise<boolean> {
  try {
    // La aceptación de invitación se hace a través de /auth/accept-invite
    // Este servicio es solo para validación
    return true
  } catch (error) {
    console.error('Error accepting invite:', error)
    return false
  }
}
