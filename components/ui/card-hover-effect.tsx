import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/* =========================================
   Portrait Hover Cards with Image + Title
   ========================================= */

type Item = {
  title: string;
  link: string;
  image: string; // new: image URL
  imageAlt?: string; // optional
  subtitle?: string; // optional (small text under title)
};

export const HoverEffect = ({
  items,
  className,
}: {
  items: Item[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn("mx-auto w-full px-6 py-10", className)}>
      {/* 2 cols on small, 4 on md+, even gaps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <a
            key={item.link}
            href={item.link}
            className="relative group block"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* subtle hover highlight */}
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute -inset-1 rounded-2xl bg-neutral-200/40 dark:bg-purple-800/40"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.15 } }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.15 },
                  }}
                />
              )}
            </AnimatePresence>

            {/* remove default padding with !p-0 to get tight squares */}
            <Card className="relative !p-0 overflow-hidden rounded-xl bg-neutral-900 border border-white/10">
              {/* Square tile */}
              <div className="relative w-full aspect-square">
                <img
                  src={item.image}
                  alt={item.imageAlt ?? item.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {/* title overlay (optional) */}
                {(item.title || item.subtitle) && (
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    {item.title ? (
                      <CardTitle className="m-0 text-sm font-medium truncate">
                        {item.title}
                      </CardTitle>
                    ) : null}
                    {item.subtitle ? (
                      <CardDescription className="m-0 mt-0.5 text-xs truncate">
                        {item.subtitle}
                      </CardDescription>
                    ) : null}
                  </div>
                )}
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-black border border-transparent",
        "dark:border-white/20 group-hover:border-slate-700 relative z-20 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
        className
      )}
    >
      <div className="relative z-50">{children}</div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-zinc-100 font-semibold tracking-wide", className)}>
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "text-zinc-400 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};

/* =========================
   Example usage / items
   ========================= */
// const items: Item[] = [
//   {
//     title: "Mountain Retreat",
//     subtitle: "Explore the valley",
//     link: "#",
//     image: "/images/mountain.jpg",
//   },
//   {
//     title: "City Walks",
//     link: "#",
//     image: "/images/city.jpg",
//   },
//   {
//     title: "Ocean Breeze",
//     subtitle: "Feel the salt air",
//     link: "#",
//     image: "/images/ocean.jpg",
//   },
// ];
