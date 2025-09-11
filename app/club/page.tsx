"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { Plus, Eye, Download, Settings, Share2, Link } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browserClient";
import { useSession } from "next-auth/react";

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
  const [iicEvents, setIicEvents] = useState<Event[]>([]);
  const [selfEvents, setSelfEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [startDatetime, setStartDatetime] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [estimatedParticipants, setEstimatedParticipants] = useState<
    number | ""
  >("");
  const [estimatedBudget, setEstimatedBudget] = useState<number | "">("");
  const [eventBlueprint, setEventBlueprint] = useState<File | null>(null);
  const [eventType, setEventType] = useState<'free' | 'paid'>('free');
  const [formError, setFormError] = useState<string | null>(null);
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const sessionUserId = (session as any)?.user?.id || null;

  const fetchEvents = async () => {
    if (!sessionUserId) return;
    setIsLoading(true);
    console.log(sessionUserId);

    try {
      // IIC events for this user's club (filter via join on clubs.email)
      const { data: iicData, error: iicErr } = await supabase
        .from("events")
        .select(
          "id, name, start_datetime, end_datetime, event_type, status, created_at, clubs(owner_id), club_id"
        )
        .eq("hosted", "iic")
        .eq("club_id", sessionUserId)
        .order("created_at", { ascending: false });
      if (iicErr) console.error("IIC error:", iicErr.message);
      setIicEvents((iicData || []) as Event[]);

      // Self-hosted events for this user's club
      const { data: selfData, error: selfErr } = await supabase
        .from("events")
        .select(
          "id, name, start_datetime, end_datetime, event_type, status, created_at, clubs(owner_id), club_id"
        )
        .eq("hosted", "self")
        .eq("club_id", sessionUserId)
        .order("created_at", { ascending: false });
      if (selfErr) console.error("Self-hosted error:", selfErr.message);
      setSelfEvents((selfData || []) as Event[]);
    } catch (error) {
      console.error("Error fetching events:", error);
      setIicEvents([]);
      setSelfEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!sessionUserId) {
      setIsLoading(false);
      return;
    }
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, sessionUserId]);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (sessionUserId) fetchEvents();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUserId]);

  const now = useMemo(() => new Date(), []);
  const currentSelfEvents = useMemo(
    () => selfEvents.filter((e) => new Date(e.end_datetime) >= new Date()),
    [selfEvents]
  );
  const pastSelfEvents = useMemo(
    () => selfEvents.filter((e) => new Date(e.end_datetime) < new Date()),
    [selfEvents]
  );

  const AddEventCard = () => (
    <div
      className="group relative overflow-hidden border border-white/20 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors cursor-pointer"
      onClick={() => setIsDialogOpen(true)}
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
        <div className="bg-[#D9D9D9] px-5 py-4">
          <div>
            <h3 className="text-2xl font-medium tracking-tight text-black">
              {event.name}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              {formatDate(event.start_datetime)} - {formatDate(event.end_datetime)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Status: {event.status}
            </p>
            {event.status === 'approved' && (
              <div className="flex gap-4 mt-4">
                <button
                  aria-label="View"
                  className="text-black hover:scale-105 transition-transform"
                  title="View Event"
                >
                  <Eye className="w-6 h-6" />
                </button>
                <button
                  aria-label="Download"
                  className="text-black hover:scale-105 transition-transform"
                  title="Download Files"
                >
                  <Download className="w-6 h-6" />
                </button>
                <button
                  aria-label="Share"
                  className="text-black hover:scale-105 transition-transform"
                  title="Share Event"
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
                  title="Event Settings"
                >
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            )}
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

        {/* Create Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setFormError(null);
                console.log("[EventForm] Starting form submission...");
                console.log("[EventForm] Form values:", {
                  name,
                  theme,
                  startDatetime,
                  endDatetime,
                  estimatedParticipants,
                  estimatedBudget,
                  eventType,
                  fileInfo: eventBlueprint
                    ? {
                        name: eventBlueprint.name,
                        type: eventBlueprint.type,
                        size: eventBlueprint.size,
                      }
                    : "No file",
                });

                // Validation
                if (
                  !name ||
                  !theme ||
                  !startDatetime ||
                  !endDatetime ||
                  estimatedParticipants === "" ||
                  estimatedBudget === "" ||
                  !eventBlueprint ||
                  !eventType
                ) {
                  const errorMsg = "All fields are required";
                  console.error("[EventForm] Validation failed:", errorMsg);
                  setFormError(errorMsg);
                  return;
                }

                if (new Date(endDatetime) < new Date(startDatetime)) {
                  const errorMsg =
                    "End date/time must be after start date/time";
                  console.error("[EventForm] Validation failed:", errorMsg);
                  setFormError(errorMsg);
                  return;
                }

                if (eventBlueprint.type !== "application/pdf") {
                  const errorMsg = "Event blueprint must be a PDF file";
                  console.error("[EventForm] Validation failed:", errorMsg);
                  setFormError(errorMsg);
                  return;
                }

                const MAX_BYTES = 200 * 1024;
                if (eventBlueprint.size > MAX_BYTES) {
                  const errorMsg = "Event blueprint must be 200KB or smaller";
                  console.error("[EventForm] Validation failed:", errorMsg);
                  setFormError(errorMsg);
                  return;
                }

                try {
                  setFormSubmitting(true);
                  const sessionUserId = (session as any)?.user?.id || null;
                  console.log("[EventForm] Session user ID:", sessionUserId);

                  if (!sessionUserId) {
                    const errorMsg = "No session. Please sign in again.";
                    console.error("[EventForm] No session user ID");
                    setFormError(errorMsg);
                    return;
                  }

                  // Submit via server API (NextAuth-compatible)
                  const eventId = uuidv4();
                  console.log("[EventForm] Generated event ID:", eventId);

                  const fd = new FormData();
                  fd.append("id", eventId);
                  fd.append("name", name);
                  fd.append("theme", theme);
                  fd.append("start_datetime", startDatetime);
                  fd.append("end_datetime", endDatetime);
                  fd.append(
                    "estimated_participants",
                    String(estimatedParticipants)
                  );
                  fd.append("estimated_budget", String(estimatedBudget));
                  fd.append("club_id", sessionUserId);
                  fd.append("event_blueprint", eventBlueprint);
                  fd.append("event_type", eventType);

                  console.log("[EventForm] Posting to /api/events/create ...");
                  const res = await fetch("/api/events/create", {
                    method: "POST",
                    body: fd,
                  });

                  const json = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    console.error("[EventForm] API error:", res.status, json);
                    setFormError(
                      json?.error || `Request failed with ${res.status}`
                    );
                    return;
                  }

                  console.log(
                    "[EventForm] Event created successfully via API:",
                    json
                  );
                  setIsDialogOpen(false);
                  setName("");
                  setTheme("");
                  setStartDatetime("");
                  setEndDatetime("");
                  setEstimatedParticipants("");
                  setEstimatedBudget("");
                  setEventBlueprint(null);

                  console.log("[EventForm] Refreshing events list...");
                  await fetchEvents();
                } catch (err: any) {
                  console.error("[EventForm] Unexpected error:", err);
                  setFormError(err?.message || "Something went wrong");
                } finally {
                  setFormSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Input
                    id="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_datetime">Start Date & Time</Label>
                  <Input
                    id="start_datetime"
                    type="datetime-local"
                    value={startDatetime}
                    onChange={(e) => setStartDatetime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_datetime">End Date & Time</Label>
                  <Input
                    id="end_datetime"
                    type="datetime-local"
                    value={endDatetime}
                    onChange={(e) => setEndDatetime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={eventType === 'free'}
                        onChange={() => setEventType('free')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span>Free</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={eventType === 'paid'}
                        onChange={() => setEventType('paid')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span>Paid</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_participants">
                    Estimated Participants
                  </Label>
                  <Input
                    id="estimated_participants"
                    type="number"
                    min={1}
                    value={estimatedParticipants as number | undefined}
                    onChange={(e) =>
                      setEstimatedParticipants(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_budget">Estimated Budget</Label>
                  <Input
                    id="estimated_budget"
                    type="number"
                    min={0}
                    step="0.01"
                    value={estimatedBudget as number | undefined}
                    onChange={(e) =>
                      setEstimatedBudget(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_blueprint">
                  Event Blueprint (PDF, max 200KB)
                </Label>
                <Input
                  id="event_blueprint"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setEventBlueprint(e.target.files?.[0] || null)
                  }
                  required
                />
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <DialogFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formSubmitting}>
                  {formSubmitting ? "Submitting..." : "Submit for approval"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center py-8">
                  <div className="text-neutral-400">Loading events...</div>
                </div>
              ) : iicEvents.length === 0 ? (
                <div className="col-span-full text-neutral-400">
                  No IIC events yet.
                </div>
              ) : (
                iicEvents.map((event) => (
                  <SupabaseEventCard key={event.id} event={event} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="current" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AddEventCard />
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center py-8">
                  <div className="text-neutral-400">Loading events...</div>
                </div>
              ) : currentSelfEvents.length === 0 ? (
                <div className="col-span-full text-neutral-400">
                  No current events.
                </div>
              ) : (
                currentSelfEvents.map((event) => (
                  <SupabaseEventCard key={event.id} event={event} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center py-8">
                  <div className="text-neutral-400">Loading events...</div>
                </div>
              ) : pastSelfEvents.length === 0 ? (
                <div className="col-span-full text-neutral-400">
                  No past events.
                </div>
              ) : (
                pastSelfEvents.map((event) => (
                  <SupabaseEventCard key={event.id} event={event} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
