"use client";

import { useUser } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  size?: number;
  rounded?: boolean;
  className?: string;
}

export function ProfileAvatar({
  size = 64,
  rounded = false,
  className,
}: ProfileAvatarProps) {
  const {
    user,
    isLoaded,
    isSignedIn,
  } = useUser();

  if (!isLoaded) {
    return (
      <div
        className="shrink-0 animate-pulse bg-muted"
        style={{
          width: size,
          height: size,
          borderRadius: rounded ? "9999px" : "0px",
        }}
      />
    );
  }

  if (!isSignedIn || !user) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.imageUrl}
      alt={
        user.fullName
          ? `${user.fullName} avatar`
          : "User avatar"
      }
      width={size}
      height={size}
      className={cn(
        "shrink-0 border-2 border-accent object-cover",
        "shadow-[3px_3px_0_0_#FF8C00]",
        className,
      )}
      style={{
        width: size,
        height: size,
        borderRadius: rounded ? "9999px" : "0px",
      }}
    />
  );
}