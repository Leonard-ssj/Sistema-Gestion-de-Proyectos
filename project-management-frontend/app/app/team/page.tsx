"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { UserPlus, Mail, Shield, User, Loader2, RefreshCw, Trash2, Edit, Copy, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { sendInvite, listInvites, resendInvite, cancelInvite } from "@/services/inviteService"
import { listMembers, updateMemberProfile, deactivateMember, activateMember, type MemberProfileUpdateData } from "@/services/memberService"
import type { Invite, Membership } from "@/mock/types"
import { normalizeAvatarUrl } from "@/lib/avatars"
import { cn } from "@/lib/utils"
import { FadeInStagger, FadeInItem } from "@/components/ui/fade-in"
import Link from "next/link"

export default function TeamPage() {
  const session = useAuthStore((s) => s.session)
  const projectId = session?.project?.id
  const EMAIL_MAX = 254
  const NAME_MAX = 255
  const JOB_TITLE_MAX = 100
  const DEPARTMENT_MAX = 100
  const DESCRIPTION_MAX = 500
  const RESPONSIBILITIES_MAX = 1000
  const SKILLS_MAX = 500
  const PHONE_MAX = 20
  const MEXICO_PREFIX = "+52"

  function normalizeMxPhone(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return null
    const digits = trimmed.replace(/\D/g, "")
    const hasPrefix = trimmed.startsWith(MEXICO_PREFIX) || digits.startsWith("52")
    if (!hasPrefix) return null
    const local = digits.startsWith("52") ? digits.slice(2) : digits
    if (local.length !== 10) return null
    return `+52${local}`
  }

  const [members, setMembers] = useState<Membership[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const inviteEmailNormalized = inviteEmail.trim().toLowerCase()
  const inviteEmailValid = !!inviteEmailNormalized && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmailNormalized) && inviteEmailNormalized.length <= EMAIL_MAX
  const [inviteData, setInviteData] = useState({
    job_title: "",
    description: "",
    responsibilities: "",
    skills: "",
    shift: "" as "" | "morning" | "afternoon" | "night" | "flexible",
    department: "",
    phone: ""
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [editData, setEditData] = useState({
    name: "",
    job_title: "",
    description: "",
    responsibilities: "",
    skills: "",
    shift: "" as "" | "morning" | "afternoon" | "night" | "flexible",
    department: "",
    phone: "",
    chat_enabled: true
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statusChangingId, setStatusChangingId] = useState<string | null>(null)

  // Calcular total de miembros (activos + pendientes)
  const teamLimit = 20
  const activeMembers = members.filter(m => m.status === "active").length
  const pendingInvites = invites.filter(i => i.status === "pending").length
  const totalMembers = activeMembers + pendingInvites
  const canInviteMore = totalMembers < teamLimit

  // Cargar miembros e invitaciones al montar
  useEffect(() => {
    if (projectId) {
      loadData()
    }
  }, [projectId])

  async function loadData() {
    setLoadingData(true)
    try {
      // Cargar miembros
      const membersResult = await listMembers()
      if (membersResult.success && membersResult.members) {
        setMembers(membersResult.members)
      }

      // Cargar invitaciones
      const invitesResult = await listInvites()
      if (invitesResult.success && invitesResult.invites) {
        setInvites(invitesResult.invites)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  async function handleInvite() {
    toast.info("Iniciando envío de invitación...")
    if (!inviteEmailNormalized || !projectId) {
      const reason = !inviteEmailNormalized ? "email vacío" : "projectId faltante"
      toast.error(`Error: ${reason}`)
      return
    }

    if (!inviteEmailValid) {
      toast.error("Ingresa un email válido")
      return
    }

    if (!inviteData.job_title.trim()) {
      toast.error("El puesto es requerido")
      return
    }

    if (!inviteData.department.trim()) {
      toast.error("El departamento es requerido")
      return
    }

    if (!inviteData.shift) {
      toast.error("El turno es requerido")
      return
    }
    
    // Validaciones
    if (!inviteData.phone.trim()) {
      toast.error("El teléfono es requerido")
      return
    }

    if (!/^[\d+\-() ]+$/.test(inviteData.phone)) {
      toast.error("El teléfono solo puede contener números y símbolos +, -, (, )")
      return
    }

    if (inviteData.phone.length > PHONE_MAX) {
      toast.error(`El teléfono no puede exceder ${PHONE_MAX} caracteres`)
      return
    }

    const normalizedPhone = normalizeMxPhone(inviteData.phone)
    if (!normalizedPhone) {
      toast.error("El teléfono debe ser de México e iniciar con +52 y tener 10 dígitos")
      return
    }
    
    if (inviteData.job_title && inviteData.job_title.length > JOB_TITLE_MAX) {
      toast.error(`El puesto no puede exceder ${JOB_TITLE_MAX} caracteres`)
      return
    }
    
    if (inviteData.department && inviteData.department.length > DEPARTMENT_MAX) {
      toast.error(`El departamento no puede exceder ${DEPARTMENT_MAX} caracteres`)
      return
    }

    if (inviteData.description && inviteData.description.length > DESCRIPTION_MAX) {
      toast.error(`La descripción no puede exceder ${DESCRIPTION_MAX} caracteres`)
      return
    }

    if (inviteData.responsibilities && inviteData.responsibilities.length > RESPONSIBILITIES_MAX) {
      toast.error(`Las responsabilidades no pueden exceder ${RESPONSIBILITIES_MAX} caracteres`)
      return
    }

    if (inviteData.skills && inviteData.skills.length > SKILLS_MAX) {
      toast.error(`Las habilidades no pueden exceder ${SKILLS_MAX} caracteres`)
      return
    }
    
    setLoading(true)
    
    try {
      // Preparar datos de enriquecimiento (solo enviar si tienen valor)
      const enrichmentData: any = {}
      if (inviteData.job_title) enrichmentData.job_title = inviteData.job_title.trim()
      if (inviteData.description) enrichmentData.description = inviteData.description
      if (inviteData.responsibilities) enrichmentData.responsibilities = inviteData.responsibilities
      if (inviteData.skills) enrichmentData.skills = inviteData.skills
      if (inviteData.shift) enrichmentData.shift = inviteData.shift
      if (inviteData.department) enrichmentData.department = inviteData.department.trim()
      enrichmentData.phone = normalizedPhone
      
      const result = await sendInvite(inviteEmailNormalized, Object.keys(enrichmentData).length > 0 ? enrichmentData : undefined)
      
      if (!result.success) {
        toast.error(result.error || "Error al enviar la invitación")
        setLoading(false)
        return
      }
      
      toast.success(result.message || `Invitación enviada a ${inviteEmailNormalized}`)
      setInviteEmail("")
      setInviteData({
        job_title: "",
        description: "",
        responsibilities: "",
        skills: "",
        shift: "",
        department: "",
        phone: ""
      })
      setDialogOpen(false)
      
      // Recargar invitaciones
      await loadData()
    } catch (error) {
      console.error("Error sending invite:", error)
      toast.error("Error al enviar la invitación")
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleMemberStatus(m: Membership) {
    if (m.role !== "employee") return
    if (!m.id) return
    setStatusChangingId(m.id)
    try {
      if (m.status === "active") {
        const res = await deactivateMember(m.id)
        if (!res.success) {
          toast.error(res.error || "No se pudo desactivar")
          return
        }
        setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "inactive" } : x)))
        toast.success("Empleado desactivado")
      } else {
        const res = await activateMember(m.id)
        if (!res.success) {
          toast.error(res.error || "No se pudo activar")
          return
        }
        setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "active" } : x)))
        toast.success("Empleado activado")
      }
    } finally {
      setStatusChangingId(null)
    }
  }

  function buildInviteUrl(token: string) {
    return `${window.location.origin}/invite/accept?token=${token}`
  }

  function buildWhatsAppInviteUrl(inv: Invite) {
    if (!inv.phone) return null
    const phone = normalizeMxPhone(inv.phone)
    if (!phone) return null
    const waPhone = phone.replace(/\D/g, "")
    const url = buildInviteUrl(inv.token)
    const ownerName = session?.user?.name || "Hola"
    const projectName = session?.project?.name || "mi proyecto"
    const text = `Hola\n\nSoy ${ownerName}.\n\nTe comparto tu invitación para unirte a “${projectName}” en ProGest.\n\nLink de registro:\n${url}`
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`
  }

  async function handleResendInvite(inviteId: string) {
    setResendingId(inviteId)
    
    try {
      const result = await resendInvite(inviteId)
      
      if (!result.success) {
        toast.error(result.error || "Error al reenviar la invitación")
        return
      }
      
      toast.success("Invitación reenviada exitosamente")
      
      // Recargar invitaciones
      await loadData()
    } catch (error) {
      console.error("Error resending invite:", error)
      toast.error("Error al reenviar la invitación")
    } finally {
      setResendingId(null)
    }
  }

  async function handleDeleteInvite(inviteId: string) {
    setDeletingId(inviteId)
    
    try {
      const result = await cancelInvite(inviteId)
      
      if (!result.success) {
        toast.error(result.error || "Error al eliminar la invitación")
        return
      }
      
      toast.success("Invitación eliminada exitosamente")
      
      // Recargar invitaciones
      await loadData()
    } catch (error) {
      console.error("Error deleting invite:", error)
      toast.error("Error al eliminar la invitación")
    } finally {
      setDeletingId(null)
    }
  }

  function handleCopyInviteLink(token: string) {
    const inviteUrl = `${window.location.origin}/invite/accept?token=${token}`
    
    navigator.clipboard.writeText(inviteUrl).then(() => {
      toast.success("Link de invitación copiado al portapapeles")
    }).catch((error) => {
      console.error("Error copying to clipboard:", error)
      toast.error("Error al copiar el link")
    })
  }

  function handleEditMember(member: any) {
    setEditingMember(member)
    setEditData({
      name: member.user?.name || member.name || "",
      job_title: member.user?.job_title || "",
      description: member.user?.description || "",
      responsibilities: member.user?.responsibilities || "",
      skills: member.user?.skills || "",
      shift: member.user?.shift || "",
      department: member.user?.department || "",
      phone: member.user?.phone || "",
      chat_enabled: member.chat_enabled !== undefined ? member.chat_enabled : true
    })
    setEditDialogOpen(true)
  }

  async function handleUpdateMember() {
    if (!editingMember) return
    
    // Validaciones
    if (editData.phone && !/^[\d+\-() ]+$/.test(editData.phone)) {
      toast.error("El teléfono solo puede contener números y símbolos +, -, (, )")
      return
    }
    
    if (editData.name && editData.name.length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres")
      return
    }

    if (editData.name && editData.name.length > NAME_MAX) {
      toast.error(`El nombre no puede exceder ${NAME_MAX} caracteres`)
      return
    }

    if (editData.job_title && editData.job_title.length > JOB_TITLE_MAX) {
      toast.error(`El puesto no puede exceder ${JOB_TITLE_MAX} caracteres`)
      return
    }

    if (editData.department && editData.department.length > DEPARTMENT_MAX) {
      toast.error(`El departamento no puede exceder ${DEPARTMENT_MAX} caracteres`)
      return
    }

    if (editData.description && editData.description.length > DESCRIPTION_MAX) {
      toast.error(`La descripción no puede exceder ${DESCRIPTION_MAX} caracteres`)
      return
    }

    if (editData.responsibilities && editData.responsibilities.length > RESPONSIBILITIES_MAX) {
      toast.error(`Las responsabilidades no pueden exceder ${RESPONSIBILITIES_MAX} caracteres`)
      return
    }

    if (editData.skills && editData.skills.length > SKILLS_MAX) {
      toast.error(`Las habilidades no pueden exceder ${SKILLS_MAX} caracteres`)
      return
    }

    if (editData.phone && editData.phone.length > PHONE_MAX) {
      toast.error(`El teléfono no puede exceder ${PHONE_MAX} caracteres`)
      return
    }
    
    setLoading(true)
    
    try {
      // Preparar datos (solo enviar campos que tienen valor)
      const updateData: MemberProfileUpdateData = {}
      if (editData.name) updateData.name = editData.name
      if (editData.job_title) updateData.job_title = editData.job_title
      if (editData.description) updateData.description = editData.description
      if (editData.responsibilities) updateData.responsibilities = editData.responsibilities
      if (editData.skills) updateData.skills = editData.skills
      if (editData.shift) updateData.shift = editData.shift
      if (editData.department) updateData.department = editData.department
      if (editData.phone) updateData.phone = editData.phone
      updateData.chat_enabled = editData.chat_enabled
      
      const userId = editingMember.user?.id || editingMember.user_id || editingMember.id
      const result = await updateMemberProfile(userId, updateData)
      
      if (!result.success) {
        toast.error(result.error || "Error al actualizar el perfil")
        setLoading(false)
        return
      }
      
      toast.success("Perfil actualizado exitosamente")
      setEditDialogOpen(false)
      setEditingMember(null)
      
      // Recargar miembros
      await loadData()
    } catch (error) {
      console.error("Error updating member:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[24px] relative z-[1]">
      <div className="flex flex-wrap items-start justify-between gap-[16px]">
        <div>
          <h1 className="text-[36px] font-[600] mb-[10px] text-admin-dark">Equipo</h1>
          <ul className="flex items-center gap-[16px]">
            <li><Link href="/app/dashboard" className="text-admin-dark-grey hover:opacity-80 transition-opacity">Dashboard</Link></li>
            <li><span className="text-admin-dark-grey">{'>'}</span></li>
            <li><span className="text-admin-blue font-medium">Equipo</span></li>
          </ul>
          <p className="text-admin-dark-grey font-medium mt-4">
            {activeMembers} miembros activos {pendingInvites > 0 && `+ ${pendingInvites} invitaciones pendientes`} ({totalMembers}/{teamLimit})
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!canInviteMore}>
              <UserPlus className="h-4 w-4" /> 
              {canInviteMore ? "Invitar Miembro" : `Límite Alcanzado (${teamLimit}/${teamLimit})`}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Invitar al Equipo</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4">
              <div>
                <Label>Email *</Label>
                <Input 
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)} 
                  placeholder="correo@ejemplo.com" 
                  type="email"
                  disabled={loading}
                  maxLength={254}
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Información del Empleado</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Puesto *</Label>
                    <Input 
                      value={inviteData.job_title} 
                      onChange={(e) => setInviteData({...inviteData, job_title: e.target.value})} 
                      placeholder="Ej: Puesto del empleado" 
                      disabled={loading}
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <Label>Departamento *</Label>
                    <Input 
                      value={inviteData.department} 
                      onChange={(e) => setInviteData({...inviteData, department: e.target.value})} 
                      placeholder="Ej: Nombre del departamento" 
                      disabled={loading}
                      maxLength={100}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label>Descripción</Label>
                  <Textarea 
                    value={inviteData.description} 
                    onChange={(e) => setInviteData({...inviteData, description: e.target.value})} 
                    placeholder="Breve descripción del empleado..." 
                    disabled={loading}
                    rows={2}
                    maxLength={500}
                  />
                </div>
                
                <div className="mt-4">
                  <Label>Responsabilidades</Label>
                  <Textarea 
                    value={inviteData.responsibilities} 
                    onChange={(e) => setInviteData({...inviteData, responsibilities: e.target.value})} 
                    placeholder="Principales responsabilidades del puesto..." 
                    disabled={loading}
                    rows={3}
                    maxLength={1000}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Habilidades</Label>
                    <Input 
                      value={inviteData.skills} 
                      onChange={(e) => setInviteData({...inviteData, skills: e.target.value})} 
                      placeholder="Ej: Habilidades separadas por comas" 
                      disabled={loading}
                      maxLength={500}
                    />
                  </div>
                  
                  <div>
                    <Label>Turno *</Label>
                    <Select 
                      value={inviteData.shift} 
                      onValueChange={(value: any) => setInviteData({...inviteData, shift: value})}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Mañana</SelectItem>
                        <SelectItem value="afternoon">Tarde</SelectItem>
                        <SelectItem value="night">Noche</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label>Teléfono *</Label>
                  <Input 
                    value={inviteData.phone} 
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9+\-() ]/g, "")
                      setInviteData({ ...inviteData, phone: raw })
                    }} 
                    placeholder="Ej: +52 123 456 7890" 
                    type="tel"
                    disabled={loading}
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Formato: +52 + 10 dígitos</p>
                </div>
              </div>
              
              <Button
                onClick={handleInvite}
                disabled={!inviteEmailValid || !inviteData.job_title.trim() || !inviteData.department.trim() || !inviteData.shift || !normalizeMxPhone(inviteData.phone) || loading}
                className="mt-2"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Invitacion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Miembro</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Nombre *</Label>
              <Input 
                value={editData.name} 
                onChange={(e) => setEditData({...editData, name: e.target.value})} 
                placeholder="Nombre completo" 
                disabled={loading}
                minLength={2}
                maxLength={255}
              />
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Información del Empleado</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Puesto</Label>
                  <Input 
                    value={editData.job_title} 
                    onChange={(e) => setEditData({...editData, job_title: e.target.value})} 
                    placeholder="Ej: Puesto del empleado" 
                    disabled={loading}
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <Label>Departamento</Label>
                  <Input 
                    value={editData.department} 
                    onChange={(e) => setEditData({...editData, department: e.target.value})} 
                    placeholder="Ej: Nombre del departamento" 
                    disabled={loading}
                    maxLength={100}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label>Descripción</Label>
                <Textarea 
                  value={editData.description} 
                  onChange={(e) => setEditData({...editData, description: e.target.value})} 
                  placeholder="Breve descripción del empleado..." 
                  disabled={loading}
                  rows={2}
                  maxLength={500}
                />
              </div>
              
              <div className="mt-4">
                <Label>Responsabilidades</Label>
                <Textarea 
                  value={editData.responsibilities} 
                  onChange={(e) => setEditData({...editData, responsibilities: e.target.value})} 
                  placeholder="Principales responsabilidades del puesto..." 
                  disabled={loading}
                  rows={3}
                  maxLength={1000}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Habilidades</Label>
                  <Input 
                    value={editData.skills} 
                    onChange={(e) => setEditData({...editData, skills: e.target.value})} 
                    placeholder="Ej: Habilidades separadas por comas" 
                    disabled={loading}
                    maxLength={500}
                  />
                </div>
                
                <div>
                  <Label>Turno</Label>
                  <Select 
                    value={editData.shift} 
                    onValueChange={(value: any) => setEditData({...editData, shift: value})}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Mañana</SelectItem>
                      <SelectItem value="afternoon">Tarde</SelectItem>
                      <SelectItem value="night">Noche</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <Label>Teléfono</Label>
                <Input 
                  value={editData.phone} 
                  onChange={(e) => {
                    // Solo permitir números, +, -, (, ), espacios
                    const value = e.target.value.replace(/[^0-9+\-() ]/g, '')
                    setEditData({...editData, phone: value})
                  }} 
                  placeholder="Ej: +52 123 456 7890" 
                  type="tel"
                  disabled={loading}
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground mt-1">Incluye código de país (Ej: +52 para México)</p>
              </div>

              <div className="mt-4 flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Permiso de Chat</Label>
                  <p className="text-sm text-muted-foreground">
                    Define si este empleado puede participar en el chat del equipo.
                  </p>
                </div>
                <Switch
                  checked={editData.chat_enabled}
                  onCheckedChange={(c) => setEditData({ ...editData, chat_enabled: c })}
                  disabled={loading}
                />
              </div>
            </div>
            
            {editingMember && (
              <div className="mt-2 flex flex-row items-center justify-between rounded-lg border border-destructive/30 p-4 bg-destructive/5">
                <div>
                  <p className="text-sm font-medium">Estado del empleado</p>
                  <p className="text-xs text-muted-foreground">
                    Actualmente:{" "}
                    <span className={editingMember.status === "active" ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                      {editingMember.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </p>
                </div>
                <Button
                  variant={editingMember.status === "active" ? "destructive" : "default"}
                  size="sm"
                  disabled={loading || statusChangingId === editingMember.id}
                  onClick={() => { handleToggleMemberStatus(editingMember); setEditDialogOpen(false) }}
                >
                  {statusChangingId === editingMember.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingMember.status === "active" ? "Desactivar" : "Activar"}
                </Button>
              </div>
            )}

            <Button onClick={handleUpdateMember} disabled={!editData.name.trim() || loading} className="mt-2">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Miembros del Proyecto</h2>
        {members.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center text-muted-foreground pt-6">
              No hay miembros en el proyecto
            </CardContent>
          </Card>
        ) : (
          <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.map((m) => (
              <FadeInItem key={m.id}>
              <Card 
                className="group h-full relative overflow-hidden transition-all duration-500 hover:shadow-xl border-none bg-admin-blue shadow-md hover:scale-[1.02]"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <User className="h-24 w-24 text-white" />
                </div>
                <div className="absolute top-0 left-0 w-1.5 h-full bg-white/20 group-hover:w-2 transition-all pointer-events-none" />
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        alt={m.user?.name || "Avatar"} 
                        src={normalizeAvatarUrl(m.user?.avatar)} 
                        className="h-10 w-10 rounded-full border bg-muted object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="flex flex-col">
                        <h3 className="font-bold text-lg leading-tight text-white">{m.user?.name || "Usuario Desconocido"}</h3>
                        <p className="text-xs text-white/70 mt-1 line-clamp-1 italic">{m.user?.job_title || "Sin puesto definido"}</p>
                      </div>
                    </div>
                    {m.role === "employee" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMember(m)}
                          disabled={loading}
                          className="h-8 w-8 transition-all active:scale-95 bg-white/10 hover:bg-white/30 text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                    )}
                  </div>

                  <div className="space-y-3 text-sm text-white/80 pt-2 selection:bg-white/20">
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      <span className="truncate" title={m.user?.email}>{m.user?.email}</span>
                    </div>
                    {m.user?.department && (
                      <div className="flex items-center gap-2.5">
                        <span className="h-3.5 w-3.5 flex items-center justify-center shrink-0 opacity-70">🏛️</span>
                        <span className="truncate">{m.user?.department}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/10">
                    <Badge variant="outline" className={cn("gap-1.5 bg-white/10 border-white/20 text-white", m.role === "owner" && "bg-white/30 border-white/40 shadow-sm")}>
                      {m.role === "owner" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {m.role === "owner" ? "Propietario" : "Empleado"}
                    </Badge>
                    <Badge variant={m.status === "active" ? "default" : "secondary"} className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 h-auto", m.status === "active" ? "bg-white text-admin-blue" : "bg-white/20 text-white")}>
                      {m.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              </FadeInItem>
            ))}
          </FadeInStagger>
        )}
      </div>

      {invites.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold tracking-tight">Invitaciones Pendientes</h2>
          <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {invites.map((inv) => (
              <FadeInItem key={inv.id}>
                <Card className="group h-full relative overflow-hidden transition-all duration-300 hover:shadow-md border border-white/40 bg-white/60 backdrop-blur-sm hover:bg-white/80 border-dashed">
                  <div className="absolute top-0 left-0 w-1 h-full bg-admin-yellow/40" />
                  <CardContent className="p-5 flex flex-col gap-4 h-full">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-admin-dark/60">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-bold text-sm text-admin-dark truncate" title={inv.email}>{inv.email}</h3>
                        <p className="text-[11px] text-admin-dark-grey leading-tight mt-0.5 capitalize">Miembro Invitado</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-white/20 p-2.5 rounded-lg border border-white/10">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-[10px] uppercase tracking-wider opacity-70">Enviada</span>
                        <span className="text-admin-dark/80">{new Date(inv.created_at).toLocaleDateString("es-ES")}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-[10px] uppercase tracking-wider opacity-70">Expira</span>
                        <span className={cn("text-admin-dark/80", new Date(inv.expires_at) < new Date() && "text-destructive font-bold")}>
                          {new Date(inv.expires_at).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 selection:bg-admin-yellow/20">
                      <Badge variant={inv.status === "pending" ? "outline" : inv.status === "accepted" ? "default" : "secondary"} className="text-[10px] uppercase tracking-wider h-auto py-0.5 bg-white/30 border-white/40 text-admin-dark/70">
                        {inv.status === "pending" ? "Pendiente" : inv.status === "accepted" ? "Aceptada" : "Expirada"}
                      </Badge>
                    </div>

                    {inv.status === "pending" && (
                      <div className="flex items-center gap-2 pt-4 border-t border-white/10 mt-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 h-8 text-xs active:scale-95 transition-transform hover:bg-white/20"
                          onClick={() => handleCopyInviteLink(inv.token)}
                          title="Copiar link"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-none px-2.5 h-8 text-emerald-400 hover:bg-white/20 active:scale-95 transition-all"
                          onClick={() => {
                            const url = buildWhatsAppInviteUrl(inv)
                            if (!url) {
                              toast.error("Agrega un teléfono válido (+52 + 10 dígitos) para compartir por WhatsApp")
                              return
                            }
                            window.open(url, "_blank", "noopener,noreferrer")
                          }}
                          title={inv.phone ? "Compartir por WhatsApp" : "Agrega teléfono para compartir"}
                          disabled={!buildWhatsAppInviteUrl(inv)}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 h-8 text-xs active:scale-95 transition-transform hover:bg-white/20"
                          onClick={() => handleResendInvite(inv.id)}
                          disabled={resendingId === inv.id}
                        >
                          {resendingId === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                          {inv.resend_count ? `Reenviar (${inv.resend_count})` : "Reenviar"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-none px-2.5 h-8 hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all text-muted-foreground"
                          onClick={() => handleDeleteInvite(inv.id)}
                          disabled={deletingId === inv.id}
                          title="Eliminar invitación"
                        >
                          {deletingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      )}
    </div>
  )
}
