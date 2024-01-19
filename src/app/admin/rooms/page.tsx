import Link from "next/link";

import { db } from "~/server/db";

const Page = async () => {
  const rooms = await db.room.findMany();

  return (
    <div>
      All rooms
      <Link href="/admin/rooms/new-room">new</Link>

      <pre>{JSON.stringify(rooms, null, 2)}</pre>
    </div>
  );
};

export default Page;
