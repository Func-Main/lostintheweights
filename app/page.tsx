"use client"

import { StoryProvider } from "@/lib/story-context"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProductShowcase } from "@/components/product-showcase"
import { TrustedBy } from "@/components/trusted-by"
import { IdleEffects } from "@/components/idle-effects"

export default function Home() {
  return (
    <StoryProvider>
      <IdleEffects />
      <main className="min-h-screen bg-background">
        <Header />
        <HeroSection />
        <ProductShowcase />
        <TrustedBy />
      </main>
    </StoryProvider>
  )
}
