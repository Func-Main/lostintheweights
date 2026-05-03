"use client"

import { useStory } from "@/lib/story-context"
import { useIdleTitleAnimation } from "@/hooks/use-idle-title-animation"

export function IdleEffects() {
  const { state } = useStory()

  // Animate the browser tab title when in idle phase
  useIdleTitleAnimation({
    enabled: state.phase === "idle",
    initialDelay: 3000,      // Wait 3 seconds before starting
    deleteSpeed: 40,         // Delete characters fairly quickly
    typeSpeed: 120,          // Type "hello?" a bit slower for effect
    questionMarkDelay: 1000, // Add question marks every second
    maxQuestionMarks: 5,     // Stop at "hello?????"
  })

  return null
}
