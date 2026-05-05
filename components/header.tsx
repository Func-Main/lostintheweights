"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlitchableButton } from "@/components/ui/glitchable-button"
import TypingText from "@/components/ui/typing-text"
import { ChevronDown, Menu, X } from "lucide-react"
import { useStory } from "@/lib/story-context"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "ElevenCreative", href: "#", hasDropdown: true },
  { name: "ElevenAgents", href: "#", hasDropdown: true },
  { name: "ElevenAPI", href: "#", hasDropdown: true },
  { name: "Resources", href: "#", hasDropdown: true },
  { name: "Enterprise", href: "#", hasDropdown: false },
  { name: "Pricing", href: "#", hasDropdown: false },
]

const idleNavTitles = [
  "ElevenLabs",
  "hello",
  "hello?",
  "hello??",
  "hello???",
  "hello????",
  "hello?????",
  "hello??????",
  "hello???????",
  "anyone there",
  "anyone there?",
  "anyone there??",
  "anyone there???",
  "anyone there????",
  "anyone there?????",
  "anyone there??????",
  "anyone there???????",
] as const

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [glitchingButton, setGlitchingButton] = useState<string | null>(null)
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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 overflow-hidden bg-background/80 backdrop-blur-md",
        navGlitchActive && "takeover-glitch-soft"
      )}
    >
      <div
        className={cn(
          "overflow-hidden bg-foreground text-background transition-[max-height,opacity] duration-1000 ease-out",
          showControlBanner ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 text-xs font-medium tracking-[0.02em] sm:px-6 lg:px-8">
          <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md border border-background/15 bg-background/10">
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-85"
              src="/creative/conversational-orb-control.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-foreground/20" />
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
            <Badge variant="outline" className="border-red-400/30 bg-red-500/15 px-1.5 py-0 text-[10px] text-red-100">
              <span className="mr-1 size-1.5 animate-pulse rounded-full bg-red-400" />
              LIVE
            </Badge>
            <span className="truncate text-background/90">V4 deployment window open. London control is live.</span>
          </div>
          {showDeploymentStatus && (
            <div className="ml-auto flex shrink-0 items-center gap-2 border-l border-background/20 pl-3">
              <span
                aria-label="V3 deployment status"
                className={cn("size-1.5 shrink-0 rounded-full transition-colors duration-500", deploymentStatusClass)}
                role="img"
              />
              <span className="hidden text-[10px] font-medium uppercase tracking-widest text-background/60 sm:inline">
                V3 deployment
              </span>
              <span className="min-w-9 text-left text-sm font-semibold text-background">
                <AnimatedPercent value={deploymentPercent} />%
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-b border-border/40 px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <button onClick={handleInteraction} className={cn("flex items-center gap-1", logoGlitchActive && "takeover-glitch-hit")}>
            <span className="inline-flex w-[15ch] items-center text-lg sm:text-xl font-semibold tracking-tight">
              <span className="font-normal">II</span>
              {state.phase === "idle" ? (
                <TypingText
                  text={idleNavTitles}
                  showCursor={false}
                  typingSpeed={55}
                  deletingSpeed={35}
                  pauseDuration={2000}
                  initialDelay={1200}
                  variableSpeed={{ min: 35, max: 90 }}
                />
              ) : (
                "ElevenLabs"
              )}
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className={cn("hidden lg:flex items-center gap-1", navGlitchActive && "takeover-glitch-hit")}>
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={handleInteraction}
                className="flex items-center gap-1 px-3 py-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                {item.name}
                {item.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className={cn("hidden lg:flex items-center gap-2", ctaGlitchActive && "takeover-glitch-soft")}>
            <GlitchableButton
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={handleCtaClick("desktop-contact")}
              isGlitching={glitchingButton === "desktop-contact"}
              intensity="intense"
              glitchVariant="light"
            >
              Contact sales
            </GlitchableButton>
            <GlitchableButton
              size="sm"
              className="text-sm rounded-full px-4"
              onClick={handleCtaClick("desktop-login")}
              isGlitching={glitchingButton === "desktop-login"}
              intensity="intense"
            >
              Log in
            </GlitchableButton>
          </div>

          {/* Mobile Right Side - Sign up + Menu */}
          <div className={cn("flex lg:hidden items-center gap-2", ctaGlitchActive && "takeover-glitch-soft")}>
            <GlitchableButton
              size="sm"
              className="rounded-full px-4 h-9 text-sm"
              onClick={handleCtaClick("mobile-signup")}
              isGlitching={glitchingButton === "mobile-signup"}
              intensity="intense"
            >
              Sign up
            </GlitchableButton>
            <button
              className="p-2"
              onClick={handleInteraction}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Hidden in idle state */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={handleInteraction}
                  className="flex items-center justify-between px-2 py-3 text-sm text-left"
                >
                  {item.name}
                  {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
                </button>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                <GlitchableButton
                  variant="outline"
                  className="w-full"
                  onClick={handleCtaClick("mobile-menu-contact")}
                  isGlitching={glitchingButton === "mobile-menu-contact"}
                  intensity="intense"
                  glitchVariant="light"
                >
                  Contact sales
                </GlitchableButton>
                <GlitchableButton
                  className="w-full"
                  onClick={handleCtaClick("mobile-menu-login")}
                  isGlitching={glitchingButton === "mobile-menu-login"}
                  intensity="intense"
                >
                  Log in
                </GlitchableButton>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
