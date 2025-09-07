"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  UserRoundPen,
  TicketCheck,
  Trophy,
  LogOut,
  Home,
  Handshake,
} from "lucide-react";
import UserProfile from "@/components/user-profile";
import MyBookings from "@/components/my-bookings";
import Certificates from "@/components/certificates";
import { motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
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
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-neutral-900">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 dark:bg-neutral-900 dark:border-r dark:border-neutral-800 bg-white">
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

                  {/* separator after Certificates */}
                  {link.id === "certificates" && <Separator className="my-4" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div>
            <div className="h-8 w-8 rounded-full bg-white"></div>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 w-full bg-neutral-900">{renderCurrentPage()}</div>
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
