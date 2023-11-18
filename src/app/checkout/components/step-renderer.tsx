"use client";

import { z } from "zod";
import { CheckoutFormValidator } from "~/lib/zod/checkout-form";
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

export const StepRenderer = (
  { currentSession, loadingNextStep, nextStep }: Props,
) => {
  if (!currentSession) {
    return (
      <p className="text-center text-sm text-neutral-700">
        A client side error happend
      </p>
    );
  }

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-xs text-neutral-700 font-light">
            {currentSession.step}
          </p>
          <p className="text-base text-neutral-900 font-bold">
            {currentSession.slug}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {Array.from(new Array(5)).map((_, i) => (
            <div
              className={cn(
                "w-[7px] h-[7px] bg-neutral-100",
                currentSession.stepNum === i && "bg-red-400",
              )}
            >
            </div>
          ))}
        </div>
      </div>
      {currentSession.form}
      {!!currentSession?.nextBtn && (
        <Button
          className="gap-2 flex items-center"
          disabled={loadingNextStep}
          onClick={() => {
            const isValid = currentSession.nextBtn?.validateStep() || false;
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
