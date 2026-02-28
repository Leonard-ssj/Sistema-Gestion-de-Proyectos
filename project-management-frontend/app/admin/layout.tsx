"use client"

import { usePathname } from "next/navigation"
import { PrivateLayout } from "@/components/layout/private-layout"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <PrivateLayout role="superadmin" currentPath={pathname}>
      {children}
    </PrivateLayout>
  )
}
