import type { ReactNode } from "react";

interface HomeSectionsBackgroundProps {
  children: ReactNode;
}

export default function HomeSectionsBackground({
  children,
}: HomeSectionsBackgroundProps) {
  return (
    <div className="relative isolate overflow-hidden bg-[#07080C]">
      {/*
       * One shared ambient-light layer for every section inside this wrapper.
       * Because it is positioned against the wrapper instead of an individual
       * section, the light continues naturally across section boundaries.
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_24%_at_16%_15%,rgba(63,86,189,0.17),transparent_72%),radial-gradient(ellipse_48%_30%_at_96%_48%,rgba(255,212,0,0.055),transparent_74%),radial-gradient(ellipse_52%_25%_at_8%_82%,rgba(63,86,189,0.11),transparent_72%)]"
      />

      {/* A single very subtle grid also prevents the texture from restarting. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#899DFF_1px,transparent_1px),linear-gradient(to_bottom,#899DFF_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black_0%,black_32%,transparent_92%)]"
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
