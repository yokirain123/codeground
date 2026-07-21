import Image from "next/image";

import lightningBoltIcon from "@/components/images/lightning-bolt.png";
import flaskIcon from "@/components/images/flask.png";
import degreeIcon from "@/components/images/degree.png";
import treeIcon from "@/components/images/tree.png";

const exploreMoreOptions = [
  {
    id: 1,
    title: "Quiz Pack",
    desc: "Practice",
    icon: lightningBoltIcon,
  },
  {
    id: 2,
    title: "Video Courses",
    desc: "Learn",
    icon: flaskIcon,
  },
  {
    id: 3,
    title: "Community Project",
    desc: "Build",
    icon: degreeIcon,
  },
  {
    id: 4,
    title: "Explore Apps",
    desc: "Explore prebuilt apps",
    icon: treeIcon,
  },
];

function ExploreMore() {
  return (
    <section>
      <h2 className="text-4xl font-bold">Explore more</h2>

      <div className="grid grid-cols-2 gap-5">
        {exploreMoreOptions.map((option) => (
          <div key={option.id} className="border border-accent flex p-6 gap-3 items-center shadow-[4px_4px_0_0_#FF8C00]">
            <Image
              src={option.icon}
              alt={option.title}
              width={80}
              height={80}
            />
            <div className="flex-col flex">
              <h3 className="text-4xl text-accent">{option.title}</h3>
              <p className="text-2xl">{option.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExploreMore;
