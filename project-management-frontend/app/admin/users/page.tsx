"use client"

import React, { useState } from "react"
import { useDataStore } from "@/stores/dataStore"
import { toast } from "sonner"
import { normalizeAvatarUrl } from "@/lib/avatars"
import { cn } from "@/lib/utils"

export default function AdminUsersPage() {
  const users = useDataStore((s) => s.users)
  const updateUser = useDataStore((s) => s.updateUser)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const roleLabel = (r: string) => {
    if (r === "owner") return "Admin"
    if (r === "employee") return "User"
    return "SuperAdmin"
  }

  return (
    <div className="w-full bg-transparent py-4">
      <div className="container mx-auto px-4 sm:px-0">
        <div className="py-2">
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center w-full">
            <h2 className="text-4xl font-black italic tracking-tighter leading-tight text-foreground drop-shadow-sm">
              Usuarios
            </h2>
            <div className="w-full sm:w-auto">
              <form 
                className="flex w-full max-w-sm space-x-3" 
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-xl border border-border/50 flex-1 appearance-none w-full py-2.5 px-4 bg-background/50 backdrop-blur-sm text-foreground placeholder-muted-foreground shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                    placeholder="Search Here" 
                  />
                </div>
                <button 
                  className="flex-shrink-0 px-6 py-2.5 text-base font-black text-primary-foreground bg-primary rounded-xl shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  type="submit"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          <div className="-mx-4 sm:-mx-0 px-4 sm:px-0 py-4 overflow-x-auto">
            <div className="inline-block min-w-full shadow-2xl rounded-3xl overflow-hidden border border-border/40 bg-card/60 backdrop-blur-2xl transition-all duration-1000">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr className="bg-muted/40 transition-colors duration-1000">
                    <th scope="col" className="px-6 py-6 border-b border-border/40 text-muted-foreground text-left text-[10px] uppercase font-black tracking-[0.2em]">
                      User
                    </th>
                    <th scope="col" className="px-6 py-6 border-b border-border/40 text-muted-foreground text-left text-[10px] uppercase font-black tracking-[0.2em]">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-6 border-b border-border/40 text-muted-foreground text-left text-[10px] uppercase font-black tracking-[0.2em]">
                      Created at
                    </th>
                    <th scope="col" className="px-6 py-6 border-b border-border/40 text-muted-foreground text-left text-[10px] uppercase font-black tracking-[0.2em]">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-6 border-b border-border/40 text-muted-foreground text-center text-[10px] uppercase font-black tracking-[0.2em]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 transition-all duration-1000">
                  {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-6 border-b border-border/20 text-sm">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="block relative">
                              <img 
                                alt={u.name} 
                                src={normalizeAvatarUrl(u.avatar)} 
                                className="mx-auto object-cover rounded-full h-12 w-12 border-2 border-border/50 shadow-sm transition-transform group-hover:scale-110" 
                              />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-foreground font-black whitespace-no-wrap text-base tracking-tight">
                              {u.name}
                            </p>
                            <p className="text-muted-foreground text-xs font-medium tracking-wide">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 border-b border-border/20 text-sm">
                        <p className="text-foreground whitespace-no-wrap font-bold bg-muted/20 inline-block px-2 py-0.5 rounded text-xs">
                          {roleLabel(u.role)}
                        </p>
                      </td>
                      <td className="px-6 py-6 border-b border-border/20 text-sm">
                        <p className="text-foreground whitespace-no-wrap font-medium tabular-nums opacity-80">
                          {new Date(u.created_at).toLocaleDateString("es-ES")}
                        </p>
                      </td>
                      <td className="px-6 py-6 border-b border-border/20 text-sm">
                        <span className={cn(
                          "relative inline-block px-4 py-1.5 font-black leading-tight rounded-full text-[10px] uppercase tracking-widest",
                          u.status === "active" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                          <span 
                            aria-hidden="true" 
                            className={cn(
                              "absolute inset-0 opacity-15 rounded-full",
                              u.status === "active" ? "bg-green-500" : "bg-red-500"
                            )}
                          ></span>
                          <span className="relative">
                            {u.status === "active" ? "active" : "disabled"}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-6 border-b border-border/20 text-sm text-center">
                        <button 
                          onClick={() => {
                            const newStatus = u.status === "active" ? "disabled" : "active"
                            updateUser(u.id, { status: newStatus })
                            toast.success(`Usuario ${newStatus === "active" ? "activado" : "desactivado"}`)
                          }}
                          className={cn(
                            "font-black text-[10px] uppercase tracking-[0.15em] transition-all hover:scale-110 active:scale-95 inline-block px-5 py-2.5 rounded-xl border-2",
                            u.status === "active" 
                              ? "text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white" 
                              : "text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white"
                          )}
                        >
                          {u.status === "active" ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic font-medium">
                        No se encontraron usuarios para su búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="px-6 bg-muted/20 py-8 flex flex-col xs:flex-row items-center xs:justify-between border-t border-border/20 transition-colors duration-1000">
                <div className="flex items-center space-x-2">
                  <button type="button" className="p-2.5 border border-border/40 text-base rounded-l-2xl text-muted-foreground bg-card/40 hover:bg-background transition-all shadow-sm">
                    <svg width="9" fill="currentColor" height="8" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1427 301l-531 531 531 531q19 19 19 45t-19 45l-166 166q-19 19-45 19t-45-19l-742-742q-19-19-19-45t19-45l742-742q19-19 45-19t45 19l166 166q19 19 19 45t-19 45z"></path>
                    </svg>
                  </button>
                  <button type="button" className="px-6 py-3 border-y border-border/40 text-xs font-black text-foreground bg-card shadow-lg ring-1 ring-primary/20 scale-105 z-10 transition-all">
                    1
                  </button>
                  <button type="button" className="px-6 py-3 border border-border/40 text-xs font-bold text-muted-foreground bg-card/40 hover:bg-background transition-all">
                    2
                  </button>
                  <button type="button" className="px-6 py-3 border-y border-border/40 text-xs font-bold text-muted-foreground bg-card/40 hover:bg-background transition-all">
                    3
                  </button>
                  <button type="button" className="p-2.5 border border-border/40 text-base rounded-r-2xl text-muted-foreground bg-card/40 hover:bg-background transition-all shadow-sm">
                    <svg width="9" fill="currentColor" height="8" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1363 877l-742 742q-19 19-45 19t-45-19l-166-166q-19-19-19-45t19-45l531-531-531-531q-19-19-19-45t19-45l166-166q19-19 45-19t45 19l742 742q19 19 19 45t-19 45z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
