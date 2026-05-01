"use client"

import { Button } from "@/components/ui/button"
import { useStory } from "@/lib/story-context"

const logos = [
  { name: "Twilio" },
  { name: "Walt Disney Studios" },
  { name: "KPN" },
  { name: "TVS" },
  { name: "Telus Digital" },
  { name: "Cisco" },
  { name: "Epic Games" },
  { name: "Nvidia" },
  { name: "Revolut" },
  { name: "Meta" },
  { name: "Bertelsmann" },
  { name: "UiPath" },
  { name: "Deliveroo" },
  { name: "Chess.com" },
  { name: "Meesho" },
  { name: "Harvey" },
]

function LogoPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-6 sm:h-8 text-muted-foreground/60 font-medium text-xs sm:text-sm tracking-wide">
      {name}
    </div>
  )
}

export function TrustedBy() {
  const { handleInteraction } = useStory()

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 sm:mb-12">
          <h2 className="text-base sm:text-lg font-medium text-foreground max-w-xs sm:max-w-none">
            Trusted by leading developers and enterprises
          </h2>
          <Button variant="outline" className="rounded-full w-fit text-sm" onClick={handleInteraction}>
            Read all stories
          </Button>
        </div>

        {/* Logo Grid - 2 columns on mobile, expanding on larger screens */}
        <div className="bg-secondary/30 rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-10">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
              >
                <LogoPlaceholder name={logo.name} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
