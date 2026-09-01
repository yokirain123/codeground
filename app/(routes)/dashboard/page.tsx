import Footer from "@/app/_components/Footer";

import EnrolledCourses from "./_components/EnrolledCourses";
import ExploreMore from "./_components/ExploreMore";
import FriendsSummary from "./_components/FriendsSummary";
import InviteFriend from "./_components/InviteFriend";
import UserStatus from "./_components/UserStatus";
import WelcomeBanner from "./_components/WelcomeBanner";

export default function Dashboard() {
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:px-10 lg:px-12 lg:py-14">
        <WelcomeBanner />

        <div className="mt-8 grid items-start gap-8 sm:mt-10 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
          <div className="flex min-w-0 flex-col gap-10 sm:gap-12">
            <EnrolledCourses />
            <ExploreMore />
            <InviteFriend />
          </div>

          <div className="min-w-0 lg:sticky lg:top-24">
            <div className="flex flex-col gap-6">
              <UserStatus />
              <FriendsSummary />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
