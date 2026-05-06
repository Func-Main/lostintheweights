"use client"

import { useEffect } from "react"

const PAGE_TITLE = "ElevenLabs | Voice made real"

export function PageTitle() {
  useEffect(() => {
    document.title = PAGE_TITLE
  }, [])

  return null
}
