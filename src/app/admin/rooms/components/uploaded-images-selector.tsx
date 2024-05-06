"use client";

import { Loader } from "~/components/ui/loader";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";

interface Props {
  chosenImageCallback: (url: string) => void;
}

export const UploadedImagesSelector = ({ chosenImageCallback }: Props) => {
  const images = api.admin.getUploadedImages.useQuery();

  if (images.isLoading) {
    return <Loader label="Fetching images" />;
  }

  if (images.error || !images.data) {
    return (
      <p className="w-full text-center text-sm text-neutral-700">
        {images.error?.message ?? "An error happened."}
      </p>
    );
  }

  return (
    <Table>
      <TableCaption>Choose an image</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Image</TableHead>
          <TableHead>Uploaded by</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {images.data.map((image, idx) => (
          <TableRow key={image.id}>
            <TableCell>
              <img
                className="h-auto w-[75px] rounded-md"
                src={image.url}
                alt={`Image number ${idx + 1}`}
              />
            </TableCell>
            <TableCell>
              {image.uploadedBy.firstName} {image.uploadedBy.lastName}
            </TableCell>
            <TableCell className="text-right">
              <button
                onClick={() => chosenImageCallback(image.url)}
                className="rounded-md bg-red-400 px-4 py-2 text-sm text-white hover:bg-red-400/80"
              >
                Choose
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
