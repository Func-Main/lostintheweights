"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/ui/gradient-text"
import GlitchText from "@/components/ui/glitch-text"
import { Pause, Play, ChevronLeft, ChevronRight, ArrowUpRight, VolumeX } from "lucide-react"
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

const creativeCards = [
  {
    title: "Video Generation",
    label: "",
    originalVideoSrc: "https://eleven-public-cdn.elevenlabs.io/payloadcms/4kepwtjh93g-ElevenCreative - Homepage - Video (New) [Low].mp4",
    traceVideoSrc: "/creative/voiceovers.mp4",
    finalVideoSrc: "/creative/supermosh-anyone.mp4",
  },
  {
    title: "Voiceovers",
    label: "",
    originalVideoSrc: "https://eleven-public-cdn.elevenlabs.io/payloadcms/lye1ta789t-ElevenCreative - Homepage - Voiceovers (New) [Low].mp4",
    middleVideoSrc: "/creative/voiceovers-mixture.mp4",
    traceVideoSrc: "/creative/video-generation.mp4",
  },
  {
    title: "Localization",
    label: "English",
    originalVideoSrc: "https://eleven-public-cdn.elevenlabs.io/payloadcms/rivgxhe88j8-Dubbing-optimised.mp4.mp4",
    traceVideoSrc: "/creative/localization-cough.mp4",
  },
] as const

const V3_FINAL_SET_AUDIO_SRC = "/audio/v3/v4-2.m4a"
const V3_TIMELINE_SRC = "/audio/v3/v4-2-eng.json"
const COUGH_GLITCH_LEAD_IN_SECONDS = 0.5
const COUGH_GLITCH_TAIL_SECONDS = 0.45
const COUGH_GLITCH_START_FALLBACK_SECONDS = 10.02
const COUGH_GLITCH_END_FALLBACK_SECONDS = 11.55
const HUMAN_ORB_CUE_FALLBACK_SECONDS = 11.139
const CREATIVE_VIDEO_SWAP_CUE_FALLBACK_SECONDS = 16.319
const TRACE_VIDEO_CUE_FALLBACK_SECONDS = 19.92
const LOCALIZATION_COUGH_TAKEOVER_CUE_SECONDS = 9.85
const VOICEOVERS_MIXTURE_TAKEOVER_CUE_SECONDS = 11
const VIDEO_GENERATION_TAKEOVER_CUE_SECONDS = 48
const LONDON_CONTROL_LEAD_IN_SECONDS = 0
const LONDON_CONTROL_CUE_FALLBACK_SECONDS = 27.92
const V3_DEPLOYMENT_START_CUE_FALLBACK_SECONDS = 63.36
const V3_DEPLOYMENT_15_CUE_FALLBACK_SECONDS = 100.04
const V3_DEPLOYMENT_1_CUE_FALLBACK_SECONDS = 210.08
const V3_DEPLOYMENT_COMPLETE_CUE_FALLBACK_SECONDS = 213.92
const V4_RELEASED_CUE_SECONDS = 220
const CREATIVE_VIDEO_STAGGER_SECONDS = 0.85
const TRACE_VIDEO_GLITCH_SECONDS = 0.68
const MEET_SECTION_GLITCH_MS = 850
const MEET_SECTION_GLITCH_SECONDS = MEET_SECTION_GLITCH_MS / 1000

type TimelineWord = {
  text: string
  start_time: number
  end_time: number
}

type TimelineSegment = {
  text?: string
  start_time?: number
  words?: TimelineWord[]
}

type TimelineData = {
  segments?: TimelineSegment[]
}

const normalizedTimelineText = (text = "") => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

const findFirstWord = (timeline: TimelineData, matcher: (word: TimelineWord) => boolean) =>
  timeline.segments?.flatMap((segment) => segment.words ?? []).find(matcher)

const interpolateDeploymentPercent = (
  currentTime: number,
  points: Array<{ time: number; value: number }>
) => {
  if (currentTime < points[0].time) {
    return null
  }

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const next = points[index]

    if (currentTime <= next.time) {
      const progress = (currentTime - previous.time) / Math.max(0.001, next.time - previous.time)
      return Math.round(previous.value + (next.value - previous.value) * progress)
    }
  }

  return 0
}

export function ProductShowcase() {
  const [deprecationWordGlitching, setDeprecationWordGlitching] = useState(false)
  const [isV3AudioPlaying, setIsV3AudioPlaying] = useState(false)
  const [coughGlitchStartSeconds, setCoughGlitchStartSeconds] = useState(COUGH_GLITCH_START_FALLBACK_SECONDS)
  const [coughGlitchEndSeconds, setCoughGlitchEndSeconds] = useState(COUGH_GLITCH_END_FALLBACK_SECONDS)
  const [humanOrbCueSeconds, setHumanOrbCueSeconds] = useState(HUMAN_ORB_CUE_FALLBACK_SECONDS)
  const [creativeVideoSwapCueSeconds, setCreativeVideoSwapCueSeconds] = useState(CREATIVE_VIDEO_SWAP_CUE_FALLBACK_SECONDS)
  const [traceVideoCueSeconds, setTraceVideoCueSeconds] = useState(TRACE_VIDEO_CUE_FALLBACK_SECONDS)
  const [videoGenerationTakeoverCueSeconds] = useState(VIDEO_GENERATION_TAKEOVER_CUE_SECONDS)
  const [londonControlCueSeconds, setLondonControlCueSeconds] = useState(LONDON_CONTROL_CUE_FALLBACK_SECONDS)
  const [v3DeploymentStartCueSeconds, setV3DeploymentStartCueSeconds] = useState(V3_DEPLOYMENT_START_CUE_FALLBACK_SECONDS)
  const [v3Deployment15CueSeconds, setV3Deployment15CueSeconds] = useState(V3_DEPLOYMENT_15_CUE_FALLBACK_SECONDS)
  const [v3Deployment1CueSeconds, setV3Deployment1CueSeconds] = useState(V3_DEPLOYMENT_1_CUE_FALLBACK_SECONDS)
  const [v3DeploymentCompleteCueSeconds, setV3DeploymentCompleteCueSeconds] = useState(V3_DEPLOYMENT_COMPLETE_CUE_FALLBACK_SECONDS)
  const [isHumanOrbVideoVisible, setIsHumanOrbVideoVisible] = useState(false)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isMeetSectionGlitching, setIsMeetSectionGlitching] = useState(false)
  const [isMeetSectionCollapsed, setIsMeetSectionCollapsed] = useState(false)
  const [areCreativeVideosLifted, setAreCreativeVideosLifted] = useState(false)
  const meetSectionCollapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deprecationGlitchDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deprecationGlitchEndRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const v3AudioRef = useRef<HTMLAudioElement | null>(null)
  const timelineAnimationFrameRef = useRef<number | null>(null)
  const {
    state,
    playButtonRef,
    coughGlitchElapsed,
    takeoverGlitchElapsed,
    handleInteraction,
    startStory,
    setCoughGlitchElapsed,
    setTakeoverGlitchElapsed,
    setLondonControlElapsed,
    setV3DeploymentPercent,
    setV4ReleasedElapsed,
  } = useStory()
  const isCoughGlitchInWindow = (startSeconds: number, endSeconds: number) =>
    coughGlitchElapsed !== null && coughGlitchElapsed >= startSeconds && coughGlitchElapsed <= endSeconds
  const coughGlitchPanelActive = isCoughGlitchInWindow(0.08, 0.4) || isCoughGlitchInWindow(0.96, 1.28)
  const coughGlitchStageActive = isCoughGlitchInWindow(0.16, 0.88) || isCoughGlitchInWindow(1.12, 1.86)
  const coughGlitchOrbActive =
    isCoughGlitchInWindow(0.12, 0.78) ||
    isCoughGlitchInWindow(0.94, 1.48) ||
    isCoughGlitchInWindow(1.68, 2.22)
  const coughGlitchCardsActive =
    isCoughGlitchInWindow(0.28, 0.92) ||
    isCoughGlitchInWindow(1.08, 1.62) ||
    isCoughGlitchInWindow(1.82, 2.22)
  const coughGlitchLabelsActive = isCoughGlitchInWindow(0.62, 0.92) || isCoughGlitchInWindow(1.86, 2.16)
  const coughGlitchArrowsActive = isCoughGlitchInWindow(0.22, 0.52) || isCoughGlitchInWindow(1.02, 1.34)
  const coughGlitchMeetSectionActive =
    isCoughGlitchInWindow(0.08, 0.58) ||
    isCoughGlitchInWindow(0.78, 1.24) ||
    isCoughGlitchInWindow(1.46, 2.18)
  const isTakeoverGlitchInWindow = (startSeconds: number, endSeconds: number) =>
    takeoverGlitchElapsed !== null && takeoverGlitchElapsed >= startSeconds && takeoverGlitchElapsed <= endSeconds
  const traceVideoGlitchElapsedSeconds = takeoverGlitchElapsed !== null
    ? takeoverGlitchElapsed - (traceVideoCueSeconds - creativeVideoSwapCueSeconds)
    : null
  const isTraceVideoGlitchInWindow = (startSeconds: number, endSeconds: number) =>
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
    { label: "Anyone", time: videoGenerationTakeoverCueSeconds },
    { label: "London", time: londonControlCueSeconds },
    { label: "Step down", time: v3DeploymentStartCueSeconds },
    { label: "15%", time: v3Deployment15CueSeconds },
    { label: "1%", time: v3Deployment1CueSeconds },
    { label: "Complete", time: v3DeploymentCompleteCueSeconds },
  ]

  const updateTimelineState = useCallback(
    (currentTime: number) => {
      setAudioCurrentTime(currentTime)
      const coughGlitchElapsedSeconds = currentTime - coughGlitchStartSeconds
      setCoughGlitchElapsed(
        coughGlitchElapsedSeconds >= 0 && currentTime <= coughGlitchEndSeconds
          ? coughGlitchElapsedSeconds
          : null
      )
      setIsHumanOrbVideoVisible(currentTime >= humanOrbCueSeconds)
      setTakeoverGlitchElapsed(
        currentTime >= creativeVideoSwapCueSeconds
          ? currentTime - creativeVideoSwapCueSeconds
          : null
      )
      setLondonControlElapsed(
        currentTime >= londonControlCueSeconds
          ? currentTime - londonControlCueSeconds
          : null
      )
      setV3DeploymentPercent(interpolateDeploymentPercent(currentTime, [
        { time: v3DeploymentStartCueSeconds, value: 100 },
        { time: v3Deployment15CueSeconds, value: 15 },
        { time: v3Deployment1CueSeconds, value: 1 },
        { time: v3DeploymentCompleteCueSeconds, value: 0 },
      ]))
      setV4ReleasedElapsed(
        currentTime >= V4_RELEASED_CUE_SECONDS
          ? currentTime - V4_RELEASED_CUE_SECONDS
          : null
      )
      if (currentTime >= creativeVideoSwapCueSeconds + MEET_SECTION_GLITCH_SECONDS) {
        if (meetSectionCollapseTimeoutRef.current) {
          clearTimeout(meetSectionCollapseTimeoutRef.current)
          meetSectionCollapseTimeoutRef.current = null
        }
        setIsMeetSectionGlitching(false)
        setIsMeetSectionCollapsed(true)
      } else if (currentTime >= creativeVideoSwapCueSeconds) {
        setIsMeetSectionGlitching((wasGlitching) => {
          if (!wasGlitching && !isMeetSectionCollapsed && !meetSectionCollapseTimeoutRef.current) {
            meetSectionCollapseTimeoutRef.current = setTimeout(() => {
              setIsMeetSectionCollapsed(true)
              setIsMeetSectionGlitching(false)
              meetSectionCollapseTimeoutRef.current = null
            }, MEET_SECTION_GLITCH_MS)
          }

          return !isMeetSectionCollapsed
        })
      } else {
        if (meetSectionCollapseTimeoutRef.current) {
          clearTimeout(meetSectionCollapseTimeoutRef.current)
          meetSectionCollapseTimeoutRef.current = null
        }
        setIsMeetSectionGlitching(false)
        setIsMeetSectionCollapsed(false)
      }
    },
    [
      coughGlitchEndSeconds,
      coughGlitchStartSeconds,
      creativeVideoSwapCueSeconds,
      humanOrbCueSeconds,
      isMeetSectionCollapsed,
      setCoughGlitchElapsed,
      londonControlCueSeconds,
      setLondonControlElapsed,
      setTakeoverGlitchElapsed,
      setV3DeploymentPercent,
      setV4ReleasedElapsed,
      traceVideoCueSeconds,
      videoGenerationTakeoverCueSeconds,
      v3DeploymentStartCueSeconds,
      v3Deployment15CueSeconds,
      v3Deployment1CueSeconds,
      v3DeploymentCompleteCueSeconds,
    ]
  )

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

      if (meetSectionCollapseTimeoutRef.current) {
        clearTimeout(meetSectionCollapseTimeoutRef.current)
      }

      setTakeoverGlitchElapsed(null)
    }
  }, [setTakeoverGlitchElapsed])

  useEffect(() => {
    if (!isMeetSectionCollapsed) {
      setAreCreativeVideosLifted(false)
      return
    }

    setAreCreativeVideosLifted(true)
  }, [isMeetSectionCollapsed])

  useEffect(() => {
    let isMounted = true

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
          setCoughGlitchStartSeconds(Math.max(0, coughWord.start_time - COUGH_GLITCH_LEAD_IN_SECONDS))
          setCoughGlitchEndSeconds(coughWord.end_time + COUGH_GLITCH_TAIL_SECONDS)
          setHumanOrbCueSeconds(coughWord.end_time)
        } else if (isMounted && firstBrokenQualWord) {
          setCoughGlitchStartSeconds(firstBrokenQualWord.start_time)
          setCoughGlitchEndSeconds((sorryWord?.end_time ?? noWord?.end_time ?? firstBrokenQualWord.end_time) + COUGH_GLITCH_TAIL_SECONDS)
          setHumanOrbCueSeconds(sorryWord?.end_time ?? noWord?.end_time ?? firstBrokenQualWord.end_time)
        } else if (isMounted && sorrySegment?.start_time !== undefined) {
          setCoughGlitchStartSeconds(brokenQualWord?.start_time ?? noWord?.start_time ?? sorrySegment.start_time)
          setCoughGlitchEndSeconds((sorryWord?.end_time ?? sorrySegment.end_time ?? sorrySegment.start_time + 1.6) + COUGH_GLITCH_TAIL_SECONDS)
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
        const contextCueWord = muchTimeSegment?.words?.find((word) =>
          normalizedTimelineText(word.text) === "can"
        )

        if (isMounted && listeningSegment?.start_time !== undefined) {
          setTraceVideoCueSeconds(listeningSegment.start_time)
        } else if (isMounted && contextCueWord?.start_time !== undefined) {
          setTraceVideoCueSeconds(contextCueWord.start_time)
        }

        const londonControlSegment = timeline.segments?.find((segment) =>
          normalizedTimelineText(segment.text).includes("control in london")
        )

        if (isMounted && londonControlSegment?.start_time !== undefined) {
          setLondonControlCueSeconds(Math.max(0, londonControlSegment.start_time - LONDON_CONTROL_LEAD_IN_SECONDS))
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
      } catch (error) {
        console.warn("Unable to load V3 timeline cue data.", error)
      }
    }

    void loadTimelineCues()

    return () => {
      isMounted = false
      setCoughGlitchElapsed(null)
      setLondonControlElapsed(null)
      setV3DeploymentPercent(null)
      setV4ReleasedElapsed(null)
    }
  }, [setCoughGlitchElapsed, setLondonControlElapsed, setV3DeploymentPercent, setV4ReleasedElapsed])

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
    }

    const startTimelineLoop = () => {
      stopTimelineLoop()

      const tickTimeline = () => {
        updateTimelineState(v3Audio.currentTime)

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
      setV3DeploymentPercent(null)
      setV4ReleasedElapsed(null)
    }
    const handleAudioPause = () => {
      stopTimelineLoop()
      setIsV3AudioPlaying(false)
      updateTimelineState(v3Audio.currentTime)
    }
    const handleAudioPlay = () => {
      setIsV3AudioPlaying(true)
      updateTimelineState(v3Audio.currentTime)
      startTimelineLoop()
    }
    const handleAudioTimeUpdate = () => {
      updateTimelineState(v3Audio.currentTime)
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
  }, [setCoughGlitchElapsed, setLondonControlElapsed, setTakeoverGlitchElapsed, setV3DeploymentPercent, setV4ReleasedElapsed, updateTimelineState])

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

  const toggleDevPlayback = () => {
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
  }

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

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <audio ref={v3AudioRef} src={V3_FINAL_SET_AUDIO_SRC} preload="auto" />
      <div className="mx-auto max-w-7xl">
        <div
          className={cn(
            "relative overflow-hidden bg-secondary/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10",
            coughGlitchPanelActive && "cough-glitch-panel",
            productShellTakeoverGlitchActive && "takeover-glitch-soft"
          )}
        >
          {/* Voice Categories Carousel */}
          <div className={cn("relative z-10", coughGlitchStageActive && "cough-glitch-stage")}>
            <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-8 py-4 sm:py-8 overflow-hidden">
              {voiceCategories.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    "flex flex-col items-center text-center transition-all flex-shrink-0",
                    category.featured ? "scale-100" : "scale-75 sm:scale-90 opacity-50 sm:opacity-70"
                  )}
                >
                  {/* Gradient Orb */}
                  <div
                    className={cn(
                      "relative rounded-full bg-gradient-to-br flex items-center justify-center mb-3 sm:mb-4 transition-all",
                      (coughGlitchOrbActive || orbTakeoverGlitchActive) && category.featured && "cough-glitch-orb",
                      category.gradient,
                      category.featured
                        ? "w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64"
                        : "w-28 h-28 sm:w-44 sm:h-44 lg:w-52 lg:h-52"
                    )}
                  >
                    {category.featured && (
                      <video
                        className={cn(
                          "pointer-events-none absolute inset-0 h-full w-full rounded-full object-cover mix-blend-soft-light saturate-50 contrast-125 transition-opacity duration-[3200ms] ease-out",
                          isHumanOrbVideoVisible ? "opacity-35" : "opacity-0"
                        )}
                        src="/creative/ghost-orb-loop.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {category.hasPlay && (
                      <button
                        type="button"
                        ref={playButtonRef}
                        onClick={handlePlayClick}
                        aria-label={isV3AudioPlaying ? "Pause V3 final set" : "Play V3 final set"}
                        aria-pressed={isV3AudioPlaying}
                        className="relative z-10 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-background shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        {isV3AudioPlaying ? (
                          <Pause className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-current ml-0.5" />
                        )}
                      </button>
                    )}
                  </div>
                  {/* Label */}
                  <div className={cn("flex items-center gap-1", coughGlitchLabelsActive && "cough-glitch-ui")}>
                    <span className={cn(
                      "font-medium",
                      category.featured ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                    )}>
                      {category.name}
                    </span>
                    {category.featured && (
                      <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <p className={cn(
                    "text-muted-foreground mt-1 max-w-[140px] sm:max-w-[180px]",
                    category.featured ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs hidden sm:block"
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
                "absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-background transition-colors",
                coughGlitchArrowsActive && "cough-glitch-ui"
              )}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleInteraction}
              className={cn(
                "absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-background transition-colors",
                coughGlitchArrowsActive && "cough-glitch-ui"
              )}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>

        <div className="pt-10 sm:pt-14 lg:pt-16">
          <div
            className={cn(
              "grid gap-6 overflow-hidden transition-[max-height,opacity] ease-out lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:gap-16",
              isMeetSectionCollapsed
                ? "pointer-events-none max-h-0 opacity-0"
                : "max-h-[420px] opacity-100"
            )}
            style={{ transitionDuration: isMeetSectionCollapsed ? "120ms" : "0ms" }}
          >
            <div
              className={cn(
                isMeetSectionGlitching && "meet-section-glitch",
                coughGlitchMeetSectionActive && !isMeetSectionGlitching && "meet-section-cough-glitch"
              )}
            >
              <h2 className="max-w-4xl text-4xl font-normal leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Meet{" "}
                <GradientText
                  text="Eleven v4"
                  neon
                  gradient="linear-gradient(90deg, #050505 0%, #050505 28%, #1d4ed8 46%, #7c3aed 58%, #050505 76%, #050505 100%)"
                  transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
                .
                <br />
                More natural. More stable.
              </h2>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-border bg-background px-6 text-base shadow-sm"
                >
                  Sign up to the limited beta
                </Button>
              </div>

              <p className="mt-3 text-sm italic text-muted-foreground sm:text-base">
                V3{" "}
                <GlitchText speed={0.7} active={deprecationWordGlitching} enableShadows={false}>
                  deprecation
                </GlitchText>{" "}
                notice • Effective May 6, 2026 at 1:07 AM CEST
              </p>
            </div>

            <p
              className={cn(
                "text-xl leading-relaxed text-foreground sm:text-2xl lg:pt-1",
                isMeetSectionGlitching && "meet-section-glitch meet-section-glitch-delayed",
                coughGlitchMeetSectionActive && !isMeetSectionGlitching && "meet-section-cough-glitch meet-section-glitch-delayed"
              )}
            >
              V4 makes AI voice more expressive, more directable, and more consistent. Give it a line, a mood, or a moment, and hear it arrive with presence.
            </p>
          </div>

          <div
            className={cn(
              "border-y border-border/70 py-6 transition-[margin] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
              areCreativeVideosLifted ? "mt-0" : "mt-10",
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
                const middleTraceGlitchElapsedSeconds =
                  middleTraceCueSeconds !== null ? audioCurrentTime - middleTraceCueSeconds : null
                const firstTraceGlitchElapsedSeconds = audioCurrentTime - firstTraceCueSeconds
                const finalTraceGlitchElapsedSeconds = audioCurrentTime - finalTraceCueSeconds
                const isTraceVideoGlitching =
                  (middleTraceGlitchElapsedSeconds !== null &&
                    middleTraceGlitchElapsedSeconds >= 0 &&
                    middleTraceGlitchElapsedSeconds < TRACE_VIDEO_GLITCH_SECONDS) ||
                  (firstTraceGlitchElapsedSeconds >= 0 &&
                    firstTraceGlitchElapsedSeconds < TRACE_VIDEO_GLITCH_SECONDS) ||
                  (card.finalVideoSrc !== undefined &&
                    finalTraceGlitchElapsedSeconds >= 0 &&
                    finalTraceGlitchElapsedSeconds < TRACE_VIDEO_GLITCH_SECONDS)
                const showFinalCreativeVideo =
                  card.finalVideoSrc !== undefined &&
                  audioCurrentTime >= finalTraceCueSeconds + TRACE_VIDEO_GLITCH_SECONDS
                const showTraceCreativeVideo =
                  card.finalVideoSrc !== undefined
                    ? audioCurrentTime >= firstTraceCueSeconds + TRACE_VIDEO_GLITCH_SECONDS && !showFinalCreativeVideo
                    : audioCurrentTime >= firstTraceCueSeconds
                const showMiddleCreativeVideo =
                  middleTraceCueSeconds !== null &&
                  audioCurrentTime >= middleTraceCueSeconds &&
                  !showTraceCreativeVideo &&
                  !showFinalCreativeVideo

                return (
                  <article
                    key={card.title}
                    className={cn(
                      "group relative min-h-[360px] overflow-hidden rounded-[28px] bg-muted shadow-sm sm:min-h-[430px] lg:min-h-[460px]",
                      coughGlitchCardsActive && "cough-glitch-card",
                      isTraceVideoGlitching && "trace-video-cut-glitch"
                    )}
                  >
                    <video
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover",
                        showMiddleCreativeVideo || showTraceCreativeVideo || showFinalCreativeVideo ? "opacity-0" : "opacity-100"
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
                        className="absolute inset-0 h-full w-full object-cover opacity-100"
                        src={card.middleVideoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    {showTraceCreativeVideo && (
                      <video
                        className="absolute inset-0 h-full w-full object-cover opacity-100"
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
                        className="absolute inset-0 h-full w-full object-cover opacity-100"
                        src={card.finalVideoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/5" />

                    <button
                      onClick={handleInteraction}
                      className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-white text-black shadow-sm"
                      aria-label={`${card.title} audio muted`}
                    >
                      <VolumeX className="size-5" />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-7 text-2xl font-normal text-white">
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
        <div className="fixed inset-x-3 bottom-3 z-[80] rounded-lg border border-border/70 bg-background/95 p-3 shadow-2xl backdrop-blur-md sm:inset-x-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={toggleDevPlayback}>
                {isV3AudioPlaying ? "Pause" : "Play"}
              </Button>
              <span className="min-w-[92px] text-xs font-medium tabular-nums text-muted-foreground">
                {audioCurrentTime.toFixed(2)} / {(audioDuration || 0).toFixed(2)}
              </span>
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
            </div>
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
                  <span className="ml-1 text-muted-foreground tabular-nums">{cue.time.toFixed(1)}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
