// components/ForwardButton.tsx
import { Button } from "antd";
import { ArrowRight } from "lucide-react";
import { useStep } from "../hooks/useStep";

interface ForwardButtonProps {
  label?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function ForwardButton({
  label = "Next",
  onClick,
  loading,
  disabled,
  className,
}: ForwardButtonProps) {
  const { goNext, current, totalSteps } = useStep();

  return (
    <Button
      type="primary"
      icon={label !== "Update" && <ArrowRight size={16} />}
      iconPlacement="end"
      loading={loading}
      disabled={disabled ?? current === totalSteps}
      onClick={onClick ?? goNext}
      className={`bg-primary hover:!bg-secondary px-6 ${className}`}
    >
      {label}
    </Button>
  );
}
