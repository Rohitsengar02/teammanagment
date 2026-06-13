"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import Autoplay from "embla-carousel-autoplay"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

export interface Gallery4Item {
  id: string
  title: string
  description: string
  href: string
  image: string
}

export interface Gallery4Props {
  title?: string
  description?: string
  items?: Gallery4Item[]
}

const LEADS_FEATURES_DATA: Gallery4Item[] = [
  {
    id: "lead-ingestion",
    title: "Omnichannel Lead Ingestion",
    description:
      "Automatically capture and log incoming leads from LinkedIn, email campaigns, landing forms, and direct outreach. Never lose track of a prospect.",
    href: "/leads",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "pipeline-boards",
    title: "Visual Deal Pipelines",
    description:
      "Organize prospects visually into won, proposal, qualified, and contacted deal stages. Predict revenue sizes and manage deal velocities easily.",
    href: "/pipeline",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "team-collaboration",
    title: "Automated Task Assignments",
    description:
      "Directly assign follow-up tasks to sales managers or tech engineers. Set high/medium/low priority tags and follow up on task completion states.",
    href: "/tasks",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "performance-analytics",
    title: "Real-time Sales Analytics",
    description:
      "Track total lead sizes, close rate metrics, average deal sizes, and monthly progress indicators. Pivot targets with high-fidelity chart reports.",
    href: "/analytics",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "employee-control",
    title: "Rosters & Shifts Planner",
    description:
      "Coordinate team shifts, attendance records, leaves requests, and employee payroll logs inside the unified employer portal.",
    href: "/employer/dashboard",
    image:
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=600",
  },
]

const Gallery4 = ({
  title = "Leads Management Features",
  description = "Explore the specialized workspace features designed to capture prospects, automate task handoffs, and manage employee performance in a unified team hub.",
  items = LEADS_FEATURES_DATA,
}: Gallery4Props) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!carouselApi) {
      return
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev())
      setCanScrollNext(carouselApi.canScrollNext())
      setCurrentSlide(carouselApi.selectedScrollSnap())
    }
    updateSelection()
    carouselApi.on("select", updateSelection)

    return () => {
      carouselApi.off("select", updateSelection)
    }
  }, [carouselApi])

  return (
    <section className="py-24 bg-white w-full relative z-10">
      <div className="w-full pl-16 pr-6 md:pr-12 lg:pr-16">
        <div className="mb-10 flex items-end justify-between md:mb-14">
          <div className="flex flex-col gap-4 text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl lg:text-5xl tracking-tight">
              {title}
            </h2>
            <p className="max-w-2xl text-slate-600 text-base leading-relaxed">{description}</p>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollPrev()
              }}
              disabled={!canScrollPrev}
              className="disabled:opacity-40 h-10 w-10 rounded-full border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollNext()
              }}
              disabled={!canScrollNext}
              className="disabled:opacity-40 h-10 w-10 rounded-full border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <Carousel
          setApi={setCarouselApi}
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: false,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
            duration: 60,
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
              },
            },
          }}
          className="w-full"
        >
          <CarouselContent className="ml-0 px-6 md:px-12 lg:px-16 gap-5">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="max-w-[310px] sm:max-w-[340px] md:max-w-[380px] pl-0"
              >
                <a href={item.href} className="group rounded-xl block h-full">
                  <div className="group relative h-full min-h-[26rem] max-w-full overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col justify-end">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Shadow overlay gradient to make text clearly readable */}
                    <div className="absolute inset-0 h-full bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10 pointer-events-none" />

                    <div className="relative z-20 flex flex-col items-start p-6 text-white md:p-8 text-left">
                      <div className="mb-2 text-xl font-bold tracking-tight">
                        {item.title}
                      </div>
                      <div className="mb-6 line-clamp-3 text-sm text-slate-200 leading-relaxed">
                        {item.description}
                      </div>
                      <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-purple-400 group-hover:text-purple-300 transition-colors">
                        Explore Feature{" "}
                        <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation Dots Indicator */}
        <div className="mt-10 flex justify-center gap-2 relative z-20">
          {items.map((_, index) => (
            <button
              key={index}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-purple-600 w-6" : "bg-slate-300 hover:bg-slate-400"
                }`}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export { Gallery4 }
