"use client"

import { motion } from "framer-motion"

/**
 * VipPass Component
 * 
 * Un componente que renderiza una tarjeta VIP con un efecto de patrón Moiré trippy.
 * Basado en la implementación de Less Rain GmbH.
 */
export function VipPass() {
  return (
    <div className="relative group w-full max-w-lg hidden lg:flex items-center justify-center p-8">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&display=swap");

        .vip-scene {
          width: 100%;
          perspective: 1200px;
          perspective-origin: 50% 50%;
          position: relative;
          display: grid;
          place-items: center;
        }

        .vip-card-container {
          animation: vip-pulse 16s ease-in-out infinite alternate,
                     vip-card-move 30s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite,
                     vip-color-cycle 8s linear infinite alternate;
          border-radius: 1.25rem;
          width: 100%;
          aspect-ratio: 3/2;
          position: relative;
          transform-style: preserve-3d;
          overflow: hidden;
          background: #000;
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.82);
        }

        .card-layer-inner {
          backface-visibility: hidden;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .moire-effect {
          display: grid;
          place-items: center;
          transform-style: preserve-3d;
          background: #000;
          width: 100%;
          height: 100%;
        }

        .moire-pattern {
          position: absolute;
          background: repeating-radial-gradient(
            circle,
            rgba(255, 0, 255, 0.9) 0,
            rgba(255, 0, 255, 0.9) 5%,
            rgba(0, 255, 255, 0.1) 15%,
            rgba(255, 0, 255, 0.9) 25%
          );
          background-size: 2.5em 2.5em;
          height: 300%;
          width: 300%;
          mix-blend-mode: lighten;
          pointer-events: none;
        }

        .moving-p {
          animation: vip-moire-move 6s linear infinite;
          mix-blend-mode: difference;
          opacity: 0.8;
        }

        .moving-extra-p {
          animation: vip-moire-move-extra 6s linear infinite;
          opacity: 0.5;
        }

        .flickering-lights-layer {
          animation: vip-flicker 3s infinite alternate;
          background: hsla(0, 0%, 100%, 0.12);
          pointer-events: none;
        }

        .text-content-layer {
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 1.5rem;
          transform: translateZ(80px);
          pointer-events: none;
          z-index: 10;
        }

        .vip-title-text {
          color: #fff;
          font-family: "Cinzel", serif;
          font-size: clamp(0.75rem, 0.6591rem + 1vw, 1.25rem);
          font-weight: 800;
          letter-spacing: 0.15em;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 1);
          opacity: 0.85;
          text-align: right;
        }

        @keyframes vip-pulse {
          0%, 100% { box-shadow: 0 0 3.5rem rgba(255, 0, 255, 0.3); }
          50% { box-shadow: 0 0 7rem rgba(255, 0, 255, 0.7); }
        }

        @keyframes vip-card-move {
          0%, 100% { transform: rotateY(0deg) rotateX(0deg) rotate(0deg) scale(1); }
          25% { transform: rotateY(18deg) rotateX(12deg) rotate(4deg) scale(1.04); }
          50% { transform: rotateY(-18deg) rotateX(-12deg) rotate(-4deg) scale(0.96); }
          75% { transform: rotateY(12deg) rotateX(-8deg) rotate(2deg) scale(1.02); }
        }

        @keyframes vip-color-cycle {
          0%, 100% { filter: hue-rotate(0deg) saturate(1.2) contrast(1.1); }
          50% { filter: hue-rotate(180deg) saturate(1.7) contrast(1.3); }
        }

        @keyframes vip-moire-move {
          0%, 100% { transform: translate(-8%, -8%) rotate(0deg) scale(1); }
          50% { transform: translate(8%, 8%) rotate(3deg) scale(1.05); }
        }

        @keyframes vip-moire-move-extra {
          0%, 100% { transform: translate(8%, 8%) rotate(0deg) scale(1.05); }
          50% { transform: translate(-8%, -8%) rotate(-3deg) scale(1); }
        }

        @keyframes vip-flicker {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.75; }
        }
      `}} />

      <div className="vip-scene">
        <motion.div
          className="vip-card-container"
          initial={{ opacity: 0, x: -100, rotateY: -45 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 1.2, ease: "circOut" }}
        >
          <div className="card-layer-inner moire-effect">
            <div className="moire-pattern"></div>
            <div className="moire-pattern moving-p"></div>
            <div className="moire-pattern moving-extra-p"></div>
          </div>
          <div className="card-layer-inner flickering-lights-layer"></div>
          <div className="card-layer-inner text-content-layer">
            <div className="vip-title-text">Pro Gest</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
