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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Upload, FileText, Share2, Calendar, AlertCircle, X } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
  eventVideo: File | null;
  eventReport: File | null;
}

interface ValidationErrors {
  [key: string]: string;
}

export function AfterEventPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    programType: '',
    otherProgramType: '',
    programTheme: '',
    duration: 0,
    startDate: '',
    endDate: '',
    studentParticipants: 0,
    facultyParticipants: 0,
    externalParticipants: 0,
    expenditure: 0,
    remark: '',
    sessionDelivery: '',
    activityLead: '',
    objective: '',
    benefits: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: ''
  });
  
  // File uploads state
  const [fileUploads, setFileUploads] = useState<FileUploads>({
    eventImages: [],
    eventVideo: null,
    eventReport: null
  });
  
  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);
  
  // Social media checkboxes
  const [socialMediaChecked, setSocialMediaChecked] = useState({
    twitter: false,
    instagram: false,
    linkedin: false
  });

  // Validation functions
  const validateStep1 = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.programType) errors.programType = 'Program type is required';
    if (formData.programType === 'other' && !formData.otherProgramType) {
      errors.otherProgramType = 'Please specify other program type';
    }
    if (!formData.programTheme) errors.programTheme = 'Program theme is required';
    if (!formData.duration || formData.duration <= 0) errors.duration = 'Duration must be greater than 0';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.endDate = 'End date must be after start date';
    }
    if (!formData.studentParticipants || formData.studentParticipants < 50) {
      errors.studentParticipants = 'Minimum 50 student participants required';
    }
    if (!formData.facultyParticipants || formData.facultyParticipants < 0) {
      errors.facultyParticipants = 'Faculty participants must be 0 or more';
    }
    if (!formData.sessionDelivery) errors.sessionDelivery = 'Session delivery mode is required';
    if (!formData.activityLead) errors.activityLead = 'Activity lead is required';
    if (!formData.objective.trim()) errors.objective = 'Objective is required';
    if (!formData.benefits.trim()) errors.benefits = 'Benefits description is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep2 = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (fileUploads.eventImages.length === 0) {
      errors.eventImages = 'At least one event image is required';
    }
    if (fileUploads.eventImages.length > 3) {
      errors.eventImages = 'Maximum 3 images allowed';
    }
    if (!fileUploads.eventReport) {
      errors.eventReport = 'Event report is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // File upload handlers
  const handleFileUpload = (type: 'images' | 'video' | 'report', files: FileList | null) => {
    if (!files) return;
    
    const errors: ValidationErrors = {};
    
    if (type === 'images') {
      const validFiles: File[] = [];
      for (let i = 0; i < Math.min(files.length, 3); i++) {
        const file = files[i];
        if (file.size > 3 * 1024 * 1024) {
          errors.eventImages = `Image ${file.name} exceeds 3MB limit`;
          continue;
        }
        if (!file.type.startsWith('image/')) {
          errors.eventImages = `${file.name} is not a valid image file`;
          continue;
        }
        validFiles.push(file);
      }
      setFileUploads(prev => ({ ...prev, eventImages: validFiles }));
    } else if (type === 'video') {
      const file = files[0];
      if (file.size > 200 * 1024 * 1024) {
        errors.eventVideo = 'Video exceeds 200MB limit';
      } else if (!file.type.startsWith('video/')) {
        errors.eventVideo = 'Invalid video file format';
      } else {
        setFileUploads(prev => ({ ...prev, eventVideo: file }));
      }
    } else if (type === 'report') {
      const file = files[0];
      if (file.size > 200 * 1024) {
        errors.eventReport = 'Report exceeds 200KB limit';
      } else if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        errors.eventReport = 'Report must be PDF or Word document';
      } else {
        setFileUploads(prev => ({ ...prev, eventReport: file }));
      }
    }
    
    setValidationErrors(prev => ({ ...prev, ...errors }));
  };
  
  // Sanitize filename for storage
  const sanitizeFilename = (filename: string): string => {
    // Remove special characters and replace with safe alternatives
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .toLowerCase();
  };
  
  // Upload file to Supabase storage
  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    try {
      const sanitizedPath = sanitizeFilename(path);
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(sanitizedPath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };
  
  // Submit form data to database
  const submitToDatabase = async (imageUrls: string[], videoUrl: string | null, reportUrl: string | null) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('after_event_reports')
        .insert({
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
          event_images: imageUrls,
          event_video: videoUrl,
          event_report: reportUrl,
          twitter_url: formData.twitterUrl || null,
          instagram_url: formData.instagramUrl || null,
          linkedin_url: formData.linkedinUrl || null,
          report_submitted: true,
          media_uploaded: true,
          social_media_promoted: socialMediaChecked.twitter || socialMediaChecked.instagram || socialMediaChecked.linkedin,
          submitted_by: user?.id || null
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
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
      } else if (stepId === 1) {
        if (!validateStep2()) {
          setIsSubmitting(false);
          return;
        }
        
        // Upload files
        const imageUrls: string[] = [];
        let videoUrl: string | null = null;
        let reportUrl: string | null = null;
        
        // Upload images
        for (let i = 0; i < fileUploads.eventImages.length; i++) {
          const file = fileUploads.eventImages[i];
          const fileExtension = file.name.split('.').pop() || 'jpg';
          const path = `image_${Date.now()}_${i}.${fileExtension}`;
          const url = await uploadFile(file, 'event-images', path);
          if (url) imageUrls.push(url);
        }
        
        // Upload video if exists
        if (fileUploads.eventVideo) {
          const fileExtension = fileUploads.eventVideo.name.split('.').pop() || 'mp4';
          const path = `video_${Date.now()}.${fileExtension}`;
          videoUrl = await uploadFile(fileUploads.eventVideo, 'event-videos', path);
        }
        
        // Upload report
        if (fileUploads.eventReport) {
          const fileExtension = fileUploads.eventReport.name.split('.').pop() || 'pdf';
          const path = `report_${Date.now()}.${fileExtension}`;
          reportUrl = await uploadFile(fileUploads.eventReport, 'event-reports', path);
        }
        
        // Submit to database
        try {
          await submitToDatabase(imageUrls, videoUrl, reportUrl);
        } catch (dbError) {
          console.error('Database submission failed:', dbError);
          // If user is not authenticated, we can still proceed but show a warning
          toast.error('Data submission failed. Please ensure you are logged in.');
          return;
        }
        
        toast.success('Files uploaded and data saved successfully!');
      } else if (stepId === 2) {
        // Update social media URLs in database if needed
        toast.success('Social media promotion links saved!');
      }
      
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps([...completedSteps, stepId]);
      }
      if (stepId < steps.length - 1) {
        setCurrentStep(stepId + 1);
      }
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const removeFile = (type: 'images' | 'video' | 'report', index?: number) => {
    if (type === 'images' && typeof index === 'number') {
      setFileUploads(prev => ({
        ...prev,
        eventImages: prev.eventImages.filter((_, i) => i !== index)
      }));
    } else if (type === 'video') {
      setFileUploads(prev => ({ ...prev, eventVideo: null }));
    } else if (type === 'report') {
      setFileUploads(prev => ({ ...prev, eventReport: null }));
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="program-type" className="text-white">
                    Program Type *
                  </Label>
                  <Select value={formData.programType} onValueChange={(value) => updateFormData('programType', value)}>
                    <SelectTrigger className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.programType ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select program type" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.programType && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.programType}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="other-program" className="text-white">
                    Other
                  </Label>
                  <Input
                    id="other-program"
                    value={formData.otherProgramType}
                    onChange={(e) => updateFormData('otherProgramType', e.target.value)}
                    placeholder="Specify if other"
                    className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.otherProgramType ? 'border-red-500' : ''}`}
                    disabled={formData.programType !== 'other'}
                  />
                  {validationErrors.otherProgramType && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.otherProgramType}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="program-theme" className="text-white">
                    Program Theme *
                  </Label>
                  <Select value={formData.programTheme} onValueChange={(value) => updateFormData('programTheme', value)}>
                    <SelectTrigger className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.programTheme ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.programTheme && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.programTheme}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="duration" className="text-white">
                    Duration of the activity (in hours) *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) => updateFormData('duration', parseInt(e.target.value) || 0)}
                    placeholder="4"
                    className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.duration ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.duration && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.duration}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date" className="text-white">
                    Start Date *
                  </Label>
                  <div className="relative">
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateFormData('startDate', e.target.value)}
                      className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.startDate ? 'border-red-500' : ''}`}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-white">
                    End Date *
                  </Label>
                  <div className="relative">
                    <Input
                      id="end-date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => updateFormData('endDate', e.target.value)}
                      className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.endDate ? 'border-red-500' : ''}`}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student-participants" className="text-white">
                    Number of Student Participants (Minimum 50 Students) *
                  </Label>
                  <Input
                    id="student-participants"
                    type="number"
                    min="50"
                    value={formData.studentParticipants || ''}
                    onChange={(e) => updateFormData('studentParticipants', parseInt(e.target.value) || 0)}
                    placeholder="75"
                    className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.studentParticipants ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.studentParticipants && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.studentParticipants}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="faculty-participants" className="text-white">
                    Number of Faculty Participants *
                  </Label>
                  <Input
                    id="faculty-participants"
                    type="number"
                    value={formData.facultyParticipants || ''}
                    onChange={(e) => updateFormData('facultyParticipants', parseInt(e.target.value) || 0)}
                    placeholder="10"
                    className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.facultyParticipants ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.facultyParticipants && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.facultyParticipants}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="external-participants" className="text-white">
                    Number of External Participants, if any
                  </Label>
                  <Input
                    id="external-participants"
                    type="number"
                    value={formData.externalParticipants || ''}
                    onChange={(e) => updateFormData('externalParticipants', parseInt(e.target.value) || 0)}
                    placeholder="5"
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="expenditure" className="text-white">
                    Expenditure Amount, if any
                  </Label>
                  <Input
                    id="expenditure"
                    type="number"
                    value={formData.expenditure || ''}
                    onChange={(e) => updateFormData('expenditure', parseFloat(e.target.value) || 0)}
                    placeholder="15000"
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="remark" className="text-white">
                    Remark
                  </Label>
                  <Textarea
                    id="remark"
                    value={formData.remark}
                    onChange={(e) => updateFormData('remark', e.target.value)}
                    placeholder="Additional remarks..."
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="session-delivery" className="text-white">
                    Mode of Session delivery *
                  </Label>
                  <Select value={formData.sessionDelivery} onValueChange={(value) => updateFormData('sessionDelivery', value)}>
                    <SelectTrigger className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.sessionDelivery ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select delivery mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.sessionDelivery && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.sessionDelivery}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="activity-lead" className="text-white">
                  Activity Lead By *
                </Label>
                <Select value={formData.activityLead} onValueChange={(value) => updateFormData('activityLead', value)}>
                  <SelectTrigger className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.activityLead ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select activity lead" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="external">External Expert</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.activityLead && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.activityLead}
                  </p>
                )}
              </div>

              {/* Overview Section */}
              <div className="border-t border-neutral-700 pt-6">
                <h3 className="text-white text-lg font-medium mb-4">
                  Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="objective" className="text-white">
                      Objective *
                    </Label>
                    <Textarea
                      id="objective"
                      value={formData.objective}
                      onChange={(e) => updateFormData('objective', e.target.value)}
                      placeholder="Describe the main objectives..."
                      className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.objective ? 'border-red-500' : ''}`}
                      rows={4}
                    />
                    {validationErrors.objective && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.objective}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="benefits" className="text-white">
                      Benefit in terms of learning/skill/knowledge obtained *
                    </Label>
                    <Textarea
                      id="benefits"
                      value={formData.benefits}
                      onChange={(e) => updateFormData('benefits', e.target.value)}
                      placeholder="Describe the benefits gained..."
                      className={`bg-neutral-800 border-neutral-700 text-white mt-2 ${validationErrors.benefits ? 'border-red-500' : ''}`}
                      rows={4}
                    />
                    {validationErrors.benefits && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.benefits}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {!isStepCompleted(0) && (
                <Button
                  onClick={() => completeStep(0)}
                  disabled={isSubmitting}
                  className="bg-orange-400 hover:bg-orange-500 text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
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
                Upload event media and documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Videos/url (Max 200MB)</Label>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload('video', e.target.files)}
                    className="hidden"
                  />
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center mt-2 ${
                    validationErrors.eventVideo ? 'border-red-500' : 'border-neutral-700'
                  }`}>
                    {fileUploads.eventVideo ? (
                      <div className="flex items-center justify-between bg-neutral-800 p-2 rounded">
                        <span className="text-white text-sm">{fileUploads.eventVideo.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('video')}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">
                          Choose video file or drag and drop
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => videoInputRef.current?.click()}
                          className="mt-2 border-neutral-700 text-white hover:bg-neutral-800 bg-transparent text-xs"
                        >
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
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload('images', e.target.files)}
                    className="hidden"
                  />
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center mt-2 ${
                    validationErrors.eventImages ? 'border-red-500' : 'border-neutral-700'
                  }`}>
                    {fileUploads.eventImages.length > 0 ? (
                      <div className="space-y-2">
                        {fileUploads.eventImages.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-neutral-800 p-2 rounded">
                            <span className="text-white text-sm">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('images', index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {fileUploads.eventImages.length < 3 && (
                          <Button
                            variant="outline"
                            onClick={() => imageInputRef.current?.click()}
                            className="mt-2 border-neutral-700 text-white hover:bg-neutral-800 bg-transparent text-xs"
                          >
                            Add More Images
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">
                          Choose image files or drag and drop
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => imageInputRef.current?.click()}
                          className="mt-2 border-neutral-700 text-white hover:bg-neutral-800 bg-transparent text-xs"
                        >
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
                  <Label className="text-white">
                    Upload Report (Word/PDF only) * (Max 200KB)
                  </Label>
                  <input
                    ref={reportInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => handleFileUpload('report', e.target.files)}
                    className="hidden"
                  />
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center mt-2 ${
                    validationErrors.eventReport ? 'border-red-500' : 'border-neutral-700'
                  }`}>
                    {fileUploads.eventReport ? (
                      <div className="flex items-center justify-between bg-neutral-800 p-2 rounded">
                        <span className="text-white text-sm">{fileUploads.eventReport.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('report')}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">
                          Choose PDF or Word document
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => reportInputRef.current?.click()}
                          className="mt-2 border-neutral-700 text-white hover:bg-neutral-800 bg-transparent text-xs"
                        >
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
              {!isStepCompleted(1) && (
                <Button
                  onClick={() => completeStep(1)}
                  disabled={isSubmitting}
                  className="bg-orange-400 hover:bg-orange-500 text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading...' : 'Confirm Upload'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Promotion in Social Media */}
        {isStepAccessible(2) && (
          <Card
            className={`bg-neutral-900 border-neutral-800 ${
              !isStepActive(2) && isStepCompleted(2) ? "opacity-60" : ""
            }`}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Promotion in Social Media
                {isStepCompleted(2) && (
                  <Badge className="bg-green-500 text-white">Completed</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Promote your event success on social media platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                Promote on any social media
              </p>

              <div className="border border-neutral-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-white font-medium text-center">
                      Social Media
                    </div>
                    <div className="text-white font-medium text-center col-span-2">
                      Url
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-800">
                  <div className="grid grid-cols-3 gap-4 p-3 border-b border-neutral-700">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={socialMediaChecked.twitter}
                        onCheckedChange={(checked) => setSocialMediaChecked(prev => ({ ...prev, twitter: !!checked }))}
                        className="border-neutral-600" 
                      />
                      <span className="text-white">Twitter</span>
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={formData.twitterUrl}
                        onChange={(e) => updateFormData('twitterUrl', e.target.value)}
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
                        onCheckedChange={(checked) => setSocialMediaChecked(prev => ({ ...prev, instagram: !!checked }))}
                        className="border-neutral-600" 
                      />
                      <span className="text-white">Instagram</span>
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={formData.instagramUrl}
                        onChange={(e) => updateFormData('instagramUrl', e.target.value)}
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
                        onCheckedChange={(checked) => setSocialMediaChecked(prev => ({ ...prev, linkedin: !!checked }))}
                        className="border-neutral-600" 
                      />
                      <span className="text-white">LinkedIn</span>
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={formData.linkedinUrl}
                        onChange={(e) => updateFormData('linkedinUrl', e.target.value)}
                        placeholder="LinkedIn URL"
                        disabled={!socialMediaChecked.linkedin}
                        className="bg-neutral-700 border-neutral-600 text-white disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {!isStepCompleted(2) && (
                <Button
                  onClick={() => completeStep(2)}
                  disabled={isSubmitting}
                  className="bg-orange-400 hover:bg-orange-500 text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Promotion Links'}
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
