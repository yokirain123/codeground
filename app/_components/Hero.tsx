import bgImage from "@/components/images/bg.gif";
import Image from "next/image";
import { Button } from "@/components/ui/shadcn/button";
import BlurOutUp from "@/components/HeroText";

function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-72px)] items-center justify-center overflow-hidden">
  <Image
    src={bgImage}
    alt=""
    fill
    priority
    unoptimized
    className="object-cover opacity-50"
  />

  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_48%,rgba(0,0,0,0.85)_100%)]" />

  <div className="relative z-10 flex flex-col items-center px-6 text-center">
    <h2 className="font-pixel text-4xl font-bold text-white md:text-5xl [text-shadow:2px_2px_0_#000,-2px_2px_0_#000,2px_-2px_0_#000,-2px_-2px_0_#000]">
      <BlurOutUp stagger={50}>
        Start your adventure with
      </BlurOutUp>
    </h2>

    <h1 className="mt-2 font-accent text-7xl font-bold leading-none text-accent md:text-9xl [text-shadow:3px_3px_0_#000,-3px_3px_0_#000,3px_-3px_0_#000,-3px_-3px_0_#000]">
      <span className="glint-title" data-text="Code Quest">
        <BlurOutUp delay={300} stagger={80}>
          Code Quest
        </BlurOutUp>
      </span>
    </h1>

    <p className="mt-4 font-pixel text-xl text-white/80 md:text-2xl [text-shadow:2px_2px_0_#000]">
      Beginner-friendly coding courses and projects
    </p>

    <Button
            variant="default"
            className="mt-10 group relative px-8 py-6 cursor-pointer overflow-hidden border bg-accent text-3xl text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
            />
    
            <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
              Start coding
            </span>
          </Button>
  </div>
</section>
  );
}

export default Hero;
