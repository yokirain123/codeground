"use client";

import { UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  Code2,
  LayoutDashboard,
  MessageCircle,
  Trophy,
} from "lucide-react";

export function UserMenu() {
  const handleFeedback = () => {
    console.log("Open feedback modal");
  };

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

        {/* Кнопка, яка запускає функцію */}
        <UserButton.Action
          label="Send feedback"
          labelIcon={<MessageCircle size={16} />}
          onClick={handleFeedback}
        />

        {/* Стандартні кнопки Clerk */}
        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}