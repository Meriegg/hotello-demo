"use client";

import { useId } from "react";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

interface Props {
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export const FilterCheckbox = ({ onCheckedChange, label }: Props) => {
  const id = useId();

  return (
    <div className="flex items-center gap-1">
      <Checkbox id={id} onCheckedChange={onCheckedChange} />
      {label && <Label htmlFor={id}>{label}</Label>}
    </div>
  );
};
