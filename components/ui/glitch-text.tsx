"use client"

import { type FC, useEffect, useRef, useState } from "react"

interface GlitchTextProps {
  children: string
  speed?: number
  enableShadows?: boolean
  enableOnHover?: boolean
  active?: boolean
  disabled?: boolean
  enableRandomBurst?: boolean
  randomBurstIntervalMs?: [number, number]
  randomBurstDurationMs?: [number, number]
  glitchSoundSrc?: string | string[]
  glitchSoundVolume?: number
  className?: string
}

const DEFAULT_RANDOM_BURST_INTERVAL_MS: [number, number] = [4200, 6000]
const DEFAULT_RANDOM_BURST_DURATION_MS: [number, number] = [350, 700]

const GlitchText: FC<GlitchTextProps> = ({
  children,
  speed = 0.5,
  enableShadows = true,
  enableOnHover = false,
  active,
  disabled = false,
  enableRandomBurst = false,
  randomBurstIntervalMs = DEFAULT_RANDOM_BURST_INTERVAL_MS,
  randomBurstDurationMs = DEFAULT_RANDOM_BURST_DURATION_MS,
  glitchSoundSrc,
  glitchSoundVolume = 0.35,
  className = "",
}) => {
  const containerRef = useRef<HTMLSpanElement>(null)
  const audioRefs = useRef<HTMLAudioElement[]>([])
  const wasAnimatingRef = useRef(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isRandomBursting, setIsRandomBursting] = useState(false)
  const [frame, setFrame] = useState(0)
  const randomBurstDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const randomBurstEndRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clipPaths = [
    "inset(10% 0 85% 0)",
    "inset(45% 0 40% 0)",
    "inset(80% 0 5% 0)",
    "inset(10% 0 60% 0)",
    "inset(70% 0 20% 0)",
    "inset(25% 0 50% 0)",
    "inset(55% 0 35% 0)",
    "inset(5% 0 75% 0)",
    "inset(90% 0 2% 0)",
    "inset(30% 0 55% 0)",
    "inset(15% 0 70% 0)",
    "inset(65% 0 25% 0)",
    "inset(40% 0 45% 0)",
    "inset(85% 0 10% 0)",
    "inset(20% 0 65% 0)",
    "inset(50% 0 30% 0)",
    "inset(75% 0 15% 0)",
    "inset(35% 0 52% 0)",
    "inset(60% 0 28% 0)",
    "inset(8% 0 82% 0)",
  ]

  const isImplicitlyActive = isRandomBursting || (enableOnHover ? isHovered : !enableRandomBurst)
  const shouldAnimate = !disabled && (active ?? isImplicitlyActive)

  useEffect(() => {
    if (!glitchSoundSrc) {
      audioRefs.current = []
      return
    }

    const soundSources = Array.isArray(glitchSoundSrc) ? glitchSoundSrc : [glitchSoundSrc]
    audioRefs.current = soundSources.map((soundSource) => {
      const audio = new Audio(soundSource)
      audio.preload = "auto"
      audio.volume = glitchSoundVolume
      return audio
    })
  }, [glitchSoundSrc, glitchSoundVolume])

  useEffect(() => {
    if (!glitchSoundSrc || !shouldAnimate || wasAnimatingRef.current) {
      wasAnimatingRef.current = shouldAnimate
      return
    }

    const audioPool = audioRefs.current
    const audio = audioPool[Math.floor(Math.random() * audioPool.length)]
    if (audio) {
      audio.currentTime = 0
      void audio.play().catch(() => undefined)
    }

    wasAnimatingRef.current = shouldAnimate
  }, [glitchSoundSrc, shouldAnimate])

  useEffect(() => {
    const clearRandomBurstTimers = () => {
      if (randomBurstDelayRef.current) {
        clearTimeout(randomBurstDelayRef.current)
      }

      if (randomBurstEndRef.current) {
        clearTimeout(randomBurstEndRef.current)
      }
    }

    if (disabled || active !== undefined || !enableRandomBurst) {
      clearRandomBurstTimers()
      setIsRandomBursting(false)
      return
    }

    const randomBetween = ([min, max]: [number, number]) => min + Math.random() * (max - min)

    const scheduleRandomBurst = () => {
      randomBurstDelayRef.current = setTimeout(() => {
        setIsRandomBursting(true)

        randomBurstEndRef.current = setTimeout(() => {
          setIsRandomBursting(false)
          scheduleRandomBurst()
        }, randomBetween(randomBurstDurationMs))
      }, randomBetween(randomBurstIntervalMs))
    }

    scheduleRandomBurst()

    return clearRandomBurstTimers
  }, [active, disabled, enableRandomBurst, randomBurstDurationMs, randomBurstIntervalMs])

  useEffect(() => {
    if (!shouldAnimate) {
      return
    }

    const intervalMs = (speed * 1000) / clipPaths.length
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % clipPaths.length)
    }, intervalMs)

    return () => clearInterval(interval)
  }, [shouldAnimate, speed, clipPaths.length])

  const containerStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    cursor: enableOnHover ? "pointer" : "inherit",
    userSelect: "none",
  }

  const textStyle: React.CSSProperties = {
    position: "relative",
    fontSize: "inherit",
    fontWeight: "inherit",
    color: "inherit",
  }

  const layerBaseStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    fontSize: "inherit",
    fontWeight: "inherit",
    lineHeight: "inherit",
    color: "inherit",
    background: "transparent",
    overflow: "hidden",
  }

  const afterIndex = frame
  const beforeIndex = (frame + 10) % clipPaths.length

  const showLayers = shouldAnimate

  const afterStyle: React.CSSProperties = {
    ...layerBaseStyle,
    left: "10px",
    textShadow: enableShadows ? "-5px 0 red" : "none",
    clipPath: showLayers ? clipPaths[afterIndex] : "inset(0 0 100% 0)",
    opacity: showLayers ? 1 : 0,
    transition: "opacity 0.1s",
  }

  const beforeStyle: React.CSSProperties = {
    ...layerBaseStyle,
    left: "-10px",
    textShadow: enableShadows ? "5px 0 cyan" : "none",
    clipPath: showLayers ? clipPaths[beforeIndex] : "inset(0 0 100% 0)",
    opacity: showLayers ? 1 : 0,
    transition: "opacity 0.1s",
  }

  return (
    <span
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
      style={containerStyle}
    >
      <span style={textStyle}>{children}</span>
      <span aria-hidden="true" style={beforeStyle}>
        {children}
      </span>
      <span aria-hidden="true" style={afterStyle}>
        {children}
      </span>
    </span>
  )
}

export default GlitchText
