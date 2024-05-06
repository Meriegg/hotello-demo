import { createRouteHandler } from "uploadthing/next";

import { adminFileRouter } from "./core";
import { env } from "~/env.mjs";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: adminFileRouter,
  config: {
    uploadthingId: env.UPLOADTHING_APP_ID,
    uploadthingSecret: env.UPLOADTHING_SECRET,
  },
});
