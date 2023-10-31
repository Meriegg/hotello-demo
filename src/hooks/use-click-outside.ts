import { useEffect, useRef } from "react";

export const useClickOutside = <T>(
  callback: () => void,
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // @ts-ignore
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  return [ref];
};
