"use client";

import { UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  Code2,
  LayoutDashboard,
  Trophy,
  UsersRound,
} from "lucide-react";

export function UserMenu() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Dashboard"
          labelIcon={<LayoutDashboard size={16} />}
          href="/dashboard"
        />

        <UserButton.Link
          label="Friends"
          labelIcon={<UsersRound size={16} />}
          href="/friends"
        />

        <UserButton.Link
          label="Achievements"
          labelIcon={<Trophy size={16} />}
          href="/achievements"
        />

        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}
