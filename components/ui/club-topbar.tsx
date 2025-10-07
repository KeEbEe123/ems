"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export const ClubTopBar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="fixed top-0 left-[200px] right-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Logos */}
        <div className="flex items-center gap-6">
          <Image
            src="/logos/iic.svg"
            alt="IIC Logo"
            width={120}
            height={120}
            className="object-contain"
          />
          <Image
            src="/logos/mlrit.svg"
            alt="MLRIT Logo"
            width={100}
            height={100}
            className="object-contain"
          />
          <Image
            src="/logos/cie.svg"
            alt="CIE Logo"
            width={50}
            height={50}
            className="object-contain"
          />
        </div>

        {/* Right side - User Info */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full">
                <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage
                    src={session?.user?.image ?? ""}
                    alt={session?.user?.name ?? "User"}
                  />
                  <AvatarFallback>
                    {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name ?? "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email ?? ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await signOut({ redirect: false });
                  } finally {
                    router.push("/home");
                  }
                }}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
