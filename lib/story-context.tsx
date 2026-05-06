"use client"

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react"

type StoryPhase = "idle" | "playing" | "paused" | "complete"

interface StoryState {
  phase: StoryPhase
  currentScene: number
  playbackPosition: number
}

interface StoryContextType {
  state: StoryState
  playButtonRef: React.RefObject<HTMLButtonElement | null>
  coughGlitchElapsed: number | null
  takeoverGlitchElapsed: number | null
  londonControlElapsed: number | null
  audioRemainingSeconds: number | null
  v4ReleasedElapsed: number | null
  performanceDarkMode: boolean
  resetSignal: number
  bouncePlayButton: () => void
  startStory: () => void
  pauseStory: () => void
  resumeStory: () => void
  resetStory: () => void
  setCoughGlitchElapsed: (elapsed: number | null) => void
  setTakeoverGlitchElapsed: (elapsed: number | null) => void
  setLondonControlElapsed: (elapsed: number | null) => void
  setAudioRemainingSeconds: (seconds: number | null) => void
  setV4ReleasedElapsed: (elapsed: number | null) => void
  setPerformanceDarkMode: (isDark: boolean) => void
  handleInteraction: (e: React.MouseEvent) => void
}

const StoryContext = createContext<StoryContextType | null>(null)

export function StoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoryState>({
    phase: "idle",
    currentScene: 0,
    playbackPosition: 0,
  })
  const [coughGlitchElapsed, setCoughGlitchElapsed] = useState<number | null>(null)
  const [takeoverGlitchElapsed, setTakeoverGlitchElapsed] = useState<number | null>(null)
  const [londonControlElapsed, setLondonControlElapsed] = useState<number | null>(null)
  const [audioRemainingSeconds, setAudioRemainingSeconds] = useState<number | null>(null)
  const [v4ReleasedElapsed, setV4ReleasedElapsed] = useState<number | null>(null)
  const [performanceDarkMode, setPerformanceDarkMode] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)

  const playButtonRef = useRef<HTMLButtonElement>(null)
  const bounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const bouncePlayButton = useCallback(() => {
    if (playButtonRef.current) {
      // Scroll into view smoothly
      playButtonRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      
      // Clear any existing animation
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current)
      }
      
      // Remove class to reset animation
      playButtonRef.current.classList.remove("animate-bounce-attention")
      
      // Force reflow to restart animation
      void playButtonRef.current.offsetWidth
      
      // Add bounce animation class
      playButtonRef.current.classList.add("animate-bounce-attention")
      
      // Remove class after animation completes
      bounceTimeoutRef.current = setTimeout(() => {
        playButtonRef.current?.classList.remove("animate-bounce-attention")
      }, 750)
    }
  }, [])

  const startStory = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "playing" }))
  }, [])

  const pauseStory = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "paused" }))
  }, [])

  const resumeStory = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "playing" }))
  }, [])

  const resetStory = useCallback(() => {
    setState({
      phase: "paused",
      currentScene: 0,
      playbackPosition: 0,
    })
    setCoughGlitchElapsed(null)
    setTakeoverGlitchElapsed(null)
    setLondonControlElapsed(null)
    setAudioRemainingSeconds(null)
    setV4ReleasedElapsed(null)
    setPerformanceDarkMode(false)
    setResetSignal((signal) => signal + 1)
  }, [])

  const handleInteraction = useCallback(
    (e: React.MouseEvent) => {
      if (state.phase === "idle") {
        e.preventDefault()
        e.stopPropagation()
        bouncePlayButton()
      }
    },
    [state.phase, bouncePlayButton]
  )

  return (
    <StoryContext.Provider
      value={{
        state,
        playButtonRef,
        coughGlitchElapsed,
        takeoverGlitchElapsed,
        londonControlElapsed,
        audioRemainingSeconds,
        v4ReleasedElapsed,
        performanceDarkMode,
        resetSignal,
        bouncePlayButton,
        startStory,
        pauseStory,
        resumeStory,
        resetStory,
        setCoughGlitchElapsed,
        setTakeoverGlitchElapsed,
        setLondonControlElapsed,
        setAudioRemainingSeconds,
        setV4ReleasedElapsed,
        setPerformanceDarkMode,
        handleInteraction,
      }}
    >
      {children}
    </StoryContext.Provider>
  )
}

export function useStory() {
  const context = useContext(StoryContext)
  if (!context) {
    throw new Error("useStory must be used within a StoryProvider")
  }
  return context
}
