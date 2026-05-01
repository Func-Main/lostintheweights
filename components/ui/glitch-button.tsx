"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlitchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  intensity?: "subtle" | "medium" | "intense"
}

const glitchKeyframes = `
@keyframes glitch-1 {
  0%, 100% { clip-path: inset(40% 0 61% 0); transform: translate(-2px, 2px); }
  20% { clip-path: inset(92% 0 1% 0); transform: translate(2px, -1px); }
  40% { clip-path: inset(43% 0 1% 0); transform: translate(-1px, 1px); }
  60% { clip-path: inset(25% 0 58% 0); transform: translate(1px, -2px); }
  80% { clip-path: inset(54% 0 7% 0); transform: translate(-2px, 1px); }
}

@keyframes glitch-2 {
  0%, 100% { clip-path: inset(65% 0 8% 0); transform: translate(2px, -1px); }
  20% { clip-path: inset(12% 0 69% 0); transform: translate(-1px, 2px); }
  40% { clip-path: inset(78% 0 2% 0); transform: translate(1px, 1px); }
  60% { clip-path: inset(5% 0 86% 0); transform: translate(-2px, -1px); }
  80% { clip-path: inset(39% 0 45% 0); transform: translate(2px, 2px); }
}

@keyframes glitch-skew {
  0%, 100% { transform: skew(0deg); }
  20% { transform: skew(-2deg); }
  40% { transform: skew(1deg); }
  60% { transform: skew(-1deg); }
  80% { transform: skew(2deg); }
}
`

export const GlitchButton = React.forwardRef<HTMLButtonElement, GlitchButtonProps>(
  ({ children, intensity = "medium", className, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)

    const config = {
      subtle: { duration: "0.4s", opacity: 0.6 },
      medium: { duration: "0.3s", opacity: 0.8 },
      intense: { duration: "0.2s", opacity: 1 },
    }[intensity]

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: glitchKeyframes }} />
        <button
          className={cn(
            "group relative inline-flex items-center justify-center",
            "rounded-lg px-6 py-3 text-sm font-bold font-mono uppercase tracking-wider",
            "bg-primary text-primary-foreground",
            "cursor-pointer",
            "hover:bg-primary/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "transition-colors",
            "motion-reduce:before:hidden motion-reduce:after:hidden",
            className,
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          ref={ref}
          style={
            isHovered
              ? {
                  animation: `glitch-skew ${config.duration} infinite linear`,
                }
              : undefined
          }
          {...props}
        >
          {/* Red glitch layer */}
          {isHovered && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-primary"
              style={{
                color: "#ff0040",
                opacity: config.opacity,
                animation: `glitch-1 ${config.duration} infinite linear`,
                mixBlendMode: "multiply",
              }}
            >
              {children}
            </span>
          )}

          {/* Cyan glitch layer */}
          {isHovered && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-primary"
              style={{
                color: "#00ffff",
                opacity: config.opacity,
                animation: `glitch-2 ${config.duration} infinite linear`,
                mixBlendMode: "multiply",
              }}
            >
              {children}
            </span>
          )}

          {/* Main text */}
          <span className="relative z-10">{children}</span>
        </button>
      </>
    )
  },
)

GlitchButton.displayName = "GlitchButton"

export default GlitchButton
