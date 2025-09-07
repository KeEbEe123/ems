"use client";

import React from "react";
import { Search, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function TopBar() {
  return (
    <div className="w-full fixed top-0 left-0 right-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:supports-[backdrop-filter]:bg-background/40 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-4">
          {/* Left placeholder for app icon */}
          <div className="h-8 w-16 rounded-sm bg-primary/80 dark:bg-white/20" />

          {/* Center search with subtle glow */}
          <div className="flex-1">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search for events..."
                className="h-10 rounded-full w-full pl-9 pr-4 text-sm bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 focus-visible:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification */}
            <div className="relative grid place-items-center h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition">
              <Inbox className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -right-[2px] -top-[2px] h-2.5 w-2.5 rounded-full bg-orange-400 ring-2 ring-white dark:ring-gray-900" />
            </div>

            {/* Avatar */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger>
                <Avatar
                  fallback="KD"
                  className="h-9 w-9 border-2 border-primary/30"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <Link href="/user/profile">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 hover:text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
