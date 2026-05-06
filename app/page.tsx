"use client"

import { StoryProvider } from "@/lib/story-context"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProductShowcase } from "@/components/product-showcase"
import { IdleEffects } from "@/components/idle-effects"
import { PageTitle } from "@/components/page-title"

export default function Home() {
  return (
    <StoryProvider>
      <PageTitle />
      <IdleEffects />
      <main className="min-h-screen bg-background">
        <Header />
        <HeroSection />
        <ProductShowcase />
      </main>
    </StoryProvider>
  )
}
