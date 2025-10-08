"use client";

import { StepConfig } from "./types";
import { Progress } from "@/components/ui/progress"; // your shadcn Progress

interface StepperHeaderProps {
  steps: StepConfig[];
  isStepCompleted: (stepId: number) => boolean;
  isStepActive: (stepId: number) => boolean;
}

export default function StepperHeader({
  steps,
  isStepCompleted,
  isStepActive,
}: StepperHeaderProps) {
  // Find the active step
  const activeStep = steps.find((step) => isStepActive(step.id));
  const completedCount = steps.filter((step) =>
    isStepCompleted(step.id)
  ).length;

  // Calculate progress as %
  const denominator = Math.max(1, steps.length - 1);
  const progressValue = Math.min(100, (completedCount / denominator) * 100);

  return (
    <div className="mb-8">
      {/* Active Step Title */}
      <div className="mb-2 text-center">
        <p className="text-sm font-semibold">
          {activeStep ? activeStep.title : steps[0].title}
        </p>
      </div>

      {/* Progress bar */}
      <Progress value={progressValue} />
    </div>
  );
}
