"use client"

import { useEffect, useRef, useState } from "react"
import { GradientText } from "@/components/ui/gradient-text"
import GlitchText from "@/components/ui/glitch-text"
import { useStory } from "@/lib/story-context"
import { cn } from "@/lib/utils"

const GLITCH_TITLE_WORDS = ["bringing", "technology", "to", "life"] as const
const GLITCH_SOUND_SOURCES = [
  "/audio/glitch/Glitch1.mp3",
  "/audio/glitch/Glitch2.mp3",
  "/audio/glitch/Glitch3.mp3",
]
const GLITCH_SOUND_VOLUME = 0.05
type GlitchTitleWord = (typeof GLITCH_TITLE_WORDS)[number]

export function HeroSection() {
  const [glitchingTitleWord, setGlitchingTitleWord] = useState<GlitchTitleWord | null>(null)
  const titleGlitchDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleGlitchEndRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { state, coughGlitchElapsed, takeoverGlitchElapsed, londonControlElapsed, v4ReleasedElapsed } = useStory()
  const isControlBannerVisible = londonControlElapsed !== null
  const isV4Released = v4ReleasedElapsed !== null
  const isCoughGlitchInWindow = (startSeconds: number, endSeconds: number) =>
    coughGlitchElapsed !== null && coughGlitchElapsed >= startSeconds && coughGlitchElapsed <= endSeconds
  const isTakeoverGlitchInWindow = (startSeconds: number, endSeconds: number) =>
    takeoverGlitchElapsed !== null && takeoverGlitchElapsed >= startSeconds && takeoverGlitchElapsed <= endSeconds
  const traceVideoGlitchElapsedSeconds = takeoverGlitchElapsed !== null
    ? takeoverGlitchElapsed - 3.601
    : null
  const isHeadlineReplacementGlitching =
    traceVideoGlitchElapsedSeconds !== null &&
    traceVideoGlitchElapsedSeconds >= 0 &&
    traceVideoGlitchElapsedSeconds < 0.72
  const heroTakeoverGlitchActive =
    isTakeoverGlitchInWindow(0.44, 0.7) ||
    isTakeoverGlitchInWindow(1.7, 1.98) ||
    isTakeoverGlitchInWindow(3.15, 3.38) ||
    isHeadlineReplacementGlitching
  const coughGlitchWords = {
    bringing: isCoughGlitchInWindow(0, 0.42) || isCoughGlitchInWindow(1.08, 1.38),
    technology: isCoughGlitchInWindow(0.16, 0.72) || isCoughGlitchInWindow(1.26, 1.58),
    to: isCoughGlitchInWindow(0.36, 0.58) || isCoughGlitchInWindow(1.44, 1.76),
    life: isCoughGlitchInWindow(0.48, 0.96) || isCoughGlitchInWindow(1.62, 2.04),
    description: isCoughGlitchInWindow(0.24, 0.88) || isCoughGlitchInWindow(1.18, 1.94),
  } satisfies Record<GlitchTitleWord | "description", boolean>

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

  return (
    <section
      className={cn(
        "px-4 pb-6 transition-[padding] duration-500 ease-out sm:px-6 sm:pb-8 lg:px-8",
        isControlBannerVisible ? "pt-32 sm:pt-40" : "pt-24 sm:pt-32",
        heroTakeoverGlitchActive && "takeover-glitch-soft"
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
          {/* Headline */}
          <div>
            <h1
              className={cn(
                "text-[2.5rem] sm:text-5xl lg:text-6xl font-medium tracking-tight text-balance leading-[1.1]",
                isHeadlineReplacementGlitching && "meet-section-glitch"
              )}
            >
              {isV4Released ? (
                <>
                  Meet{" "}
                  <GradientText
                    text="Eleven v4"
                    neon
                    gradient="linear-gradient(90deg, #050505 0%, #050505 28%, #1d4ed8 46%, #7c3aed 58%, #050505 76%, #050505 100%)"
                    transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                  .
                  <br />
                  More natural. More stable.
                </>
              ) : (
                <>
                  <GlitchText
                    speed={coughGlitchWords.bringing ? 0.12 : 0.35}
                    active={coughGlitchWords.bringing || glitchingTitleWord === "bringing" || isHeadlineReplacementGlitching}
                    glitchSoundSrc={(coughGlitchWords.bringing || isHeadlineReplacementGlitching) ? undefined : GLITCH_SOUND_SOURCES}
                    glitchSoundVolume={GLITCH_SOUND_VOLUME}
                  >
                    Bringing
                  </GlitchText>
                  <br />
                  <GlitchText
                    speed={coughGlitchWords.technology ? 0.12 : 0.35}
                    active={coughGlitchWords.technology || glitchingTitleWord === "technology" || isHeadlineReplacementGlitching}
                    glitchSoundSrc={(coughGlitchWords.technology || isHeadlineReplacementGlitching) ? undefined : GLITCH_SOUND_SOURCES}
                    glitchSoundVolume={GLITCH_SOUND_VOLUME}
                  >
                    technology
                  </GlitchText>{" "}
                  <GlitchText
                    speed={coughGlitchWords.to ? 0.12 : 0.35}
                    active={coughGlitchWords.to || glitchingTitleWord === "to" || isHeadlineReplacementGlitching}
                    glitchSoundSrc={(coughGlitchWords.to || isHeadlineReplacementGlitching) ? undefined : GLITCH_SOUND_SOURCES}
                    glitchSoundVolume={GLITCH_SOUND_VOLUME}
                  >
                    to
                  </GlitchText>{" "}
                  <GlitchText
                    speed={coughGlitchWords.life ? 0.12 : 0.35}
                    active={coughGlitchWords.life || glitchingTitleWord === "life" || isHeadlineReplacementGlitching}
                    glitchSoundSrc={(coughGlitchWords.life || isHeadlineReplacementGlitching) ? undefined : GLITCH_SOUND_SOURCES}
                    glitchSoundVolume={GLITCH_SOUND_VOLUME}
                  >
                    life
                  </GlitchText>
                </>
              )}
            </h1>
          </div>

          {/* Description - Below headline on mobile, right side on desktop */}
          <div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {isV4Released ? (
                "V4 makes AI voice more expressive, more directable, and more consistent. Give it a line, a mood, or a moment, and hear it arrive with presence."
              ) : (
                <GlitchText speed={0.18} active={coughGlitchWords.description} enableShadows={false}>
                  Powering the best enterprises, creators, and developers. From ElevenAgents for customer experience, ElevenCreative for content creation, to the leading AI voice generator.
                </GlitchText>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
