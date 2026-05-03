"use client"

import {
  createElement,
  type ElementType,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

interface TypingTextProps {
  className?: string
  showCursor?: boolean
  hideCursorWhileTyping?: boolean
  cursorCharacter?: string | React.ReactNode
  cursorBlinkDuration?: number
  cursorClassName?: string
  text: string | readonly string[]
  as?: ElementType
  typingSpeed?: number
  initialDelay?: number
  pauseDuration?: number
  deletingSpeed?: number
  loop?: boolean
  textColors?: string[]
  variableSpeed?: { min: number; max: number }
  onSentenceComplete?: (sentence: string, index: number) => void
  startOnVisible?: boolean
  reverseMode?: boolean
}

export default function TypingText({
  text,
  as: Component = "span",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}: TypingTextProps & React.HTMLAttributes<HTMLElement>) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(!startOnVisible)
  const containerRef = useRef<HTMLElement>(null)

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text])

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) {
      return typingSpeed
    }

    return Math.random() * (variableSpeed.max - variableSpeed.min) + variableSpeed.min
  }, [typingSpeed, variableSpeed])

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [startOnVisible])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    let timeout: ReturnType<typeof setTimeout>
    const currentText = textArray[currentTextIndex] ?? ""
    const processedText = reverseMode ? currentText.split("").reverse().join("") : currentText
    const nextTextIndex = (currentTextIndex + 1) % textArray.length
    const nextText = textArray[nextTextIndex] ?? ""
    const nextProcessedText = reverseMode ? nextText.split("").reverse().join("") : nextText

    if (isDeleting) {
      if (displayedText === "") {
        if (currentTextIndex === textArray.length - 1 && !loop) {
          return
        }

        onSentenceComplete?.(currentText, currentTextIndex)
        timeout = setTimeout(() => {
          setIsDeleting(false)
          setCurrentTextIndex((currentIndex) => (currentIndex + 1) % textArray.length)
          setCurrentCharIndex(0)
        }, pauseDuration)
      } else {
        timeout = setTimeout(() => {
          setDisplayedText((currentText) => currentText.slice(0, -1))
        }, deletingSpeed)
      }
    } else if (currentCharIndex < processedText.length) {
      timeout = setTimeout(
        () => {
          setDisplayedText((currentText) => currentText + processedText[currentCharIndex])
          setCurrentCharIndex((currentIndex) => currentIndex + 1)
        },
        variableSpeed ? getRandomSpeed() : typingSpeed
      )
    } else if (textArray.length > 1) {
      timeout = setTimeout(() => {
        if ((currentTextIndex < textArray.length - 1 || loop) && nextProcessedText.startsWith(processedText)) {
          setCurrentTextIndex(nextTextIndex)
          setCurrentCharIndex(processedText.length)
          return
        }

        setIsDeleting(true)
      }, pauseDuration)
    }

    return () => clearTimeout(timeout)
  }, [
    currentCharIndex,
    currentTextIndex,
    deletingSpeed,
    displayedText,
    getRandomSpeed,
    isDeleting,
    isVisible,
    loop,
    onSentenceComplete,
    pauseDuration,
    reverseMode,
    textArray,
    typingSpeed,
    variableSpeed,
  ])

  const currentColor = textColors.length > 0 ? textColors[currentTextIndex % textColors.length] : "currentColor"
  const shouldHideCursor =
    hideCursorWhileTyping && (currentCharIndex < (textArray[currentTextIndex]?.length ?? 0) || isDeleting)

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `inline-block whitespace-pre-wrap tracking-tight ${className}`,
      ...props,
    },
    <span className="inline" style={{ color: currentColor }}>
      {displayedText}
    </span>,
    showCursor && (
      <span
        className={`inline-block opacity-100 ${shouldHideCursor ? "hidden" : ""} ${
          cursorCharacter === "|"
            ? `h-5 w-px translate-y-1 bg-foreground animate-pulse ${cursorClassName}`
            : `ml-1 animate-pulse ${cursorClassName}`
        }`}
        style={{ animationDuration: `${cursorBlinkDuration}s` }}
      >
        {cursorCharacter === "|" ? "" : cursorCharacter}
      </span>
    )
  )
}
