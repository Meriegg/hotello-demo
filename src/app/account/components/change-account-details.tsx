"use client";

import postalCodes from "postal-codes-js";
import type { User } from "@prisma/client";
import { getCode as getCountryCode, getNames } from "country-list";
import { SaveIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PhoneNumInput } from "~/components/ui/phoneinput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeAccountDetailsSchema } from "~/lib/zod/account";
import { api } from "~/trpc/react";
import { Loader } from "~/components/ui/loader";
import { useRouter } from "next/navigation";

interface Props {
  user: User;
}

export const ChangeAccountDetails = ({ user }: Props) => {
  const router = useRouter();

  type FormData = z.infer<typeof ChangeAccountDetailsSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(ChangeAccountDetailsSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNum: user.phoneNum,
      phoneNumCountry: user.phoneNumCountry,
      age: user.age,
      billingRegion: user.billingRegion,
      billingAddress: user.billingAddress,
      billingCityTown: user.billingCityTown,
      billingPostalCode: user.billingPostalCode,
    },
  });

  const changeDetails = api.account.changeAccountDetails.useMutation({
    onSuccess: (data) => {
      router.refresh();
    },
  });

  return (
    <form
      className="flex flex-col gap-2 mt-4"
      onSubmit={form.handleSubmit((data) => {
        const countryCode = getCountryCode(data.billingRegion ?? "");

        if (countryCode && data.billingPostalCode && data.billingRegion) {
          const isPostalCodeValid = postalCodes.validate(
            countryCode,
            data.billingPostalCode ?? "",
          );

          if (typeof isPostalCodeValid === "string") {
            form.setError("billingPostalCode", {
              message: "Invalid postal code.",
            });
            return;
          }
        }

        changeDetails.mutate({ ...data });
      })}
      style={{ width: "min(500px, 100%)" }}
    >
      <div className="flex items-center gap-2 w-full">
        <Input
          className="disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70 rounded-tl-[15px]"
          containerClassName="w-full"
          label="First Name"
          error={form.formState.errors.firstName?.message}
          {...form.register("firstName")}
        />
        <Input
          className="disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70 rounded-tr-[15px]"
          error={form.formState.errors.lastName?.message}
          containerClassName="w-full"
          label="Last Name"
          {...form.register("lastName")}
        />
      </div>
      <PhoneNumInput
        value={form.watch("phoneNum")}
        defaultCountry={form.watch("phoneNumCountry")}
        inputClass="!rounded-[5px]"
        buttonClass="!rounded-[5px]"
        onChange={(value, country) => {
          form.setValue("phoneNum", value);
          form.setValue(
            "phoneNumCountry",
            (country as any)?.countryCode ?? "",
          );
        }}
      />
      <Input
        className="disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70"
        value={user.email}
        label="Email"
        disabled
      />
      <Select
        value={form.watch("billingRegion") ?? ""}
        onValueChange={(val) => form.setValue("billingRegion", val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Country or Region" />
        </SelectTrigger>
        <SelectContent>
          {getNames().map((name) => <SelectItem value={name}>{name}
          </SelectItem>)}
        </SelectContent>
      </Select>

      <Input
        className="disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70"
        label="Address"
        {...form.register("billingAddress")}
      />

      <Input
        className="disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70"
        label="City or town"
        {...form.register("billingCityTown")}
      />

      <Input
        className="disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70 rounded-b-[15px]"
        label="Postal code"
        error={form.formState.errors.billingPostalCode?.message}
        {...form.register("billingPostalCode")}
      />

      <Button
        type="submit"
        disabled={!form.formState.isDirty || changeDetails.isLoading}
        className="flex active:ring-2 ring-neutral-50 transition-all duration-300 gap-2 w-fit bg-neutral-50 px-8 hover:bg-neutral-100 font-bold rounded-md text-neutral-900"
      >
        Save changes {changeDetails.isLoading
          ? (
            <Loader
              containerClassName="p-0 w-fit"
              labelClassName="p-0 w-fit"
              loaderClassName="p-0 w-fit"
              label={null}
            />
          )
          : <SaveIcon className="w-4 h-4" />}
      </Button>
    </form>
  );
};
