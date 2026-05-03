"use client"

import { motion, type Transition } from "motion/react"
import type * as React from "react"
import { cn } from "@/lib/utils"

type GradientTextProps = React.ComponentProps<"span"> & {
  text: string
  gradient?: string
  neon?: boolean
  transition?: Transition
}

function GradientText({
  text,
  className,
  gradient = "linear-gradient(90deg, #3b82f6 0%, #a855f7 20%, #ec4899 50%, #a855f7 80%, #3b82f6 100%)",
  neon = false,
  transition = { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
  ...props
}: GradientTextProps) {
  const baseStyle: React.CSSProperties = {
    backgroundImage: gradient,
  }

  return (
    <span
      className={cn("relative inline-block", className)}
      data-slot="gradient-text"
      {...props}
    >
      <motion.span
        animate={{ backgroundPositionX: ["0%", "200%"] }}
        className="m-0 bg-[length:200%_100%] bg-clip-text text-transparent"
        style={baseStyle}
        transition={transition}
      >
        {text}
      </motion.span>

      {neon && (
        <motion.span
          animate={{ backgroundPositionX: ["0%", "200%"] }}
          className="absolute top-0 left-0 m-0 bg-[length:200%_100%] bg-clip-text text-transparent blur-[8px] mix-blend-plus-lighter"
          style={baseStyle}
          transition={transition}
        >
          {text}
        </motion.span>
      )}
    </span>
  )
}

export { GradientText, type GradientTextProps }
export default GradientText
