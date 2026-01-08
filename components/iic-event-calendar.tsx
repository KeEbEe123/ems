"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Plus, Search, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  EventReportDialog,
  type AfterEventReportData,
} from "@/components/event-report-dialog";

interface EventData {
  id: string;
  title: string;
  quarter: string;
  description: string;
  semester?: string;
  dateRange?: string;
  club_id?: string;
  club_name?: string;
  has_report?: boolean;
}

type Club = { id: string; name: string; avatar_url?: string };

// no local dummy data; list will be fetched from Supabase

export function IICEventCalendar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(
    "semester-1-quarter-1"
  );
  const [events, setEvents] = useState<EventData[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<AfterEventReportData | null>(
    null
  );
  const [reportLoading, setReportLoading] = useState(false);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    semesterQuarter: "",
    clubId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteEvent = async (eventId: string) => {
    const ok = window.confirm("Are you sure you want to delete this event? This action cannot be undone.");
    if (!ok) return;
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) {
      console.error("Failed to delete event:", error.message);
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleViewReport = async (eventId: string) => {
    try {
      setReportLoading(true);
      setReportData(null);
      setReportOpen(true);
      const { data, error } = await supabase
        .from("after_event_reports")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("Failed to load after_event_report:", error.message);
      } else {
        setReportData(data as unknown as AfterEventReportData);
      }
    } finally {
      setReportLoading(false);
    }
  };

  const openAddDialog = () => {
    setOpen(true);
  };

  // Helper function to get date range from semester quarter selection
  const getDateRange = (semesterQuarter: string) => {
    if (semesterQuarter === "semester-1-quarter-1") {
      return "September - November";
    } else if (semesterQuarter === "semester-1-quarter-2") {
      return "December - February";
    } else if (semesterQuarter === "semester-2-quarter-3") {
      return "March - May";
    } else if (semesterQuarter === "semester-2-quarter-4") {
      return "June - August";
    }
    return "";
  };

  // fetch events from Supabase filtered by hosted='iic' and optional semester/quarter
  const fetchEvents = async () => {
    try {
      // Parse current selected semester/quarter
      const parts = selectedSemester.split("-");
      const semester = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "";
      const quarter = parts.length >= 4 ? `${parts[2]}-${parts[3]}` : "";

      let query = supabase
        .from("events")
        .select(`
          id, 
          name, 
          additional_details, 
          quarter, 
          semester, 
          description, 
          date_range,
          club_id,
          clubs(name)
        `)
        .eq("hosted", "iic")
        .order("created_at", { ascending: false });

      if (semester) query = query.eq("semester", semester);
      if (quarter) query = query.eq("quarter", quarter);
      if (selectedClubId) query = query.eq("club_id", selectedClubId);

      const { data, error } = await query;
      if (error) throw error;

      // Check for reports for each event
      const eventIds = (data || []).map((e: any) => e.id);
      const { data: reports } = await supabase
        .from("after_event_reports")
        .select("event_id")
        .in("event_id", eventIds);

      const reportedEventIds = new Set(reports?.map((r) => r.event_id) || []);

      const mapped: EventData[] = (data || []).map((e: any) => ({
        id: e.id,
        title: e.name,
        quarter: e.quarter || "",
        description: e.description || e.additional_details || "",
        semester: e.semester || "",
        dateRange: e.date_range || "",
        club_id: e.club_id,
        club_name: e.clubs?.name || "Unassigned",
        has_report: reportedEventIds.has(e.id),
      }));
      setEvents(mapped);
    } catch (e) {
      console.error("Failed to fetch IIC events", e);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
    // refresh when window regains focus
    const onFocus = () => fetchEvents();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester, selectedClubId]);

  // Reusable function to load clubs
  const fetchClubs = async () => {
    try {
      setIsLoadingClubs(true);
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name, avatar_url")
        .order("name", { ascending: true });
      if (error) throw error;
      setClubs((data as Club[]) || []);
    } catch (e: any) {
      console.error("Failed to load clubs", e?.message || e);
      setClubs([]);
    } finally {
      setIsLoadingClubs(false);
    }
  };

  // Load clubs for both dialog and filter usage
  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchClubs();
  }, [open]);

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    const { title, description, semesterQuarter, clubId } = form;
    if (!title || !description || !semesterQuarter || !clubId) {
      setSubmitError("Please fill all fields.");
      return;
    }

    // Parse value like "semester-1-quarter-1" into semester="semester-1" and quarter="quarter-1"
    const parts = semesterQuarter.split("-");
    const semester = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "";
    const quarter = parts.length >= 4 ? `${parts[2]}-${parts[3]}` : "";

    // Calculate date_range based on semester and quarter
    const dateRange = getDateRange(semesterQuarter).replace(" - ", "-");

    try {
      setSubmitting(true);
      // Use dummy dates since we're using date_range now
      const start = new Date();
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const payload: Record<string, any> = {
        name: title,
        hosted: "iic",
        club_id: clubId,
        semester,
        quarter,
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        status: "approved",
        event_type: "free",
        venue: "",
        city: "",
        country: "",
        additional_details: description,
        description: description,
        date_range: dateRange,
      };
      const { error } = await supabase.from("events").insert(payload);
      if (error) throw error;
      setSubmitSuccess("Event created successfully.");
      setOpen(false);
      setForm({ title: "", description: "", semesterQuarter: "", clubId: "" });
      // refresh list
      fetchEvents();
    } catch (e: any) {
      setSubmitError(e?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 dark:from-purple-950 dark:via-neutral-900 dark:to-black bg-gradient-to-tl from-pink-300 via-white to-white min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-medium">
            Club - Admin Dashboard - IIC Event Calendar
          </h1>
          <Button
            onClick={openAddDialog}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New IIC Event
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-64 bg-neutral-800 border-neutral-700 text-white">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700">
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

          {/* Club filter */}
          <Select value={selectedClubId || "all"} onValueChange={(v) => setSelectedClubId(v === "all" ? "" : v)}>
            <SelectTrigger className="w-72 bg-neutral-800 border-neutral-700 text-white">
              <SelectValue placeholder={isLoadingClubs ? "Loading clubs..." : "Filter by Club (All)"} />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700">
              <SelectItem value="all" className="text-white hover:bg-neutral-700">
                All Clubs
              </SelectItem>
              {clubs.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-white hover:bg-neutral-700">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={c.avatar_url || ""} alt={c.name} />
                      <AvatarFallback>
                        {c.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{c.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <Input
              placeholder="Search Title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
            />
          </div>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-200 dark:border-neutral-800">
              <TableHead className="text-black dark:text-white font-semibold">Event Title</TableHead>
              <TableHead className="text-black dark:text-white font-semibold">Semester</TableHead>
              <TableHead className="text-black dark:text-white font-semibold">Quarter</TableHead>
              <TableHead className="text-black dark:text-white font-semibold">Assigned Club</TableHead>
              <TableHead className="text-black dark:text-white font-semibold text-center">Report Submitted</TableHead>
              <TableHead className="text-black dark:text-white font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id} className="border-neutral-200 dark:border-neutral-800">
                  <TableCell className="font-medium text-black dark:text-white">
                    {event.title}
                  </TableCell>
                  <TableCell>
                    {event.semester && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      >
                        {event.semester
                          .replace("-", " ")
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {event.quarter && (
                      <Badge
                        variant="outline"
                        className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      >
                        {event.quarter
                          .replace("-", " ")
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-black dark:text-white">
                    {event.club_name}
                  </TableCell>
                  <TableCell className="text-center">
                    {event.has_report ? (
                      <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm">Yes</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
                        <XCircle className="w-5 h-5" />
                        <span className="text-sm">No</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReport(event.id)}
                        className="text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        title="View Event Report"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-neutral-900 text-white border-neutral-800">
          <DialogHeader>
            <DialogTitle>Create IIC Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm text-neutral-300">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white"
                placeholder="Enter event title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-300">Description</label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="bg-neutral-800 border-neutral-700 text-white"
                placeholder="Enter event description"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-300">
                Semester and Quarter
              </label>
              <Select
                value={form.semesterQuarter}
                onValueChange={(v) => setForm({ ...form, semesterQuarter: v })}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue placeholder="Select semester and quarter" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  <SelectItem
                    value="semester-1-quarter-1"
                    className="text-white"
                  >
                    Semester 1 - Quarter 1
                  </SelectItem>
                  <SelectItem
                    value="semester-1-quarter-2"
                    className="text-white"
                  >
                    Semester 1 - Quarter 2
                  </SelectItem>
                  <SelectItem
                    value="semester-2-quarter-3"
                    className="text-white"
                  >
                    Semester 2 - Quarter 3
                  </SelectItem>
                  <SelectItem
                    value="semester-2-quarter-4"
                    className="text-white"
                  >
                    Semester 2 - Quarter 4
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.semesterQuarter && (
                <div className="text-sm text-blue-400 mt-2">
                  📅 Date Range: {getDateRange(form.semesterQuarter)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-300">Club</label>
              <Select
                value={form.clubId}
                onValueChange={(v) => setForm({ ...form, clubId: v })}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue
                    placeholder={
                      isLoadingClubs ? "Loading clubs..." : "Select a club"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  {clubs.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-white">
                      <div className="flex items-center gap-2 hover:cursor-pointer">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={c.avatar_url || ""} alt={c.name} />
                          <AvatarFallback>
                            {c.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{c.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {submitError && (
              <p className="text-sm text-red-400">{submitError}</p>
            )}
            {submitSuccess && (
              <p className="text-sm text-green-400">{submitSuccess}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-neutral-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report viewer dialog */}
      <EventReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        data={reportData}
      />
    </div>
  );
}
