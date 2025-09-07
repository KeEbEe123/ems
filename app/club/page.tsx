"use client";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconMenu2,
  IconChartBar,
  IconUsers,
  IconClipboard,
  IconCalendar,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { EventInfoPage } from "@/components/event-info-page";
import { AfterEventPage } from "@/components/after-event-page";
import { ParticipantsPage } from "@/components/participants-page";
import { AnalyticsPage } from "@/components/analytics-page";

export default function EventDashboard() {
  const [currentPage, setCurrentPage] = useState("event-info");
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Menu",
      href: "#",
      icon: <IconMenu2 className="h-5 w-5 shrink-0 text-neutral-200" />,
      id: "menu",
    },
    {
      label: "Analytics",
      href: "#",
      icon: <IconChartBar className="h-5 w-5 shrink-0 text-neutral-200" />,
      id: "analytics",
    },
    {
      label: "Participants",
      href: "#",
      icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-200" />,
      id: "participants",
    },
    {
      label: "Event Info",
      href: "#",
      icon: <IconClipboard className="h-5 w-5 shrink-0 text-neutral-200" />,
      id: "event-info",
    },
    {
      label: "After Event",
      href: "#",
      icon: <IconCalendar className="h-5 w-5 shrink-0 text-neutral-200" />,
      id: "after-event",
    },
  ];

  const handleLinkClick = (id: string) => {
    if (id !== "menu") {
      setCurrentPage(id);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "event-info":
        return <EventInfoPage />;
      case "after-event":
        return <AfterEventPage />;
      case "participants":
        return <ParticipantsPage />;
      case "analytics":
        return <AnalyticsPage />;
      default:
        return <EventInfoPage />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-neutral-900">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 dark:bg-neutral-900 dark:border-r dark:border-neutral-800 bg-white">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLinkClick(link.id)}
                  className="cursor-pointer"
                >
                  <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="h-8 w-8 rounded-full bg-white"></div>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 bg-neutral-900">{renderCurrentPage()}</div>
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
