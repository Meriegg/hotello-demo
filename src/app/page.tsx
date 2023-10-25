import { Footer } from "~/components/Footer";

export default function Home() {
  return (
    <>
      <div
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/homepage-background-image.jpg)",
          backgroundSize: "cover",
        }}
        className="min-h-[calc(100vh+250px)] md:min-h-screen relative"
      >
        <div className="flex justify-center -mt-24 text-center">
          <div className="flex flex-col gap-0 items-center mt-44 text-center">
            <p className="text-neutral-200 text-xs md:text-sm tracking-[10px] text-center">
              A LUXURY EXPERIENCE
            </p>
            <h1 className="text-white text-4xl md:text-5xl text-center w-full max-w-[600px] tracking-wider leading-tight">
              The best rated hotel in the whole country.
            </h1>
          </div>
        </div>

        <Footer
          theme="dark"
          className="absolute bottom-0"
        />
      </div>
    </>
  );
}
