import { cn } from "~/lib/utils";
import { EMAIL_LINK, WEBSITE_LINK } from "@mariodev14/socials";
import { MaxWidthContainer } from "./MaxWidthContainer";
import { HelpCircleIcon, PhoneIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Link from "next/link";

interface Props {
  theme: "light" | "dark";
  className?: string;
}

export const Footer = ({ theme, className }: Props) => {
  return (
    <footer
      className={cn(
        "w-full py-6",
        {
          "bg-gradient-to-t from-black/60 to-black/0 text-white":
            theme === "dark",
          "border-t-[1px] border-neutral-100 text-neutral-900":
            theme === "light",
        },
        className,
      )}
    >
      <TooltipProvider>
        <MaxWidthContainer className="flex flex-col justify-between gap-4 px-4 md:flex-row md:items-center md:gap-0">
          <div className={cn("flex flex-col gap-2 text-xs")}>
            <div className="flex items-center gap-2">
              <p>
                &copy; 2023 - 2024{" "}
                <a
                  referrerPolicy="no-referrer"
                  href={WEBSITE_LINK}
                  className="font-bold underline"
                >
                  MarioDev
                </a>
              </p>
              <p className="text-neutral-200">•</p>
              <Link href="/faq" className="text-white hover:underline">
                FAQ
              </Link>
              <p className="text-neutral-200">•</p>
              <Link href="/contact" className="text-white hover:underline">
                Contact
              </Link>
              <p className="text-neutral-200">•</p>
              <Link href="/legal" className="text-white hover:underline">
                Legal
              </Link>
            </div>
            <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
              <a
                href="tel:+1 472-268-0630"
                className="flex items-center gap-1 hover:underline"
              >
                <PhoneIcon className="h-4 w-4" />
                +1 472-268-0630
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircleIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>This is a dummy phone number.</TooltipContent>
                </Tooltip>
              </a>
              <p className="md:initial hidden text-neutral-200">•</p>
              <a
                href={EMAIL_LINK}
                className="flex items-center gap-1 hover:underline"
              >
                mario.developer.contact@gmail.com
              </a>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <img
              src={
                theme === "light"
                  ? "/trustpilot_mini_light.svg"
                  : "/trustpilot_mini_dark.svg"
              }
            />
            <p
              className={cn("flex items-center gap-1 text-xs font-bold", {
                "text-neutral-200": theme === "dark",
                "text-neutral-700": theme === "light",
              })}
            >
              Not a real evaluation.{" "}
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircleIcon className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent>
                  This is not a real Trustpilot evaluation, it's only present
                  for design purposes.
                </TooltipContent>
              </Tooltip>
            </p>
          </div>
        </MaxWidthContainer>
      </TooltipProvider>
    </footer>
  );
};
