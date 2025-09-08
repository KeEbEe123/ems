"use client";

import * as React from "react";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

type TicketModalProps = {
  ticketId: string;
};

export function TicketModal({ ticketId }: TicketModalProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // The ticket design
  const TicketDesign = (
    <div className="w-full flex justify-center">
      <div
        className="
          relative w-[360px] sm:w-[420px]
          rounded-2xl overflow-hidden
          bg-gradient-to-b from-neutral-100 to-purple-300
          shadow-xl
        "
      >
        {/* Ticket SVG background */}
        <Image
          src="/elements/ticket.svg"
          alt="Ticket"
          width={600}
          height={300}
          className="w-full h-auto"
        />

        {/* Overlay ID text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="absolute right-8 top-1/2 -translate-y-1/2 text-sm sm:text-base font-medium text-black">
            ID: {ticketId}
          </p>
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            className="rounded-full bg-yellow-400 text-black font-bold hover:brightness-95"
          >
            View Ticket
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[480px] p-0 bg-transparent border-none shadow-none">
          {TicketDesign}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="secondary"
          className="rounded-full bg-yellow-400 text-black font-bold hover:brightness-95"
        >
          View Ticket
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-6 bg-transparent border-none shadow-none">
        {TicketDesign}
      </DrawerContent>
    </Drawer>
  );
}
