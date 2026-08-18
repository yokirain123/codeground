"use client";

import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";

export function UserMenu() {
  const { t } = useI18n();

  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label={t("Dashboard")}
          labelIcon={<LayoutDashboard size={16} />}
          href="/dashboard"
        />

        <UserButton.Link
          label={t("Friends")}
          labelIcon={<UsersRound size={16} />}
          href="/friends"
        />

        <UserButton.Link
          label={t("Achievements")}
          labelIcon={<Trophy size={16} />}
          href="/achievements"
        />

        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}
