"use client";

import type { z } from "zod";
import type { CheckoutFormValidator } from "~/lib/zod/checkout-form";
import type { StepType } from "./checkout-form";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";

interface Props {
  currentSession: StepType | null;
  form: UseFormReturn<z.infer<typeof CheckoutFormValidator>>;
  nextStep: () => void;
  loadingNextStep: boolean;
}

export const StepRenderer = ({
  currentSession,
  loadingNextStep,
  nextStep,
}: Props) => {
  if (!currentSession) {
    return (
      <p className="text-center text-sm text-neutral-700">
        A client side error happend
      </p>
    );
  }

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col">
          <p className="text-xs font-light text-neutral-700">
            {currentSession.step}
          </p>
          <p className="text-base font-bold text-neutral-900">
            {currentSession.slug}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {Array.from(new Array(5)).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-[7px] w-[7px] bg-neutral-100",
                currentSession.stepNum === i && "bg-red-400",
              )}
            ></div>
          ))}
        </div>
      </div>
      {currentSession.form}
      {!!currentSession?.nextBtn && (
        <Button
          className="flex items-center gap-2"
          disabled={loadingNextStep}
          onClick={() => {
            const isValid = currentSession.nextBtn?.validateStep() ?? false;
            if (!isValid) return;

            nextStep();
          }}
        >
          {loadingNextStep && (
            <Loader
              label={null}
              containerClassName="p-0 w-fit"
              labelClassName="p-0 w-fit"
              loaderClassName="p-0 w-fit text-white"
            />
          )}
          {currentSession.nextBtn.contents}
        </Button>
      )}
    </>
  );
};
