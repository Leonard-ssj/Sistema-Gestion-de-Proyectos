import { api } from '@/lib/api'
import type { Membership, EmployeeShift } from '@/mock/types'

// ============================================
// MAPEO DE MIEMBRO
// ============================================

interface BackendMember {
  id: string
  email: string
  name: string
  role: string
  status: string
  avatar?: string
  job_title?: string
  description?: string
  responsibilities?: string
  skills?: string
  shift?: string
  department?: string
  phone?: string
  created_at: string
  joined_at?: string
  is_owner: boolean
  membership_id?: string
}

function mapMemberFromBackend(member: BackendMember): Membership {
  return {
    id: member.membership_id || `owner-${member.id}`,
    user_id: member.id,
    project_id: '',
    role: member.role.toLowerCase() as 'owner' | 'employee',
    status: member.status as 'active' | 'inactive',
    joined_at: member.joined_at || member.created_at,
    user: {
      id: member.id,
      email: member.email,
      name: member.name,
      role: member.role.toLowerCase() as 'owner' | 'employee',
      status: member.status as 'active' | 'inactive',
      avatar: member.avatar,
      job_title: member.job_title,
      description: member.description,
      responsibilities: member.responsibilities,
      skills: member.skills,
      shift: member.shift as EmployeeShift | undefined,
      department: member.department,
      phone: member.phone,
      created_at: member.created_at,
      password: ''
    }
  }
}

// ============================================
// LIST MEMBERS (Listar miembros)
// ============================================

export async function listMembers(): Promise<{ success: boolean; members?: Membership[]; error?: string }> {
  try {
    const response = await api.get<{ members: BackendMember[]; total: number; active: number; inactive: number }>('/members')
    return {
      success: true,
      members: response.members.map(mapMemberFromBackend)
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al listar miembros'
    }
  }
}

// ============================================
// DEACTIVATE MEMBER (Desactivar miembro)
// ============================================

export async function deactivateMember(membershipId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await api.patch(`/members/${membershipId}/deactivate`, {})
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al desactivar miembro'
    }
  }
}


// ============================================
// UPDATE MEMBER PROFILE (Actualizar perfil de miembro)
// ============================================

export interface MemberProfileUpdateData {
  name?: string
  job_title?: string
  description?: string
  responsibilities?: string
  skills?: string
  shift?: 'morning' | 'afternoon' | 'night' | 'flexible'
  department?: string
  phone?: string
}

export async function updateMemberProfile(
  userId: string,
  profileData: MemberProfileUpdateData
): Promise<{ success: boolean; user?: any; error?: string; message?: string }> {
  try {
    const response = await api.patch<{ user: any; message: string }>(`/members/${userId}/profile`, profileData)
    return {
      success: true,
      user: response.user,
      message: response.message
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al actualizar el perfil'
    }
  }
}
