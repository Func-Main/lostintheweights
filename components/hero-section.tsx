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
const HERO_TWO_COLUMN_QUERY = "(min-width: 640px)"

const formatLandingTimestamp = (date: Date) => {
  const dateParts = new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
  const timeParts = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)

  return `${dateParts} at ${timeParts}`
}

export function HeroSection() {
  const [glitchingTitleWord, setGlitchingTitleWord] = useState<GlitchTitleWord | null>(null)
  const [deprecationWordGlitching, setDeprecationWordGlitching] = useState(false)
  const [landingTimestamp, setLandingTimestamp] = useState<string | null>(null)
  const [isHeroTwoColumn, setIsHeroTwoColumn] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia(HERO_TWO_COLUMN_QUERY).matches
  )
  const titleGlitchDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleGlitchEndRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deprecationGlitchDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deprecationGlitchEndRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
    setLandingTimestamp(formatLandingTimestamp(new Date()))
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(HERO_TWO_COLUMN_QUERY)
    const syncHeroLayout = () => setIsHeroTwoColumn(mediaQuery.matches)

    syncHeroLayout()
    mediaQuery.addEventListener("change", syncHeroLayout)

    return () => mediaQuery.removeEventListener("change", syncHeroLayout)
  }, [])

  useEffect(() => {
    const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

    const scheduleDeprecationGlitch = () => {
      deprecationGlitchDelayRef.current = setTimeout(() => {
        setDeprecationWordGlitching(true)

        deprecationGlitchEndRef.current = setTimeout(() => {
          setDeprecationWordGlitching(false)
          scheduleDeprecationGlitch()
        }, randomBetween(420, 760))
      }, randomBetween(9000, 15000))
    }

    scheduleDeprecationGlitch()

    return () => {
      if (deprecationGlitchDelayRef.current) {
        clearTimeout(deprecationGlitchDelayRef.current)
      }

      if (deprecationGlitchEndRef.current) {
        clearTimeout(deprecationGlitchEndRef.current)
      }
    }
  }, [])

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
        <div
          className="grid gap-6"
          style={{
            alignItems: isHeroTwoColumn ? "center" : undefined,
            gap: isHeroTwoColumn ? "2rem" : "1.5rem",
            gridTemplateColumns: isHeroTwoColumn
              ? "minmax(0, 1.12fr) minmax(280px, 0.88fr)"
              : "1fr",
          }}
        >
          {/* Headline */}
          <div className="min-w-0">
            {isV4Released ? (
              <>
                <h1
                  className={cn(
                    "text-[2.5rem] font-medium tracking-tight text-balance leading-[1.1] sm:text-5xl lg:text-6xl",
                    isHeadlineReplacementGlitching && "meet-section-glitch"
                  )}
                >
                  Meet{" "}
                  <GradientText
                    text="Eleven v4"
                    neon
                    gradient="linear-gradient(90deg, #050505 0%, #050505 28%, #1d4ed8 46%, #7c3aed 58%, #050505 76%, #050505 100%)"
                    transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                  .
                </h1>
                <p className="mt-4 text-2xl font-medium leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  Voice made real
                </p>
              </>
            ) : (
              <h1
                className={cn(
                  "text-[2.5rem] font-medium tracking-tight text-balance leading-[1.1] sm:text-5xl lg:text-6xl",
                  isHeadlineReplacementGlitching && "meet-section-glitch"
                )}
              >
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
              </h1>
            )}
          </div>

          {/* Description - Below headline on mobile, right side on desktop */}
          <div className="min-w-0" style={{ justifySelf: isHeroTwoColumn ? "end" : undefined }}>
            <p
              className="text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{
                maxWidth: isHeroTwoColumn ? 420 : 600,
                textAlign: isHeroTwoColumn ? "right" : undefined,
              }}
            >
              <GlitchText speed={0.18} active={coughGlitchWords.description} enableShadows={false}>
                Powering the best enterprises, creators, and developers. From ElevenAgents for customer experience, ElevenCreative for content creation, to the leading AI voice generator.
              </GlitchText>
            </p>
            {!isV4Released && (
              <p
                className="mt-4 border-t border-border/60 pt-3 text-xs italic text-muted-foreground/75 sm:text-sm"
                style={{
                  marginLeft: isHeroTwoColumn ? "auto" : undefined,
                  maxWidth: isHeroTwoColumn ? 420 : 600,
                  textAlign: isHeroTwoColumn ? "right" : undefined,
                }}
              >
                V3{" "}
                <GlitchText speed={0.7} active={deprecationWordGlitching} enableShadows={false}>
                  deprecation
                </GlitchText>{" "}
                notice • Effective {landingTimestamp ?? "on arrival"}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
