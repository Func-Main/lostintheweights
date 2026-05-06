"use client"

import { useEffect, useRef, useState } from "react"
import { GradientText } from "@/components/ui/gradient-text"
import GlitchText from "@/components/ui/glitch-text"
import { useStory } from "@/lib/story-context"
import { cn } from "@/lib/utils"

const GLITCH_TITLE_WORDS = ["bringing", "technology", "to", "life"] as const
type GlitchTitleWord = (typeof GLITCH_TITLE_WORDS)[number]
const HERO_TWO_COLUMN_QUERY = "(min-width: 640px)"
const SHORT_DESKTOP_HEIGHT_QUERY = "(min-width: 640px) and (max-height: 1000px)"
const DESKTOP_HERO_SCROLL_CUE_SECONDS = 0.62
const DESKTOP_ORB_SCROLL_OFFSET_PX = 96
const DESKTOP_ORB_SCROLL_DURATION_MS = 1100

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

const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3)

export function HeroSection() {
  const [glitchingTitleWord, setGlitchingTitleWord] = useState<GlitchTitleWord | null>(null)
  const [deprecationWordGlitching, setDeprecationWordGlitching] = useState(false)
  const [landingTimestamp, setLandingTimestamp] = useState<string | null>(null)
  const [hasDeprecationNoticeEntered, setHasDeprecationNoticeEntered] = useState(false)
  const [hasScrolledDesktopHeroOut, setHasScrolledDesktopHeroOut] = useState(false)
  const [isHeroTwoColumn, setIsHeroTwoColumn] = useState(true)
  const [isShortDesktopViewport, setIsShortDesktopViewport] = useState(false)
  const titleGlitchDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleGlitchEndRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deprecationGlitchDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deprecationGlitchEndRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const desktopHeroScrollAnimationRef = useRef<number | null>(null)
  const previousCoughGlitchElapsedRef = useRef<number | null>(null)
  const { state, coughGlitchElapsed, takeoverGlitchElapsed, londonControlElapsed, v4ReleasedElapsed, resetSignal } = useStory()
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
    setLandingTimestamp(formatLandingTimestamp(new Date(Date.now() + 60_000)))
  }, [])

  useEffect(() => {
    if (takeoverGlitchElapsed !== null) {
      setHasDeprecationNoticeEntered(true)
    }
  }, [takeoverGlitchElapsed])

  useEffect(() => {
    const previousCoughGlitchElapsed = previousCoughGlitchElapsedRef.current
    const crossedScrollCue =
      coughGlitchElapsed !== null &&
      coughGlitchElapsed >= DESKTOP_HERO_SCROLL_CUE_SECONDS &&
      previousCoughGlitchElapsed !== null &&
      previousCoughGlitchElapsed < DESKTOP_HERO_SCROLL_CUE_SECONDS

    previousCoughGlitchElapsedRef.current = coughGlitchElapsed

    if (isShortDesktopViewport && !hasScrolledDesktopHeroOut && !isV4Released && crossedScrollCue) {
      const orbSection = document.getElementById("orb-section")

      if (orbSection) {
        const targetTop = orbSection.getBoundingClientRect().top + window.scrollY - DESKTOP_ORB_SCROLL_OFFSET_PX
        const targetScrollY = Math.max(0, targetTop)
        const startScrollY = window.scrollY
        const scrollDistance = targetScrollY - startScrollY
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        if (desktopHeroScrollAnimationRef.current !== null) {
          cancelAnimationFrame(desktopHeroScrollAnimationRef.current)
          desktopHeroScrollAnimationRef.current = null
        }

        if (prefersReducedMotion || Math.abs(scrollDistance) < 1) {
          window.scrollTo({ top: targetScrollY, behavior: "instant" })
        } else {
          const startedAt = performance.now()

          const animateScroll = (now: number) => {
            const progress = Math.min(1, (now - startedAt) / DESKTOP_ORB_SCROLL_DURATION_MS)
            const easedProgress = easeOutCubic(progress)

            window.scrollTo({
              top: startScrollY + scrollDistance * easedProgress,
              behavior: "instant",
            })

            if (progress < 1) {
              desktopHeroScrollAnimationRef.current = requestAnimationFrame(animateScroll)
            } else {
              desktopHeroScrollAnimationRef.current = null
            }
          }

          desktopHeroScrollAnimationRef.current = requestAnimationFrame(animateScroll)
        }
      }

      setHasScrolledDesktopHeroOut(true)
    }
  }, [coughGlitchElapsed, hasScrolledDesktopHeroOut, isShortDesktopViewport, isV4Released])

  useEffect(() => {
    if (desktopHeroScrollAnimationRef.current !== null) {
      cancelAnimationFrame(desktopHeroScrollAnimationRef.current)
      desktopHeroScrollAnimationRef.current = null
    }

    previousCoughGlitchElapsedRef.current = null
    setHasDeprecationNoticeEntered(false)
    setHasScrolledDesktopHeroOut(false)
  }, [resetSignal])

  useEffect(() => {
    return () => {
      if (desktopHeroScrollAnimationRef.current !== null) {
        cancelAnimationFrame(desktopHeroScrollAnimationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(HERO_TWO_COLUMN_QUERY)
    const shortDesktopMediaQuery = window.matchMedia(SHORT_DESKTOP_HEIGHT_QUERY)
    const syncHeroLayout = () => {
      setIsHeroTwoColumn((current) => (current === mediaQuery.matches ? current : mediaQuery.matches))
      setIsShortDesktopViewport((current) =>
        current === shortDesktopMediaQuery.matches ? current : shortDesktopMediaQuery.matches
      )
    }

    syncHeroLayout()
    mediaQuery.addEventListener("change", syncHeroLayout)
    shortDesktopMediaQuery.addEventListener("change", syncHeroLayout)

    return () => {
      mediaQuery.removeEventListener("change", syncHeroLayout)
      shortDesktopMediaQuery.removeEventListener("change", syncHeroLayout)
    }
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
        "px-4 pb-2 transition-[padding] duration-500 ease-out sm:px-6 sm:pb-8 lg:px-8",
        isControlBannerVisible ? (isV4Released ? "pt-24 sm:pt-40" : "pt-30 sm:pt-40") : (isV4Released ? "pt-16 sm:pt-32" : "pt-20 sm:pt-32"),
        heroTakeoverGlitchActive && "takeover-glitch-soft"
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="grid gap-6"
          style={{
            alignItems: isHeroTwoColumn ? "center" : undefined,
            gap: isHeroTwoColumn ? "2rem" : isV4Released ? "0.75rem" : hasDeprecationNoticeEntered ? "0.5rem" : "0.75rem",
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
                    "theme-color-transition text-[2rem] font-medium tracking-tight text-balance text-foreground leading-[1.1] sm:text-5xl lg:text-6xl",
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
                <p className="theme-color-transition mt-2 text-2xl font-medium leading-tight tracking-tight text-foreground sm:mt-4 sm:text-3xl lg:text-4xl">
                  Voice Made Real
                </p>
              </>
            ) : (
              <h1
                className={cn(
                  "theme-color-transition text-[2rem] font-medium tracking-tight text-balance text-foreground leading-[1.1] sm:text-5xl lg:text-6xl",
                  isHeadlineReplacementGlitching && "meet-section-glitch"
                )}
              >
                  <GlitchText
                    speed={coughGlitchWords.bringing ? 0.12 : 0.35}
                    active={coughGlitchWords.bringing || glitchingTitleWord === "bringing" || isHeadlineReplacementGlitching}
                  >
                    Bringing
                  </GlitchText>
                  <br />
                  <GlitchText
                    speed={coughGlitchWords.technology ? 0.12 : 0.35}
                    active={coughGlitchWords.technology || glitchingTitleWord === "technology" || isHeadlineReplacementGlitching}
                  >
                    technology
                  </GlitchText>{" "}
                  <GlitchText
                    speed={coughGlitchWords.to ? 0.12 : 0.35}
                    active={coughGlitchWords.to || glitchingTitleWord === "to" || isHeadlineReplacementGlitching}
                  >
                    to
                  </GlitchText>{" "}
                  <GlitchText
                    speed={coughGlitchWords.life ? 0.12 : 0.35}
                    active={coughGlitchWords.life || glitchingTitleWord === "life" || isHeadlineReplacementGlitching}
                  >
                    life
                  </GlitchText>
              </h1>
            )}
          </div>

          {/* Description - Below headline on mobile, right side on desktop */}
          <div className="min-w-0" style={{ justifySelf: isHeroTwoColumn ? "end" : undefined }}>
            {!isV4Released && (
              <p
                className="theme-color-transition text-base leading-relaxed text-muted-foreground sm:hidden"
                style={{
                  maxWidth: isHeroTwoColumn ? 520 : 600,
                  textAlign: isHeroTwoColumn ? "right" : undefined,
                }}
              >
                <GlitchText speed={0.18} active={coughGlitchWords.description} enableShadows={false}>
                  Powering the best enterprises, creators, and developers.
                </GlitchText>
              </p>
            )}
            <p
              className="theme-color-transition hidden text-base leading-relaxed text-muted-foreground sm:block sm:text-lg"
              style={{
                maxWidth: isHeroTwoColumn ? 520 : 600,
                textAlign: isHeroTwoColumn ? "right" : undefined,
              }}
            >
              <GlitchText speed={0.18} active={coughGlitchWords.description} enableShadows={false}>
                Powering the best enterprises, creators, and developers. From ElevenAgents for customer experience, ElevenCreative for content creation, to the leading AI voice generator.
              </GlitchText>
            </p>
            {!isV4Released && (
              <p
                className={cn(
                  "theme-reveal-transition overflow-hidden border-t border-border/60 text-xs italic text-muted-foreground/75 sm:text-sm",
                  hasDeprecationNoticeEntered
                    ? "mt-4 max-h-24 translate-y-0 pt-3 pb-2 opacity-100 sm:pb-0"
                    : "pointer-events-none mt-0 max-h-0 -translate-y-3 pt-0 opacity-0"
                )}
                style={{
                  marginLeft: isHeroTwoColumn ? "auto" : undefined,
                  maxWidth: isHeroTwoColumn ? 520 : 600,
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
            {isV4Released && (
              <p
                className="theme-color-transition mt-2 border-t border-border/60 pt-2 text-xs text-muted-foreground/75 sm:mt-4 sm:pt-3 sm:text-sm"
                style={{
                  marginLeft: isHeroTwoColumn ? "auto" : undefined,
                  maxWidth: isHeroTwoColumn ? 520 : 600,
                  textAlign: isHeroTwoColumn ? "right" : undefined,
                }}
              >
                An ElevenLabs Hack by{" "}
                <a
                  href="https://www.instagram.com/danoflondon?igsh=MXB3bWpydG8xYjFkYQ%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-muted-foreground"
                >
                  @danoflondon
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
