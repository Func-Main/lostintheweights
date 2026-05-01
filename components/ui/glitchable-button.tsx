"use client"

import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const glitchKeyframes = `
@keyframes glitch-1 {
  0%, 100% { clip-path: inset(40% 0 61% 0); transform: translate(-1px, 1px); }
  20% { clip-path: inset(92% 0 1% 0); transform: translate(1px, -0.5px); }
  40% { clip-path: inset(43% 0 1% 0); transform: translate(-0.5px, 0.5px); }
  60% { clip-path: inset(25% 0 58% 0); transform: translate(0.5px, -1px); }
  80% { clip-path: inset(54% 0 7% 0); transform: translate(-1px, 0.5px); }
}

@keyframes glitch-2 {
  0%, 100% { clip-path: inset(65% 0 8% 0); transform: translate(1px, -0.5px); }
  20% { clip-path: inset(12% 0 69% 0); transform: translate(-0.5px, 1px); }
  40% { clip-path: inset(78% 0 2% 0); transform: translate(0.5px, 0.5px); }
  60% { clip-path: inset(5% 0 86% 0); transform: translate(-1px, -0.5px); }
  80% { clip-path: inset(39% 0 45% 0); transform: translate(1px, 1px); }
}

@keyframes glitch-skew {
  0%, 100% { transform: skew(0deg); }
  20% { transform: skew(-0.5deg); }
  40% { transform: skew(0.3deg); }
  60% { transform: skew(-0.3deg); }
  80% { transform: skew(0.5deg); }
}
`

export interface GlitchableButtonProps extends ButtonProps {
  isGlitching?: boolean
  intensity?: "subtle" | "medium" | "intense"
  glitchOnHover?: boolean
  glitchVariant?: "dark" | "light"
  glitchSoundSrc?: string | string[]
  glitchSoundVolume?: number
}

export const GlitchableButton = React.forwardRef<HTMLButtonElement, GlitchableButtonProps>(
  (
    {
      children,
      isGlitching = false,
      intensity = "medium",
      glitchOnHover = true,
      glitchVariant = "dark",
      glitchSoundSrc,
      glitchSoundVolume = 0.35,
      className,
      ...props
    },
    ref
  ) => {
    const [isHovering, setIsHovering] = React.useState(false)
    const audioRefs = React.useRef<HTMLAudioElement[]>([])
    const wasGlitchingRef = React.useRef(false)
    const shouldGlitch = isGlitching || (glitchOnHover && isHovering)
    const config = {
      subtle: { duration: "1.2s", opacity: 0.4 },
      medium: { duration: "0.8s", opacity: 0.5 },
      intense: { duration: "0.5s", opacity: 0.7 },
    }[intensity]
    
    // Monochrome glitch colors for light vs dark button backgrounds
    const glitchColors = glitchVariant === "dark" 
      ? { layer1: "#ffffff", layer2: "#cccccc", bg: "bg-primary" }
      : { layer1: "#000000", layer2: "#333333", bg: "bg-background" }

    React.useEffect(() => {
      if (!glitchSoundSrc) {
        audioRefs.current = []
        return
      }

      const soundSources = Array.isArray(glitchSoundSrc) ? glitchSoundSrc : [glitchSoundSrc]
      audioRefs.current = soundSources.map((soundSource) => {
        const audio = new Audio(soundSource)
        audio.preload = "auto"
        audio.volume = glitchSoundVolume
        return audio
      })
    }, [glitchSoundSrc, glitchSoundVolume])

    React.useEffect(() => {
      if (!glitchSoundSrc || !shouldGlitch || wasGlitchingRef.current) {
        wasGlitchingRef.current = shouldGlitch
        return
      }

      const audioPool = audioRefs.current
      const audio = audioPool[Math.floor(Math.random() * audioPool.length)]
      if (audio) {
        audio.currentTime = 0
        void audio.play().catch(() => undefined)
      }

      wasGlitchingRef.current = shouldGlitch
    }, [glitchSoundSrc, shouldGlitch])

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: glitchKeyframes }} />
        <Button
          ref={ref}
          className={cn("relative overflow-visible", className)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={
            shouldGlitch
              ? {
                  animation: `glitch-skew ${config.duration} infinite linear`,
                }
              : undefined
          }
          {...props}
        >
          {/* Glitch layer 1 */}
          {shouldGlitch && (
            <span
              aria-hidden="true"
              className={cn("pointer-events-none absolute inset-0 flex items-center justify-center rounded-full", glitchColors.bg)}
              style={{
                color: glitchColors.layer1,
                opacity: config.opacity,
                animation: `glitch-1 ${config.duration} infinite linear`,
              }}
            >
              {children}
            </span>
          )}

          {/* Glitch layer 2 */}
          {shouldGlitch && (
            <span
              aria-hidden="true"
              className={cn("pointer-events-none absolute inset-0 flex items-center justify-center rounded-full", glitchColors.bg)}
              style={{
                color: glitchColors.layer2,
                opacity: config.opacity,
                animation: `glitch-2 ${config.duration} infinite linear`,
              }}
            >
              {children}
            </span>
          )}

          {/* Main text */}
          <span className="relative z-10">{children}</span>
        </Button>
      </>
    )
  }
)

GlitchableButton.displayName = "GlitchableButton"
