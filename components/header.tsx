"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GlitchableButton } from "@/components/ui/glitchable-button"
import TypingText from "@/components/ui/typing-text"
import { ChevronDown, Menu, X } from "lucide-react"
import { useStory } from "@/lib/story-context"

const navItems = [
  { name: "ElevenCreative", href: "#", hasDropdown: true },
  { name: "ElevenAgents", href: "#", hasDropdown: true },
  { name: "ElevenAPI", href: "#", hasDropdown: true },
  { name: "Resources", href: "#", hasDropdown: true },
  { name: "Enterprise", href: "#", hasDropdown: false },
  { name: "Pricing", href: "#", hasDropdown: false },
]

const idleNavTitles = ["ElevenLabs", "hello?", "anyone there?", "press play"] as const

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [glitchingButton, setGlitchingButton] = useState<string | null>(null)
  const { state, handleInteraction } = useStory()

  const handleCtaClick = (buttonId: string) => (e: React.MouseEvent) => {
    if (state.phase === "idle") {
      setGlitchingButton(buttonId)
      setTimeout(() => setGlitchingButton(null), 500)
    }
    handleInteraction(e)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <button onClick={handleInteraction} className="flex items-center gap-1">
            <span className="text-lg sm:text-xl font-semibold tracking-tight">
              <span className="font-normal">II</span>
              {state.phase === "idle" ? (
                <TypingText
                  text={idleNavTitles}
                  showCursor={false}
                  typingSpeed={55}
                  deletingSpeed={35}
                  pauseDuration={1200}
                  initialDelay={1200}
                  variableSpeed={{ min: 35, max: 90 }}
                />
              ) : (
                "ElevenLabs"
              )}
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
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
          <div className="hidden lg:flex items-center gap-2">
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
          <div className="flex lg:hidden items-center gap-2">
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
