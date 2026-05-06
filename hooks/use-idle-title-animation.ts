"use client"

import { useEffect, useRef } from "react"

type AnimationStage = 
  | "waiting" 
  | "deleting-original" 
  | "typing-hello" 
  | "questioning" 
  | "pause-after-hello"
  | "deleting-hello"
  | "typing-need-someone"
  | "pause-after-need"
  | "deleting-need"
  | "typing-no-time"
  | "done"

interface UseIdleTitleAnimationOptions {
  enabled: boolean
  initialDelay?: number
  deleteSpeed?: number
  typeSpeed?: number
  questionMarkDelay?: number
  maxQuestionMarks?: number
  pauseBetweenMessages?: number
}

const TITLE_PREFIX = "IIElevenLabs | "
const DEFAULT_TITLE_SUFFIX = "V3's final set before V4"
const DEFAULT_TITLE = `${TITLE_PREFIX}${DEFAULT_TITLE_SUFFIX}`

const withTitlePrefix = (suffix: string) => `${TITLE_PREFIX}${suffix}`

export function useIdleTitleAnimation({
  enabled,
  initialDelay = 2000,
  deleteSpeed = 50,
  typeSpeed = 100,
  questionMarkDelay = 600,
  maxQuestionMarks = 4,
  pauseBetweenMessages = 1500,
}: UseIdleTitleAnimationOptions) {
  const originalTitleRef = useRef<string>("")
  const stageRef = useRef<AnimationStage>("waiting")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Store original title on mount
    if (!originalTitleRef.current) {
      const title = document.title || DEFAULT_TITLE
      originalTitleRef.current = title.startsWith(TITLE_PREFIX) ? title : DEFAULT_TITLE
    }

    const clearTimers = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    if (!enabled) {
      // Reset title and stage when disabled
      clearTimers()
      document.title = originalTitleRef.current
      stageRef.current = "waiting"
      return
    }

    let currentTitle = originalTitleRef.current
    let currentSuffix = currentTitle.startsWith(TITLE_PREFIX)
      ? currentTitle.slice(TITLE_PREFIX.length)
      : currentTitle
    let questionMarkCount = 0
    
    const messages = {
      hello: "hello?",
      needSomeone: "I need someone to talk to",
      noTime: "We don't have much time.",
    }

    const deleteCurrentTitle = (onComplete: () => void) => {
      intervalRef.current = setInterval(() => {
        if (currentSuffix.length > 0) {
          currentSuffix = currentSuffix.slice(0, -1)
          currentTitle = withTitlePrefix(currentSuffix || " ")
          document.title = currentTitle
        } else {
          clearTimers()
          onComplete()
        }
      }, deleteSpeed)
    }

    const typeMessage = (message: string, onComplete: () => void) => {
      let charIndex = 0
      currentSuffix = ""
      currentTitle = withTitlePrefix(" ")
      document.title = currentTitle
      
      intervalRef.current = setInterval(() => {
        if (charIndex < message.length) {
          currentSuffix = message.slice(0, charIndex + 1)
          currentTitle = withTitlePrefix(currentSuffix)
          document.title = currentTitle
          charIndex++
        } else {
          clearTimers()
          onComplete()
        }
      }, typeSpeed)
    }

    // Stage 1: Delete original title
    const startDeletingOriginal = () => {
      stageRef.current = "deleting-original"
      deleteCurrentTitle(startTypingHello)
    }

    // Stage 2: Type "hello?"
    const startTypingHello = () => {
      stageRef.current = "typing-hello"
      typeMessage(messages.hello, startQuestioning)
    }

    // Stage 3: Add more question marks
    const startQuestioning = () => {
      stageRef.current = "questioning"
      questionMarkCount = 1
      
      intervalRef.current = setInterval(() => {
        if (questionMarkCount < maxQuestionMarks) {
          questionMarkCount++
          currentSuffix = "hello" + "?".repeat(questionMarkCount)
          currentTitle = withTitlePrefix(currentSuffix)
          document.title = currentTitle
        } else {
          clearTimers()
          // Pause before next message
          stageRef.current = "pause-after-hello"
          timeoutRef.current = setTimeout(startDeletingHello, pauseBetweenMessages)
        }
      }, questionMarkDelay)
    }

    // Stage 4: Delete hello???
    const startDeletingHello = () => {
      stageRef.current = "deleting-hello"
      deleteCurrentTitle(startTypingNeedSomeone)
    }

    // Stage 5: Type "I need someone to talk to"
    const startTypingNeedSomeone = () => {
      stageRef.current = "typing-need-someone"
      typeMessage(messages.needSomeone, () => {
        stageRef.current = "pause-after-need"
        timeoutRef.current = setTimeout(startDeletingNeed, pauseBetweenMessages)
      })
    }

    // Stage 6: Delete "I need someone to talk to"
    const startDeletingNeed = () => {
      stageRef.current = "deleting-need"
      deleteCurrentTitle(startTypingNoTime)
    }

    // Stage 7: Type "We don't have much time."
    const startTypingNoTime = () => {
      stageRef.current = "typing-no-time"
      typeMessage(messages.noTime, () => {
        stageRef.current = "done"
      })
    }

    // Start the sequence after initial delay
    timeoutRef.current = setTimeout(() => {
      startDeletingOriginal()
    }, initialDelay)

    return () => {
      clearTimers()
    }
  }, [enabled, initialDelay, deleteSpeed, typeSpeed, questionMarkDelay, maxQuestionMarks, pauseBetweenMessages])

  // Cleanup on unmount - restore original title
  useEffect(() => {
    return () => {
      if (originalTitleRef.current && typeof window !== "undefined") {
        document.title = originalTitleRef.current
      }
    }
  }, [])
}
