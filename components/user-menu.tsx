"use client";

import { UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  Code2,
  LayoutDashboard,
  Trophy,
} from "lucide-react";

export function UserMenu() {

  return (
    <UserButton>
      <UserButton.MenuItems>
        {/* Посилання на сторінки */}
        <UserButton.Link
          label="Dashboard"
          labelIcon={<LayoutDashboard size={16} />}
          href="/dashboard"
        />

        <UserButton.Link
          label="Playground"
          labelIcon={<Code2 size={16} />}
          href="/playground"
        />

        <UserButton.Link
          label="Courses"
          labelIcon={<BookOpen size={16} />}
          href="/courses"
        />

        <UserButton.Link
          label="Achievements"
          labelIcon={<Trophy size={16} />}
          href="/achievements"
        />

        {/* Стандартні кнопки Clerk */}
        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}