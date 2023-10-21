import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/homepage-background-image.jpg)",
        backgroundSize: "cover",
      }}
      className="h-screen flex justify-center -mt-24"
    >
      <div className="flex flex-col gap-0 items-center mt-44">
        <p className="text-neutral-200 text-sm tracking-[10px]">
          A LUXURY EXPERIENCE
        </p>
        <h1 className="text-white text-5xl text-center w-full max-w-[600px] tracking-wider leading-tight">
          The best rated hotel in the whole country.
        </h1>
        <Link href="/test">Test route</Link>
      </div>
    </div>
  );
}
