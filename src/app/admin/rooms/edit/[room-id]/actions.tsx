"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom"

export const EditRoomActions = () => {
  const [renderWithPortal, setRenderWithPortal] = useState(false);

  useEffect(() => {
    if (document.getElementById("PORTAL_PATH_DISPLAY_ADDITIONAL_OPTIONS")) {
      setRenderWithPortal(true)
    }
  }, [])

  return (
    <>

      {renderWithPortal && createPortal(
        <button>Hello, world</button>,
        document.getElementById("PORTAL_PATH_DISPLAY_ADDITIONAL_OPTIONS") ?? document.body
      )}
    </>
  )
}
