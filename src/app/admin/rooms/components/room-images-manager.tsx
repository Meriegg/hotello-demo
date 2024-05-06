import { useAutoAnimate } from "@formkit/auto-animate/react";
import { UploadButton } from "~/lib/uploadthing/utils";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { UploadedImagesSelector } from "./uploaded-images-selector";
import { useToast } from "~/hooks/use-toast";

interface Props {
  onImageChange?: (imageUrls: string[]) => void;
  setImagesOverride?: (urls: string[]) => void;
  value?: string[];
}

export const RoomImageManager = ({
  onImageChange,
  value,
  setImagesOverride,
}: Props) => {
  const { toast } = useToast();
  const [images, setUseStateImages] = useState<string[]>(value ?? []);
  const setImages = (urls: string[]) => {
    if (setImagesOverride) setImagesOverride(urls);
    setUseStateImages(urls);
  };
  const [imagesContainerRef] = useAutoAnimate();
  const [isUploadedImgsDialogOpen, setIsUploadedImgsDialogOpen] =
    useState(false);
  const [isCustomLinkDialogOpen, setIsCustomLinkDialogOpen] = useState(false);
  const [customLinkValue, setCustomLinkValue] = useState("");
  const [customLinkError, setCustomLinkError] = useState<string | null>(null);
  const [maximizedImageIdx, setMaximizedImageIdx] = useState<number | null>(
    null,
  );

  const imageActions = [
    {
      text: "Remove",
      action: (imageIdx: number) => {
        setImages([...images.filter((_, idx) => idx !== imageIdx)]);
      },
    },
    {
      text: "Maximize",
      action: (imageIdx: number) => {
        setMaximizedImageIdx(imageIdx);
      },
    },
    {
      text: "Set as display",
      action: (imageIdx: number) => {
        const imagesCopy = [...images];
        if (imageIdx > images.length - 1) return;

        imagesCopy[0] = images.find((_, idx) => idx === imageIdx) ?? "";
        imagesCopy[imageIdx] = images[0] ?? "";

        setImages(imagesCopy);
      },
      skipDisplayImage: true,
    },
  ];

  const addCustomImageLink = () => {
    const existingUrl = images.find((url) => url === customLinkValue);
    if (existingUrl) {
      setCustomLinkError("This URL is already used.");
      return;
    }

    const { success } = z.string().url().safeParse(customLinkValue);
    if (!success) {
      setCustomLinkError("Invalid value.");
      return;
    }

    setImages([...images, customLinkValue]);
    setCustomLinkError(null);
    setCustomLinkValue("");
    setIsCustomLinkDialogOpen(false);
  };

  useEffect(() => {
    if (onImageChange) onImageChange(images);
  }, [images]);

  return (
    <>
      <Dialog
        open={maximizedImageIdx !== null}
        onOpenChange={(val) =>
          setMaximizedImageIdx(!val ? null : maximizedImageIdx)
        }
      >
        <DialogContent>
          <img
            src={images.find((_, idx) => idx === maximizedImageIdx)}
            className="h-auto w-full rounded-lg"
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isUploadedImgsDialogOpen}
        onOpenChange={setIsUploadedImgsDialogOpen}
      >
        <DialogContent>
          <UploadedImagesSelector
            chosenImageCallback={(url) => {
              const existingImg = images.find(
                (existingUrl) => existingUrl === url,
              );
              if (existingImg) {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "This image is already used.",
                });
                return;
              }

              setImages([...images, url]);
              setIsUploadedImgsDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="flex w-full max-w-[400px] flex-col gap-2">
        <div style={{ width: "min(400px, 100%)" }}>
          {!images.length && (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg bg-neutral-50 text-center">
              <p className="text-2xl font-bold text-neutral-900">
                No pictures yet
              </p>
              <p className="text-sm text-neutral-700">
                At least 1 picture is required
              </p>
            </div>
          )}
          {images.length > 0 && (
            <div className="flex flex-col gap-2" ref={imagesContainerRef}>
              {images.map((url, idx) => (
                <div key={url}>
                  {idx === 0 ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                      <div className="absolute inset-0 flex h-full w-full flex-col items-start justify-end gap-1 bg-black/60 p-4 text-white">
                        <p className="text-sm text-white/80">
                          <span className="italic text-white">#{idx + 1}</span>{" "}
                          Display image
                        </p>
                        <div className="flex items-center divide-x divide-white/60 text-xs font-bold underline">
                          {imageActions
                            .filter((action) => !action.skipDisplayImage)
                            .map((action, actionIdx) => (
                              <button
                                key={action.text}
                                onClick={() => action.action(idx)}
                                className={cn("pr-2", actionIdx > 0 && "pl-2")}
                              >
                                {action.text}
                              </button>
                            ))}
                        </div>
                      </div>

                      <img
                        className="h-full w-full"
                        src={url}
                        alt="Display image"
                      />
                    </div>
                  ) : (
                    <div className="flex w-full items-center gap-2">
                      <div className="flex h-full items-center gap-1">
                        <div className="h-[50px] w-[4px] rounded-full bg-red-400"></div>
                        <div
                          className="h-[50px] w-[80px] rounded-lg"
                          style={{
                            background: `url(${url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        ></div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-xs italic text-neutral-700">
                          #{idx + 1}
                        </p>
                        <div className="flex items-center divide-x divide-neutral-100 text-xs font-bold text-red-400 underline">
                          {imageActions.map((action, actionIdx) => (
                            <button
                              key={action.text}
                              onClick={() => action.action(idx)}
                              className={cn("pr-2", actionIdx > 0 && "pl-2")}
                            >
                              {action.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start justify-end gap-[1px] text-xs font-bold text-white">
          <UploadButton
            endpoint="roomImageUploader"
            onClientUploadComplete={(res) => {
              res.forEach((file) => {
                setImages([...images, file.url]);
              });
            }}
            onUploadError={(error: Error) => {
              alert(`Error: ${error.message}`);
            }}
            className="flex flex-col items-start gap-1 text-left"
            appearance={{
              button:
                "bg-red-400 text-xs font-bold rounded-r-[0px] rounded-l-full h-[35px] transition-all duration-300 hover:bg-red-400/90",
              allowedContent: "font-normal text-xs text-neutral-700",
            }}
          />

          <Dialog
            open={isCustomLinkDialogOpen}
            onOpenChange={setIsCustomLinkDialogOpen}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-[35px] w-[35px] items-center justify-center rounded-r-full bg-red-400 transition-all duration-300 hover:bg-red-400/90">
                  <ChevronDownIcon className="h-4 w-4 text-inherit" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <button onClick={() => setIsUploadedImgsDialogOpen(true)}>
                    Choose uploaded picture
                  </button>
                </DropdownMenuItem>

                <DialogTrigger asChild>
                  <DropdownMenuItem>Add link</DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a custom link</DialogTitle>
                <DialogDescription>
                  Make sure this link won&apos;t change in the future.
                </DialogDescription>
              </DialogHeader>

              <div className="flex w-full flex-col gap-2">
                <Input
                  value={customLinkValue}
                  onChange={(e) => setCustomLinkValue(e.target.value)}
                  placeholder="Custom link"
                  error={customLinkError}
                />

                <Button
                  onClick={() => addCustomImageLink()}
                  className="w-full rounded-md py-3"
                >
                  Add link
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};
