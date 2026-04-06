// components/StepNavButtons.tsx
import { Button } from "antd";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useStep } from "../hooks/useStep";

interface StepNavButtonsProps {
  backLabel?: string; // default: "Back"
  forwardLabel?: string; // e.g. "Look Up" | "Fetch SAP Data"
  onBack?: () => void; // override default goPrev
  onForward?: () => void; // override default goNext
  hideBack?: boolean;
  hideForward?: boolean;
  forwardLoading?: boolean;
  className?: string;
}

export default function StepNavButtons({
  backLabel = "Back",
  forwardLabel = "Next",
  onBack,
  onForward,
  hideBack,
  hideForward,
  forwardLoading,
  className,
}: StepNavButtonsProps) {
  const { goPrev, goNext, current, totalSteps } = useStep();

  return (
    <div
      className={`p-4 border-t bg-stepbgbody flex justify-between items-center ${className}`}
    >
      {!hideBack && (
        <Button
          icon={<ArrowLeft size={16} />}
          disabled={current === 1}
          onClick={onBack ?? goPrev}
          className="border border-borderer text-primary bg-white
            hover:!bg-secondary hover:!text-white hover:!border-secondary"
        >
          {backLabel}
        </Button>
      )}

      {!hideForward && (
        <Button
          type="primary"
          icon={<ArrowRight size={16} />}
          iconPlacement="end"
          disabled={current === totalSteps}
          loading={forwardLoading}
          onClick={onForward ?? goNext}
          className="bg-primary hover:!bg-secondary px-6"
        >
          {forwardLabel}
        </Button>
      )}
    </div>
  );
}
