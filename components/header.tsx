import Logo from "@/app/_components/Logo";
import Navbar from "@/app/_components/Navbar";
import { Button } from "@/components/ui/button";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-4">
      <Link href="/" className="flex items-center gap-x-4">
        <Logo />
      </Link>
      <Navbar />
      <div className="flex items-center gap-x-4 border-l pl-4">
        <Show when="signed-out">
          <Button
            variant="default"
            className="group relative h-8 w-24 shrink-0 cursor-pointer justify-center overflow-hidden rounded-none border bg-accent px-0 font-pixel text-2xl text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            <Link href="/sign-in">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-full left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
              />

              <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                Sign in
              </span>
            </Link>
          </Button>
        </Show>
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-12 w-12 rounded-none border-2 border-accent shadow-[3px_3px_0_#FF8C00]",
              },
            }}
          />
        </Show>
      </div>
    </header>
  );
}
