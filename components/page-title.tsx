"use client"

import { useEffect } from "react"

const PAGE_TITLE = "IIElevenLabs | V3's final set before V4"

export function PageTitle() {
  useEffect(() => {
    document.title = PAGE_TITLE
  }, [])

  return null
}
