"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

interface Props {
  onSuccessCb?: () => void;
  bookingId: string;
}

export const AddServiceForm = ({ onSuccessCb, bookingId }: Props) => {
  const apiUtils = api.useUtils();
  const { toast } = useToast();
  const addServiceMutation =
    api.admin.bookingActions.addOtherService.useMutation({
      onSuccess: () => {
        apiUtils.admin.getBooking
          .invalidate()
          .catch((err) => console.error(err));
        if (onSuccessCb) onSuccessCb();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message ?? "Something went wrong.",
        });
      },
    });

  const ValidationSchema = z.object({
    name: z.string(),
    price: z.number(),
    description: z.string().optional(),
  });

  type FormData = z.infer<typeof ValidationSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(ValidationSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    addServiceMutation.mutate({ ...data, bookingId });
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-2"
    >
      <Input
        placeholder="Name (eg: room service)"
        className="rounded-t-2xl"
        {...form.register("name")}
      />
      <Input
        placeholder="Price (in USD)"
        type="number"
        step="0.01"
        {...form.register("price", {
          valueAsNumber: true,
        })}
      />
      <Textarea
        placeholder="Description (optional)"
        className="min-h-[100px]"
        {...form.register("description")}
      />
      <Button
        type="submit"
        disabled={addServiceMutation.isLoading}
        className="gap-2 rounded-lg rounded-b-2xl disabled:cursor-not-allowed disabled:opacity-70"
      >
        Add service
        {addServiceMutation.isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-inherit" />
        )}
      </Button>
    </form>
  );
};
