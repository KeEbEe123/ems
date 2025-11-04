"use client";

import { Upload, FileText, Share2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/browserClient";
import { toast } from "sonner";
import StepperHeader from "@/components/after-event/StepperHeader";
import ReportStepCard from "@/components/after-event/ReportStepCard";
import UploadsStepCard from "@/components/after-event/UploadsStepCard";
import SocialStepCard from "@/components/after-event/SocialStepCard";
import CompletionCard from "@/components/after-event/CompletionCard";
import { ClubTopBar } from "./ui/club-topbar";

interface FormData {
  programType: string;
  otherProgramType: string;
  programTheme: string;
  duration: number;
  startDate: string;
  endDate: string;
  studentParticipants: number;
  facultyParticipants: number;
  externalParticipants: number;
  expenditure: number;
  remark: string;
  sessionDelivery: string;
  activityLead: string;
  objective: string;
  benefits: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
}

interface FileUploads {
  eventImages: File[];
  videoUrl: string;
  eventReport: File | null;
  permissionLetter: File | null;
}

interface ValidationErrors {
  [key: string]: string;
}

interface AfterEventPageProps {
  eventId: string;
}

export function AfterEventPage({ eventId }: AfterEventPageProps) {
  const { data: session } = useSession();
  const sessionUserId = (session as any)?.user?.id || null;
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [reportId, setReportId] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    programType: "",
    otherProgramType: "",
    programTheme: "",
    duration: 0,
    startDate: "",
    endDate: "",
    studentParticipants: 0,
    facultyParticipants: 0,
    externalParticipants: 0,
    expenditure: 0,
    remark: "",
    sessionDelivery: "",
    activityLead: "",
    objective: "",
    benefits: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
  });

  // File uploads state
  const [fileUploads, setFileUploads] = useState<FileUploads>({
    eventImages: [],
    videoUrl: "",
    eventReport: null,
    permissionLetter: null,
  });

  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);
  const permissionLetterInputRef = useRef<HTMLInputElement>(null);

  // Load existing report to restore progress/state
  useEffect(() => {
    const loadExistingReport = async () => {
      try {
        if (!sessionUserId) return;

        // Fetch the latest report submitted by this user. If your schema adds event_id later, filter by eventId as well.
        const { data, error } = await supabase
          .from("after_event_reports")
          .select("*")
          .eq("submitted_by", sessionUserId)
          .eq("event_id", eventId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error loading existing report:", error);
          return;
        }

        if (data) {
          setReportId(data.id);
          // Restore form data
          setFormData({
            programType: data.program_type || "",
            otherProgramType: data.other_program_type || "",
            programTheme: data.program_theme || "",
            duration: data.duration_hours || 0,
            startDate: data.start_date || "",
            endDate: data.end_date || "",
            studentParticipants: data.student_participants || 0,
            facultyParticipants: data.faculty_participants || 0,
            externalParticipants: data.external_participants || 0,
            expenditure: Number(data.expenditure_amount || 0),
            remark: data.remark || "",
            sessionDelivery: data.session_delivery_mode || "",
            activityLead: data.activity_lead_by || "",
            objective: data.objective || "",
            benefits: data.benefits || "",
            twitterUrl: data.twitter_url || "",
            instagramUrl: data.instagram_url || "",
            linkedinUrl: data.linkedin_url || "",
          });

          // Restore steps based on booleans
          const stepsCompleted: number[] = [];
          if (data.report_submitted) stepsCompleted.push(0);
          if (data.media_uploaded) stepsCompleted.push(1);
          if (data.social_media_promoted) stepsCompleted.push(2);
          setCompletedSteps(stepsCompleted);

          // Set the next active step
          if (!data.report_submitted) setCurrentStep(0);
          else if (!data.media_uploaded) setCurrentStep(1);
          else if (!data.social_media_promoted) setCurrentStep(2);
          else setCurrentStep(2);
        }
      } catch (e) {
        console.error("Unexpected error loading report:", e);
      }
    };

    loadExistingReport();
  }, [eventId, sessionUserId]);

  // Social media checkboxes
  const [socialMediaChecked, setSocialMediaChecked] = useState({
    twitter: false,
    instagram: false,
    linkedin: false,
  });

  // Validation functions
  const validateStep1 = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.programType) errors.programType = "Program type is required";
    if (formData.programType === "other" && !formData.otherProgramType) {
      errors.otherProgramType = "Please specify other program type";
    }
    if (!formData.programTheme)
      errors.programTheme = "Program theme is required";
    if (!formData.duration || formData.duration <= 0)
      errors.duration = "Duration must be greater than 0";
    if (!formData.startDate) errors.startDate = "Start date is required";
    if (!formData.endDate) errors.endDate = "End date is required";
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      errors.endDate = "End date must be after start date";
    }
    if (!formData.studentParticipants || formData.studentParticipants < 50) {
      errors.studentParticipants = "Minimum 50 student participants required";
    }
    if (!formData.facultyParticipants || formData.facultyParticipants < 0) {
      errors.facultyParticipants = "Faculty participants must be 0 or more";
    }
    if (!formData.sessionDelivery)
      errors.sessionDelivery = "Session delivery mode is required";
    if (!formData.activityLead)
      errors.activityLead = "Activity lead is required";
    if (!formData.objective.trim()) errors.objective = "Objective is required";
    if (!formData.benefits.trim())
      errors.benefits = "Benefits description is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: ValidationErrors = {};

    if (fileUploads.eventImages.length === 0) {
      errors.eventImages = "At least one event image is required";
    }
    if (fileUploads.eventImages.length > 3) {
      errors.eventImages = "Maximum 3 images allowed";
    }
    if (!fileUploads.eventReport) {
      errors.eventReport = "Event report is required";
    }
    if (!fileUploads.permissionLetter) {
      errors.permissionLetter = "Permission letter is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // File upload handlers
  const handleFileUpload = (
    type: "images" | "report" | "permissionLetter",
    files: FileList | null,
    targetIndex?: number
  ) => {
    if (!files) return;

    const errors: ValidationErrors = {};

    if (type === "images") {
      const file = files[0]; // Take only the first file
      if (file.size > 3 * 1024 * 1024) {
        errors.eventImages = `Image ${file.name} exceeds 3MB limit`;
        setValidationErrors((prev) => ({ ...prev, ...errors }));
        return;
      }
      if (!file.type.startsWith("image/")) {
        errors.eventImages = `${file.name} is not a valid image file`;
        setValidationErrors((prev) => ({ ...prev, ...errors }));
        return;
      }

      // Add or replace image at specific index
      setFileUploads((prev) => {
        const newImages = [...prev.eventImages];
        if (targetIndex !== undefined) {
          newImages[targetIndex] = file;
        } else {
          // Find first empty slot
          const emptyIndex = newImages.findIndex((img) => !img);
          if (emptyIndex !== -1) {
            newImages[emptyIndex] = file;
          } else if (newImages.length < 3) {
            newImages.push(file);
          }
        }
        return { ...prev, eventImages: newImages };
      });
    } else if (type === "report") {
      const file = files[0];
      if (file.size > 200 * 1024) {
        errors.eventReport = "Report exceeds 200KB limit";
      } else if (
        ![
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type)
      ) {
        errors.eventReport = "Report must be PDF or Word document";
      } else {
        setFileUploads((prev) => ({ ...prev, eventReport: file }));
      }
    } else if (type === "permissionLetter") {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        errors.permissionLetter = "Permission letter exceeds 5MB limit";
      } else if (
        !file.type.startsWith("image/") &&
        file.type !== "application/pdf"
      ) {
        errors.permissionLetter = "Permission letter must be an image or PDF";
      } else {
        setFileUploads((prev) => ({ ...prev, permissionLetter: file }));
      }
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
  };

  const handleVideoUrlChange = (url: string) => {
    setFileUploads((prev) => ({ ...prev, videoUrl: url }));
    // Clear validation error when user starts typing
    if (validationErrors.videoUrl) {
      setValidationErrors((prev) => ({ ...prev, videoUrl: "" }));
    }
  };

  // Sanitize filename for storage
  const sanitizeFilename = (filename: string): string => {
    // Remove special characters and replace with safe alternatives
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace special chars with underscore
      .replace(/_{2,}/g, "_") // Replace multiple underscores with single
      .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
      .toLowerCase();
  };

  // Upload file to Supabase storage using anon key (browser client)
  const uploadFile = async (
    file: File,
    bucket: string,
    path: string
  ): Promise<string> => {
    const sanitizedPath = sanitizeFilename(path);
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(sanitizedPath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });
    if (error) throw error;
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
    if (!pub.publicUrl) throw new Error("Failed to get public URL");
    return pub.publicUrl;
  };

  // Submit form data to database
  const upsertReport = async (fields: Record<string, any>) => {
    if (!sessionUserId) {
      console.error("No user in NextAuth session");
      throw new Error("User not authenticated");
    }

    const payload = {
      ...fields,
      event_id: eventId,
      submitted_by: sessionUserId,
      updated_at: new Date().toISOString(),
    };

    if (reportId) {
      const { error } = await supabase
        .from("after_event_reports")
        .update(payload)
        .eq("id", reportId);
      if (error) throw error;
      return reportId;
    } else {
      const { data, error } = await supabase
        .from("after_event_reports")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      setReportId(data.id);
      return data.id as string;
    }
  };

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
      title: "Promotion in Social Media",
      description: "Share event success on social platforms",
      icon: Share2,
    },
  ];

  const completeStep = async (stepId: number) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (stepId === 0) {
        if (!validateStep1()) {
          setIsSubmitting(false);
          return;
        }
        await upsertReport({
          program_type: formData.programType,
          other_program_type: formData.otherProgramType || null,
          program_theme: formData.programTheme,
          duration_hours: formData.duration,
          start_date: formData.startDate,
          end_date: formData.endDate,
          student_participants: formData.studentParticipants,
          faculty_participants: formData.facultyParticipants,
          external_participants: formData.externalParticipants,
          expenditure_amount: formData.expenditure,
          remark: formData.remark || null,
          session_delivery_mode: formData.sessionDelivery,
          activity_lead_by: formData.activityLead,
          objective: formData.objective,
          benefits: formData.benefits,
          report_submitted: true,
        });
        toast.success("Report saved!");
      } else if (stepId === 1) {
        if (!validateStep2()) {
          setIsSubmitting(false);
          return;
        }
        try {
          // Upload images
          const imageUrls: string[] = [];
          for (let i = 0; i < fileUploads.eventImages.length; i++) {
            const file = fileUploads.eventImages[i];
            const ext = file.name.split(".").pop() || "jpg";
            const path = `${eventId}/image_${Date.now()}_${i}.${ext}`;
            const url = await uploadFile(file, "event-images", path);
            imageUrls.push(url);
          }

          // Upload report (required)
          let reportUrl: string | null = null;
          if (fileUploads.eventReport) {
            const ext = fileUploads.eventReport.name.split(".").pop() || "pdf";
            const path = `${eventId}/report_${Date.now()}.${ext}`;
            reportUrl = await uploadFile(
              fileUploads.eventReport,
              "event-reports",
              path
            );
          }

          // Upload permission letter (required)
          let permissionLetterUrl: string | null = null;
          if (fileUploads.permissionLetter) {
            const ext = fileUploads.permissionLetter.name.split(".").pop() || "pdf";
            const path = `${eventId}/permission_letter_${Date.now()}.${ext}`;
            permissionLetterUrl = await uploadFile(
              fileUploads.permissionLetter,
              "permission-letters",
              path
            );
          }

          // Ensure required uploads exist
          if (imageUrls.length === 0 || !reportUrl || !permissionLetterUrl) {
            toast.error(
              "Upload failed. Please ensure at least one image, a report, and a permission letter are uploaded."
            );
            setIsSubmitting(false);
            return;
          }

          await upsertReport({
            event_images: imageUrls,
            video_url: fileUploads.videoUrl || null,
            event_report: reportUrl,
            permission_letter: permissionLetterUrl,
            media_uploaded: true,
          });

          toast.success("Files uploaded and saved!");
        } catch (err) {
          console.error("Upload/save failed:", err);
          toast.error("Upload failed. Please try again.");
          setIsSubmitting(false);
          return;
        }
      } else if (stepId === 2) {
        await upsertReport({
          twitter_url: formData.twitterUrl || null,
          instagram_url: formData.instagramUrl || null,
          linkedin_url: formData.linkedinUrl || null,
          social_media_promoted: !!(
            formData.twitterUrl ||
            formData.instagramUrl ||
            formData.linkedinUrl
          ),
        });
        toast.success("Social media links saved!");
      }

      if (!completedSteps.includes(stepId)) {
        setCompletedSteps([...completedSteps, stepId]);
      }
      if (stepId < steps.length - 1) {
        setCurrentStep(stepId + 1);
      }
    } catch (error) {
      console.error("Error completing step:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const removeFile = (type: "images" | "report" | "permissionLetter", index?: number) => {
    if (type === "images" && typeof index === "number") {
      setFileUploads((prev) => ({
        ...prev,
        eventImages: prev.eventImages.filter((_, i) => i !== index),
      }));
    } else if (type === "report") {
      setFileUploads((prev) => ({ ...prev, eventReport: null }));
    } else if (type === "permissionLetter") {
      setFileUploads((prev) => ({ ...prev, permissionLetter: null }));
    }
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepActive = (stepId: number) => stepId === currentStep;
  const isStepAccessible = (stepId: number) => stepId <= currentStep;

  return (
    <div className="bg-white dark:bg-neutral-950">
      {/* Sticky Header Section */}
      <div className="sticky top-18 z-40 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
        <div className="px-2 pt-4">
          <StepperHeader
            steps={steps}
            isStepCompleted={isStepCompleted}
            isStepActive={isStepActive}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6 bg-transparent">
        <ReportStepCard
          isActive={isStepActive(0)}
          isCompleted={isStepCompleted(0)}
          formData={formData}
          updateFormData={updateFormData}
          validationErrors={validationErrors}
          isSubmitting={isSubmitting}
          completeStep={completeStep}
        />

        <UploadsStepCard
          isActive={isStepActive(1)}
          isCompleted={isStepCompleted(1)}
          isSubmitting={isSubmitting}
          fileUploads={fileUploads}
          imageInputRef={imageInputRef}
          reportInputRef={reportInputRef}
          permissionLetterInputRef={permissionLetterInputRef}
          handleFileUpload={handleFileUpload}
          handleVideoUrlChange={handleVideoUrlChange}
          removeFile={removeFile}
          validationErrors={validationErrors}
          completeStep={completeStep}
        />

        <SocialStepCard
          isActive={isStepActive(2)}
          isCompleted={isStepCompleted(2)}
          isSubmitting={isSubmitting}
          formData={formData}
          updateFormData={updateFormData}
          socialMediaChecked={socialMediaChecked}
          setSocialMediaChecked={setSocialMediaChecked}
          completeStep={completeStep}
        />
      </div>

      {completedSteps.length === steps.length && <CompletionCard />}
    </div>
  );
}
