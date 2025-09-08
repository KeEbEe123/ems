"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Upload,
  FileText,
  Users,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

export function AfterEventPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 0,
      title: "Event Report Submission",
      description: "Submit detailed event report and summary",
      icon: FileText,
    },
    {
      id: 1,
      title: "Pictures and Videos Upload",
      description: "Upload event media and documentation",
      icon: Upload,
    },
    {
      id: 2,
      title: "Participants Data",
      description: "Review and finalize participant information",
      icon: Users,
    },
    {
      id: 3,
      title: "Overall Feedback",
      description: "Collect and submit event feedback",
      icon: MessageSquare,
    },
  ];

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < steps.length - 1) {
      setCurrentStep(stepId + 1);
    }
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepActive = (stepId: number) => stepId === currentStep;
  const isStepAccessible = (stepId: number) => stepId <= currentStep;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-white text-lg font-medium mb-8">
          Club - Event Dashboard - After Event Page
        </h1>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                        isStepCompleted(step.id)
                          ? "bg-green-500 border-green-500 text-white"
                          : isStepActive(step.id)
                          ? "bg-orange-400 border-orange-400 text-white"
                          : isStepAccessible(step.id)
                          ? "border-gray-400 text-gray-400"
                          : "border-gray-600 text-gray-600"
                      }`}
                    >
                      {isStepCompleted(step.id) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-xs font-medium ${
                          isStepActive(step.id)
                            ? "text-orange-400"
                            : isStepCompleted(step.id)
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-24 mx-4 transition-colors ${
                        isStepCompleted(step.id)
                          ? "bg-green-500"
                          : "bg-gray-600"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Event Report Submission */}
        {isStepAccessible(0) && (
          <Card
            className={`bg-neutral-900 border-neutral-800 ${
              !isStepActive(0) && isStepCompleted(0) ? "opacity-60" : ""
            }`}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Event Report Submission
                {isStepCompleted(0) && (
                  <Badge className="bg-green-500 text-white">Completed</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Provide a comprehensive summary of the event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="event-summary" className="text-white">
                  Event Summary
                </Label>
                <Textarea
                  id="event-summary"
                  placeholder="Describe the overall event experience, key highlights, and outcomes..."
                  className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="attendance" className="text-white">
                    Total Attendance
                  </Label>
                  <Input
                    id="attendance"
                    type="number"
                    placeholder="150"
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="revenue" className="text-white">
                    Total Revenue
                  </Label>
                  <Input
                    id="revenue"
                    type="number"
                    placeholder="₹25,000"
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="challenges" className="text-white">
                  Challenges Faced
                </Label>
                <Textarea
                  id="challenges"
                  placeholder="Describe any challenges encountered and how they were resolved..."
                  className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  rows={3}
                />
              </div>
              {!isStepCompleted(0) && (
                <Button
                  onClick={() => completeStep(0)}
                  className="bg-orange-400 hover:bg-orange-500 text-white"
                >
                  Submit Report
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Pictures and Videos Upload */}
        {isStepAccessible(1) && (
          <Card
            className={`bg-neutral-900 border-neutral-800 ${
              !isStepActive(1) && isStepCompleted(1) ? "opacity-60" : ""
            }`}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Pictures and Videos Upload
                {isStepCompleted(1) && (
                  <Badge className="bg-green-500 text-white">Completed</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Upload event photos, videos, and other media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-gray-400 text-sm">
                  Supports JPG, PNG, MP4, MOV files up to 50MB each
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-neutral-700 text-white hover:bg-neutral-800 bg-transparent"
                >
                  Choose Files
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-neutral-800 rounded">
                  <span className="text-white text-sm">
                    event-highlights.mp4
                  </span>
                  <Badge
                    variant="outline"
                    className="text-green-400 border-green-400"
                  >
                    Uploaded
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-800 rounded">
                  <span className="text-white text-sm">group-photos.zip</span>
                  <Badge
                    variant="outline"
                    className="text-green-400 border-green-400"
                  >
                    Uploaded
                  </Badge>
                </div>
              </div>
              {!isStepCompleted(1) && (
                <Button
                  onClick={() => completeStep(1)}
                  className="bg-orange-400 hover:bg-orange-500 text-white"
                >
                  Confirm Upload
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Participants Data */}
        {isStepAccessible(2) && (
          <Card
            className={`bg-neutral-900 border-neutral-800 ${
              !isStepActive(2) && isStepCompleted(2) ? "opacity-60" : ""
            }`}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants Data
                {isStepCompleted(2) && (
                  <Badge className="bg-green-500 text-white">Completed</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Review and finalize participant information and attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-800 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white">142</p>
                  <p className="text-gray-400 text-sm">Total Registered</p>
                </div>
                <div className="bg-neutral-800 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-400">128</p>
                  <p className="text-gray-400 text-sm">Attended</p>
                </div>
                <div className="bg-neutral-800 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-400">14</p>
                  <p className="text-gray-400 text-sm">No Show</p>
                </div>
              </div>
              <div>
                <Label className="text-white">Additional Notes</Label>
                <Textarea
                  placeholder="Any additional notes about participant attendance or behavior..."
                  className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  rows={3}
                />
              </div>
              {!isStepCompleted(2) && (
                <Button
                  onClick={() => completeStep(2)}
                  className="bg-orange-400 hover:bg-orange-500 text-white"
                >
                  Finalize Data
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Overall Feedback */}
        {isStepAccessible(3) && (
          <Card
            className={`bg-neutral-900 border-neutral-800 ${
              !isStepActive(3) && isStepCompleted(3) ? "opacity-60" : ""
            }`}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Overall Feedback
                {isStepCompleted(3) && (
                  <Badge className="bg-green-500 text-white">Completed</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Collect feedback and suggestions for future events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="success-rating" className="text-white">
                  Event Success Rating (1-10)
                </Label>
                <Input
                  id="success-rating"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="8"
                  className="bg-neutral-800 border-neutral-700 text-white mt-2"
                />
              </div>
              <div>
                <Label htmlFor="improvements" className="text-white">
                  Areas for Improvement
                </Label>
                <Textarea
                  id="improvements"
                  placeholder="What could be improved for future events..."
                  className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="recommendations" className="text-white">
                  Recommendations for Next Event
                </Label>
                <Textarea
                  id="recommendations"
                  placeholder="Suggestions and recommendations for organizing similar events..."
                  className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  rows={4}
                />
              </div>
              {!isStepCompleted(3) && (
                <Button
                  onClick={() => completeStep(3)}
                  className="bg-orange-400 hover:bg-orange-500 text-white"
                >
                  Submit Feedback
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {completedSteps.length === steps.length && (
        <Card className="bg-green-900/20 border-green-500/30 mt-6">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              All Steps Completed!
            </h3>
            <p className="text-gray-300">
              Your after-event process has been successfully completed.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
