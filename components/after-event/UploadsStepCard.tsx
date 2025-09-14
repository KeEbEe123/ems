"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertCircle, X } from "lucide-react";
import type { FileUploads, ValidationErrors } from "./types";
import { RefObject } from "react";

interface UploadsStepCardProps {
  isActive: boolean;
  isCompleted: boolean;
  isSubmitting: boolean;
  fileUploads: FileUploads;
  imageInputRef: RefObject<HTMLInputElement | null>;
  videoInputRef: RefObject<HTMLInputElement | null>;
  reportInputRef: RefObject<HTMLInputElement | null>;
  handleFileUpload: (type: "images" | "video" | "report", files: FileList | null) => void;
  removeFile: (type: "images" | "video" | "report", index?: number) => void;
  validationErrors: ValidationErrors;
  completeStep: (stepId: number) => void;
}

export default function UploadsStepCard({ isActive, isCompleted, isSubmitting, fileUploads, imageInputRef, videoInputRef, reportInputRef, handleFileUpload, removeFile, validationErrors, completeStep }: UploadsStepCardProps) {
  return (
    <Card className={`bg-neutral-900 border-neutral-800 ${!isActive && isCompleted ? "opacity-60" : ""}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Pictures and Videos Upload
          {isCompleted && <Badge className="bg-green-500 text-white">Completed</Badge>}
        </CardTitle>
        <CardDescription className="text-gray-400">Upload event media and documentation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label className="text-white">Videos/url (Max 200MB)</Label>
            <input ref={videoInputRef} type="file" accept="video/*" onChange={(e) => handleFileUpload("video", e.target.files)} className="hidden" />
            <div className={`border-2 border-dashed rounded-lg p-4 text-center mt-2 ${validationErrors.eventVideo ? "border-red-500" : "border-neutral-700"}`}>
              {fileUploads.eventVideo ? (
                <div className="flex items-center justify-between bg-neutral-800 p-2 rounded">
                  <span className="text-white text-sm">{fileUploads.eventVideo.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeFile("video")} className="text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Choose video file or drag and drop</p>
                  <Button variant="outline" onClick={() => videoInputRef.current?.click()} className="mt-2 border-neutral-700 text-white hover:bg-neutral-800 bg-transparent text-xs">
                    Browse
                  </Button>
                </>
              )}
            </div>
            {validationErrors.eventVideo && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.eventVideo}
              </p>
            )}
          </div>

          <div>
            <Label className="text-white">Photographs * (Max 3 images, 3MB each)</Label>
            <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFileUpload("images", e.target.files)} className="hidden" />
            <div className={`border-2 border-dashed rounded-lg p-4 text-center mt-2 ${validationErrors.eventImages ? "border-red-500" : "border-neutral-700"}`}>
              {fileUploads.eventImages.length > 0 ? (
                <div className="space-y-2">
                  {fileUploads.eventImages.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-neutral-800 p-2 rounded">
                      <span className="text-white text-sm">{file.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeFile("images", index)} className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {fileUploads.eventImages.length < 3 && (
                    <Button variant="outline" onClick={() => imageInputRef.current?.click()} className="mt-2 border-neutral-700 text-white hover:bg-neutral-800 bg-transparent text-xs">
                      Add More Images
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Choose image files or drag and drop</p>
                  <Button variant="outline" onClick={() => imageInputRef.current?.click()} className="mt-2 border-neutral-700 text-white hover:bg-neutral-800 bg-transparent text-xs">
                    Browse
                  </Button>
                </>
              )}
            </div>
            {validationErrors.eventImages && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.eventImages}
              </p>
            )}
          </div>

          <div>
            <Label className="text-white">Upload Report (Word/PDF only) * (Max 200KB)</Label>
            <input
              ref={reportInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => handleFileUpload("report", e.target.files)}
              className="hidden"
            />
            <div className={`border-2 border-dashed rounded-lg p-4 text-center mt-2 ${validationErrors.eventReport ? "border-red-500" : "border-neutral-700"}`}>
              {fileUploads.eventReport ? (
                <div className="flex items-center justify-between bg-neutral-800 p-2 rounded">
                  <span className="text-white text-sm">{fileUploads.eventReport.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeFile("report")} className="text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Choose PDF or Word document</p>
                  <Button variant="outline" onClick={() => reportInputRef.current?.click()} className="mt-2 border-neutral-700 text-white hover:bg-neutral-800 bg-transparent text-xs">
                    Browse
                  </Button>
                </>
              )}
            </div>
            {validationErrors.eventReport && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.eventReport}
              </p>
            )}
          </div>
        </div>

        {!isCompleted && (
          <Button onClick={() => completeStep(1)} disabled={isSubmitting} className="bg-orange-400 hover:bg-orange-500 text-white disabled:opacity-50">
            {isSubmitting ? "Uploading..." : "Confirm Upload"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
