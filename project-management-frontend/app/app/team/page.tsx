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
import { UserPlus, Mail, Shield, User, Loader2, RefreshCw, Trash2, Edit, Copy } from "lucide-react"
import { toast } from "sonner"
import { sendInvite, listInvites, resendInvite, cancelInvite } from "@/services/inviteService"
import { listMembers, updateMemberProfile, type MemberProfileUpdateData } from "@/services/memberService"
import type { Invite, Membership } from "@/mock/types"

export default function TeamPage() {
  const session = useAuthStore((s) => s.session)
  const projectId = session?.project?.id

  const [members, setMembers] = useState<Membership[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
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
    phone: ""
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Calcular total de miembros (activos + pendientes)
  const activeMembers = members.filter(m => m.status === "active").length
  const pendingInvites = invites.filter(i => i.status === "pending").length
  const totalMembers = activeMembers + pendingInvites
  const canInviteMore = totalMembers < 10

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
    if (!inviteEmail.trim() || !projectId) return
    
    // Validaciones
    if (inviteData.phone && !/^[\d+\-() ]+$/.test(inviteData.phone)) {
      toast.error("El teléfono solo puede contener números y símbolos +, -, (, )")
      return
    }
    
    if (inviteData.job_title && inviteData.job_title.length > 100) {
      toast.error("El puesto no puede exceder 100 caracteres")
      return
    }
    
    if (inviteData.department && inviteData.department.length > 100) {
      toast.error("El departamento no puede exceder 100 caracteres")
      return
    }
    
    setLoading(true)
    
    try {
      // Preparar datos de enriquecimiento (solo enviar si tienen valor)
      const enrichmentData: any = {}
      if (inviteData.job_title) enrichmentData.job_title = inviteData.job_title
      if (inviteData.description) enrichmentData.description = inviteData.description
      if (inviteData.responsibilities) enrichmentData.responsibilities = inviteData.responsibilities
      if (inviteData.skills) enrichmentData.skills = inviteData.skills
      if (inviteData.shift) enrichmentData.shift = inviteData.shift
      if (inviteData.department) enrichmentData.department = inviteData.department
      if (inviteData.phone) enrichmentData.phone = inviteData.phone
      
      const result = await sendInvite(inviteEmail.trim(), Object.keys(enrichmentData).length > 0 ? enrichmentData : undefined)
      
      if (!result.success) {
        toast.error(result.error || "Error al enviar la invitación")
        setLoading(false)
        return
      }
      
      toast.success(result.message || `Invitación enviada a ${inviteEmail}`)
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
      phone: member.user?.phone || ""
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipo</h1>
          <p className="text-muted-foreground">
            {activeMembers} miembros activos {pendingInvites > 0 && `+ ${pendingInvites} invitaciones pendientes`} ({totalMembers}/10)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!canInviteMore}>
              <UserPlus className="h-4 w-4" /> 
              {canInviteMore ? "Invitar Miembro" : "Límite Alcanzado (10/10)"}
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
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Información del Empleado (Opcional)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Puesto</Label>
                    <Input 
                      value={inviteData.job_title} 
                      onChange={(e) => setInviteData({...inviteData, job_title: e.target.value})} 
                      placeholder="Ej: Puesto del empleado" 
                      disabled={loading}
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <Label>Departamento</Label>
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
                    <Label>Turno</Label>
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
                  <Label>Teléfono</Label>
                  <Input 
                    value={inviteData.phone} 
                    onChange={(e) => {
                      // Solo permitir números, +, -, (, ), espacios
                      const value = e.target.value.replace(/[^0-9+\-() ]/g, '')
                      setInviteData({...inviteData, phone: value})
                    }} 
                    placeholder="Ej: +52 123 456 7890" 
                    type="tel"
                    disabled={loading}
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Incluye código de país (Ej: +52 para México)</p>
                </div>
              </div>
              
              <Button onClick={handleInvite} disabled={!inviteEmail.trim() || loading} className="mt-2">
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
            </div>
            
            <Button onClick={handleUpdateMember} disabled={!editData.name.trim() || loading} className="mt-2">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Miembros del Proyecto</CardTitle></CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
              No hay miembros en el proyecto
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {m.user?.name?.charAt(0) || "?"}
                        </div>
                        <span className="font-medium">{m.user?.name || "Desconocido"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.user?.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {m.role === "owner" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {m.role === "owner" ? "Propietario" : "Empleado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.status === "active" ? "default" : "secondary"}>
                        {m.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {m.role === "employee" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMember(m)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Invitaciones</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enviada</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead>Reenvíos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" /> {inv.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={inv.status === "pending" ? "outline" : inv.status === "accepted" ? "default" : "secondary"}>
                        {inv.status === "pending" ? "Pendiente" : inv.status === "accepted" ? "Aceptada" : "Expirada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(inv.expires_at).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.resend_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {inv.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyInviteLink(inv.token)}
                              title="Copiar link de invitación"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendInvite(inv.id)}
                              disabled={resendingId === inv.id}
                              title="Reenviar invitación"
                            >
                              {resendingId === inv.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvite(inv.id)}
                              disabled={deletingId === inv.id}
                              title="Eliminar invitación"
                            >
                              {deletingId === inv.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
