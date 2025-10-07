"use client";

import React from "react";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface LoginDialogProps {
  children?: React.ReactNode;
  triggerClassName?: string;
}

export function LoginDialog({ children, triggerClassName }: LoginDialogProps) {
  const handleGoogleSignIn = () => {
    signIn("google", {
      callbackUrl: "/home",
    });
  };

  return (
    <Dialog>
      <DialogTrigger className={triggerClassName}>
        {children}
      </DialogTrigger>
      <DialogContent 
        className="max-w-3xl w-full p-0 overflow-hidden border-0 bg-transparent shadow-none"
        showCloseButton={false}
      >
        <div className="flex items-center rounded-3xl overflow-hidden bg-[#141414] shadow-2xl relative">
          {/* Violet gradient overlay from bottom-right to top-left */}
          <div className="absolute inset-0 bg-gradient-to-tl from-violet-600/20 via-transparent to-transparent pointer-events-none" />
          
          {/* Left Side - Logos stacked vertically */}
          <div className="flex-1 p-12 flex flex-col justify-center items-center gap-8 relative z-10">
            <img 
              src="/logos/cie.svg" 
              alt="MLR CIE Logo" 
              className="h-20 w-auto object-contain"
            />
            <img 
              src="/logos/mlrit.svg" 
              alt="MLRIT Logo" 
              className="h-20 w-auto object-contain"
            />
            <img 
              src="/logos/iic.svg" 
              alt="Institution's Innovation Council Logo" 
              className="h-24 w-auto object-contain"
            />
          </div>
          
          {/* Vertical Separator */}
          <Separator orientation="vertical" className="h-80 bg-white/10" />
          
          {/* Right Side - Sign In */}
          <div className="flex-1 p-12 flex flex-col justify-center items-center relative z-10">
            <div className="w-full max-w-sm text-center">
              <h1 className="font-figtree text-xl font-semibold text-white mb-8">
                Welcome Back
              </h1>
              
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-figtree transition-all duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium">Sign in</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
