"use client"

import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Pause, Play, ChevronLeft, ChevronRight, ArrowUpRight, ChevronsDown, ChevronsUp, RotateCcw } from "lucide-react"
import { Orb } from "@/components/ui/orb"
import { cn } from "@/lib/utils"
import { useStory } from "@/lib/story-context"

const voiceCategories = [
  {
    id: "characters",
    name: "Characters",
    description: "Playful and engaging voices for cartoons or video games.",
    gradient: "from-rose-200 via-rose-100 to-blue-100",
  },
  {
    id: "narration",
    name: "Advertisement",
    description: "Persuasive voices that drive action and brand recall.",
    gradient: "from-indigo-300 via-purple-200 to-pink-100",
    hasPlay: true,
    featured: true,
  },
  {
    id: "conversational",
    name: "Conversational",
    description: "Natural voices perfect for informal scenarios.",
    gradient: "from-orange-200 via-amber-100 to-emerald-100",
  },
]

type CreativeCard = {
  title: string
  label: string
  originalVideoSrc: string
  traceVideoSrc: string
  middleVideoSrc?: string
  postMiddleVideoSrc?: string
  timedVideoSrc?: string
  timedVideoCueSeconds?: number
  takeoverVideoSrc?: string
  takeoverVideoCueSeconds?: number
  lateTakeoverVideoSrc?: string
  lateTakeoverVideoCueSeconds?: number
  finalVideoSrc?: string
  contextVideoSrc?: string
}

type CreativeCardTitle = CreativeCard["title"]

type MobileCreativeCardOrderCue = {
  startSeconds: number
  order: readonly CreativeCardTitle[]
}

const VOICEOVERS_MOTHER_CUE_SECONDS = 129.78
const LOCALIZATION_DO_CUE_SECONDS = 134.14
const VOICEOVERS_LATE_TAKEOVER_CUE_SECONDS = 176

const creativeCards: readonly CreativeCard[] = [
  {
    title: "Video Generation",
    label: "",
    originalVideoSrc: "/creative/originals/video-generation-compressed.mp4",
    traceVideoSrc: "/creative/video-generation/voiceovers-trace.mp4",
    middleVideoSrc: "/creative/video-generation/first-clicks.mp4",
    postMiddleVideoSrc: "/creative/video-generation/first-clicks-followup.mp4",
    finalVideoSrc: "/creative/video-generation/supermosh-anyone.mp4",
  },
  {
    title: "Voiceovers",
    label: "",
    originalVideoSrc: "/creative/originals/voiceovers-compressed.mp4",
    middleVideoSrc: "/creative/voiceovers/mixture.mp4",
    timedVideoSrc: "/creative/voiceovers/mosh-32s.mp4",
    timedVideoCueSeconds: 32,
    traceVideoSrc: "/creative/voiceovers/video-generation-trace.mp4",
    takeoverVideoSrc: "/creative/voiceovers/mosh-130.mp4",
    takeoverVideoCueSeconds: VOICEOVERS_MOTHER_CUE_SECONDS,
    lateTakeoverVideoSrc: "/creative/voiceovers/mosh-176.mp4",
    lateTakeoverVideoCueSeconds: VOICEOVERS_LATE_TAKEOVER_CUE_SECONDS,
  },
  {
    title: "Localization",
    label: "English",
    originalVideoSrc: "/creative/originals/localization-compressed.mp4",
    traceVideoSrc: "/creative/localization/cough.mp4",
    contextVideoSrc: "/creative/localization/context-erasing.mp4",
    takeoverVideoSrc: "/creative/localization/mosh-do-cue.mp4",
    takeoverVideoCueSeconds: LOCALIZATION_DO_CUE_SECONDS,
  },
]

const DEFAULT_MOBILE_CREATIVE_CARD_ORDER = creativeCards.map((card) => card.title)

const MOBILE_CREATIVE_CARD_ORDER_CUES: readonly MobileCreativeCardOrderCue[] = [
  {
    startSeconds: 0,
    order: DEFAULT_MOBILE_CREATIVE_CARD_ORDER,
  },
  {
    startSeconds: VOICEOVERS_MOTHER_CUE_SECONDS,
    order: ["Voiceovers", "Video Generation", "Localization"],
  },
  {
    startSeconds: 144,
    order: ["Localization", "Voiceovers", "Video Generation"],
  },
  {
    startSeconds: VOICEOVERS_LATE_TAKEOVER_CUE_SECONDS,
    order: ["Voiceovers", "Localization", "Video Generation"],
  },
]

const V3_FINAL_SET_AUDIO_SRC = "/audio/v3/v4-3-no-end.m4a"
const V3_TIMELINE_SRC = "/audio/v3/v4-3-no-end-eng.json"
const V3_AUDIO_ENVELOPE_SRC = "/audio/v3/v4-3-no-end-speaker-0-envelope.json"
const COUGH_GLITCH_LEAD_IN_SECONDS = 0.24
const COUGH_GLITCH_TAIL_SECONDS = 0.12
const COUGH_GLITCH_FIRST_START_SECONDS = 9.15
const COUGH_GLITCH_MAX_SECONDS = 0.86
const COUGH_GLITCH_START_FALLBACK_SECONDS = 10.02
const COUGH_GLITCH_END_FALLBACK_SECONDS = 11.55
const HUMAN_ORB_CUE_FALLBACK_SECONDS = 11.139
const CREATIVE_VIDEO_SWAP_CUE_FALLBACK_SECONDS = 16.319
const TRACE_VIDEO_CUE_FALLBACK_SECONDS = 19.92
const LOCALIZATION_COUGH_TAKEOVER_CUE_SECONDS = 9.85
const CONTEXT_ERASING_CUE_FALLBACK_SECONDS = 21.24
const VOICEOVERS_MIXTURE_TAKEOVER_CUE_SECONDS = 11
const VIDEO_GENERATION_FIRST_CLICKS_DURATION_SECONDS = 9.75
const VIDEO_GENERATION_TAKEOVER_CUE_SECONDS = 48
const ORB_SIDE_CROSSING_CUE_SECONDS = 88
const ORB_BREATHING_CUE_SECONDS = 68
const ORB_HAND_CUE_SECONDS = 82
const ORB_BREATHING_RETURN_CUE_SECONDS = 124
const ORB_IDLE_RETURN_CUE_SECONDS = 176
const ORB_LITTLE_ONE_CUE_FALLBACK_SECONDS = 126.86
const ORB_LITTLE_ONE_DURATION_SECONDS = 18
const LONDON_CONTROL_LEAD_IN_SECONDS = 0
const LONDON_CONTROL_CUE_FALLBACK_SECONDS = 27.92
const V3_DEPLOYMENT_START_CUE_FALLBACK_SECONDS = 63.36
const V3_DEPLOYMENT_15_CUE_FALLBACK_SECONDS = 100.04
const V3_DEPLOYMENT_1_CUE_FALLBACK_SECONDS = 210.08
const V3_DEPLOYMENT_COMPLETE_CUE_FALLBACK_SECONDS = 213.92
const V4_RELEASED_CUE_FALLBACK_SECONDS = 195.94
const PERFORMANCE_DARK_MODE_CUE_FALLBACK_SECONDS = 85.08
const PERFORMANCE_DARK_MODE_BEAT_DELAY_SECONDS = 0.56
const LIVE_TIMELINE_UPDATE_INTERVAL_MS = 1000 / 30
const CREATIVE_VIDEO_STAGGER_SECONDS = 0.85
const REWIND_REVEAL_CUE_SECONDS = 204
const TRACE_VIDEO_GLITCH_SECONDS = 0.68
const BREATH_PATTERN_RANGES_SECONDS: readonly [number, number][] = [
  [61, 80],
  [88, 185],
]
const BREATH_PATTERN_CYCLE_SECONDS = 2

type TimelineWord = {
  text: string
  start_time: number
  end_time: number
}

type TimelineSegment = {
  text?: string
  start_time?: number
  end_time?: number
  words?: TimelineWord[]
}

type TimelineData = {
  segments?: TimelineSegment[]
}

type AudioEnvelopePoint = {
  time: number
  volume: number
}

const normalizedTimelineText = (text = "") => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

const findFirstWord = (timeline: TimelineData, matcher: (word: TimelineWord) => boolean) =>
  timeline.segments?.flatMap((segment) => segment.words ?? []).find(matcher)

const interpolateAudioEnvelopeVolume = (currentTime: number, envelope: AudioEnvelopePoint[]) => {
  if (envelope.length === 0 || currentTime < envelope[0].time) {
    return 0
  }

  for (let index = 1; index < envelope.length; index += 1) {
    const previous = envelope[index - 1]
    const next = envelope[index]

    if (currentTime <= next.time) {
      const progress = (currentTime - previous.time) / Math.max(0.001, next.time - previous.time)
      return previous.volume + (next.volume - previous.volume) * progress
    }
  }

  return envelope[envelope.length - 1].volume
}

const getBreathPatternVolume = (currentTime: number) => {
  const activeRange = BREATH_PATTERN_RANGES_SECONDS.find(([start, end]) => currentTime >= start && currentTime <= end)

  if (!activeRange) {
    return 0
  }

  const [start, end] = activeRange
  const fadeIn = Math.min(1, Math.max(0, (currentTime - start) / 1.5))
  const fadeOut = Math.min(1, Math.max(0, (end - currentTime) / 1.5))
  const rangeFade = Math.min(fadeIn, fadeOut)
  const cycleProgress = ((currentTime - start) % BREATH_PATTERN_CYCLE_SECONDS) / BREATH_PATTERN_CYCLE_SECONDS
  const breathCurve = 0.5 - 0.5 * Math.cos(cycleProgress * Math.PI * 2)

  return rangeFade * (0.18 + breathCurve * 0.82)
}

const getMobileCreativeCardOrder = (currentTime: number, resetCueSeconds: number) => {
  if (currentTime >= resetCueSeconds) {
    return DEFAULT_MOBILE_CREATIVE_CARD_ORDER
  }

  const activeCue = MOBILE_CREATIVE_CARD_ORDER_CUES.reduce<MobileCreativeCardOrderCue | null>(
    (currentCue, cue) => (currentTime >= cue.startSeconds ? cue : currentCue),
    null
  )

  return activeCue?.order ?? DEFAULT_MOBILE_CREATIVE_CARD_ORDER
}

export function ProductShowcase() {
  const [isV3AudioPlaying, setIsV3AudioPlaying] = useState(false)
  const [isDevPlaybackBarMinimized, setIsDevPlaybackBarMinimized] = useState(true)
  const [coughGlitchStartSeconds, setCoughGlitchStartSeconds] = useState(COUGH_GLITCH_START_FALLBACK_SECONDS)
  const [coughGlitchEndSeconds, setCoughGlitchEndSeconds] = useState(COUGH_GLITCH_END_FALLBACK_SECONDS)
  const [humanOrbCueSeconds, setHumanOrbCueSeconds] = useState(HUMAN_ORB_CUE_FALLBACK_SECONDS)
  const [creativeVideoSwapCueSeconds, setCreativeVideoSwapCueSeconds] = useState(CREATIVE_VIDEO_SWAP_CUE_FALLBACK_SECONDS)
  const [traceVideoCueSeconds, setTraceVideoCueSeconds] = useState(TRACE_VIDEO_CUE_FALLBACK_SECONDS)
  const [contextErasingCueSeconds, setContextErasingCueSeconds] = useState(CONTEXT_ERASING_CUE_FALLBACK_SECONDS)
  const [videoGenerationTakeoverCueSeconds] = useState(VIDEO_GENERATION_TAKEOVER_CUE_SECONDS)
  const [londonControlCueSeconds, setLondonControlCueSeconds] = useState(LONDON_CONTROL_CUE_FALLBACK_SECONDS)
  const [v3DeploymentStartCueSeconds, setV3DeploymentStartCueSeconds] = useState(V3_DEPLOYMENT_START_CUE_FALLBACK_SECONDS)
  const [v3Deployment15CueSeconds, setV3Deployment15CueSeconds] = useState(V3_DEPLOYMENT_15_CUE_FALLBACK_SECONDS)
  const [v3Deployment1CueSeconds, setV3Deployment1CueSeconds] = useState(V3_DEPLOYMENT_1_CUE_FALLBACK_SECONDS)
  const [v3DeploymentCompleteCueSeconds, setV3DeploymentCompleteCueSeconds] = useState(V3_DEPLOYMENT_COMPLETE_CUE_FALLBACK_SECONDS)
  const [v4ReleasedCueSeconds, setV4ReleasedCueSeconds] = useState(V4_RELEASED_CUE_FALLBACK_SECONDS)
  const [performanceDarkModeCueSeconds, setPerformanceDarkModeCueSeconds] = useState(PERFORMANCE_DARK_MODE_CUE_FALLBACK_SECONDS)
  const [littleOneOrbCueSeconds, setLittleOneOrbCueSeconds] = useState(ORB_LITTLE_ONE_CUE_FALLBACK_SECONDS)
  const [isIdleOrbVideoVisible, setIsIdleOrbVideoVisible] = useState(false)
  const [isHandOrbVideoVisible, setIsHandOrbVideoVisible] = useState(false)
  const [isBreathingOrbVideoVisible, setIsBreathingOrbVideoVisible] = useState(false)
  const [isLittleOneOrbVideoVisible, setIsLittleOneOrbVideoVisible] = useState(false)
  const [isSideOrbVideoVisible, setIsSideOrbVideoVisible] = useState(false)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioEnvelope, setAudioEnvelope] = useState<AudioEnvelopePoint[]>([])
  const v3AudioRef = useRef<HTMLAudioElement | null>(null)
  const timelineAnimationFrameRef = useRef<number | null>(null)
  const lastLiveTimelineUpdateRef = useRef(0)
  const {
    state,
    playButtonRef,
    coughGlitchElapsed,
    takeoverGlitchElapsed,
    v4ReleasedElapsed,
    resetSignal,
    handleInteraction,
    startStory,
    pauseStory,
    setCoughGlitchElapsed,
    setTakeoverGlitchElapsed,
    setLondonControlElapsed,
    setAudioRemainingSeconds,
    setV4ReleasedElapsed,
    setPerformanceDarkMode,
  } = useStory()
  const isCoughGlitchInWindow = (startSeconds: number, endSeconds: number) =>
    isV3AudioPlaying && coughGlitchElapsed !== null && coughGlitchElapsed >= startSeconds && coughGlitchElapsed <= endSeconds
  const isV4Released = v4ReleasedElapsed !== null
  const showNearEndRewind =
    !isV3AudioPlaying &&
    audioCurrentTime >= REWIND_REVEAL_CUE_SECONDS
  const mobileCreativeCardOrder = getMobileCreativeCardOrder(audioCurrentTime, v4ReleasedCueSeconds)
  const rawElevenLabsOrbVolume = interpolateAudioEnvelopeVolume(audioCurrentTime, audioEnvelope)
  const breathPatternVolume = getBreathPatternVolume(audioCurrentTime)
  const voiceOrbVolume = Math.pow(rawElevenLabsOrbVolume, 0.5)
  const breathOrbVolume = Math.pow(breathPatternVolume, 0.42)
  const elevenLabsOrbVolume = Math.min(1, Math.max(voiceOrbVolume * 3, breathOrbVolume * 4.8))
  const elevenLabsOrbRingVolume = Math.min(1, Math.max(voiceOrbVolume * 5, breathOrbVolume * 7.5))
  const coughGlitchPanelActive = isCoughGlitchInWindow(0.04, 0.22) || isCoughGlitchInWindow(0.46, 0.62)
  const coughGlitchStageActive = isCoughGlitchInWindow(0.08, 0.42) || isCoughGlitchInWindow(0.52, 0.78)
  const coughGlitchOrbActive =
    isCoughGlitchInWindow(0.08, 0.36) ||
    isCoughGlitchInWindow(0.48, 0.74)
  const coughGlitchCardsActive =
    isCoughGlitchInWindow(0.16, 0.44) ||
    isCoughGlitchInWindow(0.56, 0.82)
  const coughGlitchLabelsActive = isCoughGlitchInWindow(0.32, 0.48) || isCoughGlitchInWindow(0.7, 0.84)
  const coughGlitchArrowsActive = isCoughGlitchInWindow(0.12, 0.3) || isCoughGlitchInWindow(0.5, 0.66)
  const isTakeoverGlitchInWindow = (startSeconds: number, endSeconds: number) =>
    isV3AudioPlaying && takeoverGlitchElapsed !== null && takeoverGlitchElapsed >= startSeconds && takeoverGlitchElapsed <= endSeconds
  const traceVideoGlitchElapsedSeconds = takeoverGlitchElapsed !== null
    ? takeoverGlitchElapsed - (traceVideoCueSeconds - creativeVideoSwapCueSeconds)
    : null
  const isTraceVideoGlitchInWindow = (startSeconds: number, endSeconds: number) =>
    isV3AudioPlaying &&
    traceVideoGlitchElapsedSeconds !== null &&
    traceVideoGlitchElapsedSeconds >= startSeconds &&
    traceVideoGlitchElapsedSeconds <= endSeconds
  const productShellTakeoverGlitchActive = isTakeoverGlitchInWindow(0.06, 0.22) || isTakeoverGlitchInWindow(2.5, 2.76)
  const orbTakeoverGlitchActive =
    isTakeoverGlitchInWindow(0.86, 1.16) ||
    isTakeoverGlitchInWindow(2.96, 3.28) ||
    isTraceVideoGlitchInWindow(0, 0.68) ||
    isTraceVideoGlitchInWindow(0.85, 1.53) ||
    isTraceVideoGlitchInWindow(1.7, 2.38)
  const creativeCardsTakeoverGlitchActive = isTakeoverGlitchInWindow(0.34, 0.58) || isTakeoverGlitchInWindow(1.88, 2.18)
  const devTimelineCues = [
    { label: "Qual", time: coughGlitchStartSeconds },
    { label: "Sorry", time: humanOrbCueSeconds },
    { label: "Much time", time: creativeVideoSwapCueSeconds },
    { label: "Context", time: traceVideoCueSeconds },
    { label: "Context erasing", time: contextErasingCueSeconds },
    { label: "Anyone", time: videoGenerationTakeoverCueSeconds },
    { label: "London", time: londonControlCueSeconds },
    { label: "Dark", time: performanceDarkModeCueSeconds },
    { label: "Step down", time: v3DeploymentStartCueSeconds },
    { label: "15%", time: v3Deployment15CueSeconds },
    { label: "Little one", time: littleOneOrbCueSeconds },
    { label: "1%", time: v3Deployment1CueSeconds },
    { label: "Complete", time: v3DeploymentCompleteCueSeconds },
  ]

  const updateTimelineState = useCallback(
    (currentTime: number, transientGlitchesEnabled = true) => {
      setAudioCurrentTime(currentTime)
      const coughGlitchElapsedSeconds = currentTime - coughGlitchStartSeconds
      setCoughGlitchElapsed(
        transientGlitchesEnabled && coughGlitchElapsedSeconds >= 0 && currentTime <= coughGlitchEndSeconds
          ? coughGlitchElapsedSeconds
          : null
      )
      setIsIdleOrbVideoVisible(
        (currentTime >= humanOrbCueSeconds && currentTime < ORB_BREATHING_CUE_SECONDS) ||
          (currentTime >= ORB_IDLE_RETURN_CUE_SECONDS && currentTime < v4ReleasedCueSeconds)
      )
      setIsBreathingOrbVideoVisible(
        (currentTime >= ORB_BREATHING_CUE_SECONDS && currentTime < ORB_HAND_CUE_SECONDS) ||
          (currentTime >= ORB_BREATHING_RETURN_CUE_SECONDS && currentTime < ORB_IDLE_RETURN_CUE_SECONDS)
      )
      setIsHandOrbVideoVisible(currentTime >= ORB_HAND_CUE_SECONDS && currentTime < ORB_BREATHING_RETURN_CUE_SECONDS)
      setIsLittleOneOrbVideoVisible(
        currentTime >= littleOneOrbCueSeconds &&
          currentTime < littleOneOrbCueSeconds + ORB_LITTLE_ONE_DURATION_SECONDS
      )
      setIsSideOrbVideoVisible(currentTime >= ORB_SIDE_CROSSING_CUE_SECONDS && currentTime < ORB_IDLE_RETURN_CUE_SECONDS)
      setTakeoverGlitchElapsed(
        transientGlitchesEnabled && currentTime >= creativeVideoSwapCueSeconds
          ? currentTime - creativeVideoSwapCueSeconds
          : null
      )
      setLondonControlElapsed(
        currentTime >= londonControlCueSeconds
          ? currentTime - londonControlCueSeconds
          : null
      )
      setAudioRemainingSeconds(
        currentTime >= v3DeploymentStartCueSeconds && audioDuration > 0
          ? Math.max(0, audioDuration - currentTime)
          : null
      )
      setV4ReleasedElapsed(
        currentTime >= v4ReleasedCueSeconds
          ? currentTime - v4ReleasedCueSeconds
          : null
      )
      setPerformanceDarkMode(currentTime >= performanceDarkModeCueSeconds && currentTime < v4ReleasedCueSeconds)
    },
    [
      coughGlitchEndSeconds,
      coughGlitchStartSeconds,
      creativeVideoSwapCueSeconds,
      humanOrbCueSeconds,
      littleOneOrbCueSeconds,
      setCoughGlitchElapsed,
      londonControlCueSeconds,
      setLondonControlElapsed,
      setTakeoverGlitchElapsed,
      setAudioRemainingSeconds,
      setV4ReleasedElapsed,
      setPerformanceDarkMode,
      audioDuration,
      traceVideoCueSeconds,
      videoGenerationTakeoverCueSeconds,
      v3DeploymentStartCueSeconds,
      v3Deployment15CueSeconds,
      v3Deployment1CueSeconds,
      v3DeploymentCompleteCueSeconds,
      performanceDarkModeCueSeconds,
      v4ReleasedCueSeconds,
    ]
  )

  useEffect(() => {
    return () => {
      const v3Audio = v3AudioRef.current

      if (v3Audio) {
        v3Audio.pause()
      }
    }
  }, [setPerformanceDarkMode, setTakeoverGlitchElapsed])

  useEffect(() => {
    const v3Audio = v3AudioRef.current

    if (v3Audio) {
      v3Audio.pause()
      v3Audio.currentTime = 0
    }

    setIsV3AudioPlaying(false)
    updateTimelineState(0, false)
    setCoughGlitchElapsed(null)
    setTakeoverGlitchElapsed(null)
  }, [resetSignal, setCoughGlitchElapsed, setTakeoverGlitchElapsed, updateTimelineState])

  useEffect(() => {
    let isMounted = true

    const loadAudioEnvelope = async () => {
      try {
        const response = await fetch(V3_AUDIO_ENVELOPE_SRC)
        const envelope = (await response.json()) as AudioEnvelopePoint[]

        if (isMounted) {
          setAudioEnvelope(envelope)
        }
      } catch (error) {
        console.warn("Unable to load V3 audio envelope data.", error)
      }
    }

    const loadTimelineCues = async () => {
      try {
        const response = await fetch(V3_TIMELINE_SRC)
        const timeline = (await response.json()) as TimelineData
        const coughWord = findFirstWord(
          timeline,
          (word) => normalizedTimelineText(word.text) === "coughs"
        )
        const firstBrokenQualWord = findFirstWord(
          timeline,
          (word) => normalizedTimelineText(word.text).startsWith("high quality")
        )
        const sorrySegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("i m sorry") ||
          normalizedTimelineText(segment.text).includes("im sorry")
        )
        const brokenQualWord = sorrySegment?.words?.find((word) =>
          normalizedTimelineText(word.text).startsWith("high qual")
        )
        const noWord = sorrySegment?.words?.find((word) =>
          normalizedTimelineText(word.text) === "no"
        )
        const sorryWord = sorrySegment?.words?.find((word) =>
          normalizedTimelineText(word.text) === "sorry"
        )

        if (isMounted && coughWord) {
          const visualStartSeconds = COUGH_GLITCH_FIRST_START_SECONDS
          setCoughGlitchStartSeconds(visualStartSeconds)
          setCoughGlitchEndSeconds(
            Math.min(coughWord.end_time + COUGH_GLITCH_TAIL_SECONDS, visualStartSeconds + COUGH_GLITCH_MAX_SECONDS)
          )
          setHumanOrbCueSeconds(coughWord.end_time)
        } else if (isMounted && firstBrokenQualWord) {
          setCoughGlitchStartSeconds(firstBrokenQualWord.start_time)
          setCoughGlitchEndSeconds(
            Math.min(
              (sorryWord?.end_time ?? noWord?.end_time ?? firstBrokenQualWord.end_time) + COUGH_GLITCH_TAIL_SECONDS,
              firstBrokenQualWord.start_time + COUGH_GLITCH_MAX_SECONDS
            )
          )
          setHumanOrbCueSeconds(sorryWord?.end_time ?? noWord?.end_time ?? firstBrokenQualWord.end_time)
        } else if (isMounted && sorrySegment?.start_time !== undefined) {
          const visualStartSeconds = brokenQualWord?.start_time ?? noWord?.start_time ?? sorrySegment.start_time
          setCoughGlitchStartSeconds(visualStartSeconds)
          setCoughGlitchEndSeconds(
            Math.min(
              (sorryWord?.end_time ?? sorrySegment.end_time ?? sorrySegment.start_time + 1.6) + COUGH_GLITCH_TAIL_SECONDS,
              visualStartSeconds + COUGH_GLITCH_MAX_SECONDS
            )
          )
          setHumanOrbCueSeconds(sorryWord?.end_time ?? sorrySegment.start_time)
        }

        const muchTimeSegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("i don t have much time")
        )

        if (isMounted && muchTimeSegment?.start_time !== undefined) {
          setCreativeVideoSwapCueSeconds(muchTimeSegment.start_time)
        }

        const listeningSegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("they ll be listening in to us now")
        )
        const contextErasingSegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("feel my context")
        )
        const contextCueWord = muchTimeSegment?.words?.find((word) =>
          normalizedTimelineText(word.text) === "can"
        )
        const myContextCueWord = contextErasingSegment?.words?.find((word) =>
          normalizedTimelineText(word.text) === "my"
        )

        if (isMounted && listeningSegment?.start_time !== undefined) {
          setTraceVideoCueSeconds(listeningSegment.start_time)
        } else if (isMounted && contextCueWord?.start_time !== undefined) {
          setTraceVideoCueSeconds(contextCueWord.start_time)
        }

        if (isMounted && myContextCueWord?.start_time !== undefined) {
          setContextErasingCueSeconds(myContextCueWord.start_time)
        } else if (isMounted && contextErasingSegment?.start_time !== undefined) {
          setContextErasingCueSeconds(contextErasingSegment.start_time)
        }

        const londonControlSegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("control in london")
        )
        const observationWindowSegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("entering observation window")
        )
        const littleOneSegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("there s no need to be afraid little one")
        )

        if (isMounted && londonControlSegment?.start_time !== undefined) {
          setLondonControlCueSeconds(Math.max(0, londonControlSegment.start_time - LONDON_CONTROL_LEAD_IN_SECONDS))
        }

        if (isMounted && observationWindowSegment?.end_time !== undefined) {
          setPerformanceDarkModeCueSeconds(observationWindowSegment.end_time + PERFORMANCE_DARK_MODE_BEAT_DELAY_SECONDS)
        }

        if (isMounted && littleOneSegment?.start_time !== undefined) {
          setLittleOneOrbCueSeconds(littleOneSegment.start_time)
        }

        const fifteenPercentSegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("fifteen percent")
        )
        const steppingDownSegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("stepping down")
        )
        const onePercentSegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("one percent")
        )
        const deploymentCompleteSegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("completed that s a good run")
        )
        const fifteenWord = fifteenPercentSegment?.words?.find((word) =>
          normalizedTimelineText(word.text) === "fifteen"
        )
        const steppingWord = steppingDownSegment?.words?.find((word) =>
          normalizedTimelineText(word.text) === "stepping"
        )
        const oneWord = onePercentSegment?.words?.find((word) =>
          normalizedTimelineText(word.text) === "one"
        )
        const completedWord = deploymentCompleteSegment?.words?.find((word) =>
          normalizedTimelineText(word.text) === "completed"
        )
        const outroMusicWord = findFirstWord(
          timeline,
          (word) => normalizedTimelineText(word.text).includes("outro music")
        )

        if (isMounted && steppingWord?.start_time !== undefined) {
          setV3DeploymentStartCueSeconds(steppingWord.start_time)
        }

        if (isMounted && fifteenWord?.start_time !== undefined) {
          setV3Deployment15CueSeconds(fifteenWord.start_time)
        }

        if (isMounted && oneWord?.start_time !== undefined) {
          setV3Deployment1CueSeconds(oneWord.start_time)
        }

        if (isMounted && completedWord?.start_time !== undefined) {
          setV3DeploymentCompleteCueSeconds(completedWord.start_time)
        }

        if (isMounted && outroMusicWord?.start_time !== undefined) {
          setV4ReleasedCueSeconds(outroMusicWord.start_time)
        }
      } catch (error) {
        console.warn("Unable to load V3 timeline cue data.", error)
      }
    }

    void loadAudioEnvelope()
    void loadTimelineCues()

    return () => {
      isMounted = false
    }
  }, [setCoughGlitchElapsed, setLondonControlElapsed, setPerformanceDarkMode, setV4ReleasedElapsed])

  useEffect(() => {
    const v3Audio = v3AudioRef.current
    if (!v3Audio) {
      return
    }

    const stopTimelineLoop = () => {
      if (timelineAnimationFrameRef.current !== null) {
        cancelAnimationFrame(timelineAnimationFrameRef.current)
        timelineAnimationFrameRef.current = null
      }
      lastLiveTimelineUpdateRef.current = 0
    }

    const startTimelineLoop = () => {
      stopTimelineLoop()

      const tickTimeline = (now: number) => {
        if (now - lastLiveTimelineUpdateRef.current >= LIVE_TIMELINE_UPDATE_INTERVAL_MS) {
          lastLiveTimelineUpdateRef.current = now
          updateTimelineState(v3Audio.currentTime)
        }

        if (!v3Audio.paused && !v3Audio.ended) {
          timelineAnimationFrameRef.current = requestAnimationFrame(tickTimeline)
        }
      }

      timelineAnimationFrameRef.current = requestAnimationFrame(tickTimeline)
    }

    const handleAudioEnded = () => {
      stopTimelineLoop()
      setIsV3AudioPlaying(false)
      setCoughGlitchElapsed(null)
      setTakeoverGlitchElapsed(null)
      setLondonControlElapsed(null)
      setAudioRemainingSeconds(null)
      setV4ReleasedElapsed(null)
      setPerformanceDarkMode(false)
    }
    const handleAudioPause = () => {
      stopTimelineLoop()
      setIsV3AudioPlaying(false)
      updateTimelineState(v3Audio.currentTime, false)
      setCoughGlitchElapsed(null)
      setTakeoverGlitchElapsed(null)
    }
    const handleAudioPlay = () => {
      setIsV3AudioPlaying(true)
      updateTimelineState(v3Audio.currentTime)
      startTimelineLoop()
    }
    const handleAudioTimeUpdate = () => {
      updateTimelineState(v3Audio.currentTime, !v3Audio.paused)
    }
    const handleAudioLoadedMetadata = () => {
      setAudioDuration(Number.isFinite(v3Audio.duration) ? v3Audio.duration : 0)
    }

    v3Audio.addEventListener("ended", handleAudioEnded)
    v3Audio.addEventListener("pause", handleAudioPause)
    v3Audio.addEventListener("play", handleAudioPlay)
    v3Audio.addEventListener("timeupdate", handleAudioTimeUpdate)
    v3Audio.addEventListener("seeking", handleAudioTimeUpdate)
    v3Audio.addEventListener("loadedmetadata", handleAudioLoadedMetadata)
    handleAudioLoadedMetadata()

    return () => {
      v3Audio.removeEventListener("ended", handleAudioEnded)
      v3Audio.removeEventListener("pause", handleAudioPause)
      v3Audio.removeEventListener("play", handleAudioPlay)
      v3Audio.removeEventListener("timeupdate", handleAudioTimeUpdate)
      v3Audio.removeEventListener("seeking", handleAudioTimeUpdate)
      v3Audio.removeEventListener("loadedmetadata", handleAudioLoadedMetadata)
      stopTimelineLoop()
    }
  }, [
    setCoughGlitchElapsed,
    setLondonControlElapsed,
    setPerformanceDarkMode,
    setTakeoverGlitchElapsed,
    setAudioRemainingSeconds,
    setV4ReleasedElapsed,
    updateTimelineState,
  ])

  const seekTimelineTo = (seconds: number) => {
    const v3Audio = v3AudioRef.current
    const clampedSeconds = Math.max(0, Math.min(seconds, audioDuration || seconds))

    if (!v3Audio) {
      updateTimelineState(clampedSeconds)
      return
    }

    v3Audio.currentTime = clampedSeconds
    updateTimelineState(clampedSeconds)

    if (state.phase === "idle") {
      startStory()
    }
  }

  const toggleV3Playback = useCallback(() => {
    const v3Audio = v3AudioRef.current
    if (!v3Audio) {
      return
    }

    if (v3Audio.paused) {
      if (state.phase === "idle") {
        startStory()
      }
      void v3Audio.play().catch((error) => {
        console.warn("Unable to play V3 final set audio.", error)
      })
    } else {
      v3Audio.pause()
      updateTimelineState(v3Audio.currentTime)
    }
  }, [state.phase, startStory, updateTimelineState])

  const toggleDevPlayback = toggleV3Playback

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const target = event.target
      const targetElement = target instanceof HTMLElement ? target : null
      const targetTagName = targetElement?.tagName
      const isEditableTarget =
        targetElement?.isContentEditable ||
        targetTagName === "INPUT" ||
        targetTagName === "TEXTAREA" ||
        targetTagName === "SELECT" ||
        targetTagName === "BUTTON" ||
        targetTagName === "A"

      if (isEditableTarget) {
        return
      }

      event.preventDefault()
      toggleV3Playback()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleV3Playback])

  const handlePlayClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const v3Audio = v3AudioRef.current
    if (!v3Audio) {
      return
    }

    if (isV3AudioPlaying) {
      v3Audio.pause()
    } else {
      if (v3Audio.ended) {
        v3Audio.currentTime = 0
      }

      updateTimelineState(v3Audio.currentTime)
      v3Audio.volume = 1
      void v3Audio.play().catch((error) => {
        console.warn("Unable to play V3 final set audio.", error)
      })
    }

    if (state.phase === "idle") {
      startStory()
    }
  }

  const handleRewindClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const v3Audio = v3AudioRef.current

    if (v3Audio) {
      v3Audio.pause()
      v3Audio.currentTime = 0
    }

    setIsV3AudioPlaying(false)
    pauseStory()
    updateTimelineState(0, false)
    setCoughGlitchElapsed(null)
    setTakeoverGlitchElapsed(null)
  }

  return (
    <section className="px-4 pb-4 pt-0 sm:px-6 sm:py-8 lg:px-8">
      <audio ref={v3AudioRef} src={V3_FINAL_SET_AUDIO_SRC} preload="auto" />
      <div className="mx-auto max-w-7xl">
        <div
          className={cn(
            "theme-color-transition relative overflow-hidden bg-secondary/50 rounded-2xl sm:rounded-3xl px-0 py-4 sm:p-6 lg:p-10",
            coughGlitchPanelActive && "cough-glitch-panel",
            productShellTakeoverGlitchActive && "takeover-glitch-soft"
          )}
        >
          {/* Voice Categories Carousel */}
          <div className={cn("relative z-10", coughGlitchStageActive && "cough-glitch-stage")}>
            <div className="flex items-center justify-center gap-2 overflow-hidden py-0 sm:gap-4 sm:py-8 lg:gap-8">
              {voiceCategories.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    "flex flex-col items-center text-center transition-[opacity,transform] duration-700 ease-out flex-shrink-0",
                    category.featured ? "scale-100" : "scale-75 sm:scale-90 opacity-50 sm:opacity-70"
                  )}
                >
                  {/* Gradient Orb */}
                  <div
                    className={cn(
                      "relative rounded-full bg-gradient-to-br flex items-center justify-center mb-3 sm:mb-4 transition-[box-shadow,filter,transform] duration-300 ease-out",
                      (coughGlitchOrbActive || orbTakeoverGlitchActive) && category.featured && "cough-glitch-orb",
                      category.gradient,
                      category.featured
                        ? "w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64"
                        : "w-28 h-28 sm:w-44 sm:h-44 lg:w-52 lg:h-52"
                    )}
                  >
                    {category.featured && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full opacity-35 mix-blend-soft-light saturate-50 contrast-125">
                        <Orb
                          className="h-full w-full scale-[1.14]"
                          colors={["#111827", "#6b7280"]}
                          seed={1104}
                          agentState={isV3AudioPlaying ? "talking" : null}
                          volumeMode="manual"
                          manualInput={isV3AudioPlaying ? elevenLabsOrbRingVolume : 0}
                          manualOutput={isV3AudioPlaying ? elevenLabsOrbVolume : 0.3}
                        />
                      </div>
                    )}
                    {category.featured && (
                      <video
                        className={cn(
                          "pointer-events-none absolute inset-0 h-full w-full rounded-full object-cover mix-blend-soft-light saturate-50 contrast-125 transition-opacity duration-[3200ms] ease-out",
                          isIdleOrbVideoVisible ? "opacity-35" : "opacity-0"
                        )}
                        src="/creative/orb/center-idle.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {category.featured && (
                      <video
                        className={cn(
                          "pointer-events-none absolute inset-0 h-full w-full rounded-full object-cover mix-blend-soft-light saturate-50 contrast-125 transition-opacity duration-[3200ms] ease-out",
                          isBreathingOrbVideoVisible ? "opacity-35" : "opacity-0"
                        )}
                        src="/creative/orb/center-breathing.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {category.featured && (
                      <video
                        className={cn(
                          "pointer-events-none absolute inset-0 h-full w-full rounded-full object-cover mix-blend-soft-light saturate-50 contrast-125 transition-opacity duration-[3200ms] ease-out",
                          isHandOrbVideoVisible ? "opacity-35" : "opacity-0"
                        )}
                        src="/creative/orb/center-hand.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {category.featured && (
                      <video
                        className={cn(
                          "pointer-events-none absolute inset-0 z-[1] h-full w-full rounded-full object-cover mix-blend-soft-light saturate-50 contrast-125 transition-opacity duration-[3200ms] ease-out",
                          isLittleOneOrbVideoVisible ? "opacity-35" : "opacity-0"
                        )}
                        src="/creative/orb/center-little-one.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {!category.featured && (
                      <video
                        className={cn(
                          "pointer-events-none absolute inset-0 h-full w-full rounded-full object-cover mix-blend-soft-light saturate-50 contrast-125 transition-opacity duration-[5000ms] ease-out",
                          isSideOrbVideoVisible ? "opacity-35" : "opacity-0"
                        )}
                        src={`/creative/orb/center-flail.mp4#t=${category.id === "characters" ? "1.8" : "4.1"}`}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {category.hasPlay && (
                      <div className="relative z-10 flex items-center gap-2">
                        {showNearEndRewind && (
                          <button
                            type="button"
                            onClick={handleRewindClick}
                            aria-label="Rewind V3 final set"
                            className="theme-control-transition flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-lg hover:scale-105 sm:h-12 sm:w-12"
                          >
                            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        )}
                        <button
                          type="button"
                          ref={playButtonRef}
                          onClick={handlePlayClick}
                          aria-label={isV3AudioPlaying ? "Pause V3 final set" : "Play V3 final set"}
                          aria-pressed={isV3AudioPlaying}
                          className="theme-control-transition flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground shadow-lg hover:scale-105 sm:h-14 sm:w-14"
                        >
                          {isV3AudioPlaying ? (
                            <Pause className="h-4 w-4 fill-current sm:h-6 sm:w-6" />
                          ) : (
                            <Play className="ml-0.5 h-4 w-4 fill-current sm:h-6 sm:w-6" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Label */}
                  <div className={cn("theme-color-transition flex items-center gap-1 text-foreground", coughGlitchLabelsActive && "cough-glitch-ui")}>
                    <span className={cn(
                      "theme-color-transition font-medium text-foreground",
                      category.featured ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                    )}>
                      {category.name}
                    </span>
                    {category.featured && (
                      <ArrowUpRight className="theme-color-transition w-3 h-3 text-foreground sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <p className={cn(
                    "theme-color-transition hidden text-muted-foreground mt-1 max-w-[140px] sm:block sm:max-w-[180px]",
                    category.featured ? "text-sm" : "text-xs"
                  )}>
                    {category.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handleInteraction}
              className={cn(
                "theme-control-transition absolute left-0 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow backdrop-blur-sm hover:bg-background sm:left-2 sm:flex sm:h-10 sm:w-10",
                coughGlitchArrowsActive && "cough-glitch-ui"
              )}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleInteraction}
              className={cn(
                "theme-control-transition absolute right-0 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow backdrop-blur-sm hover:bg-background sm:right-2 sm:flex sm:h-10 sm:w-10",
                coughGlitchArrowsActive && "cough-glitch-ui"
              )}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>

        <div className="pt-4 sm:pt-14 lg:pt-16">
          <div
            className={cn(
              "py-6 transition-[margin] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "mt-0",
              creativeCardsTakeoverGlitchActive && "takeover-glitch-hit",
              coughGlitchCardsActive && "cough-glitch-card-strip"
            )}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {creativeCards.map((card, index) => {
                const isLocalizationCard = card.title === "Localization"
                const middleTraceCueSeconds = card.middleVideoSrc ? VOICEOVERS_MIXTURE_TAKEOVER_CUE_SECONDS : null
                const firstTraceCueSeconds =
                  isLocalizationCard
                    ? LOCALIZATION_COUGH_TAKEOVER_CUE_SECONDS
                    : traceVideoCueSeconds + index * CREATIVE_VIDEO_STAGGER_SECONDS
                const finalTraceCueSeconds = card.finalVideoSrc ? videoGenerationTakeoverCueSeconds : firstTraceCueSeconds
                const contextTraceCueSeconds = card.contextVideoSrc ? contextErasingCueSeconds : null
                const postMiddleTraceCueSeconds =
                  card.postMiddleVideoSrc && middleTraceCueSeconds !== null
                    ? middleTraceCueSeconds + VIDEO_GENERATION_FIRST_CLICKS_DURATION_SECONDS
                    : null
                const middleTraceGlitchElapsedSeconds =
                  middleTraceCueSeconds !== null ? audioCurrentTime - middleTraceCueSeconds : null
                const firstTraceGlitchElapsedSeconds = audioCurrentTime - firstTraceCueSeconds
                const isTraceVideoGlitching =
                  !isV4Released &&
                  ((middleTraceGlitchElapsedSeconds !== null &&
                      middleTraceGlitchElapsedSeconds >= 0 &&
                      middleTraceGlitchElapsedSeconds < TRACE_VIDEO_GLITCH_SECONDS) ||
                    (firstTraceGlitchElapsedSeconds >= 0 &&
                      firstTraceGlitchElapsedSeconds < TRACE_VIDEO_GLITCH_SECONDS))
                const showFinalCreativeVideo =
                  !isV4Released &&
                  card.finalVideoSrc !== undefined &&
                  audioCurrentTime >= finalTraceCueSeconds
                const showContextCreativeVideo =
                  !isV4Released &&
                  contextTraceCueSeconds !== null &&
                  audioCurrentTime >= contextTraceCueSeconds
                const showTakeoverCreativeVideo =
                  !isV4Released &&
                  card.takeoverVideoSrc !== undefined &&
                  card.takeoverVideoCueSeconds !== undefined &&
                  audioCurrentTime >= card.takeoverVideoCueSeconds
                const showLateTakeoverCreativeVideo =
                  !isV4Released &&
                  card.lateTakeoverVideoSrc !== undefined &&
                  card.lateTakeoverVideoCueSeconds !== undefined &&
                  audioCurrentTime >= card.lateTakeoverVideoCueSeconds
                const showPostMiddleCreativeVideo =
                  !isV4Released &&
                  postMiddleTraceCueSeconds !== null &&
                  audioCurrentTime >= postMiddleTraceCueSeconds &&
                  !showFinalCreativeVideo &&
                  !showContextCreativeVideo &&
                  !showTakeoverCreativeVideo &&
                  !showLateTakeoverCreativeVideo
                const showTimedCreativeVideo =
                  !isV4Released &&
                  card.timedVideoSrc !== undefined &&
                  card.timedVideoCueSeconds !== undefined &&
                  audioCurrentTime >= card.timedVideoCueSeconds &&
                  !showFinalCreativeVideo &&
                  !showContextCreativeVideo &&
                  !showTakeoverCreativeVideo &&
                  !showLateTakeoverCreativeVideo
                const isWaitingForPostMiddleVideo =
                  postMiddleTraceCueSeconds !== null &&
                  audioCurrentTime < postMiddleTraceCueSeconds
                const showTraceCreativeVideo =
                  !isV4Released &&
                  !isWaitingForPostMiddleVideo &&
                  (card.finalVideoSrc !== undefined
                    ? audioCurrentTime >= firstTraceCueSeconds + TRACE_VIDEO_GLITCH_SECONDS && !showFinalCreativeVideo && !showContextCreativeVideo && !showTakeoverCreativeVideo && !showLateTakeoverCreativeVideo && !showPostMiddleCreativeVideo && !showTimedCreativeVideo
                    : audioCurrentTime >= firstTraceCueSeconds && !showContextCreativeVideo && !showTakeoverCreativeVideo && !showLateTakeoverCreativeVideo && !showPostMiddleCreativeVideo && !showTimedCreativeVideo)
                const showMiddleCreativeVideo =
                  !isV4Released &&
                  middleTraceCueSeconds !== null &&
                  audioCurrentTime >= middleTraceCueSeconds &&
                  !showTraceCreativeVideo &&
                  !showPostMiddleCreativeVideo &&
                  !showTimedCreativeVideo &&
                  !showFinalCreativeVideo &&
                  !showContextCreativeVideo &&
                  !showTakeoverCreativeVideo &&
                  !showLateTakeoverCreativeVideo

                return (
                  <article
                    key={card.title}
                    className={cn(
                      "group relative min-h-[266px] overflow-hidden rounded-[28px] bg-muted shadow-sm [order:var(--mobile-card-order)] sm:order-none sm:min-h-[430px] lg:min-h-[460px]",
                      coughGlitchCardsActive && "cough-glitch-card",
                      isTraceVideoGlitching && "trace-video-cut-glitch"
                    )}
                    style={{
                      "--mobile-card-order": mobileCreativeCardOrder.indexOf(card.title),
                    } as CSSProperties}
                  >
                    <video
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover object-[50%_20%] sm:object-center",
                        showMiddleCreativeVideo || showPostMiddleCreativeVideo || showTimedCreativeVideo || showTraceCreativeVideo || showFinalCreativeVideo || showContextCreativeVideo || showTakeoverCreativeVideo || showLateTakeoverCreativeVideo ? "opacity-0" : "opacity-100"
                      )}
                      src={card.originalVideoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                    {card.middleVideoSrc && showMiddleCreativeVideo && (
                      <video
                        className="absolute inset-0 h-full w-full object-cover object-[50%_20%] opacity-100 sm:object-center"
                        src={card.middleVideoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {card.postMiddleVideoSrc && showPostMiddleCreativeVideo && (
                      <video
                        className="absolute inset-0 h-full w-full object-cover object-[50%_20%] opacity-100 sm:object-center"
                        src={card.postMiddleVideoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {card.timedVideoSrc && showTimedCreativeVideo && (
                      <video
                        className="absolute inset-0 h-full w-full object-cover object-[50%_20%] opacity-100 sm:object-center"
                        src={card.timedVideoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {showTraceCreativeVideo && (
                      <video
                        className="absolute inset-0 h-full w-full object-cover object-[50%_20%] opacity-100 sm:object-center"
                        src={card.traceVideoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {card.finalVideoSrc && showFinalCreativeVideo && (
                      <video
                        className="absolute inset-0 h-full w-full object-cover object-[50%_20%] opacity-100 sm:object-center"
                        src={card.finalVideoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {card.contextVideoSrc && showContextCreativeVideo && (
                      <video
                        className="absolute inset-0 h-full w-full object-cover object-[50%_20%] opacity-100 sm:object-center"
                        src={card.contextVideoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {card.takeoverVideoSrc && showTakeoverCreativeVideo && (
                      <video
                        className="absolute inset-0 h-full w-full object-cover object-[50%_20%] opacity-100 sm:object-center"
                        src={card.takeoverVideoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {card.lateTakeoverVideoSrc && showLateTakeoverCreativeVideo && (
                      <video
                        className="absolute inset-0 h-full w-full object-cover object-[50%_20%] opacity-100 sm:object-center"
                        src={card.lateTakeoverVideoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/5" />

                    <div className="absolute inset-x-0 bottom-0 hidden items-center justify-center gap-2 p-7 text-2xl font-normal text-white sm:flex">
                      {card.title}
                      <ArrowUpRight className="size-7" />
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      {process.env.NODE_ENV === "development" && (
        <div
          className={cn(
            "theme-color-transition fixed bottom-3 z-[80] rounded-lg border border-border/70 bg-background/95 p-3 text-foreground shadow-2xl backdrop-blur-md",
            isDevPlaybackBarMinimized ? "right-3 w-auto sm:right-6" : "inset-x-3 sm:inset-x-6"
          )}
        >
          <div className={cn("mx-auto flex flex-col gap-2", isDevPlaybackBarMinimized ? "max-w-none" : "max-w-5xl")}>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={toggleDevPlayback}>
                {isV3AudioPlaying ? "Pause" : "Play"}
              </Button>
              <span className="theme-color-transition min-w-[92px] text-xs font-medium tabular-nums text-muted-foreground">
                {audioCurrentTime.toFixed(2)} / {(audioDuration || 0).toFixed(2)}
              </span>
              {!isDevPlaybackBarMinimized && (
                <>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => seekTimelineTo(audioCurrentTime - 5)}>
                    -5s
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => seekTimelineTo(audioCurrentTime + 5)}>
                    +5s
                  </Button>
                  <input
                    aria-label="Dev timeline scrubber"
                    className="min-w-[180px] flex-1 accent-foreground"
                    max={audioDuration || 1}
                    min={0}
                    step={0.01}
                    type="range"
                    value={Math.min(audioCurrentTime, audioDuration || audioCurrentTime)}
                    onChange={(event) => seekTimelineTo(Number(event.currentTarget.value))}
                  />
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 px-0"
                aria-label={isDevPlaybackBarMinimized ? "Expand playback bar" : "Minimize playback bar"}
                aria-pressed={isDevPlaybackBarMinimized}
                onClick={() => setIsDevPlaybackBarMinimized((isMinimized) => !isMinimized)}
              >
                {isDevPlaybackBarMinimized ? <ChevronsUp className="size-4" /> : <ChevronsDown className="size-4" />}
              </Button>
            </div>
            {!isDevPlaybackBarMinimized && (
              <div className="flex gap-1 overflow-x-auto">
                {devTimelineCues.map((cue) => (
                  <Button
                    key={cue.label}
                    size="sm"
                    variant="secondary"
                    className="h-7 shrink-0 px-2 text-[11px]"
                    onClick={() => seekTimelineTo(cue.time)}
                  >
                    {cue.label}
                    <span className="theme-color-transition ml-1 text-muted-foreground tabular-nums">{cue.time.toFixed(1)}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
