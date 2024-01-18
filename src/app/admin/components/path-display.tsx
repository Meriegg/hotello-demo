"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { useEffect, useRef, useState } from "react";

type PathData = string | { defaultText: string; portalValueID: string };

const Path = (
  { path, showBehindSlash, href }: {
    path: PathData;
    showBehindSlash: boolean;
    href: string | null;
  },
) => {
  const [showCustomVal, setShowCustomVal] = useState(false);
  const customValRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!customValRef.current) return;

    const interval = setInterval(() => {
      setShowCustomVal(customValRef.current?.innerHTML !== "");
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const renderPathContent = () => (
    <>
      {!showCustomVal && (
        <p
          className={cn(
            "text-neutral-900 pointer-events-none",
            typeof path === "object" && "text-red-400",
          )}
        >
          {typeof path === "string" ? path : path.defaultText}
        </p>
      )}
      {typeof path === "object" && (
        <div
          ref={customValRef}
          id={path.portalValueID}
          className={cn(showCustomVal ? "block" : "hidden")}
        >
        </div>
      )}
    </>
  );

  const renderLink = () => (
    <Link
      href={href!}
      className={cn(
        "text-neutral-900 pointer-events-none hover:underline hover:text-red-400",
        typeof path === "object" && "text-red-400",
      )}
    >
      {typeof path === "string" ? path : path.defaultText}
    </Link>
  );

  return (
    <>
      {showBehindSlash && (
        <span className="italic text-neutral-200 pointer-events-none">/</span>
      )}
      {!href ? renderPathContent() : renderLink()}
    </>
  );
};

export const PathDisplay = () => {
  const pathname = usePathname();
  if (!pathname) {
    return null;
  }

  const splitPathname = pathname.split("/").filter((pathStr) => !!pathStr);

  const replaceMap: { [key: string]: PathData } = {
    "admin": "Hotello admin panel",
    "bookings": "Bookings",
    "new-room": {
      defaultText: "New room",
      portalValueID: "PORTAL_PATH_DISPLAY_NEW_ROOM_VAL",
    },
  };

  return (
    <div className="flex items-center justify-between px-8 py-4 border-[1px] border-t-[0px] border-neutral-100">
      <div className="flex items-center gap-2 text-xs font-bold">
        {splitPathname.map((
          pathData,
          i,
        ) => (
          <Path
            href={i < splitPathname.length - 1
              ? `/${splitPathname.slice(0, i + 1).join("/")}`
              : null}
            showBehindSlash={i > 0}
            path={replaceMap[pathData] ?? pathData}
            key={i}
          />
        ))}
      </div>

      <div id="PORTAL_PATH_DISPLAY_ADDITIONAL_OPTIONS"></div>
    </div>
  );
};
