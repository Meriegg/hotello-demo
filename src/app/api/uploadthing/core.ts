import { createUploadthing, type FileRouter } from "uploadthing/next";
import { db } from "~/server/db";
import { getUserSession } from "~/server/utils/get-user-session";

const f = createUploadthing();

export const adminFileRouter = {
  roomImageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { error, message, userSession } = await getUserSession();
      if (error || !userSession) {
        throw new Error(message ?? "Unauthorized.");
      }

      const user = userSession.user;

      if (user.role !== "ADMIN") throw new Error("Unauthorized.");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const dbImage = await db.uploadedImage.create({
        data: {
          url: file.url,
          filename: file.name,
          uploadedById: metadata.userId,
        },
      });

      return { url: file.url, dbImageId: dbImage.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof adminFileRouter;
