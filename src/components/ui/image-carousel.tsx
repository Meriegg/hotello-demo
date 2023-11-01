"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface Props {
  images: string[];
  containerClassname?: string;
  iconsClassname?: string;
  indicatorClassname?: string;
}

export const ImageCarousel = (
  { images, iconsClassname, indicatorClassname, containerClassname }: Props,
) => {
  const [containerRef] = useAutoAnimate();
  const [activeImage, setActiveImage] = useState(0);

  const increase = () => {
    setActiveImage((prev) => {
      if (prev + 1 > images.length - 1) {
        return prev;
      }

      return prev + 1;
    });
  };

  const decrease = () => {
    setActiveImage((prev) => {
      if (prev === 0) {
        return prev;
      }

      return prev - 1;
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "carousel-container relative overflow-hidden w-full",
        containerClassname,
      )}
    >
      {images.map((image, i) => (
        <>
          {i === activeImage
            ? (
              <img
                src={image}
                alt="Carousel image"
                className="w-full h-auto"
              />
            )
            : null}
        </>
      ))}
      {images.length > 1
        ? (
          <div
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(217, 217, 217, 0.00) 0%, rgba(16, 16, 16, 0.46) 92.71%, rgba(0, 0, 0, 0.50) 100%, rgba(0, 0, 0, 0.05) 100%)",
            }}
            className="carousel-controls transition-all duration-300 opacity-0 absolute top-0 left-0 w-full h-full"
          >
            <button
              onClick={() => decrease()}
              className="absolute text-white top-1/2 left-2 transform -translate-y-1/2"
            >
              <ChevronLeft
                className={cn("w-10 h-10", iconsClassname)}
                strokeWidth={1}
              />
            </button>
            <button
              onClick={() => increase()}
              className="absolute text-white top-1/2 right-2 transform -translate-y-1/2"
            >
              <ChevronRight
                className={cn("h-10 w-10", iconsClassname)}
                strokeWidth={1}
              />
            </button>

            <div className="absolute flex items-center gap-2 left-1/2 transform bottom-3 -translate-x-1/2">
              {Array.from(new Array(images.length)).map((_, i) => (
                <button
                  onClick={() => {
                    setActiveImage(i);
                  }}
                  className={cn(
                    "w-[7px] h-[7px] rounded-full",
                    indicatorClassname,
                    {
                      "bg-red-400": i === activeImage,
                      "bg-neutral-100 hover:bg-neutral-200": i !== activeImage,
                    },
                  )}
                  key={i}
                />
              ))}
            </div>
          </div>
        )
        : null}
    </div>
  );
};
