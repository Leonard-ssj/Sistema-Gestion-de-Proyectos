"use client"

import { useState } from "react"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

export default function AuditPage() {
  const auditLogs = useDataStore((s) => s.auditLogs)
  const [search, setSearch] = useState("")

  const sorted = [...auditLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const filtered = sorted.filter((log) => {
    if (!search) return true
    const q = search.toLowerCase()
    return log.action.includes(q) || log.user_email.includes(q) || log.details.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Auditoria</h1>
        <p className="text-muted-foreground">{auditLogs.length} eventos registrados</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar eventos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Accion</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{log.action.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.user_email}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{log.details}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(log.created_at).toLocaleString("es-ES")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
