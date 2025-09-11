"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { useSession } from "next-auth/react";
type DBEvent = {
  id: string;
  name: string;
  status: string;
  start_datetime: string;
  event_type?: string | null;
  additional_details?: string | null;
  budget?: string | null; // optional if you add later
  expected_attendees?: number | null; // optional if you add later
  club_id?: string | null;
  clubs?: {
    name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
};

export function ManageSelfHostedEvents() {
  const [events, setEvents] = useState<DBEvent[]>([]);
  const { data: session } = useSession();
  const sessionUserId = (session as any)?.user?.id || null;

  const fetchEvents = async () => {
    // Only self-hosted events for the current club (session user id)
    if (!sessionUserId) {
      setEvents([]);
      return;
    }
    const { data, error } = await supabase
      .from("events")
      .select(
        "id, name, status, start_datetime, event_type, additional_details, budget, expected_attendees, club_id, clubs(name, avatar_url, email)"
      )
      .eq("hosted", "self")
      .eq("club_id", sessionUserId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load events:", error.message);
      setEvents([]);
    } else {
      setEvents(data as DBEvent[]);
    }
  };

  useEffect(() => {
    fetchEvents();
    const onFocus = () => fetchEvents();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [sessionUserId]);

  const handleApprove = async (eventId: string) => {
    const { error } = await supabase
      .from("events")
      .update({ status: "approved" })
      .eq("id", eventId);
    if (error) {
      console.error("Approve failed:", error.message);
      return;
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "approved" } : e))
    );
  };

  const handleReject = async (eventId: string) => {
    const { error } = await supabase
      .from("events")
      .update({ status: "rejected" })
      .eq("id", eventId);
    if (error) {
      console.error("Reject failed:", error.message);
      return;
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "rejected" } : e))
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="bg-neutral-600 hover:bg-neutral-700 text-white">
            Draft
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">
            Pending
          </Badge>
        );
      case "pending_approval":
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-600 hover:bg-green-700 text-white">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-neutral-600 hover:bg-neutral-700 text-white">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 bg-neutral-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">
          Club - Admin Dashboard - Manage Self Hosted Events
        </h1>
      </div>

      <Card className="bg-neutral-800 border-neutral-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left p-4 text-white font-medium">Club</th>
                <th className="text-left p-4 text-white font-medium">
                  Event Details
                </th>
                <th className="text-left p-4 text-white font-medium">
                  Date & Attendees
                </th>
                <th className="text-left p-4 text-white font-medium">Budget</th>
                <th className="text-left p-4 text-white font-medium">Status</th>
                <th className="text-left p-4 text-white font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-neutral-700 hover:bg-neutral-750"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={event.clubs?.avatar_url || "/placeholder.svg"}
                          alt={event.clubs?.name || "Club"}
                        />
                        <AvatarFallback className="bg-neutral-600 text-white">
                          {(event.clubs?.name || "Club")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-medium text-sm">
                          {event.clubs?.name || "Unknown Club"}
                        </div>
                        <div className="text-neutral-400 text-xs">
                          {event.clubs?.email || ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="text-white font-medium text-sm mb-1">
                        {event.name}
                      </div>
                      <div className="text-neutral-400 text-xs mb-1">
                        {event.event_type || ""}
                      </div>
                      <div className="text-neutral-400 text-xs max-w-xs truncate">
                        {event.additional_details || ""}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="text-white text-sm">
                        {new Date(event.start_datetime).toLocaleDateString()}
                      </div>
                      <div className="text-neutral-400 text-xs">
                        {event.expected_attendees ?? 0} attendees
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium text-sm">
                      {event.budget || "—"}
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(event.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-neutral-700"
                        disabled={event.status === "draft"}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(event.status === "pending" ||
                        event.status === "pending_approval") && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(event.id)}
                            className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-neutral-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(event.id)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-neutral-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
