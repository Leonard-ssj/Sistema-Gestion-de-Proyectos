"use client"

import { useEffect, useRef } from "react"

export function GsapLoader({ className }: { className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const l1 = useRef<HTMLDivElement>(null)
  const l2 = useRef<HTMLDivElement>(null)
  const l3 = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    let gsap: typeof import("gsap").gsap

    async function init() {
      const mod = await import("gsap")
      gsap = mod.gsap

      if (!l1.current || !l2.current || !l3.current) return

      const duration = 0.25
      const delay = 1

      const tl = gsap.timeline({ repeat: -1, delay })
      tlRef.current = tl

      tl
        .to(l3.current, duration, { width: 35 })
        .set(l2.current, { rotate: 90, transformOrigin: "45px 45px", marginLeft: 0 })
        .to(l2.current, duration, { width: 90 })
        .set(l2.current, { transformOrigin: "72px 17px", rotate: 270 })
        .to(l2.current, duration, { width: 35 })
        .to(l1.current, duration, { width: 90 })
        .set(l1.current, { transformOrigin: "45px 17.5px", rotate: 180 })
        .to(l1.current, duration, { width: 35 })
        .set(l3.current, { transformOrigin: "45px 45px", rotate: 270, marginTop: 0 })
        .to(l3.current, duration, { width: 90 })
        .set(l3.current, { transformOrigin: "17.5px 17.5px", rotate: 90 })
        .to(l3.current, duration, { width: 35 })
        .set(l2.current, { transformOrigin: "45px 45px", rotate: 180 })
        .to(l2.current, duration, { width: 90 })
        .set(l2.current, { transformOrigin: "bottom center", marginTop: 20 })
        .to(l2.current, duration, { width: 35 })
        .set(l1.current, { transformOrigin: "45px 45px", rotate: 90 })
        .to(l1.current, duration, { width: 90 })
        .set(l1.current, { transformOrigin: "72px 17.5px", rotate: 270 })
        .to(l1.current, duration, { width: 35 })
        .set(l3.current, { rotate: 360 })
        .to(l3.current, duration, { width: 90 })
        .set(l3.current, { transformOrigin: "45px 17.5px", rotate: 180 })
        .to(l3.current, duration, { width: 35 })
        .set(l2.current, { transformOrigin: "45px 45px", rotate: 270, marginTop: 0 })
        .to(l2.current, duration, { width: 90 })
        .set(l2.current, { transformOrigin: "17.5px 17.5px", rotate: 90 })
        .to(l2.current, duration, { width: 35 })
        .set(l1.current, { transformOrigin: "45px 45px", rotate: 180 })
        .to(l1.current, duration, { width: 90 })
        .set(l1.current, { transformOrigin: "bottom center", marginTop: 20 })
        .to(l1.current, duration, { width: 35 })
        .set(l3.current, { transformOrigin: "45px 45px", rotate: 90 })
        .to(l3.current, duration, { width: 90 })
        .set(l3.current, { transformOrigin: "72px 17.5px", rotate: 270 })
        .to(l3.current, duration, { width: 35 })
        .set(l2.current, { transformOrigin: "45px 17.5px", rotate: 0 })
        .to(l2.current, duration, { width: 90 })
        .set(l2.current, { rotate: 180 })
        .to(l2.current, duration, { width: 35 })
        .set(l1.current, { transformOrigin: "45px 45px", rotate: 270, marginTop: 0 })
        .to(l1.current, duration, { width: 90 })
        .set(l1.current, { transformOrigin: "17.5px 17.5px", rotate: 90 })
        .to(l1.current, duration, { width: 35 })
        .set(l3.current, { transformOrigin: "45px 17.5px", rotate: 180, marginTop: 55 })
        .to(l3.current, duration, { width: 90 })
        .set(l2.current, { marginLeft: 55 })
    }

    init()

    return () => {
      tlRef.current?.kill()
    }
  }, [])

  return (
    <div ref={wrapperRef} className={className} style={{ position: "relative", width: 90, height: 90 }}>
      {/* loader-1 */}
      <div
        ref={l1}
        style={{
          position: "absolute",
          width: 35,
          height: 35,
          border: "3px solid currentColor",
          borderRadius: 40,
          opacity: 0.7,
        }}
      />
      {/* loader-2 */}
      <div
        ref={l2}
        style={{
          position: "absolute",
          width: 35,
          height: 35,
          border: "3px solid currentColor",
          borderRadius: 40,
          marginLeft: 55,
          opacity: 0.7,
        }}
      />
      {/* loader-3 */}
      <div
        ref={l3}
        style={{
          position: "absolute",
          width: 90,
          height: 35,
          border: "3px solid currentColor",
          borderRadius: 40,
          marginTop: 55,
          opacity: 0.7,
        }}
      />
    </div>
  )
}
