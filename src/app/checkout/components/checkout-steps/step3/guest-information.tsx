import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { Room } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { Button } from "~/components/ui/button";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import type { CheckoutFormValidator } from "~/lib/zod/checkout-form";

const GIFormDisplay = ({
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
}) => {
  const [isEditing, setIsEditing] = useState(true);

  return (
    <div
      className={cn("flex w-full gap-2", !isEditing ? "flex-row" : "flex-col")}
    >
      <p className="text-xs italic text-neutral-700">#{index + 1}</p>
      {!isEditing && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-neutral-900">
            {firstNameValue || "(No first name)"}{" "}
            {lastNameValue || "(No last name)"}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <p className="text-neutral-900">Age {ageValue || "(No age)"}</p>
            <button
              className="italic text-red-400 hover:underline"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          </div>
        </div>
      )}
      {isEditing && (
        <>
          <div className="flex w-full items-center gap-2 px-0">
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
          <div className="flex w-full items-center gap-2 px-0">
            <Input
              label="Age"
              type="number"
              pattern="[0-9]"
              value={ageValue}
              className="flex-1"
              onChange={ageChange}
            />
            <Button className="flex-1" onClick={() => setIsEditing(false)}>
              Enter
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const GuestInformationFormItem = ({
  form,
  item,
}: {
  item: Room;
  form: UseFormReturn<z.infer<typeof CheckoutFormValidator>>;
}) => {
  const [parentRef] = useAutoAnimate();
  const [isFormOpen, setIsFormOpen] = useState(false);
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
        "relative py-3 transition-all duration-300",
        isFormOpen && "pb-[50px]",
      )}
      style={{ transitionDelay: "300ms" }}
    >
      <div className="flex items-center gap-2">
        <p className="line-clamp-1 max-w-[300px] text-sm font-bold text-neutral-900">
          {item.name}
        </p>
        <p className="text-xs text-red-400">
          {item.accommodates} {item.accommodates > 1 ? "people" : "person"}
        </p>
      </div>

      {isFormOpen ? (
        <div className="mt-2 flex flex-col gap-4">
          {Object.keys(people).map((key, i) => (
            <GIFormDisplay
              index={i}
              key={key}
              ageChange={(e) =>
                handleObjChange("age", parseInt(e.target.value), key)
              }
              firstNameChange={(e) =>
                handleObjChange("firstName", e.target.value, key)
              }
              lastNameChange={(e) =>
                handleObjChange("lastName", e.target.value, key)
              }
              ageValue={people[parseInt(key)]?.age ?? ""}
              firstNameValue={people[parseInt(key)]?.firstName ?? ""}
              lastNameValue={people[parseInt(key)]?.lastName ?? ""}
            />
          ))}
        </div>
      ) : null}

      <button
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="absolute bottom-2 right-0 flex h-[30px] w-[30px] items-center justify-center rounded-md bg-neutral-50"
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 transform text-neutral-900 transition-all duration-300",
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
