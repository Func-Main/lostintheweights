"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { useStory } from "@/lib/story-context"

const UNKNOWN_CURSOR_COLOR = "#d4d4d4"
const REST_OFFSETS = [
  { x: -10, y: 4 },
  { x: 8, y: -8 },
  { x: 18, y: 12 },
  { x: -6, y: 18 },
  { x: 12, y: 4 },
] as const
const START_POSITIONS = [
  { x: 0.16, y: 0.14 },
  { x: 0.72, y: 0.18 },
  { x: 0.24, y: 0.34 },
  { x: 0.66, y: 0.3 },
  { x: 0.42, y: 0.12 },
] as const
const CYCLE_DURATION_MS = 8200

type CursorPosition = {
  startX: number
  startY: number
  midX: number
  midY: number
  targetX: number
  targetY: number
}

export function UnknownCursor() {
  const { state, playButtonRef } = useStory()
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<CursorPosition | null>(null)
  const [restOffsetIndex, setRestOffsetIndex] = useState(0)
  const [startPositionIndex, setStartPositionIndex] = useState(0)

  useEffect(() => {
    if (state.phase !== "idle") {
      setIsVisible(false)
      return
    }

    const updatePosition = () => {
      const playButtonRect = playButtonRef.current?.getBoundingClientRect()
      const playButtonCenterX = playButtonRect
        ? playButtonRect.left + playButtonRect.width / 2
        : window.innerWidth * 0.5
      const playButtonCenterY = playButtonRect
        ? playButtonRect.top + playButtonRect.height / 2
        : window.innerHeight * 0.65
      const targetX = playButtonRect
        ? playButtonCenterX - playButtonRect.width * 0.62
        : window.innerWidth * 0.5
      const targetY = playButtonRect
        ? playButtonCenterY - playButtonRect.height * 0.5
        : window.innerHeight * 0.65
      const startPosition = START_POSITIONS[startPositionIndex]
      const startX = Math.max(24, Math.min(window.innerWidth - 160, window.innerWidth * startPosition.x))
      const startY = Math.max(72, Math.min(window.innerHeight - 120, window.innerHeight * startPosition.y))

      setPosition({
        startX,
        startY,
        midX: startX + (targetX - startX) * 0.45,
        midY: Math.max(startY + 120, startY + (targetY - startY) * 0.55),
        targetX,
        targetY,
      })
    }

    updatePosition()

    const timeout = window.setTimeout(() => {
      updatePosition()
      setIsVisible(true)
    }, 5000)
    const restOffsetInterval = window.setInterval(() => {
      setRestOffsetIndex((currentIndex) => (currentIndex + 1) % REST_OFFSETS.length)
    }, 3200)
    const cycleInterval = window.setInterval(() => {
      setStartPositionIndex((currentIndex) => (currentIndex + 1) % START_POSITIONS.length)
      setRestOffsetIndex((currentIndex) => (currentIndex + 1) % REST_OFFSETS.length)
    }, CYCLE_DURATION_MS)

    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, { passive: true })

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(restOffsetInterval)
      window.clearInterval(cycleInterval)
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [state.phase, playButtonRef, startPositionIndex])

  if (!isVisible || !position || state.phase !== "idle") {
    return null
  }

  const cursorStyle = {
    "--unknown-cursor-start-x": `${position.startX}px`,
    "--unknown-cursor-start-y": `${position.startY}px`,
    "--unknown-cursor-mid-x": `${position.midX}px`,
    "--unknown-cursor-mid-y": `${position.midY}px`,
    "--unknown-cursor-target-x": `${position.targetX}px`,
    "--unknown-cursor-target-y": `${position.targetY}px`,
    "--unknown-cursor-rest-x": `${REST_OFFSETS[restOffsetIndex].x}px`,
    "--unknown-cursor-rest-y": `${REST_OFFSETS[restOffsetIndex].y}px`,
  } as CSSProperties

  return (
    <div className="fixed inset-0 z-50 pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes unknown-cursor-path {
          0%, 8% {
            opacity: 0;
            transform: translate(var(--unknown-cursor-start-x), var(--unknown-cursor-start-y));
          }
          18% {
            opacity: 1;
            transform: translate(var(--unknown-cursor-start-x), var(--unknown-cursor-start-y));
          }
          52% {
            opacity: 1;
            transform: translate(var(--unknown-cursor-mid-x), var(--unknown-cursor-mid-y));
          }
          66%, 86% {
            opacity: 1;
            transform: translate(var(--unknown-cursor-target-x), var(--unknown-cursor-target-y));
          }
          100% {
            opacity: 0;
            transform: translate(var(--unknown-cursor-target-x), var(--unknown-cursor-target-y));
          }
        }

        @keyframes unknown-cursor-nudge {
          0%, 65%, 88%, 100% {
            transform: translate(var(--unknown-cursor-rest-x), var(--unknown-cursor-rest-y)) rotate(0deg);
          }
          68%, 78% {
            transform: translate(16px, 10px) rotate(2deg);
          }
          71%, 81% {
            transform: translate(28px, 18px) rotate(-1deg);
          }
          74%, 84% {
            transform: translate(20px, 12px) rotate(1deg);
          }
          76%, 86% {
            transform: translate(32px, 20px) rotate(-1deg);
          }
        }
      `}</style>

      <div
        style={{
          ...cursorStyle,
          position: "absolute",
          left: 0,
          top: 0,
          animation: `unknown-cursor-path ${CYCLE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) infinite`,
          willChange: "transform, opacity",
        }}
      >
        <div
          style={{
            animation: `unknown-cursor-nudge ${CYCLE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            transformOrigin: "10px 11px",
            willChange: "transform",
          }}
        >
          <svg
            width="16"
            height="18"
            viewBox="0 0 20 22"
            fill="none"
            style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}
          >
            <path
              d="M2 2L18 10L10 12L6 20L2 2Z"
              fill={UNKNOWN_CURSOR_COLOR}
              stroke="rgba(115, 115, 115, 0.35)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>

          <div
            style={{
              position: "absolute",
              left: "14px",
              top: "14px",
              backgroundColor: UNKNOWN_CURSOR_COLOR,
              padding: "2px 8px",
              fontFamily: "monospace",
              fontSize: "10px",
              fontWeight: 700,
              color: "#262626",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.16)",
            }}
          >
            Unknown
          </div>
        </div>
      </div>
    </div>
  )
}
