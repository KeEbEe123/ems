"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export function UserProfile() {
  const [profileData, setProfileData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = () => {
    console.log("[v0] Updating profile:", profileData);
    // Handle profile update logic here
  };

  const handleImageEdit = () => {
    console.log("[v0] Edit image clicked");
    // Handle image upload logic here
  };

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">
          Club - Event Dashboard - User Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {/* Left Side - Username Section */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-white text-2xl font-semibold mb-2">
                Username
              </h2>
              <p className="text-neutral-400 text-lg">Student</p>
            </div>

            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src="/professional-profile.png" alt="Profile" />
                <AvatarFallback className="bg-neutral-700 text-white text-2xl">
                  U
                </AvatarFallback>
              </Avatar>
            </div>

            <Button
              variant="ghost"
              onClick={handleImageEdit}
              className="text-blue-400 hover:text-blue-300 hover:bg-neutral-800 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Edit Image
            </Button>
          </CardContent>
        </Card>

        {/* Right Side - Profile Details */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-8">
            <h2 className="text-white text-2xl font-semibold mb-6">
              Profile Details
            </h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="firstname" className="text-white mb-2 block">
                  Firstname
                </Label>
                <div className="relative">
                  <Input
                    id="firstname"
                    value={profileData.firstname}
                    onChange={(e) =>
                      handleInputChange("firstname", e.target.value)
                    }
                    className="bg-neutral-800 border-2 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 p-[2px] rounded-lg"
                    style={{
                      background:
                        "linear-gradient(90deg, #3b82f6, #8b5cf6) padding-box, linear-gradient(90deg, #3b82f6, #8b5cf6) border-box",
                      border: "2px solid transparent",
                    }}
                  />
                  <div className="absolute inset-[2px] bg-neutral-800 rounded-md">
                    <input
                      type="text"
                      value={profileData.firstname}
                      onChange={(e) =>
                        handleInputChange("firstname", e.target.value)
                      }
                      className="w-full h-full bg-transparent text-white px-3 py-2 rounded-md outline-none placeholder:text-neutral-400"
                      placeholder="Enter firstname"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="lastname" className="text-white mb-2 block">
                  Lastname
                </Label>
                <div className="relative">
                  <div
                    className="rounded-lg p-[2px]"
                    style={{
                      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                    }}
                  >
                    <input
                      type="text"
                      value={profileData.lastname}
                      onChange={(e) =>
                        handleInputChange("lastname", e.target.value)
                      }
                      className="w-full bg-neutral-800 text-white px-3 py-2 rounded-md outline-none placeholder:text-neutral-400"
                      placeholder="Enter lastname"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-white mb-2 block">
                  Email
                </Label>
                <div className="relative">
                  <div
                    className="rounded-lg p-[2px]"
                    style={{
                      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                    }}
                  >
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full bg-neutral-800 text-white px-3 py-2 rounded-md outline-none placeholder:text-neutral-400"
                      placeholder="Enter email"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-white mb-2 block">
                  Phone no.
                </Label>
                <div className="relative">
                  <div
                    className="rounded-lg p-[2px]"
                    style={{
                      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                    }}
                  >
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full bg-neutral-800 text-white px-3 py-2 rounded-md outline-none placeholder:text-neutral-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleUpdate}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2 rounded-lg font-medium"
                >
                  Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
