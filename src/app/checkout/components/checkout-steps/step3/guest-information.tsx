import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Room } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { CheckoutFormValidator } from "~/lib/zod/checkout-form";

const GIFormDisplay = (
  {
    firstNameValue,
    firstNameChange,
    lastNameValue,
    lastNameChange,
    ageValue,
    ageChange,
    index,
  }: {
    firstNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
    lastNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
    ageChange: (e: ChangeEvent<HTMLInputElement>) => void;
    firstNameValue: string;
    lastNameValue: string;
    ageValue: string | number;
    index: number;
  },
) => {
  const [isEditing, setEditing] = useState(true);

  return (
    <div
      className={cn("flex gap-2 w-full", !isEditing ? "flex-row" : "flex-col")}
    >
      <p className="text-xs italic text-neutral-700">#{index + 1}</p>
      {!isEditing && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-neutral-900">
            {firstNameValue || "(No first name)"}{" "}
            {lastNameValue || "(No last name)"}
          </p>
          <div className="text-xs flex items-center gap-2">
            <p className="text-neutral-900">Age {ageValue || "(No age)"}</p>
            <button
              className="italic text-red-400 hover:underline"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          </div>
        </div>
      )}
      {isEditing && (
        <>
          <div className="flex items-center gap-2 w-full px-0">
            <Input
              label="First name"
              value={firstNameValue}
              containerClassName="w-full"
              onChange={firstNameChange}
            />
            <Input
              label="Last name"
              value={lastNameValue}
              containerClassName="w-full"
              onChange={lastNameChange}
            />
          </div>
          <div className="flex items-center gap-2 w-full px-0">
            <Input
              label="Age"
              type="number"
              pattern="[0-9]"
              value={ageValue}
              className="flex-1"
              onChange={ageChange}
            />
            <Button className="flex-1" onClick={() => setEditing(false)}>
              Enter
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const GuestInformationFormItem = (
  { form, item }: {
    item: Room;
    form: UseFormReturn<z.infer<typeof CheckoutFormValidator>>;
  },
) => {
  const [parentRef] = useAutoAnimate();
  const [isFormOpen, setFormOpen] = useState(false);
  const people = form.watch("step3.guestInformation")[item.id]?.people;

  if (!people) {
    return null;
  }

  const handleObjChange = (
    field: "age" | "firstName" | "lastName",
    val: string | number,
    key: string,
  ) => {
    const pastValues = form.getValues("step3.guestInformation");

    if (!pastValues[item.id]?.people) return;
    pastValues[item.id]!.people[parseInt(key)]![field] = val as never;

    form.setValue("step3.guestInformation", pastValues);
  };

  return (
    <div
      ref={parentRef}
      className={cn(
        "py-3 relative transition-all duration-300",
        isFormOpen && "pb-[50px]",
      )}
      style={{ transitionDelay: "300ms" }}
    >
      <div className="flex items-center gap-2">
        <p className="text-sm text-neutral-900 font-bold line-clamp-1 max-w-[300px]">
          {item.name}
        </p>
        <p className="text-xs text-red-400">
          {item.accommodates} {item.accommodates > 1 ? "people" : "person"}
        </p>
      </div>

      {isFormOpen
        ? (
          <div className="mt-2 flex flex-col gap-4">
            {Object.keys(people).map((key, i) => (
              <GIFormDisplay
                index={i}
                key={i}
                ageChange={(e) =>
                  handleObjChange("age", parseInt(e.target.value), key)}
                firstNameChange={(e) =>
                  handleObjChange("firstName", e.target.value, key)}
                lastNameChange={(e) =>
                  handleObjChange("lastName", e.target.value, key)}
                ageValue={people[parseInt(key)]?.age ?? ""}
                firstNameValue={people[parseInt(key)]?.firstName ?? ""}
                lastNameValue={people[parseInt(key)]?.lastName ?? ""}
              />
            ))}
          </div>
        )
        : null}

      <button
        onClick={() => setFormOpen(!isFormOpen)}
        className="w-[30px] h-[30px] bg-neutral-50 flex items-center justify-center rounded-md absolute right-0 bottom-2"
      >
        <ChevronDown
          className={cn(
            "w-4 h-4 text-neutral-900 transition-all duration-300 transform",
            isFormOpen && "rotate-180",
          )}
        />
      </button>
    </div>
  );
};

interface Props {
  form: UseFormReturn<z.infer<typeof CheckoutFormValidator>>;
  items: Room[];
}

export const GuestInformationForm = ({ form, items }: Props) => {
  return (
    <div className="flex flex-col">
      <p className="text-xs text-neutral-700">Guest information (optional)</p>
      <div className="flex flex-col divide-y divide-neutral-100">
        {items.map((item) => (
          <GuestInformationFormItem key={item.id} form={form} item={item} />
        ))}
      </div>
    </div>
  );
};
