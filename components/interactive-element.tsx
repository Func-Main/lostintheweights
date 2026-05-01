"use client"

import { useStory } from "@/lib/story-context"
import { cn } from "@/lib/utils"
import type { ReactNode, MouseEvent } from "react"

interface InteractiveElementProps {
  children: ReactNode
  className?: string
  as?: "button" | "a" | "div"
  onClick?: (e: MouseEvent) => void
}

export function InteractiveElement({
  children,
  className,
  as: Component = "button",
  onClick,
}: InteractiveElementProps) {
  const { state, handleInteraction } = useStory()

  const handleClick = (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement | HTMLDivElement>) => {
    if (state.phase === "idle") {
      handleInteraction(e as unknown as MouseEvent)
    } else if (onClick) {
      onClick(e as unknown as MouseEvent)
    }
  }

  return (
    <Component
      className={cn(
        state.phase === "idle" && "cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </Component>
  )
}
