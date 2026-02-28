"use client"

import { usePathname } from "next/navigation"
import { PrivateLayout } from "@/components/layout/private-layout"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <PrivateLayout role="owner" currentPath={pathname}>
      {children}
    </PrivateLayout>
  )
}
