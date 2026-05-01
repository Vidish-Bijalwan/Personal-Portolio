"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    const resize = () => {
      width = window.innerWidth
      canvas.width = width
      height = window.innerHeight
      canvas.height = height
      initNetwork()
    }

    window.addEventListener("resize", resize)

    // Neural Network config
    let layers: number[]
    let nodes: { x: number; y: number; layer: number }[] = []
    let connections: {
      from: { x: number; y: number; layer: number }
      to: { x: number; y: number; layer: number }
      progress: number
      active: boolean
      speed: number
    }[] = []

    const initNetwork = () => {
      nodes = []
      connections = []
      
      // Adapt network to screen width
      if (width < 768) {
        layers = [4, 6, 6, 4]
      } else if (width < 1024) {
        layers = [5, 8, 8, 5]
      } else {
        layers = [6, 10, 10, 10, 6]
      }

      const layerSpacing = width / (layers.length + 1)

      layers.forEach((nodeCount, layerIdx) => {
        const x = layerSpacing * (layerIdx + 1)
        const ySpacing = height / (nodeCount + 1)

        for (let i = 0; i < nodeCount; i++) {
          const y = ySpacing * (i + 1)
          nodes.push({ x, y, layer: layerIdx })
        }
      })

      // Create connections between adjacent layers
      for (let i = 0; i < layers.length - 1; i++) {
        const currentLayerNodes = nodes.filter((n) => n.layer === i)
        const nextLayerNodes = nodes.filter((n) => n.layer === i + 1)

        currentLayerNodes.forEach((fromNode) => {
          nextLayerNodes.forEach((toNode) => {
            // Dropout some connections for visual variety (sparse network)
            if (Math.random() > 0.15) {
              connections.push({
                from: fromNode,
                to: toNode,
                progress: Math.random(), // Start randomly distributed
                active: Math.random() > 0.4,
                speed: 0.002 + Math.random() * 0.003,
              })
            }
          })
        })
      }
    }

    initNetwork()

    const isDark = theme !== "light"
    // Indigo rgb colors matching Tailwind primary
    const r = 99, g = 102, b = 241 // Light mode #6366f1
    const rD = 79, gD = 70, bD = 229 // Dark mode #4f46e5
    const cR = isDark ? rD : r
    const cG = isDark ? gD : g
    const cB = isDark ? bD : b

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw connections
      connections.forEach((conn) => {
        ctx.beginPath()
        ctx.moveTo(conn.from.x, conn.from.y)
        ctx.lineTo(conn.to.x, conn.to.y)
        ctx.strokeStyle = `rgba(${cR}, ${cG}, ${cB}, 0.15)`
        ctx.lineWidth = 1
        ctx.stroke()

        // Animate signals traveling
        if (conn.active) {
          conn.progress += conn.speed
          if (conn.progress >= 1) {
            conn.progress = 0
            conn.active = Math.random() > 0.3 // Sometimes pause forming a burst effect
          }

          if (conn.progress > 0) {
            const curX = conn.from.x + (conn.to.x - conn.from.x) * conn.progress
            const curY = conn.from.y + (conn.to.y - conn.from.y) * conn.progress

            ctx.beginPath()
            ctx.arc(curX, curY, 2.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${cR}, ${cG}, ${cB}, 0.8)`
            ctx.fill()

            // Glow effect
            ctx.shadowBlur = 10
            ctx.shadowColor = `rgba(${cR}, ${cG}, ${cB}, 1)`
            ctx.fill()
            ctx.shadowBlur = 0 // reset
          }
        } else if (Math.random() < 0.005) {
          // Chance to activate an inactive connection
          conn.active = true
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? "#000" : "#fff" 
        ctx.fill()
        ctx.strokeStyle = `rgba(${cR}, ${cG}, ${cB}, 0.8)`
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Inner node glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cR}, ${cG}, ${cB}, 0.4)`
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
