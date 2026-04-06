import React from "react"
import { cn } from "@/lib/utils"

export type AnimatedFlashCardVariant = 'success' | 'working' | 'error' | 'info'

interface AnimatedFlashCardProps {
  variant: AnimatedFlashCardVariant
  value: string | number
  label: string
  onAction?: () => void
  actionLabel?: string
}

export function AnimatedFlashCard({ variant, value, label, onAction, actionLabel }: AnimatedFlashCardProps) {
  
  const renderIconContent = () => {
    switch (variant) {
      case "success":
        return (
          <g fill="none">
            <circle fill="#BDE3CA" cx="42" cy="42" r="42" />
            <path d="M30,62 C33.0710678,65.0710678 37.3137085,66.9705627 42,66.9705627 C46.6862915,66.9705627 50.9289322,65.0710678 54,62" stroke="#5FB67D" strokeWidth="5" />
            <circle fill="#5FB67D" cx="30" cy="42" r="3" />
            <circle fill="#5FB67D" cx="54" cy="42" r="3" />
          </g>
        )
      case "working":
        return (
          <g fill="none">
            <circle fill="#EEE5C6" cx="42" cy="42" r="42" />
            <circle stroke="#E1C55E" strokeWidth="5" cx="42" cy="63" r="7" />
            <circle fill="#E1C55E" cx="30" cy="42" r="3" />
            <circle fill="#E1C55E" cx="54" cy="42" r="3" />
          </g>
        )
      case "error":
        return (
          <g fill="none">
            <circle fill="#F4B6BA" cx="42" cy="42" r="42" />
            <path d="M30,65 C33.0710678,61.9107443 37.3137085,60 42,60 C46.6862915,60 50.9289322,61.9107443 54,65" stroke="#C46465" strokeWidth="5" />
            <circle fill="#C46465" cx="30" cy="45" r="3" />
            <circle fill="#C46465" cx="54" cy="45" r="3" />
          </g>
        )
      case "info":
        return (
          <g fill="none">
            <circle fill="#CBE5FF" cx="42" cy="42" r="42" />
            <path d="M25,62 C33.0710678,65.0710678 37.3137085,66.9705627 42,66.9705627 C46.6862915,66.9705627 50.9289322,65.0710678 59,62" stroke="#3C91E6" strokeWidth="5" />
            <circle fill="#3C91E6" cx="30" cy="42" r="3" />
            <circle fill="#3C91E6" cx="54" cy="42" r="3" />
          </g>
        )
    }
  }

  const renderButtons = () => {
    switch(variant) {
      case "success":
      case "info":
        return (
          <>
            <button onClick={onAction}>
              <svg viewBox="0 0 56 56">
                <polyline points="16 29.4852814 24.4852814 37.9705627 41.4852814 21" fill="none" strokeWidth="4" stroke={variant === "info" ? "#3C91E6" : "#5FB67D"} />
              </svg>
              <span>{actionLabel || 'Details'}</span>
            </button>
            <button onClick={onAction}>
              <svg viewBox="0 0 56 56">
                <g fill="none" stroke="#ADBBB2" strokeWidth="4">
                  <polyline points="31.5147186 19.5147186 40 28 31.5147186 36.4852814" />
                  <line x1="40" x2="16" y1="28" y2="28" />
                </g>
              </svg>
              <span>{actionLabel ? 'Action' : 'Export'}</span>
            </button>
          </>
        )
      case "working":
        return (
          <button>
            <svg viewBox="0 0 56 56">
              <g fill="#E1C55E">
                <circle cx="16" cy="28" r="3" />
                <circle cx="28" cy="28" r="3" />
                <circle cx="40" cy="28" r="3" />
              </g>
            </svg>
          </button>
        )
      case "error":
        return (
          <button onClick={onAction}>
            <svg viewBox="0 0 56 56">
              <g fill="none" strokeWidth="4" stroke="#C46465">
                <path d="M28,15 C20.8202983,15 15,20.8202983 15,28 C15,35.1797017 20.8202983,41 28,41 C35.1797017,41 41,35.1797017 41,28 C41,26.2373929 40.649213,24.5567164 40.0136429,23.0239745" />
                <polyline points="19.8973389 11.0570105 27.9864853 15.0023508 24.041145 23.0914972" />
              </g>
            </svg>
            <span>{actionLabel || 'Review'}</span>
          </button>
        )
    }
  }

  return (
    <div className={cn("flash", variant)}>
      <div className="bg">
        <div className="bg-icon"></div>
        <div className="bg-btns"></div>
      </div>
      <div className="inside shadow-md">
        <figure className="icon shadow-lg">
          <svg viewBox="0 0 84 84">
            {renderIconContent()}
          </svg>
        </figure>
        <div className="mt-4">
          <h2>{value}</h2>
          <p>{label}</p>
        </div>
        <div className="btns">
          {renderButtons()}
        </div>
      </div>
    </div>
  )
}
