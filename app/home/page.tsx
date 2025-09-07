"use client";
import React, { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import AnimatedContent from "@/components/AnimatedContent";
import { FocusCards } from "@/components/ui/focus-cards";
import FadeContent from "@/components/FadeContent";
import LogoLoop from "@/components/LogoLoop";
import { HomeIcon } from "lucide-react";
function Page() {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const imageLogos = [
    {
      src: "/logos/company1.png",
      alt: "Company 1",
      href: "https://company1.com",
    },
    {
      src: "/logos/company2.png",
      alt: "Company 2",
      href: "https://company2.com",
    },
  ];
  const cards = [
    {
      title: "Equinox",
      src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
      title: "B2B",
      src: "https://images.unsplash.com/photo-1600271772470-bd22a42787b3?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
      title: "Codex",
      src: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=3070&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
      title: "MUN 2025",
      src: "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
      title: "Init Saga",
      src: "https://images.unsplash.com/photo-1507041957456-9c397ce39c97?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
      title: "Eloquent",
      src: "https://assets.aceternity.com/the-first-rule.png",
    },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center dark:bg-[#0A0B1E] bg-white overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -bottom-72 left-1/2 w-[120vmax] h-[60vmax] rounded-t-full bg-[radial-gradient(ellipse_at_bottom,rgba(160,100,200,0.4),transparent_70%)] -translate-x-1/2 z-0" />
      <div className="absolute -bottom-64 right-[-10%] w-[70vmax] h-[40vmax] rounded-t-full bg-[radial-gradient(ellipse_at_bottom,rgba(160,60,220,0.6),transparent_70%)] z-0" />

      <div className="relative z-10 w-full mt-10 mb-10">
        <AnimatedContent
          distance={150}
          direction="vertical"
          reverse={false}
          duration={0.8}
          ease="ease-in-out"
          initialOpacity={0.2}
          animateOpacity
          threshold={0.2}
          delay={0.3}
          onComplete={() => plugin.current?.reset()}
        >
          <Carousel
            opts={{ align: "center", loop: true }}
            plugins={[plugin.current as any]}
            className="w-full"
            onMouseEnter={plugin.current?.stop}
            onMouseLeave={plugin.current?.reset}
          >
            <CarouselContent className="-ml-4 md:-ml-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 md:pl-6 basis-[90%] sm:basis-[85%] md:basis-[75%] lg:basis-[70%]"
                >
                  {/* no borders, no shadow, no padding */}
                  <Card className="w-full border-0 bg-transparent shadow-none">
                    {/* fixed aspect: 16:9 mobile, 21:9 desktop */}
                    <CardContent className="relative p-0 overflow-hidden rounded-2xl aspect-video md:aspect-[21/9]">
                      {/* Mobile (16:9) */}
                      <img
                        src="https://i.ibb.co/RTTp4KzR/equinox-169.png"
                        alt={`Equinox ${index + 1}`}
                        className="block md:hidden absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                      />
                      {/* Desktop (21:9) — your 886x380 PNG */}
                      <img
                        src="https://i.ibb.co/tP1xHZ1G/equinox-219.png"
                        alt={`Equinox ${index + 1}`}
                        className="hidden md:block absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                      />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-4 md:left-8 top-1/2 -translate-y-1/2" />
            <CarouselNext className="right-4 md:right-8 top-1/2 -translate-y-1/2" />
          </Carousel>
        </AnimatedContent>

        <div className="mt-20">
          <FadeContent
            blur={true}
            duration={500}
            easing="ease-out"
            initialOpacity={0}
            delay={500}
          >
            {/* Width + left padding mirror CarouselItem: basis + pl */}
            <div className="mx-auto w-[90%] sm:w-[85%] md:w-[75%] lg:w-[70%] px-4 md:px-6">
              <h2 className="text-3xl font-bold mb-6 font-poppins">Live Now</h2>
              <FocusCards cards={cards} />
            </div>
          </FadeContent>
        </div>
        <div className="mt-20">
          <FadeContent
            blur={true}
            duration={500}
            easing="ease-out"
            initialOpacity={0}
          >
            {/* Width + left padding mirror CarouselItem: basis + pl */}
            <div className="mx-auto w-[90%] sm:w-[85%] md:w-[75%] lg:w-[70%] px-4 md:px-6">
              <h2 className="text-3xl font-bold mb-6 font-poppins">Upcoming</h2>
              <FocusCards cards={cards} />
            </div>
          </FadeContent>
        </div>
        <div className="mt-20">
          <FadeContent
            blur={true}
            duration={500}
            easing="ease-out"
            initialOpacity={0}
          >
            {/* Keep the heading aligned with the carousel's main slide */}
            <div className="mx-auto w-[90%] sm:w-[85%] md:w-[75%] lg:w-[70%] px-4 md:px-6 mb-10">
              <h2 className="text-3xl font-bold mb-6 font-poppins">
                Browse by Clubs
              </h2>
            </div>

            {/* Full-bleed LogoLoop like the carousel */}
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
              <LogoLoop
                logos={imageLogos}
                speed={120}
                direction="left"
                logoHeight={48}
                gap={40}
                pauseOnHover
                scaleOnHover
                fadeOut
                fadeOutColor="transparent"
                ariaLabel="Technology partners"
              />
            </div>
          </FadeContent>
        </div>
      </div>
    </div>
  );
}

export default Page;
