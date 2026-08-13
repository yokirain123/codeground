import Image, { type StaticImageData } from "next/image";

import degreeIcon from "@/components/images/degree.png";
import flaskIcon from "@/components/images/flask.png";
import lightningBoltIcon from "@/components/images/lightning-bolt.png";
import treeIcon from "@/components/images/tree.png";

interface ExploreOption {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: StaticImageData;
}

const exploreMoreOptions: ExploreOption[] = [
  {
    id: 1,
    title: "Quiz Pack",
    description: "Test what you learned with short coding quizzes.",
    category: "Practice",
    icon: lightningBoltIcon,
  },
  {
    id: 2,
    title: "Video Courses",
    description: "Follow guided lessons at your own pace.",
    category: "Learn",
    icon: flaskIcon,
  },
  {
    id: 3,
    title: "Community Project",
    description: "Build something together with other learners.",
    category: "Build",
    icon: degreeIcon,
  },
  {
    id: 4,
    title: "Explore Apps",
    description: "Discover projects made with the skills you are learning.",
    category: "Discover",
    icon: treeIcon,
  },
];

export default function ExploreMore() {
  return (
    <section>
      <div className="mb-5 border-b border-white/10 pb-4">
        <p className="font-pixel text-xs uppercase tracking-[0.22em] text-[#899DFF]">
          Optional side quests
        </p>
        <h2 className="mt-1 font-pixel text-3xl font-bold text-white sm:text-4xl">
          Explore <span className="text-[#FFD400]">more</span>
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {exploreMoreOptions.map((option) => (
          <article
            key={option.id}
            className="group flex min-w-0 items-center gap-4 border-2 border-[#899DFF]/30 bg-[#10152A] p-4 shadow-[4px_4px_0_#020307] transition-colors hover:border-[#FFD400]/60"
          >
            <div className="flex size-16 shrink-0 items-center justify-center border border-[#899DFF]/25 bg-black/20">
              <Image
                src={option.icon}
                alt=""
                width={52}
                height={52}
                className="object-contain [image-rendering:pixelated]"
              />
            </div>

            <div className="min-w-0">
              <p className="font-pixel text-[10px] uppercase tracking-[0.18em] text-[#899DFF]">
                {option.category}
              </p>
              <h3 className="mt-1 font-pixel text-xl text-white sm:text-2xl">
                {option.title}
              </h3>
              <p className="mt-1 line-clamp-2 font-sans text-sm leading-5 text-white/50">
                {option.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}