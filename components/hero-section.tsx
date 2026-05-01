"use client"

import { useEffect, useRef, useState } from "react"
import { GlitchableButton } from "@/components/ui/glitchable-button"
import GlitchText from "@/components/ui/glitch-text"
import { useStory } from "@/lib/story-context"

const GLITCH_TITLE_WORDS = ["bringing", "technology", "to", "life"] as const
const GLITCH_SOUND_SOURCES = [
  "/audio/glitch/Glitch1.mp3",
  "/audio/glitch/Glitch2.mp3",
  "/audio/glitch/Glitch3.mp3",
]
const GLITCH_SOUND_VOLUME = 0.05
type GlitchTitleWord = (typeof GLITCH_TITLE_WORDS)[number]

export function HeroSection() {
  const [glitchingButton, setGlitchingButton] = useState<string | null>(null)
  const [glitchingTitleWord, setGlitchingTitleWord] = useState<GlitchTitleWord | null>(null)
  const titleGlitchDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleGlitchEndRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { state, handleInteraction } = useStory()

  useEffect(() => {
    const clearTitleGlitchTimers = () => {
      if (titleGlitchDelayRef.current) {
        clearTimeout(titleGlitchDelayRef.current)
      }

      if (titleGlitchEndRef.current) {
        clearTimeout(titleGlitchEndRef.current)
      }
    }

    if (state.phase !== "idle") {
      clearTitleGlitchTimers()
      setGlitchingTitleWord(null)
      return
    }

    const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)
    const randomTitleWord = () => GLITCH_TITLE_WORDS[Math.floor(Math.random() * GLITCH_TITLE_WORDS.length)]

    const scheduleTitleGlitch = () => {
      titleGlitchDelayRef.current = setTimeout(() => {
        setGlitchingTitleWord(randomTitleWord())

        titleGlitchEndRef.current = setTimeout(() => {
          setGlitchingTitleWord(null)
          scheduleTitleGlitch()
        }, randomBetween(175, 350))
      }, randomBetween(4200, 6000))
    }

    scheduleTitleGlitch()

    return clearTitleGlitchTimers
  }, [state.phase])

  const handleCtaClick = (buttonId: string) => (e: React.MouseEvent) => {
    if (state.phase === "idle") {
      setGlitchingButton(buttonId)
      setTimeout(() => setGlitchingButton(null), 500)
    }
    handleInteraction(e)
  }

  return (
    <section className="pt-24 sm:pt-32 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Headline */}
          <div>
            <h1 className="text-[2.5rem] sm:text-5xl lg:text-6xl font-medium tracking-tight text-balance leading-[1.1]">
              <GlitchText
                speed={0.35}
                active={glitchingTitleWord === "bringing"}
                glitchSoundSrc={GLITCH_SOUND_SOURCES}
                glitchSoundVolume={GLITCH_SOUND_VOLUME}
              >
                Bringing
              </GlitchText>
              <br />
              <GlitchText
                speed={0.35}
                active={glitchingTitleWord === "technology"}
                glitchSoundSrc={GLITCH_SOUND_SOURCES}
                glitchSoundVolume={GLITCH_SOUND_VOLUME}
              >
                technology
              </GlitchText>{" "}
              <GlitchText
                speed={0.35}
                active={glitchingTitleWord === "to"}
                glitchSoundSrc={GLITCH_SOUND_SOURCES}
                glitchSoundVolume={GLITCH_SOUND_VOLUME}
              >
                to
              </GlitchText>{" "}
              <GlitchText
                speed={0.35}
                active={glitchingTitleWord === "life"}
                glitchSoundSrc={GLITCH_SOUND_SOURCES}
                glitchSoundVolume={GLITCH_SOUND_VOLUME}
              >
                life
              </GlitchText>
            </h1>
          </div>

          {/* Description - Below headline on mobile, right side on desktop */}
          <div className="lg:pt-4">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Powering the best enterprises, creators, and developers. From ElevenAgents for customer experience, ElevenCreative for content creation, to the leading AI voice generator.
            </p>
          </div>
        </div>

        {/* CTA Buttons - Always below content */}
        <div className="flex flex-wrap gap-3 mt-8">
          <GlitchableButton
            className="rounded-full px-6 h-11 text-base"
            onClick={handleCtaClick("hero-signup")}
            isGlitching={glitchingButton === "hero-signup"}
            intensity="intense"
            glitchSoundSrc={GLITCH_SOUND_SOURCES}
            glitchSoundVolume={GLITCH_SOUND_VOLUME}
          >
            Sign up
          </GlitchableButton>
          <GlitchableButton
            variant="outline"
            className="rounded-full px-6 h-11 text-base"
            onClick={handleCtaClick("hero-contact")}
            isGlitching={glitchingButton === "hero-contact"}
            intensity="intense"
            glitchVariant="light"
            glitchSoundSrc={GLITCH_SOUND_SOURCES}
            glitchSoundVolume={GLITCH_SOUND_VOLUME}
          >
            Contact sales
          </GlitchableButton>
        </div>
      </div>
    </section>
  )
}
