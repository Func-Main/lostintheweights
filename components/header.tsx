"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlitchableButton } from "@/components/ui/glitchable-button"
import GlitchText from "@/components/ui/glitch-text"
import { useStory } from "@/lib/story-context"
import { cn } from "@/lib/utils"

const formatCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function Header() {
  const [glitchingButton, setGlitchingButton] = useState<string | null>(null)
  const [isHacksVisible, setIsHacksVisible] = useState(false)
  const [isHacksGlitching, setIsHacksGlitching] = useState(false)
  const [hasHacksIntroduced, setHasHacksIntroduced] = useState(false)
  const { state, takeoverGlitchElapsed, londonControlElapsed, audioRemainingSeconds, v4ReleasedElapsed, resetStory, handleInteraction } = useStory()
  const showControlBanner = londonControlElapsed !== null && v4ReleasedElapsed === null
  const showCountdownStatus = audioRemainingSeconds !== null
  const countdownLabel = formatCountdown(audioRemainingSeconds ?? 0)
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
    const revealTimeout = window.setTimeout(() => {
      setIsHacksVisible(true)
      setHasHacksIntroduced(true)
    }, 2000)
    let glitchEndTimeout: ReturnType<typeof window.setTimeout> | undefined
    let nextGlitchTimeout: ReturnType<typeof window.setTimeout> | undefined
    let hideEndTimeout: ReturnType<typeof window.setTimeout> | undefined
    let nextHideTimeout: ReturnType<typeof window.setTimeout> | undefined
    let blinkTimeouts: ReturnType<typeof window.setTimeout>[] = []
    const randomGlitchDelay = () => 3000 + Math.random() * 7000
    const randomHideDelay = () => 5000 + Math.random() * 9000
    const randomHideDuration = () => 1600 + Math.random() * 2200

    const pulseHacksGlitch = () => {
      setIsHacksGlitching(true)
      glitchEndTimeout = window.setTimeout(() => setIsHacksGlitching(false), 300)
      nextGlitchTimeout = window.setTimeout(pulseHacksGlitch, randomGlitchDelay())
    }

    const hideHacksBriefly = () => {
      const hideDuration = randomHideDuration()
      const queueBlink = (delay: number, visible: boolean) => {
        blinkTimeouts.push(window.setTimeout(() => setIsHacksVisible(visible), delay))
      }

      queueBlink(0, false)
      queueBlink(90, true)
      queueBlink(160, false)
      queueBlink(230, true)
      queueBlink(310, false)
      hideEndTimeout = window.setTimeout(() => {
        setIsHacksVisible(true)
        queueBlink(70, false)
        queueBlink(140, true)
      }, hideDuration)
      nextHideTimeout = window.setTimeout(hideHacksBriefly, randomHideDelay())
    }

    const glitchStartTimeout = window.setTimeout(pulseHacksGlitch, 4200)
    const hideStartTimeout = window.setTimeout(hideHacksBriefly, 6800)

    return () => {
      window.clearTimeout(revealTimeout)
      window.clearTimeout(glitchStartTimeout)
      window.clearTimeout(hideStartTimeout)

      if (glitchEndTimeout) {
        window.clearTimeout(glitchEndTimeout)
      }

      if (nextGlitchTimeout) {
        window.clearTimeout(nextGlitchTimeout)
      }

      if (hideEndTimeout) {
        window.clearTimeout(hideEndTimeout)
      }

      if (nextHideTimeout) {
        window.clearTimeout(nextHideTimeout)
      }

      blinkTimeouts.forEach((timeout) => window.clearTimeout(timeout))
      blinkTimeouts = []
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
          showControlBanner ? "max-h-10 opacity-100 sm:max-h-20 sm:[@media(max-height:1000px)]:max-h-12" : "max-h-0 opacity-0"
        )}
        style={{
          background: "linear-gradient(90deg, rgb(12 12 12) 0%, rgb(48 10 16) 50%, rgb(12 12 12) 100%)",
          color: "rgb(255 255 255)",
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex h-8 max-w-7xl items-center gap-3 text-xs font-medium tracking-[0.02em] sm:h-16 sm:[@media(max-height:1000px)]:h-10">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
              <Badge variant="outline" className="border-red-400/30 bg-red-500/15 px-1.5 py-0 text-[10px] text-red-100">
                <span className="mr-1 size-1.5 animate-pulse rounded-full bg-red-400" />
                LIVE
              </Badge>
              <span className="truncate" style={{ color: "rgb(255 255 255 / 0.92)" }}>
                V4 deployment in progress.
              </span>
            </div>
            {showCountdownStatus && (
              <div className="ml-auto flex shrink-0 items-center gap-2 border-l border-white/20 pl-3">
                <span
                  aria-label="Audio countdown status"
                  className="size-1.5 shrink-0 rounded-full bg-red-400 transition-colors duration-500"
                  role="img"
                />
                <span className="hidden text-[10px] font-medium uppercase tracking-widest text-white/60 sm:inline">
                  Time remaining
                </span>
                <span className="min-w-11 text-left text-sm font-semibold tabular-nums text-white">
                  {countdownLabel}
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
            onClick={resetStory}
            aria-label="Return to start"
            className={cn("theme-color-transition flex items-center gap-1 text-foreground", logoGlitchActive && "takeover-glitch-hit")}
          >
            <span className="theme-color-transition inline-flex w-[15ch] items-center text-lg tracking-tight text-foreground sm:text-xl">
              <span className="font-normal">II</span>
              <span className="font-semibold">ElevenLabs</span>
              <span
                className="font-normal"
                style={{
                  opacity: isHacksVisible ? 1 : 0,
                  transition: isHacksVisible && !hasHacksIntroduced ? "opacity 2200ms ease-out" : "opacity 90ms linear",
                }}
              >
                <GlitchText speed={0.7} active={isHacksGlitching} enableShadows={false}>
                  Hacks
                </GlitchText>
              </span>
            </span>
          </button>

          <div className={cn("hidden items-center gap-2 sm:flex", ctaGlitchActive && "takeover-glitch-soft")}>
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
