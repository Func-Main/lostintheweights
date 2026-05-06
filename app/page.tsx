"use client"

import { useLayoutEffect, useRef } from "react"
import { StoryProvider } from "@/lib/story-context"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProductShowcase } from "@/components/product-showcase"
import { IdleEffects } from "@/components/idle-effects"
import { PageTitle } from "@/components/page-title"
import { useStory } from "@/lib/story-context"

const THEME_CROSSFADE_MS = 2800

type OklchColor = readonly [lightness: number, chroma: number, hue: number]

const themeColorTokens = [
  { name: "--background", light: [1, 0, 0], dark: [0.145, 0, 0] },
  { name: "--foreground", light: [0.145, 0, 0], dark: [0.985, 0, 0] },
  { name: "--card", light: [1, 0, 0], dark: [0.145, 0, 0] },
  { name: "--card-foreground", light: [0.145, 0, 0], dark: [0.985, 0, 0] },
  { name: "--popover", light: [1, 0, 0], dark: [0.145, 0, 0] },
  { name: "--popover-foreground", light: [0.145, 0, 0], dark: [0.985, 0, 0] },
  { name: "--primary", light: [0.205, 0, 0], dark: [0.985, 0, 0] },
  { name: "--primary-foreground", light: [0.985, 0, 0], dark: [0.205, 0, 0] },
  { name: "--secondary", light: [0.97, 0, 0], dark: [0.269, 0, 0] },
  { name: "--secondary-foreground", light: [0.205, 0, 0], dark: [0.985, 0, 0] },
  { name: "--muted", light: [0.97, 0, 0], dark: [0.269, 0, 0] },
  { name: "--muted-foreground", light: [0.556, 0, 0], dark: [0.708, 0, 0] },
  { name: "--accent", light: [0.97, 0, 0], dark: [0.269, 0, 0] },
  { name: "--accent-foreground", light: [0.205, 0, 0], dark: [0.985, 0, 0] },
  { name: "--border", light: [0.922, 0, 0], dark: [0.269, 0, 0] },
  { name: "--input", light: [0.922, 0, 0], dark: [0.269, 0, 0] },
  { name: "--ring", light: [0.708, 0, 0], dark: [0.439, 0, 0] },
] as const satisfies readonly { name: string; light: OklchColor; dark: OklchColor }[]

const formatOklch = ([lightness, chroma, hue]: OklchColor) =>
  `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(3)})`

const interpolateOklch = (from: OklchColor, to: OklchColor, progress: number): OklchColor => [
  from[0] + (to[0] - from[0]) * progress,
  from[1] + (to[1] - from[1]) * progress,
  from[2] + (to[2] - from[2]) * progress,
]

const applyThemeProgress = (element: HTMLElement, progress: number) => {
  for (const token of themeColorTokens) {
    element.style.setProperty(token.name, formatOklch(interpolateOklch(token.light, token.dark, progress)))
  }
}

const clearThemeProgress = (element: HTMLElement) => {
  for (const token of themeColorTokens) {
    element.style.removeProperty(token.name)
  }
}

function useThemeCrossfadeRef(isDark: boolean) {
  const shellRef = useRef<HTMLElement | null>(null)
  const progressRef = useRef(isDark ? 1 : 0)
  const animationFrameRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const element = shellRef.current

    if (!element) {
      return
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    const from = progressRef.current
    const to = isDark ? 1 : 0

    if (Math.abs(from - to) < 0.001) {
      progressRef.current = to
      clearThemeProgress(element)
      return
    }

    const startedAt = performance.now()
    applyThemeProgress(element, from)

    const animate = (now: number) => {
      const linearProgress = Math.min(1, (now - startedAt) / THEME_CROSSFADE_MS)
      const currentProgress = from + (to - from) * linearProgress
      progressRef.current = currentProgress
      applyThemeProgress(element, currentProgress)

      if (linearProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        progressRef.current = to
        animationFrameRef.current = null
        clearThemeProgress(element)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isDark])

  return shellRef
}

function StoryPageShell() {
  const { performanceDarkMode } = useStory()
  const shellRef = useThemeCrossfadeRef(performanceDarkMode)

  return (
    <main
      ref={shellRef}
      className={`theme-crossfade min-h-screen bg-background text-foreground ${performanceDarkMode ? "dark" : ""}`}
    >
      <Header />
      <HeroSection />
      <ProductShowcase />
    </main>
  )
}

export default function Home() {
  return (
    <StoryProvider>
      <PageTitle />
      <IdleEffects />
      <StoryPageShell />
    </StoryProvider>
  )
}
