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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import {
  Plus,
  Eye,
  Download,
  Settings,
  Share2,
  Link,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browserClient";
import { useSession } from "next-auth/react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import GradientButton from "@/components/ui/gradient-button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface Event {
  id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  status: string;
  created_at: string;
  description?: string;
  semester?: string;
  quarter?: string;
  date_range?: string;
  hosted?: string;
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
  const [eventType, setEventType] = useState<"free" | "paid">("free");
  const [formError, setFormError] = useState<string | null>(null);
  const [iicEventViewOpen, setIicEventViewOpen] = useState(false);
  const [selectedIicEvent, setSelectedIicEvent] = useState<Event | null>(null);
  const [iicSearchTerm, setIicSearchTerm] = useState("");
  const [iicSemesterFilter, setIicSemesterFilter] = useState("all");
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
          "id, name, start_datetime, end_datetime, event_type, status, created_at, description, semester, quarter, date_range, hosted, clubs(owner_id), club_id"
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

  const filteredIicEvents = useMemo(() => {
    return iicEvents.filter((event) => {
      // Search filter
      const matchesSearch = event.name
        .toLowerCase()
        .includes(iicSearchTerm.toLowerCase());

      // Semester/Quarter filter
      let matchesFilter = true;
      if (iicSemesterFilter && iicSemesterFilter !== "all") {
        const eventSemesterQuarter =
          event.semester && event.quarter
            ? `${event.semester}-${event.quarter}`
            : "";
        matchesFilter = eventSemesterQuarter === iicSemesterFilter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [iicEvents, iicSearchTerm, iicSemesterFilter]);

  // Helper function to get date range display
  const getDateRangeDisplay = (event: Event) => {
    if (event.date_range) {
      return event.date_range.replace("-", " - ");
    }
    // Fallback for older events without date_range
    if (event.semester && event.quarter) {
      const semesterQuarter = `${event.semester}-${event.quarter}`;
      if (semesterQuarter === "semester-1-quarter-1")
        return "September - November";
      if (semesterQuarter === "semester-1-quarter-2")
        return "December - February";
      if (semesterQuarter === "semester-2-quarter-3") return "March - May";
      if (semesterQuarter === "semester-2-quarter-4") return "June - August";
    }
    return "";
  };

  const handleViewIicEvent = (event: Event) => {
    setSelectedIicEvent(event);
    setIicEventViewOpen(true);
  };

  // Date + Time picker built with shadcn Calendar & Popover
  function DateTimePicker({
    id,
    label,
    value,
    onChange,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState<string>("10:30:00");

    // Initialize from incoming value (expects YYYY-MM-DDTHH:MM or HH:MM:SS)
    useEffect(() => {
      if (!value) return;
      const [d, t] = value.split("T");
      if (d) {
        const parts = d.split("-");
        if (parts.length === 3) {
          const y = Number(parts[0]);
          const m = Number(parts[1]) - 1;
          const dd = Number(parts[2]);
          const parsed = new Date(y, m, dd);
          if (!isNaN(parsed.getTime())) setDate(parsed);
        }
      }
      if (t) setTime(t.length === 5 ? `${t}:00` : t);
    }, [value]);

    const combine = (d?: Date, t?: string) => {
      if (!d) return;
      const yyyy = d.getFullYear();
      const mm = `${d.getMonth() + 1}`.padStart(2, "0");
      const dd = `${d.getDate()}`.padStart(2, "0");
      const tt = (t || time || "00:00:00").slice(0, 8);
      onChange(`${yyyy}-${mm}-${dd}T${tt}`);
    };

    return (
      <div className="space-y-2">
        <Label htmlFor={`${id}-date`}>{label}</Label>
        <div className="flex gap-1">
          <div className="flex flex-col gap-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id={`${id}-date`}
                  className="w-44 justify-between font-normal"
                >
                  {date ? date.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(d) => {
                    setDate(d);
                    if (d) combine(d, time);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <Input
              type="time"
              id={`${id}-time`}
              step="1"
              value={time}
              onChange={(e) => {
                const v =
                  e.target.value.length === 5
                    ? `${e.target.value}:00`
                    : e.target.value;
                setTime(v);
                combine(date, v);
              }}
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
      </div>
    );
  }

  const AddEventCard = () => (
    <div
      className="group relative overflow-hidden border border-white/20 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors cursor-pointer"
      onClick={() => setIsDialogOpen(true)}
    >
      <div className="relative h-40 bg-neutral-900 flex items-center justify-center">
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
      <div className="group relative overflow-hidden border border-white/80 bg-gradient-to-t from-purple-950 via-purple-800 to-purple-600">
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
              {event.hosted === "iic" && getDateRangeDisplay(event)
                ? `📅 ${getDateRangeDisplay(event)}`
                : `${formatDate(event.start_datetime)} - ${formatDate(
                    event.end_datetime
                  )}`}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Status: {event.status}
            </p>
            {event.status === "approved" && (
              <div className="flex gap-4 mt-4">
                <button
                  aria-label="View"
                  className="text-black hover:scale-105 transition-transform"
                  title="View Event"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (event.hosted === "iic") {
                      handleViewIicEvent(event);
                    }
                  }}
                >
                  <Eye className="w-6 h-6" />
                </button>
                {event.hosted !== "iic" && (
                  <>
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
                  </>
                )}
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

  // IIC-specific card using shadcn/ui Card. Buttons and data mirror SupabaseEventCard for IIC events.
  const IICCard = ({ event }: { event: Event }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return (
      <Card className="bg-gradient-to-tl from-[#3A3CBA] via-[#FF1D1D] to-[#FCB045]">
        <CardHeader>
          <CardTitle className="text-white text-xl">{event.name}</CardTitle>
          <CardDescription className="text-neutral-300">
            {event.hosted === "iic" && getDateRangeDisplay(event)
              ? `📅 ${getDateRangeDisplay(event)}`
              : `${formatDate(event.start_datetime)} - ${formatDate(
                  event.end_datetime
                )}`}
          </CardDescription>
        </CardHeader>
        {event.status === "approved" && (
          <CardFooter className="justify-end gap-4 border-t border-white/10 pt-4">
            <button
              aria-label="View"
              className="text-white hover:scale-105 transition-transform"
              title="View Event"
              onClick={(e) => {
                e.stopPropagation();
                handleViewIicEvent(event);
              }}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              aria-label="Settings"
              className="text-white hover:scale-105 transition-transform hover:animate-spinHalf"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/club/event/${event.id}`);
              }}
              title="Event Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen p-6 dark:bg-gradient-to-tl dark:from-purple-950 dark:via-neutral-900 dark:to-black bg-gradient-to-tl from-pink-300 via-white to-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Your Events</h1>
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
                const errorMsg = "End date/time must be after start date/time";
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
              <DateTimePicker
                id="start_datetime"
                label="Start Date & Time"
                value={startDatetime}
                onChange={setStartDatetime}
              />
              <DateTimePicker
                id="end_datetime"
                label="End Date & Time"
                value={endDatetime}
                onChange={setEndDatetime}
              />
              <div className="space-y-2">
                <Label>Event Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={eventType === "free"}
                      onChange={() => setEventType("free")}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>Free</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={eventType === "paid"}
                      onChange={() => setEventType("paid")}
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
                onChange={(e) => setEventBlueprint(e.target.files?.[0] || null)}
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
              <GradientButton
                type="submit"
                disabled={formSubmitting}
                className="text-md"
              >
                {formSubmitting ? "Submitting..." : "Submit for approval"}
              </GradientButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* IIC Event View Dialog */}
      <Dialog open={iicEventViewOpen} onOpenChange={setIicEventViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>IIC Event Details</DialogTitle>
          </DialogHeader>
          {selectedIicEvent && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-600">
                  Event Name
                </label>
                <p className="text-base font-semibold">
                  {selectedIicEvent.name}
                </p>
              </div>

              {selectedIicEvent.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-600">
                    Description
                  </label>
                  <p className="text-sm">{selectedIicEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedIicEvent.semester && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-600">
                      Semester
                    </label>
                    <p className="text-sm capitalize">
                      {selectedIicEvent.semester.replace("-", " ")}
                    </p>
                  </div>
                )}

                {selectedIicEvent.quarter && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-600">
                      Quarter
                    </label>
                    <p className="text-sm capitalize">
                      {selectedIicEvent.quarter.replace("-", " ")}
                    </p>
                  </div>
                )}
              </div>

              {getDateRangeDisplay(selectedIicEvent) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-600">
                    Date Range
                  </label>
                  <p className="text-sm text-blue-600 font-medium">
                    📅 {getDateRangeDisplay(selectedIicEvent)}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIicEventViewOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-start mb-8">
          <TabsList className="inline-flex w-auto bg-neutral-800 dark:bg-neutral-800 bg-white/80 border border-neutral-700 dark:border-neutral-700 border-neutral-200 rounded-lg p-1 backdrop-blur-sm">
            <TabsTrigger
              value="iic"
              className="px-6 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-neutral-700 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-white data-[state=active]:bg-neutral-900 data-[state=active]:text-white text-neutral-300 dark:text-neutral-300 text-neutral-600 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium"
            >
              IIC Events
            </TabsTrigger>
            <TabsTrigger
              value="current"
              className="px-6 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-neutral-700 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-white data-[state=active]:bg-neutral-900 data-[state=active]:text-white text-neutral-300 dark:text-neutral-300 text-neutral-600 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium"
            >
              Current
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="px-6 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-neutral-700 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-white data-[state=active]:bg-neutral-900 data-[state=active]:text-white text-neutral-300 dark:text-neutral-300 text-neutral-600 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium"
            >
              Past
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="iic" className="mt-8">
          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <Select
              value={iicSemesterFilter}
              onValueChange={setIicSemesterFilter}
            >
              <SelectTrigger className="w-64 bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder="All Semesters & Quarters" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem
                  value="all"
                  className="text-white hover:bg-neutral-700"
                >
                  All Semesters & Quarters
                </SelectItem>
                <SelectItem
                  value="semester-1-quarter-1"
                  className="text-white hover:bg-neutral-700"
                >
                  Semester 1 - Quarter 1
                </SelectItem>
                <SelectItem
                  value="semester-1-quarter-2"
                  className="text-white hover:bg-neutral-700"
                >
                  Semester 1 - Quarter 2
                </SelectItem>
                <SelectItem
                  value="semester-2-quarter-3"
                  className="text-white hover:bg-neutral-700"
                >
                  Semester 2 - Quarter 3
                </SelectItem>
                <SelectItem
                  value="semester-2-quarter-4"
                  className="text-white hover:bg-neutral-700"
                >
                  Semester 2 - Quarter 4
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search IIC events..."
                value={iicSearchTerm}
                onChange={(e) => setIicSearchTerm(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="text-neutral-400">Loading events...</div>
              </div>
            ) : filteredIicEvents.length === 0 ? (
              <div className="col-span-full text-neutral-400">
                {iicSearchTerm ||
                (iicSemesterFilter && iicSemesterFilter !== "all")
                  ? "No IIC events match your search criteria."
                  : "No IIC events yet."}
              </div>
            ) : (
              filteredIicEvents.map((event) => (
                <IICCard key={event.id} event={event} />
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
  );
}
