"use client"

import { AppSidebar } from "./app-sidebar"
import { Topbar } from "./topbar"
import { RoleGate } from "./role-gate"
import type { Role } from "@/mock/types"
import { InteractiveGridBg } from "@/components/ui/interactive-grid-bg"

interface PrivateLayoutProps {
  children: React.ReactNode
  role: Role
  currentPath: string
}

export function PrivateLayout({ children, role, currentPath }: PrivateLayoutProps) {
  const isOnboarding = currentPath === "/onboarding" || currentPath === "/work/no-project"

  if (isOnboarding) {
    return (
      <RoleGate allowedRole={role} currentPath={currentPath}>
        <div className="flex min-h-screen flex-col bg-muted/40">
          <main className="flex flex-1 items-center justify-center p-4 md:p-6">
            {children}
          </main>
        </div>
      </RoleGate>
    )
  }

  return (
    <RoleGate allowedRole={role} currentPath={currentPath}>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar role={role} />
        <div className="flex min-w-0 flex-1 flex-col bg-admin-grey relative z-[0]">
          <InteractiveGridBg />
          <Topbar />
          <main className="flex-1 overflow-y-auto px-[24px] py-[36px] font-poppins relative z-[1]">
            {children}
          </main>
        </div>
      </div>
    </RoleGate>
  )
}
