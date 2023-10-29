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
    <div className="flex items-center gap-2 pl-4">
      <Checkbox id={id} onCheckedChange={onCheckedChange} />
      {label && (
        <Label htmlFor={id} className="text-sm text-neutral-900">
          {label}
        </Label>
      )}
    </div>
  );
};
