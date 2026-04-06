// components/BackButton.tsx
import { Button } from "antd";
import { ArrowLeft } from "lucide-react";
import { useStep } from "../hooks/useStep";

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function BackButton({
  label = "Back",
  onClick,
  disabled,
  className,
}: BackButtonProps) {
  const { goPrev, current } = useStep();

  return (
    <Button
      icon={<ArrowLeft size={16} />}
      disabled={disabled ?? current === 1}
      onClick={onClick ?? goPrev}
      className={`border border-borderer text-primary bg-white 
      hover:!bg-secondary hover:!text-white hover:!border-secondary ${className}`}
    >
      {label}
    </Button>
  );
}
