"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: any;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "group rounded-2xl relative overflow-hidden border border-white/10 bg-white/60 dark:bg-neutral-900/80 shadow-sm backdrop-blur",
        "transition-all duration-300 ease-out will-change-transform",
        hovered !== null && hovered !== index && "blur-[2px] scale-[0.96]"
      )}
    >
      {/* 1:1 image area on all devices */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img
          src={card.src}
          alt={card.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          draggable={false}
        />
        {/* optional bottom fade for readability; safe to remove if not needed */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Always-visible content area */}
      <div className="p-3 md:p-4">
        <div className="text-sm md:text-base font-semibold text-foreground">
          {card.title}
        </div>
        {/* Example extra line; keep or remove */}
        {/* <p className="mt-1 text-xs md:text-sm text-muted-foreground line-clamp-2">
          Small description or meta can go here.
        </p> */}
      </div>
    </div>
  )
);

Card.displayName = "Card";

type Card = {
  title: string;
  src: string;
};

export function FocusCards({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto px-4 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
