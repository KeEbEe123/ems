import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import TopBar from "@/components/top-bar";

export const metadata: Metadata = {
  title: "Club Event Dashboard",
  description: "Event management dashboard",
  generator: "v0.app",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <TopBar />
      {/* Spacer to offset the fixed top bar height */}
      <div className="h-16" />
      <main className="min-h-screen bg-background text-foreground">
        {children}
      </main>
    </>
  );
}
