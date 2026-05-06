"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlitchableButton } from "@/components/ui/glitchable-button"
import GlitchText from "@/components/ui/glitch-text"
import { useStory } from "@/lib/story-context"
import { cn } from "@/lib/utils"

function AnimatedPercent({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    const startedAt = performance.now()
    const from = displayValue
    const change = value - from
    let animationFrame = 0

    const animate = () => {
      const progress = Math.min(1, (performance.now() - startedAt) / 500)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(from + change * eased))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value])

  return <span className="tabular-nums">{displayValue}</span>
}

export function Header() {
  const [glitchingButton, setGlitchingButton] = useState<string | null>(null)
  const [isHacksVisible, setIsHacksVisible] = useState(false)
  const [isHacksGlitching, setIsHacksGlitching] = useState(false)
  const { state, takeoverGlitchElapsed, londonControlElapsed, v3DeploymentPercent, v4ReleasedElapsed, handleInteraction } = useStory()
  const showControlBanner = londonControlElapsed !== null && v4ReleasedElapsed === null
  const showDeploymentStatus = v3DeploymentPercent !== null
  const deploymentPercent = v3DeploymentPercent ?? 100
  const deploymentStatusClass =
    deploymentPercent <= 15 ? "bg-red-400" : deploymentPercent <= 40 ? "bg-amber-400" : "bg-emerald-400"
  const isTakeoverGlitchInWindow = (startSeconds: number, endSeconds: number) =>
    takeoverGlitchElapsed !== null && takeoverGlitchElapsed >= startSeconds && takeoverGlitchElapsed <= endSeconds
  const navGlitchActive = isTakeoverGlitchInWindow(0.18, 0.34) || isTakeoverGlitchInWindow(1.45, 1.65)
  const logoGlitchActive = isTakeoverGlitchInWindow(0.72, 0.92) || isTakeoverGlitchInWindow(2.2, 2.42)
  const ctaGlitchActive = isTakeoverGlitchInWindow(1.02, 1.24) || isTakeoverGlitchInWindow(2.84, 3.1)

  const handleCtaClick = (buttonId: string) => (e: React.MouseEvent) => {
    if (state.phase === "idle") {
      setGlitchingButton(buttonId)
      setTimeout(() => setGlitchingButton(null), 500)
    }
    handleInteraction(e)
  }

  useEffect(() => {
    const revealTimeout = window.setTimeout(() => setIsHacksVisible(true), 2000)
    let glitchEndTimeout: ReturnType<typeof window.setTimeout> | undefined
    let nextGlitchTimeout: ReturnType<typeof window.setTimeout> | undefined
    const randomGlitchDelay = () => 3000 + Math.random() * 7000

    const pulseHacksGlitch = () => {
      setIsHacksGlitching(true)
      glitchEndTimeout = window.setTimeout(() => setIsHacksGlitching(false), 300)
      nextGlitchTimeout = window.setTimeout(pulseHacksGlitch, randomGlitchDelay())
    }

    const glitchStartTimeout = window.setTimeout(pulseHacksGlitch, 4200)

    return () => {
      window.clearTimeout(revealTimeout)
      window.clearTimeout(glitchStartTimeout)

      if (glitchEndTimeout) {
        window.clearTimeout(glitchEndTimeout)
      }

      if (nextGlitchTimeout) {
        window.clearTimeout(nextGlitchTimeout)
      }
    }
  }, [])

  return (
    <header
      className={cn(
        "theme-color-transition fixed top-0 left-0 right-0 z-50 overflow-hidden bg-background/80 text-foreground backdrop-blur-md",
        navGlitchActive && "takeover-glitch-soft"
      )}
    >
      <div
        className={cn(
          "overflow-hidden border-b border-red-950/40 shadow-[0_18px_60px_rgb(0_0_0_/_0.18)] transition-[max-height,opacity] duration-1000 ease-out",
          showControlBanner ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        )}
        style={{
          background: "linear-gradient(90deg, rgb(12 12 12) 0%, rgb(48 10 16) 50%, rgb(12 12 12) 100%)",
          color: "rgb(255 255 255)",
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 text-xs font-medium tracking-[0.02em]">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
              <Badge variant="outline" className="border-red-400/30 bg-red-500/15 px-1.5 py-0 text-[10px] text-red-100">
                <span className="mr-1 size-1.5 animate-pulse rounded-full bg-red-400" />
                LIVE
              </Badge>
              <span className="truncate" style={{ color: "rgb(255 255 255 / 0.92)" }}>
                V4 deployment in progress. London Control is live.
              </span>
            </div>
            {showDeploymentStatus && (
              <div className="ml-auto flex shrink-0 items-center gap-2 border-l border-white/20 pl-3">
                <span
                  aria-label="V3 deployment status"
                  className={cn("size-1.5 shrink-0 rounded-full transition-colors duration-500", deploymentStatusClass)}
                  role="img"
                />
                <span className="hidden text-[10px] font-medium uppercase tracking-widest text-white/60 sm:inline">
                  V3 deployment
                </span>
                <span className="min-w-9 text-left text-sm font-semibold text-white">
                  <AnimatedPercent value={deploymentPercent} />%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="theme-color-transition border-b border-border/40 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between sm:h-16">
          {/* Logo */}
          <button
            onClick={handleInteraction}
            className={cn("theme-color-transition flex items-center gap-1 text-foreground", logoGlitchActive && "takeover-glitch-hit")}
          >
            <span className="theme-color-transition inline-flex w-[15ch] items-center text-lg tracking-tight text-foreground sm:text-xl">
              <span className="font-normal">II</span>
              <span className="font-semibold">ElevenLabs</span>
              <span
                className="font-normal"
                style={{
                  opacity: isHacksVisible ? 1 : 0,
                  transition: "opacity 2200ms ease-out",
                }}
              >
                <GlitchText speed={0.7} active={isHacksGlitching} enableShadows={false}>
                  Hacks
                </GlitchText>
              </span>
            </span>
          </button>

          <div className={cn("flex items-center gap-2", ctaGlitchActive && "takeover-glitch-soft")}>
            <GlitchableButton
              variant="ghost"
              size="sm"
              className="theme-color-transition text-sm text-foreground"
              onClick={handleCtaClick("desktop-contact")}
              isGlitching={glitchingButton === "desktop-contact"}
              intensity="intense"
              glitchVariant="light"
            >
              Contact sales
            </GlitchableButton>
            <GlitchableButton
              size="sm"
              className="theme-color-transition rounded-full px-4 text-sm"
              onClick={handleCtaClick("desktop-login")}
              isGlitching={glitchingButton === "desktop-login"}
              intensity="intense"
            >
              Log in
            </GlitchableButton>
          </div>
        </div>
      </div>
    </header>
  )
}
