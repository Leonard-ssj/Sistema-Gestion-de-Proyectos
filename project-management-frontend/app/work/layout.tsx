"use client"

import { usePathname } from "next/navigation"
import { PrivateLayout } from "@/components/layout/private-layout"

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <PrivateLayout role="employee" currentPath={pathname}>
      {children}
    </PrivateLayout>
  )
}
