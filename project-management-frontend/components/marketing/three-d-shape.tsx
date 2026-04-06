"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"

interface ThreeDShapeProps {
  shape: "Tetrahedron" | "Octahedron" | "Icosahedron"
  color?: string
}

export function ThreeDShape({ shape, color = "#ffcccc" }: ThreeDShapeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!containerRef.current || !mounted) return

    const isDark = resolvedTheme === "dark" || resolvedTheme === "sunset"
    
    // --- Scene Setup ---
    const width = 240
    const height = 240
    const scene = new THREE.Scene()
    
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
    camera.position.z = 2
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance" 
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // --- Shape Logic ---
    let geometry: THREE.BufferGeometry
    switch (shape) {
      case "Tetrahedron": geometry = new THREE.TetrahedronGeometry(0.7); break
      case "Octahedron": geometry = new THREE.OctahedronGeometry(0.7); break
      case "Icosahedron": geometry = new THREE.IcosahedronGeometry(0.7); break
      default: geometry = new THREE.IcosahedronGeometry(0.7)
    }

    // --- Texture: Dynamic Gradient Canvas ---
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 256)
      if (isDark) {
        gradient.addColorStop(0, "#ffffff")
        gradient.addColorStop(0.5, color)
        gradient.addColorStop(1, "#000000")
      } else {
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, "#ffffff")
      }
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 256, 256)
    }
    const texture = new THREE.CanvasTexture(canvas)

    // --- Material Refinado (Más vítreo) ---
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: isDark ? 0.1 : 0.3,
      metalness: isDark ? 0.9 : 0.4,
      flatShading: true,
      transparent: true,
      opacity: isDark ? 0.75 : 0.6, // Transparencia aumentada
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Wireframe más sutil
    const wireframe = new THREE.Mesh(
      geometry, 
      new THREE.MeshBasicMaterial({ 
        color: isDark ? 0xffffff : 0x000000, 
        wireframe: true, 
        transparent: true, 
        opacity: isDark ? 0.08 : 0.05 
      })
    )
    mesh.add(wireframe)

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, isDark ? 1 : 1.2))
    const dLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dLight.position.set(1, 1, 2)
    scene.add(dLight)

    // --- Mouse Tracking ---
    let mouseX = 0, mouseY = 0
    const handleMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      mouseX = ((e.clientX - rect.left) / width) * 2 - 1
      mouseY = -((e.clientY - rect.top) / height) * 2 + 1
    }
    window.addEventListener("mousemove", handleMove)

    let frameId: number
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      mesh.rotation.y += 0.003 + mouseX * 0.03
      mesh.rotation.x += 0.003 + mouseY * 0.03
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener("mousemove", handleMove)
      cancelAnimationFrame(frameId)
      renderer.dispose()
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement)
    }
  }, [shape, color, resolvedTheme, mounted])

  if (!mounted) return <div style={{ width: 240, height: 240 }} />

  return (
    <div 
      ref={containerRef} 
      className="flex items-center justify-center relative select-none pointer-events-none" 
      style={{ width: 240, height: 240 }}
    />
  )
}
