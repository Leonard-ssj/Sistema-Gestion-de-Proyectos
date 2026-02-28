"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { isRouteAllowed, getRedirectForRole } from "@/lib/guards"
import { Loader2 } from "lucide-react"

interface RoleGateProps {
  children: React.ReactNode
  allowedRole: "owner" | "employee" | "superadmin"
  currentPath: string
}

export function RoleGate({ children, allowedRole, currentPath }: RoleGateProps) {
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const hydrated = useAuthStore((s) => s.hydrated)
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!hydrated) return
    if (!session) {
      router.replace("/auth/login")
      return
    }
    if (!isRouteAllowed(session.user.role, currentPath)) {
      router.replace(getRedirectForRole(session.user.role))
      return
    }
    if (session.user.role === "owner" && !session.project && currentPath !== "/onboarding") {
      router.replace("/onboarding")
      return
    }
    if (session.user.role === "employee" && !session.membership && currentPath !== "/work/no-project") {
      router.replace("/work/no-project")
    }
  }, [session, hydrated, currentPath, router])

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isRouteAllowed(session.user.role, currentPath)) return null

  return <>{children}</>
}
