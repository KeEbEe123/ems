"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/browserClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CalendarDays, Award, ImageIcon, Pencil } from "lucide-react";
import Image from "next/image";
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
import { Textarea } from "@/components/ui/textarea";
import Autoplay from "embla-carousel-autoplay";

interface EventData {
  id: string;
  hosted: string;
  banners?: {
    "1x1": string;
    "16:9": string;
    "21:9": string;
  };
}

interface ClubData {
  about?: string;
  faculty_coordinator?: string;
  faculty_coordinator_designation?: string;
  name?: string | null;
  avatar_url?: string | null;
}

interface ProfileStats {
  selfDrivenCount: number;
  iicEventsCount: number;
  banners: string[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ClubData | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    selfDrivenCount: 0,
    iicEventsCount: 0,
    banners: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    about: "",
    faculty_coordinator: "",
    faculty_coordinator_designation: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const [events, setEvents] = useState<
    Array<{ id: string; name: string; banners: Record<string, string> }>
  >([]);

  const sessionUserId = (session as any)?.user?.id || null;

  useEffect(() => {
    if (!sessionUserId) return;
    fetchProfileData();
  }, [sessionUserId]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);

      // Fetch club profile from public.clubs where id = sessionUserId
      const [
        { data: club, error: clubError },
        { data: events, error: eventsError },
      ] = await Promise.all([
        supabase
          .from("clubs")
          .select(
            "about, faculty_coordinator, faculty_coordinator_designation, name, avatar_url"
          )
          .eq("id", sessionUserId)
          .maybeSingle(),
        // Fetch all events for this club for stats and banners
        supabase
          .from("events")
          .select("id, hosted, banners")
          .eq("club_id", sessionUserId),
      ]);

      if (clubError) {
        console.error("Error fetching club profile:", clubError);
      } else if (club) {
        setProfileData(club as ClubData);
      }

      if (eventsError) {
        console.error("Error fetching events for stats:", eventsError);
      }

      if (events && events.length > 0) {
        // Calculate stats
        const selfDrivenEvents = (events as EventData[]).filter(
          (e) => e.hosted === "self"
        );
        const iicEvents = (events as EventData[]).filter(
          (e) => e.hosted === "iic"
        );

        // Extract 16:9 banners from self-driven events
        const bannerUrls: string[] = [];
        selfDrivenEvents.forEach((event) => {
          if (event.banners && event.banners["16:9"]) {
            bannerUrls.push(event.banners["16:9"]);
          }
        });

        setStats({
          selfDrivenCount: selfDrivenEvents.length,
          iicEventsCount: iicEvents.length,
          banners: bannerUrls,
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: profileData?.name || session?.user?.name || "",
      about: profileData?.about || "",
      faculty_coordinator: profileData?.faculty_coordinator || "",
      faculty_coordinator_designation:
        profileData?.faculty_coordinator_designation || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      const { error } = await supabase.from("clubs").upsert({
        id: sessionUserId,
        name: editForm.name,
        about: editForm.about,
        faculty_coordinator: editForm.faculty_coordinator,
        faculty_coordinator_designation:
          editForm.faculty_coordinator_designation,
        owner_id: sessionUserId,
      });

      if (error) {
        setUpdateError(error.message);
        return;
      }

      // Update local state
      setProfileData({
        ...profileData,
        name: editForm.name,
        about: editForm.about,
        faculty_coordinator: editForm.faculty_coordinator,
        faculty_coordinator_designation:
          editForm.faculty_coordinator_designation,
      });

      setIsEditModalOpen(false);
    } catch (error: any) {
      setUpdateError(error.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 dark:bg-gradient-to-tl dark:from-purple-950 dark:via-neutral-900 dark:to-black bg-gradient-to-tl from-pink-300 via-white to-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 dark:bg-gradient-to-tl dark:from-purple-950 dark:via-neutral-900 dark:to-black bg-gradient-to-tl from-pink-300 via-white to-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Club Profile</h1>
      </div>

      <div className="grid grid-cols-4 grid-rows-4 gap-4 h-full min-h-[700px]">
        {/* Avatar Card (spans 2 columns, 1 row) */}
        <Card className="border-neutral-700 col-span-2 row-span-1">
          <CardContent className="flex items-center justify-between p-4 h-full">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={session?.user?.image ?? ""}
                  alt={session?.user?.name ?? "User"}
                />
                <AvatarFallback className="bg-neutral-700 text-white">
                  {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">
                    {profileData?.name || session?.user?.name || "Club Name"}
                  </h2>
                  <button
                    onClick={openEditModal}
                    className="text-neutral-400 hover:text-white transition-colors"
                    title="Edit profile"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-neutral-400 text-sm">
                  {session?.user?.email ?? ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards (spans 1 column, 2 rows) */}
        <div className="col-span-1 row-span-2 flex flex-col gap-2">
          <Card className="border-neutral-700 flex-1 bg-gradient-to-tl dark:from-purple-600 dark:via-neutral-900 dark:to-black from-pink-500 via-white to-white">
            <CardContent className="p-3 h-full flex flex-col justify-between">
              <div className="flex items-start gap-2 mb-2 text-left">
                <p className="text-lg font-semibold -mt-4">
                  Self Driven Events
                </p>
              </div>
              <p className="text-6xl font-bold self-end text-right mr-2">
                {stats.selfDrivenCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-neutral-700 bg-gradient-to-tl from-[#3A3CBA] via-[#FF1D1D] to-[#FCB045] flex-1">
            <CardContent className="p-3 h-full flex flex-col justify-between">
              <div className="flex items-start gap-2 mb-2 text-left">
                <p className="text-lg font-semibold -mt-4">IIC Events</p>
              </div>
              <p className="text-6xl font-bold self-end text-right mr-2">
                {stats.iicEventsCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-neutral-700 flex-1">
            <CardContent className="p-3 h-full flex flex-col justify-between">
              <div className="flex items-start gap-2 mb-2 text-left">
                <p className="text-lg font-semibold -mt-4">Banner Count</p>
              </div>
              <p className="text-6xl font-bold self-end text-right mr-2">
                {stats.banners.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Card (spans 1 column, 2 rows) */}
        <Card className="border-neutral-700 col-span-1 row-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="text-neutral-400">
            No new notifications
          </CardContent>
        </Card>

        {/* About Card (spans 2 columns, 2 rows) */}
        <Card className="border-neutral-700 col-span-2 row-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">About</CardTitle>
          </CardHeader>
          <CardContent>
            {profileData?.about ? (
              <p className="dark:text-neutral-300 text-neutral-600 text-lg leading-relaxed">
                {profileData.about}
              </p>
            ) : (
              <p className="text-neutral-400 text-sm">
                No description available. Add an about section to your events to
                see it here.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Gallery Card (spans 2 columns, 2 rows) */}
        <Card className="border-neutral-700 col-span-2 row-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Event Gallery
            </CardTitle>
          </CardHeader>
          <CardContent className="relative overflow-hidden">
            {stats.banners.length > 0 ? (
              <Carousel
                opts={{ align: "center", loop: true }}
                plugins={[plugin.current as any]}
              >
                <CarouselContent>
                  {stats.banners.map((bannerUrl, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video bg-neutral-800 rounded-lg overflow-hidden">
                        <Image
                          src={bannerUrl}
                          alt={`Event banner ${index + 1}`}
                          fill
                          className="object-contain hover:scale-105 transition-transform duration-200"
                          sizes="(min-width: 768px) 50vw, 100vw"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ImageIcon className="h-12 w-12 text-neutral-600 mb-4" />
                <p className="text-neutral-400 text-sm">
                  No event banners available yet.
                </p>
                <p className="text-neutral-500 text-xs mt-2">
                  Event banners will appear here once you create self-driven
                  events.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Faculty Coordinator Card (spans 2 columns, 1 row) */}
        <Card className="border-neutral-700 col-span-2 row-span-1">
          <CardHeader>
            <CardTitle className="text-2xl">Faculty Coordinator</CardTitle>
          </CardHeader>
          <CardContent>
            {profileData?.faculty_coordinator ? (
              <div>
                <p className="font-semibold text-4xl">
                  {profileData.faculty_coordinator}
                </p>
                {profileData.faculty_coordinator_designation && (
                  <p className="text-neutral-400 text-lg">
                    {profileData.faculty_coordinator_designation}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-neutral-400 text-sm">
                No faculty coordinator information available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-neutral-700">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Club Name
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="border-neutral-600"
                placeholder="Enter club name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="about" className="text-sm">
                About
              </Label>
              <Textarea
                id="about"
                value={editForm.about}
                onChange={(e) =>
                  setEditForm({ ...editForm, about: e.target.value })
                }
                className="border-neutral-600 min-h-[100px]"
                placeholder="Tell us about your club..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty_coordinator" className="text-sm">
                Faculty Coordinator
              </Label>
              <Input
                id="faculty_coordinator"
                value={editForm.faculty_coordinator}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    faculty_coordinator: e.target.value,
                  })
                }
                className="border-neutral-600"
                placeholder="Faculty coordinator name"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="faculty_coordinator_designation"
                className="text-sm"
              >
                Faculty Designation
              </Label>
              <Input
                id="faculty_coordinator_designation"
                value={editForm.faculty_coordinator_designation}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    faculty_coordinator_designation: e.target.value,
                  })
                }
                className="border-neutral-600"
                placeholder="Faculty coordinator designation"
              />
            </div>

            {updateError && (
              <p className="text-sm text-red-400">{updateError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="bg-transparent border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
