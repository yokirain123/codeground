"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Star from "@/components/images/blink.png";
import Badge from "@/components/images/label.png";
import Streak from "@/components/images/confetti.png";
import { ProfileAvatar } from "@/components/profile-avatar";

function UserStatus() {
  const { user } = useUser();
  return (
    <div className="px-10 py-4 border border-accent shadow-[4px_4px_0_0_#FF8C00]">
      <div className="flex items-center justify-center gap-6">
        <ProfileAvatar />
        <h2 className="text-4xl">{user?.primaryEmailAddress?.emailAddress}</h2>
      </div>
      <div className="grid grid-cols-2 gap-5 mt-6">
        <div className="flex gap-3 items-center">
          <Image src={Star} alt="Points" width={50} height={50} />
          <div className="flex flex-col">
            <h3 className="text-3xl text-accent">20</h3>
            <h3 className="text-xl">Total points</h3>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <Image src={Badge} alt="Points" width={50} height={50} />
          <div className="flex flex-col">
            <h3 className="text-3xl text-accent">3</h3>
            <h3 className="text-xl">Badge</h3>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <Image src={Streak} alt="Points" width={50} height={50} />
          <div className="flex flex-col">
            <h3 className="text-3xl text-accent">7</h3>
            <h3 className="text-xl">Streak</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserStatus;
