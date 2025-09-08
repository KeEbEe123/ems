"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Check,
  X,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

type TabType = "attendees" | "waitlist";

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  passType: "general" | "vip" | "premium";
  registeredAt: string;
}

export function ParticipantsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("attendees");

  const [attendees] = useState<Participant[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      avatar: "/professional-woman.png",
      passType: "vip",
      registeredAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.chen@email.com",
      avatar: "/professional-man.png",
      passType: "general",
      registeredAt: "2024-01-14",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      avatar: "/business-woman.png",
      passType: "premium",
      registeredAt: "2024-01-13",
    },
    {
      id: "4",
      name: "David Kim",
      email: "david.kim@email.com",
      avatar: "/casual-man.png",
      passType: "general",
      registeredAt: "2024-01-12",
    },
  ]);

  const [waitlist, setWaitlist] = useState<Participant[]>([
    {
      id: "5",
      name: "Jessica Brown",
      email: "jessica.brown@email.com",
      avatar: "/woman-young.jpg",
      passType: "vip",
      registeredAt: "2024-01-16",
    },
    {
      id: "6",
      name: "Alex Thompson",
      email: "alex.thompson@email.com",
      avatar: "/professional-person.png",
      passType: "general",
      registeredAt: "2024-01-17",
    },
    {
      id: "7",
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      avatar: "/woman-smile.jpg",
      passType: "premium",
      registeredAt: "2024-01-18",
    },
  ]);

  const tabs = [
    { id: "attendees", label: "Attendees" },
    { id: "waitlist", label: "Waitlist" },
  ];

  const handleApprove = (participantId: string) => {
    const participant = waitlist.find((p) => p.id === participantId);
    if (participant) {
      setWaitlist(waitlist.filter((p) => p.id !== participantId));
      // In a real app, this would move to attendees
      console.log("[v0] Approved participant:", participant.name);
    }
  };

  const handleReject = (participantId: string) => {
    const participant = waitlist.find((p) => p.id === participantId);
    if (participant) {
      setWaitlist(waitlist.filter((p) => p.id !== participantId));
      console.log("[v0] Rejected participant:", participant.name);
    }
  };

  const handleView = (participant: Participant) => {
    console.log("[v0] Viewing participant:", participant);
  };

  const getPassTypeBadge = (passType: string) => {
    const styles = {
      general: "bg-blue-600 text-white",
      vip: "bg-yellow-600 text-white",
      premium: "bg-purple-600 text-white",
    };
    return styles[passType as keyof typeof styles] || styles.general;
  };

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">
          Club - Event Dashboard - Participants Page
        </h1>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={
                activeTab === tab.id
                  ? "bg-white text-black hover:bg-gray-100 rounded-sm px-4 py-1 text-sm"
                  : "text-white hover:bg-neutral-800 rounded-sm px-4 py-1 text-sm"
              }
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Attendees Tab */}
      {activeTab === "attendees" && (
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">
              Attendees ({attendees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendees.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">]</Avatar>
                    <div>
                      <h3 className="text-white font-medium">
                        {participant.name}
                      </h3>
                      <p className="text-neutral-400 text-sm">
                        {participant.email}
                      </p>
                    </div>
                    <Badge className={getPassTypeBadge(participant.passType)}>
                      {participant.passType.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-neutral-700"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-neutral-800 border-neutral-700">
                        <DropdownMenuItem className="text-white hover:bg-neutral-700">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-neutral-700">
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-neutral-700">
                          <Phone className="w-4 h-4 mr-2" />
                          Contact Info
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-neutral-700">
                          <Calendar className="w-4 h-4 mr-2" />
                          Registration Date
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {attendees.length === 0 && (
                <p className="text-neutral-400 text-center py-8">
                  No attendees yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waitlist Tab */}
      {activeTab === "waitlist" && (
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">
              Waitlist ({waitlist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitlist.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10"></Avatar>
                    <div>
                      <h3 className="text-white font-medium">
                        {participant.name}
                      </h3>
                      <p className="text-neutral-400 text-sm">
                        {participant.email}
                      </p>
                    </div>
                    <Badge className={getPassTypeBadge(participant.passType)}>
                      {participant.passType.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(participant)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-neutral-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(participant.id)}
                      className="text-green-400 hover:text-green-300 hover:bg-neutral-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(participant.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-neutral-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {waitlist.length === 0 && (
                <p className="text-neutral-400 text-center py-8">
                  No participants in waitlist
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
