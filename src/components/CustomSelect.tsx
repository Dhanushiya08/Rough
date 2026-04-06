import { Select } from "antd";
import type { SelectProps } from "antd";

type Props = {
  label: string;
  placeholder?: string;
  options: SelectProps["options"];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export default function CustomSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: Props) {
  return (
    <div>
      <p className="text-[10px] text-primary mb-1 font-semibold">{label}</p>

      <Select
        placeholder={placeholder}
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
}
