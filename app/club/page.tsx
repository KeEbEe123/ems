"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, Download, Settings, Share2, Link } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Sample event data
const sampleEvents = {
  iic: [
    {
      id: 1,
      title: "Innovation Summit 2024",
      imageUrl: "/innovation-summit-conference-hall.jpg",
      date: "15-17 March",
    },
    {
      id: 2,
      title: "Tech Startup Showcase",
      imageUrl: "/startup-pitch-presentation-stage.jpg",
      date: "22-24 March",
    },
    {
      id: 3,
      title: "Digital Transformation Workshop",
      imageUrl: "/digital-workshop-technology.jpg",
      date: "5-7 April",
    },
  ],
  current: [
    {
      id: 4,
      title: "Equinox Conference",
      imageUrl: "/modern-conference-equinox-event.jpg",
      date: "1-3 August",
    },
    {
      id: 5,
      title: "AI & Machine Learning Summit",
      imageUrl: "/ai-machine-learning-conference.png",
      date: "10-12 August",
    },
  ],
  past: [
    {
      id: 6,
      title: "Web Development Bootcamp",
      imageUrl: "/web-dev-bootcamp.png",
      date: "15-20 July",
    },
    {
      id: 7,
      title: "Blockchain Symposium",
      imageUrl: "/blockchain-cryptocurrency-symposium.jpg",
      date: "1-3 July",
    },
    {
      id: 8,
      title: "UX Design Workshop",
      imageUrl: "/ux-design-workshop-creative.jpg",
      date: "20-22 June",
    },
  ],
};

interface Event {
  id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  status: string;
  created_at: string;
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("iic");
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  // Refresh events when the page comes into focus (e.g., after creating an event)
  useEffect(() => {
    const handleFocus = () => {
      fetchEvents();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
        return;
      }

      setCurrentEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const AddEventCard = () => (
    <div
      className="group relative overflow-hidden border border-white/20 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors cursor-pointer"
      onClick={() => router.push("/club/event/create")}
    >
      <div className="relative h-40 bg-neutral-900/80 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center">
          <Plus className="w-8 h-8 text-neutral-300" />
        </div>
      </div>
      <div className="flex items-center justify-center bg-[#D9D9D9] px-5 py-4">
        <span className="text-xl font-medium tracking-tight text-black">
          Add New Event
        </span>
      </div>
    </div>
  );

  const EventCard = ({
    title,
    imageUrl,
  }: {
    title: string;
    imageUrl: string;
  }) => (
    <div className="group relative overflow-hidden border border-white/80 bg-black">
      {/* Media (dark area) */}
      <div className="relative h-40 bg-neutral-900">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover opacity-80 group-hover:opacity-90 transition-opacity"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between bg-[#D9D9D9] px-5 py-4">
        <h3 className="text-2xl font-medium tracking-tight text-black">
          {title}
        </h3>
        <div className="flex items-center gap-6">
          <button
            aria-label="Link"
            className="text-black hover:scale-105 transition-transform"
          >
            <Link className="w-6 h-6" />
          </button>
          <button
            aria-label="Share"
            className="text-black hover:scale-105 transition-transform"
          >
            <Share2 className="w-6 h-6" />
          </button>
          <button
            aria-label="Settings"
            className="text-black hover:scale-105 transition-transform"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );

  const SupabaseEventCard = ({ event }: { event: Event }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return (
      <div className="group relative overflow-hidden border border-white/80 bg-black">
        {/* Media (dark area) */}
        <div className="relative h-40 bg-neutral-900 flex items-center justify-center">
          <div className="text-neutral-400 text-sm">
            {event.event_type === "paid" ? "💰 Paid Event" : "🆓 Free Event"}
          </div>
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between bg-[#D9D9D9] px-5 py-4">
          <div>
            <h3 className="text-2xl font-medium tracking-tight text-black">
              {event.name}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              {formatDate(event.start_datetime)} -{" "}
              {formatDate(event.end_datetime)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Status: {event.status}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button
              aria-label="Link"
              className="text-black hover:scale-105 transition-transform"
            >
              <Link className="w-6 h-6" />
            </button>
            <button
              aria-label="Share"
              className="text-black hover:scale-105 transition-transform"
            >
              <Share2 className="w-6 h-6" />
            </button>
            <button
              aria-label="Settings"
              className="text-black hover:scale-105 transition-transform hover:animate-spinHalf"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/club/event/${event.id}`);
              }}
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Your Events</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-neutral-800 border border-neutral-700">
            <TabsTrigger
              value="iic"
              className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-neutral-300"
            >
              IIC Events
            </TabsTrigger>
            <TabsTrigger
              value="current"
              className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-neutral-300"
            >
              Current
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-neutral-300"
            >
              Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="iic" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AddEventCard />
              {sampleEvents.iic.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  imageUrl={event.imageUrl}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="current" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AddEventCard />
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center py-8">
                  <div className="text-neutral-400">Loading events...</div>
                </div>
              ) : (
                currentEvents.map((event) => (
                  <SupabaseEventCard key={event.id} event={event} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleEvents.past.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  imageUrl={event.imageUrl}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
