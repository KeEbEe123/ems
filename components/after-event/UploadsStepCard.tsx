"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertCircle, X, Image, Video, FileText } from "lucide-react";
import type { FileUploads, ValidationErrors } from "./types";
import React, { RefObject } from "react";

interface UploadsStepCardProps {
  isActive: boolean;
  isCompleted: boolean;
  isSubmitting: boolean;
  fileUploads: FileUploads;
  imageInputRef: RefObject<HTMLInputElement | null>;
  videoInputRef: RefObject<HTMLInputElement | null>;
  reportInputRef: RefObject<HTMLInputElement | null>;
  handleFileUpload: (
    type: "images" | "video" | "report",
    files: FileList | null,
    targetIndex?: number
  ) => void;
  removeFile: (type: "images" | "video" | "report", index?: number) => void;
  validationErrors: ValidationErrors;
  completeStep: (stepId: number) => void;
}

// Helper component for individual image upload box
const ImageUploadBox = ({
  index,
  file,
  onUpload,
  onRemove,
  hasError,
}: {
  index: number;
  file: File | undefined;
  onUpload: () => void;
  onRemove: () => void;
  hasError: boolean;
}) => {
  return (
    <div
      className={`relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center ${
        hasError ? "border-red-500" : "border-neutral-700"
      } hover:border-neutral-600 transition-colors`}
    >
      {file ? (
        <>
          {/* Preview for image files */}
          {file.type.startsWith('image/') ? (
            <div className="relative w-full h-full">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="w-full h-full object-cover rounded-md"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="text-center p-2">
              <Image className="w-6 h-6 mx-auto mb-1 text-green-500" />
              <p className="text-xs text-center break-words">{file.name}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="mt-1 h-6 text-red-400 hover:text-red-300"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-4 cursor-pointer" onClick={onUpload}>
          <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-xs text-gray-400 mb-2">Image {index + 1}</p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-neutral-700 hover:bg-neutral-800 bg-transparent"
          >
            Browse
          </Button>
        </div>
      )}
    </div>
  );
};

export default function UploadsStepCard({
  isActive,
  isCompleted,
  isSubmitting,
  fileUploads,
  imageInputRef,
  videoInputRef,
  reportInputRef,
  handleFileUpload,
  removeFile,
  validationErrors,
  completeStep,
}: UploadsStepCardProps) {
  const [targetImageIndex, setTargetImageIndex] = React.useState<number | undefined>(undefined);

  return (
    <Card
      aria-disabled={!isActive}
      className={`bg-transparent border-neutral-800 ${
        !isActive ? "pointer-events-none" : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Pictures and Videos Upload
          {isCompleted && <Badge className="bg-green-500">Completed</Badge>}
        </CardTitle>
        <CardDescription className="text-gray-400">
          Upload event media and documentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hidden file inputs */}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileUpload("video", e.target.files)}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleFileUpload("images", files, targetImageIndex);
              // Reset input to allow selecting the same file again
              e.target.value = '';
              setTargetImageIndex(undefined);
            }
          }}
          className="hidden"
        />
        <input
          ref={reportInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => handleFileUpload("report", e.target.files)}
          className="hidden"
        />

        {/* Horizontal layout with three sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <Label className="text-sm font-medium">Video</Label>
              <span className="text-xs text-gray-400">(Max 200MB)</span>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center h-40 flex flex-col items-center justify-center ${
                validationErrors.eventVideo
                  ? "border-red-500"
                  : "border-neutral-700"
              } hover:border-neutral-600 transition-colors`}
            >
              {fileUploads.eventVideo ? (
                <div className="text-center">
                  <Video className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-xs text-center break-words px-2">
                    {fileUploads.eventVideo.name}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile("video")}
                    className="mt-2 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                  <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs mb-2">
                    Upload video
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-neutral-700 hover:bg-neutral-800 bg-transparent"
                  >
                    Browse
                  </Button>
                </div>
              )}
            </div>
            {validationErrors.eventVideo && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.eventVideo}
              </p>
            )}
          </div>

          {/* Images Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <Label className="text-sm font-medium">Images *</Label>
              <span className="text-xs text-gray-400">(Max 3, 3MB each)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((index) => (
                <ImageUploadBox
                  key={index}
                  index={index}
                  file={fileUploads.eventImages[index]}
                  onUpload={() => {
                    setTargetImageIndex(index);
                    imageInputRef.current?.click();
                  }}
                  onRemove={() => removeFile("images", index)}
                  hasError={!!validationErrors.eventImages}
                />
              ))}
            </div>
            {validationErrors.eventImages && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.eventImages}
              </p>
            )}
          </div>

          {/* Report Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <Label className="text-sm font-medium">Report *</Label>
              <span className="text-xs text-gray-400">(Max 200KB)</span>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center h-40 flex flex-col items-center justify-center ${
                validationErrors.eventReport
                  ? "border-red-500"
                  : "border-neutral-700"
              } hover:border-neutral-600 transition-colors`}
            >
              {fileUploads.eventReport ? (
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-xs text-center break-words px-2">
                    {fileUploads.eventReport.name}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile("report")}
                    className="mt-2 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="cursor-pointer" onClick={() => reportInputRef.current?.click()}>
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs mb-2">
                    Upload PDF/Word
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-neutral-700 hover:bg-neutral-800 bg-transparent"
                  >
                    Browse
                  </Button>
                </div>
              )}
            </div>
            {validationErrors.eventReport && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.eventReport}
              </p>
            )}
          </div>
        </div>

        {!isCompleted && (
          <Button
            onClick={() => completeStep(1)}
            disabled={!isActive || isSubmitting}
            className="bg-orange-400 hover:bg-orange-500 text-white disabled:opacity-50"
          >
            {isSubmitting ? "Uploading..." : "Confirm Upload"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
