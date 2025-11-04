import type { LucideIcon } from "lucide-react";

export interface FormData {
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

export interface FileUploads {
  eventImages: File[];
  videoUrl: string;
  eventReport: File | null;
  permissionLetter: File | null;
}

export type ValidationErrors = Record<string, string>;

export interface StepConfig {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}
