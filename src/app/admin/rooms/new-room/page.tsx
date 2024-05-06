"use client";

import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RoomImageManager } from "../components/room-images-manager";
import { Input } from "~/components/ui/input";
import { cn, formatPlural } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { Loader } from "~/components/ui/loader";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { EyeIcon, Loader2, PlusIcon, SaveIcon } from "lucide-react";
import { RoomValidationSchema } from "~/lib/zod/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import { RoomCard } from "~/app/rooms/components/room-card";
import { Dialog, DialogContent } from "~/components/ui/dialog";

const Page = () => {
  const { toast } = useToast();
  const router = useRouter();

  const categories = api.rooms.getRoomCategories.useQuery();
  const createRoom = api.admin.createRoom.useMutation({
    onError: (error) => {
      const parsedMessage = error?.message ? JSON.parse(error.message) : null;
      if (typeof parsedMessage === "object" && Array.isArray(parsedMessage)) {
        form.trigger();

        toast({
          variant: "destructive",
          title: "Error",
          description: parsedMessage.map(
            (message) => `Invalid value for ${message.path[0]}.\n`,
          ),
        });
        return;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message ?? "Could not create room.",
      });
    },
    onSuccess: () => {
      router.push("/admin/rooms");
    },
  });

  const [showCardPreview, setShowCardPreview] = useState(false);
  const [showActionsInPathDisplay, setShowActionsInPathDisplay] =
    useState(false);
  const [additionalAttributeVal, setAdditionalAttributeVal] = useState<{
    val: string;
    error: string | null;
  }>({
    val: "",
    error: null,
  });
  const [additionalAttributeLink, setAdditionalAttributeLink] = useState<{
    val: string;
    error: string | null;
  }>({
    val: "",
    error: null,
  });

  type FormData = z.infer<typeof RoomValidationSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(RoomValidationSchema),
    defaultValues: {
      images: [],
      name: "",
      hasSpecialNeeds: false,
      accommodates: 1,
      otherAttributes: {},
    },
  });

  const addAdditionalAttribute = () => {
    const attributes = form.getValues("otherAttributes") ?? {};
    const numOfAttributes = Object.keys(attributes).length;

    const valueValidation = z
      .string()
      .min(1)
      .safeParse(additionalAttributeVal.val);
    if (!valueValidation.success) {
      setAdditionalAttributeVal({
        val: additionalAttributeVal.val,
        error: "Invalid value",
      });
      return;
    }

    const linkValidation = z
      .string()
      .url()
      .safeParse(additionalAttributeLink.val);
    if (additionalAttributeLink.val && !linkValidation.success) {
      setAdditionalAttributeLink({
        val: additionalAttributeLink.val,
        error: "Invalid link",
      });
      return;
    }

    attributes[numOfAttributes.toString()] = additionalAttributeLink.val
      ? {
          text: additionalAttributeVal.val,
          href: additionalAttributeLink.val,
        }
      : additionalAttributeVal.val;

    setAdditionalAttributeVal({ val: "", error: null });
    setAdditionalAttributeLink({ val: "", error: null });
  };

  const roomActions = () => {
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-lg text-xs font-bold text-red-400 underline">
        <button
          onClick={() => {
            const { success } = RoomValidationSchema.safeParse(
              form.getValues(),
            );
            if (!success || !categories.data) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "Invalid values.",
              });
              return;
            }

            setShowCardPreview(true);
          }}
          className="flex items-center gap-2"
        >
          Show preview card <EyeIcon className="h-3 w-3 text-inherit" />
        </button>

        <button
          onClick={async () => {
            createRoom.mutate({ ...form.getValues() });
          }}
          className="flex items-center gap-2"
        >
          Save room{" "}
          {createRoom.isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-inherit" />
          ) : (
            <SaveIcon className="h-3 w-3 text-inherit" />
          )}
        </button>
      </div>
    );
  };

  useEffect(() => {
    setShowActionsInPathDisplay(true);
  }, []);

  return (
    <>
      {showActionsInPathDisplay
        ? createPortal(
            roomActions(),
            document.getElementById("PORTAL_PATH_DISPLAY_ADDITIONAL_OPTIONS")!,
          )
        : roomActions()}

      <Dialog open={showCardPreview} onOpenChange={setShowCardPreview}>
        <DialogContent>
          <div className="flex w-full justify-center">
            <RoomCard
              room={(() => {
                const values = form.getValues();

                return {
                  name: values.name,
                  other: values.otherAttributes,
                  hasSpecialNeeds: values.hasSpecialNeeds,
                  accommodates: values.accommodates,
                  price: values.price * 100,
                  images: values.images,
                  categoryId: values.category,
                  id: "TEST",
                  isUnavailable: false,
                  createdOn: new Date(),
                  updatedOn: new Date(),
                };
              })()}
              category={
                categories.data?.find(
                  (category) => category.id === form.getValues("category"),
                )?.name ?? ""
              }
              disabledCartBtn={true}
              disabledMoreLink={true}
            />
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex w-full items-start gap-4">
        <RoomImageManager
          value={form.watch("images")}
          setImagesOverride={(images) => form.setValue("images", images)}
        />

        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-start gap-2">
            <Input
              placeholder="Room name"
              containerClassName="w-full"
              className="rounded-tl-[20px]"
              error={form.formState.errors.name?.message}
              {...form.register("name")}
            />

            <Input
              placeholder="Price (IN USD)"
              containerClassName="w-full"
              className="rounded-tr-[20px]"
              type="number"
              error={form.formState.errors.price?.message}
              {...form.register("price", { valueAsNumber: true })}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex w-fit items-center gap-2 rounded-lg bg-neutral-50 px-4 py-2 text-sm text-neutral-700">
              <p>Accomodates</p>
              <span className="flex items-center gap-2 font-bold text-neutral-900">
                <button
                  disabled={form.watch("accommodates") <= 1}
                  onClick={() => {
                    if (form.getValues("accommodates") <= 1) return;

                    form.setValue(
                      "accommodates",
                      form.getValues("accommodates") - 1,
                    );
                  }}
                  className="text-red-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  -
                </button>
                <p>{form.watch("accommodates")}</p>
                <button
                  onClick={() =>
                    form.setValue(
                      "accommodates",
                      form.getValues("accommodates") + 1,
                    )
                  }
                  className="text-red-400"
                >
                  +
                </button>
              </span>
              <p>
                {formatPlural(
                  form.watch("accommodates") > 1,
                  "person",
                  "people",
                )}
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-lg bg-neutral-50 px-4 py-2 text-sm text-neutral-900">
              <Checkbox
                checked={form.watch("hasSpecialNeeds")}
                onCheckedChange={(isChecked) => {
                  if (typeof isChecked !== "boolean") return;

                  form.setValue("hasSpecialNeeds", isChecked);
                }}
                id="FORM_HAS_SPECIAL_NEEDS"
              />
              <Label htmlFor="FORM_HAS_SPECIAL_NEEDS">
                Accommodates special needs?
              </Label>
            </div>
          </div>

          <hr className="w-full border-neutral-100" />

          <div className="flex flex-col gap-1">
            <p className="text-sm text-neutral-700">Category</p>

            {categories.isLoading && <Loader label="Fetching categories" />}
            {categories.isError && (
              <p className="w-full text-center text-sm text-neutral-700">
                {categories.error?.message ?? "Failed to fetch categories."}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {!!categories.data &&
                categories.data.map((category) => {
                  const isSelected = form.watch("category") === category.id;

                  return (
                    <button
                      onClick={() => form.setValue("category", category.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-300",
                        {
                          "border-[1px] border-neutral-100 bg-none text-neutral-900":
                            !isSelected,
                          "border-[0px] bg-red-400 text-white": isSelected,
                        },
                      )}
                      key={category.id}
                    >
                      {category.name}
                    </button>
                  );
                })}
            </div>

            {form.formState.errors.category?.message && (
              <p className="text-left text-sm text-red-400">
                {form.formState.errors.category.message}
              </p>
            )}

            <div className="mt-2 flex flex-col gap-1">
              <p className="text-sm text-neutral-700">Other attributes</p>

              {Object.keys(form.watch("otherAttributes")).map((key, i) => {
                const value = form.watch("otherAttributes")[key];

                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-neutral-900"
                  >
                    <p>•</p>
                    {typeof value === "object" ? (
                      <p>
                        {value.text} [
                        <span className="text-red-400">{value.href}</span>]
                      </p>
                    ) : (
                      <p>{value}</p>
                    )}
                  </div>
                );
              })}

              <div className="flex w-full flex-col items-end gap-2">
                <div className="flex w-full gap-2">
                  <Input
                    placeholder="Attribute name"
                    containerClassName="w-full"
                    onChange={(e) =>
                      setAdditionalAttributeVal({
                        val: e.target.value,
                        error: null,
                      })
                    }
                    value={additionalAttributeVal.val}
                    error={additionalAttributeVal.error}
                  />
                  <Input
                    placeholder="Link (optional)"
                    containerClassName="w-full"
                    onChange={(e) =>
                      setAdditionalAttributeLink({
                        val: e.target.value,
                        error: null,
                      })
                    }
                    value={additionalAttributeLink.val}
                    error={additionalAttributeLink.error}
                  />
                </div>
                <Button
                  onClick={() => addAdditionalAttribute()}
                  className="w-fit gap-2 rounded-full px-4 py-2 text-sm text-white"
                >
                  Add <PlusIcon className="h-4 w-4 text-inherit" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {!!form.watch("name") && (
          <>
            {createPortal(
              <p className="text-red-400">{form.watch("name")}</p>,
              document.getElementById("PORTAL_PATH_DISPLAY_NEW_ROOM_VAL")!,
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Page;
