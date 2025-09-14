"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2 } from "lucide-react";
import type { FormData } from "./types";

interface SocialStepCardProps {
  isActive: boolean;
  isCompleted: boolean;
  isSubmitting: boolean;
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  socialMediaChecked: { twitter: boolean; instagram: boolean; linkedin: boolean };
  setSocialMediaChecked: React.Dispatch<React.SetStateAction<{ twitter: boolean; instagram: boolean; linkedin: boolean }>>;
  completeStep: (stepId: number) => void;
}

export default function SocialStepCard({ isActive, isCompleted, isSubmitting, formData, updateFormData, socialMediaChecked, setSocialMediaChecked, completeStep }: SocialStepCardProps) {
  return (
    <Card className={`bg-neutral-900 border-neutral-800 ${!isActive && isCompleted ? "opacity-60" : ""}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Promotion in Social Media
          {isCompleted && <Badge className="bg-green-500 text-white">Completed</Badge>}
        </CardTitle>
        <CardDescription className="text-gray-400">Promote your event success on social media platforms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm mb-4">Promote on any social media</p>

        <div className="border border-neutral-700 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-white font-medium text-center">Social Media</div>
              <div className="text-white font-medium text-center col-span-2">Url</div>
            </div>
          </div>

          <div className="bg-neutral-800">
            <div className="grid grid-cols-3 gap-4 p-3 border-b border-neutral-700">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={socialMediaChecked.twitter}
                  onCheckedChange={(checked) => setSocialMediaChecked((prev) => ({ ...prev, twitter: !!checked }))}
                  className="border-neutral-600"
                />
                <span className="text-white">Twitter</span>
              </div>
              <div className="col-span-2">
                <Input
                  value={formData.twitterUrl}
                  onChange={(e) => updateFormData("twitterUrl", e.target.value)}
                  placeholder="Twitter URL"
                  disabled={!socialMediaChecked.twitter}
                  className="bg-neutral-700 border-neutral-600 text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-3 border-b border-neutral-700">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={socialMediaChecked.instagram}
                  onCheckedChange={(checked) => setSocialMediaChecked((prev) => ({ ...prev, instagram: !!checked }))}
                  className="border-neutral-600"
                />
                <span className="text-white">Instagram</span>
              </div>
              <div className="col-span-2">
                <Input
                  value={formData.instagramUrl}
                  onChange={(e) => updateFormData("instagramUrl", e.target.value)}
                  placeholder="Instagram URL"
                  disabled={!socialMediaChecked.instagram}
                  className="bg-neutral-700 border-neutral-600 text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={socialMediaChecked.linkedin}
                  onCheckedChange={(checked) => setSocialMediaChecked((prev) => ({ ...prev, linkedin: !!checked }))}
                  className="border-neutral-600"
                />
                <span className="text-white">LinkedIn</span>
              </div>
              <div className="col-span-2">
                <Input
                  value={formData.linkedinUrl}
                  onChange={(e) => updateFormData("linkedinUrl", e.target.value)}
                  placeholder="LinkedIn URL"
                  disabled={!socialMediaChecked.linkedin}
                  className="bg-neutral-700 border-neutral-600 text-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        {!isCompleted && (
          <Button onClick={() => completeStep(2)} disabled={isSubmitting} className="bg-orange-400 hover:bg-orange-500 text-white disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Save Promotion Links"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
