import Link from "next/link";

const Page = () => {
  return (
    <div>
      All rooms
      <Link href="/admin/rooms/new-room">new</Link>
    </div>
  );
};

export default Page;
