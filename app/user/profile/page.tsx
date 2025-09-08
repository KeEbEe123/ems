"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { UserRoundPen, TicketCheck, Trophy, LogOut, Home } from "lucide-react";
import UserProfile from "@/components/user-profile";
import MyBookings from "@/components/my-bookings";
import Certificates from "@/components/certificates";
import { motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

/** Reusable background blobs (same as carousel page) */
const BackgroundBlobs = () => (
  <>
    {/* Big bottom-center ellipse */}
    <div
      className="
        absolute -bottom-72 left-1/2 w-[120vmax] h-[60vmax]
        rounded-t-full
        bg-[radial-gradient(ellipse_at_bottom,rgba(160,100,200,0.4),transparent_70%)]
        -translate-x-1/2
        z-0 pointer-events-none
      "
    />
    {/* Right-side ellipse */}
    <div
      className="
        absolute -bottom-64 right-[-10%] w-[70vmax] h-[40vmax]
        rounded-t-full
        bg-[radial-gradient(ellipse_at_bottom,rgba(160,60,220,0.6),transparent_70%)]
        z-0 pointer-events-none
      "
    />
  </>
);

export default function Profile() {
  const [currentPage, setCurrentPage] = useState("profile");
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Profile",
      href: "#",
      icon: (
        <UserRoundPen className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-700" />
      ),
      id: "profile",
    },
    {
      label: "My Bookings",
      href: "#",
      icon: (
        <TicketCheck className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-700" />
      ),
      id: "my-bookings",
    },
    {
      label: "Certificates",
      href: "#",
      icon: (
        <Trophy className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-700" />
      ),
      id: "certificates",
    },
    {
      label: "Logout",
      href: "#",
      icon: <LogOut className="h-5 w-5 shrink-0 text-red-400" />,
      id: "logout",
    },
    {
      label: "Back to home",
      href: "#",
      icon: (
        <Home className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-700" />
      ),
      id: "home",
    },
  ];

  const handleLinkClick = (id: string) => {
    if (id !== "logout" && id !== "home") {
      setCurrentPage(id);
    } else if (id === "logout") {
      localStorage.removeItem("token");
      window.location.href = "/";
    } else {
      window.location.href = "/home";
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "profile":
        return <UserProfile />;
      case "my-bookings":
        return <MyBookings />;
      case "certificates":
        return <Certificates />;
      case "partner":
        return <div>Partner</div>;
      case "logout":
        return <div>Logout</div>;
      case "home":
        return <div>Home</div>;
      default:
        return <UserProfile />;
    }
  };

  return (
    <div
      className="
        relative flex min-h-screen md:h-dvh w-full
        overflow-hidden
        dark:bg-[#0A0B1E] bg-white
      "
    >
      {/* Blob gradients behind everything */}
      <BackgroundBlobs />

      {/* Actual UI above blobs */}
      <div className="relative z-10 flex flex-col md:flex-row w-full items-stretch">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 dark:bg-neutral-900/90 dark:border-r dark:border-neutral-800 bg-white/90 backdrop-blur">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <Logo />
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link) => (
                  <React.Fragment key={link.id}>
                    <div
                      onClick={() => handleLinkClick(link.id)}
                      className="cursor-pointer"
                    >
                      <SidebarLink link={link} />
                    </div>
                    {link.id === "certificates" && (
                      <Separator className="my-4" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div>
              <div className="flex flex-col items-start align-middle gap-2">
                <div className="-ml-1">
                  <ThemeToggle />
                </div>
                <div className="h-8 w-8 rounded-full dark:bg-white bg-neutral-600"></div>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>

        {/* Make content transparent so blobs are visible */}
        <main className="flex-1 w-full bg-transparent">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
      <div className="h-6 w-6 shrink-0 rounded bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-white"
      >
        Club
      </motion.span>
    </div>
  );
};
