"use client";

import React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

export const ClubTopBar = () => {
  const { data: session } = useSession();

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
          <span className="font-medium text-neutral-800 dark:text-white">
            {session?.user?.name ?? "User"}
          </span>
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={session?.user?.image ?? ""}
              alt={session?.user?.name ?? "User"}
            />
            <AvatarFallback>
              {(session?.user?.name?.[0] ?? "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};
