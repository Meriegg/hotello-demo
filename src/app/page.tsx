import { Footer } from "~/components/Footer";
import { HomepageAIHelp } from "~/components/HomepageAIHelp";

export default function Home() {
  return (
    <div
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/homepage-background-image.jpg)",
        backgroundSize: "cover",
      }}
      className="relative min-h-[calc(100vh+250px)]"
    >
      <div className="-mt-24 flex justify-center text-center">
        <div className="mt-44 flex flex-col items-center justify-center gap-0 text-center">
          <p className="text-center text-xs tracking-[10px] text-neutral-200 md:text-sm">
            A LUXURY EXPERIENCE
          </p>
          <h1 className="w-full max-w-[600px] text-center text-4xl leading-tight tracking-wider text-white md:text-5xl">
            The best rated hotel in the whole country.
          </h1>
          <HomepageAIHelp />
        </div>
      </div>

      <Footer theme="dark" className="absolute bottom-0" />
    </div>
  );
}
