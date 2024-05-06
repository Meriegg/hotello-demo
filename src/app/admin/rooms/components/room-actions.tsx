"use client";

import type { Room } from "@prisma/client";
import { CheckIcon, EditIcon, Loader2, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

interface Props {
  room: Room;
}

export const RoomActions = ({ room }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const setRoomAvailability = api.admin.setRoomAvailability.useMutation({
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message ?? "Failed to change availability.",
      });
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <div className="flex items-center gap-2 rounded-md bg-neutral-50 px-4 py-2">
      <button
        className="flex items-center gap-1 text-xs font-bold text-red-400 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={setRoomAvailability.isLoading}
        onClick={() =>
          setRoomAvailability.mutate({
            roomId: room.id,
            isUnavailable: !room.isUnavailable,
          })
        }
      >
        {setRoomAvailability.isLoading && (
          <Loader2 className="h-3 w-3 animate-spin text-inherit" />
        )}
        {room.isUnavailable ? "Set as available" : "Set as unavailable"}{" "}
        {room.isUnavailable ? (
          <CheckIcon className="h-3 w-3 text-inherit" />
        ) : (
          <XIcon className="h-3 w-3 text-inherit" />
        )}
      </button>

      <Link
        href={`/admin/rooms/edit/${room.id}`}
        className="flex items-center gap-1 text-xs font-bold text-red-400"
      >
        Edit <EditIcon className="h-3 w-3 text-inherit" />
      </Link>
    </div>
  );
};
