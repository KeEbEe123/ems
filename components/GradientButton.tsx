"use client";
import React from "react";
import { cn } from "@/lib/utils"; // optional utility for merging classes

interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export default function GradientButton({
  children = "Get started →",
  className,
}: ButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium transition-all duration-300",
        "border border-transparent bg-black text-white shadow-md",
        "dark:bg-black dark:text-white",
        "bg-white text-black",
        "before:absolute before:inset-0 before:rounded-lg before:p-[2px] before:bg-gradient-to-r before:from-pink-400 before:to-purple-600 before:opacity-100",
        "before:-z-10 before:transition before:duration-300 hover:before:opacity-80",
        "dark:before:from-pink-400 dark:before:to-purple-600",
        className
      )}
    >
      <span className="relative z-10 dark:text-white text-black">
        {children}
      </span>
    </button>
  );
}
