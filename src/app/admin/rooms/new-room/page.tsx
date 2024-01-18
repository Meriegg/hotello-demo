"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

const Page = () => {
  const [data, setData] = useState("");

  return (
    <div>
      Create new room
      <input
        onChange={(e) => setData(e.target.value)}
        placeholder="Value"
        value={data}
      />

      {!!data && (
        <>
          {createPortal(
            <p className="text-red-400">{data}</p>,
            document.getElementById("PORTAL_PATH_DISPLAY_NEW_ROOM_VAL")!,
          )}
        </>
      )}
    </div>
  );
};

export default Page;
