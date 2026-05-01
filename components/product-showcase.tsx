"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStory } from "@/lib/story-context"

const productTabs = [
  { id: "creative", name: "Creative", fullName: "ElevenCreative" },
  { id: "agents", name: "Agents", fullName: "ElevenAgents" },
  { id: "api", name: "API", fullName: "ElevenAPI" },
]

const featureTabs = [
  { id: "voice-gen", name: "AI Voice Generator" },
  { id: "tts", name: "Text to Speech" },
  { id: "music", name: "Music" },
  { id: "stt", name: "Speech to Text" },
  { id: "cloning", name: "Voice Cloning" },
]

const voiceCategories = [
  {
    id: "characters",
    name: "Characters",
    description: "Playful and engaging voices for cartoons or video games.",
    gradient: "from-rose-200 via-rose-100 to-blue-100",
  },
  {
    id: "narration",
    name: "Narration",
    description: "Expressive voices that bring audiobooks and podcasts to life.",
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

export function ProductShowcase() {
  const [activeProduct, setActiveProduct] = useState("creative")
  const [activeFeature, setActiveFeature] = useState("voice-gen")
  const { state, playButtonRef, handleInteraction, startStory } = useStory()

  const handlePlayClick = () => {
    if (state.phase === "idle") {
      startStory()
    }
  }

  const handleTabClick = (setter: (value: string) => void, value: string) => {
    if (state.phase === "idle") {
      handleInteraction({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent)
    } else {
      setter(value)
    }
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="bg-secondary/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10">
          {/* Mobile: Product Tabs at top in pill container */}
          <div className="lg:hidden mb-4">
            <div className="inline-flex bg-background/60 rounded-full p-1">
              {productTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(setActiveProduct, tab.id)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-medium transition-all",
                    activeProduct === tab.id
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: Feature tabs row */}
          <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 w-max">
              {featureTabs.slice(0, 2).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(setActiveFeature, tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    activeFeature === tab.id
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Top Bar - Product Tabs & Feature Info */}
          <div className="hidden lg:flex lg:items-start lg:justify-between gap-6 mb-8">
            {/* Product Tabs with color indicators */}
            <div className="flex flex-wrap gap-2">
              {productTabs.map((tab, index) => {
                const colors = ["bg-orange-400", "bg-blue-400", "bg-emerald-400"]
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(setActiveProduct, tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                      activeProduct === tab.id
                        ? "bg-background shadow-sm"
                        : "hover:bg-background/50"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", colors[index])} />
                    {tab.fullName}
                  </button>
                )
              })}
            </div>

            {/* Feature Info */}
            <div className="text-right">
              <h3 className="text-base font-medium">AI Voice Generator</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Access a library of 10,000+ studio quality AI voices
              </p>
            </div>
          </div>

          {/* Voice Categories Carousel */}
          <div className="relative">
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
                      category.gradient,
                      category.featured
                        ? "w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
                        : "w-20 h-20 sm:w-32 sm:h-32 lg:w-36 lg:h-36"
                    )}
                  >
                    {category.hasPlay && (
                      <button
                        ref={playButtonRef}
                        onClick={handlePlayClick}
                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-background shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-current ml-0.5" />
                      </button>
                    )}
                  </div>
                  {/* Label */}
                  <div className="flex items-center gap-1">
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
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleInteraction}
              className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Mobile: Bottom info */}
          <div className="lg:hidden text-center mt-4 pt-4 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              Access a library of 10,000+ studio quality AI voices
            </p>
            <Button className="rounded-full px-6 mt-4" onClick={handleInteraction}>
              Sign up
            </Button>
          </div>

          {/* Desktop: Bottom Bar - Feature Tabs & CTA */}
          <div className="hidden lg:flex items-center justify-between gap-4 mt-8 pt-6 border-t border-border/50">
            {/* Feature Tabs */}
            <div className="flex flex-wrap gap-1">
              {featureTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(setActiveFeature, tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activeFeature === tab.id
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <Button className="rounded-full px-6" onClick={handleInteraction}>
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
