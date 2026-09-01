import Image from "next/image";

import moonImage from "@/components/images/logo.png";

interface LogoProps {
  compactOnMobile?: boolean;
}

/**
 * Renders the CodeQuest logo with an optional compact layout on small screens.
 *
 * @param compactOnMobile - Whether to reduce the image size and hide the wordmark below the `sm` breakpoint
 */
function Logo({ compactOnMobile = false }: LogoProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Image
        src={moonImage}
        alt="CodeQuest"
        width={50}
        height={50}
        sizes={compactOnMobile ? "(max-width: 639px) 40px, 48px" : "48px"}
        className={`shrink-0 rounded-full ${
          compactOnMobile ? "size-10 sm:size-12" : "size-12"
        }`}
      />

      <div
        className={
          compactOnMobile
            ? "hidden min-w-0 items-center sm:flex"
            : "flex min-w-0 items-center"
        }
      >
        <span className="font-accent text-4xl text-white">Code</span>
        <span className="font-accent text-4xl text-accent">Quest</span>
      </div>
    </div>
  );
}

export default Logo;
