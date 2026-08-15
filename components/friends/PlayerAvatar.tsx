"use client";

import { useState } from "react";

interface PlayerAvatarProps {
  name: string;
  imageUrl: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-10 text-sm",
  md: "size-14 text-lg",
  lg: "size-28 text-3xl sm:size-32 sm:text-4xl",
} as const;

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export default function PlayerAvatar({
  name,
  imageUrl,
  size = "md",
  className = "",
}: PlayerAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border-2 border-[#899DFF]/55 bg-[#899DFF]/10 font-pixel text-[#AAB8FF] shadow-[3px_3px_0_#020307] ${sizeClasses[size]} ${className}`}
    >
      {showImage ? (
        // Clerk hosts these images remotely, so a plain img avoids Next image-domain config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl ?? ""}
          alt={`${name}'s avatar`}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-label={`${name}'s initials`}>{getInitials(name)}</span>
      )}
    </span>
  );
}
