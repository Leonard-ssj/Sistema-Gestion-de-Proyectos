import type { Role } from "@/mock/types"

export function getHomeRoute(role: Role, hasProject: boolean, hasMembership: boolean): string {
  switch (role) {
    case "owner":
      return hasProject ? "/app/dashboard" : "/onboarding"
    case "employee":
      return hasMembership ? "/work/my-tasks" : "/work/no-project"
    case "superadmin":
      return "/admin"
    default:
      return "/auth/login"
  }
}

export function isRouteAllowed(role: Role, pathname: string): boolean {
  if (pathname.startsWith("/app") && role !== "owner") return false
  if (pathname.startsWith("/work") && role !== "employee") return false
  if (pathname.startsWith("/admin") && role !== "superadmin") return false
  return true
}

export function getRedirectForRole(role: Role): string {
  switch (role) {
    case "owner": return "/app/dashboard"
    case "employee": return "/work/my-tasks"
    case "superadmin": return "/admin"
    default: return "/auth/login"
  }
}
