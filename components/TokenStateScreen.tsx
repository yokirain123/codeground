"use client";

import Image from "next/image";
import Link from "next/link";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import Token from "@/components/images/Token.png";
import { Button } from "@/components/ui/shadcn/button";
import { useI18n } from "@/components/i18n/I18nProvider";

type TokenStateMode =
  | "loading"
  | "not-found";

interface TokenStateScreenProps {
  mode: TokenStateMode;
}

/**
 * Displays a loading or not-found state for the Token quest interface.
 *
 * @param mode - Whether to display the loading state or the not-found state.
 */
export default function TokenStateScreen({
  mode,
}: TokenStateScreenProps) {
  const shouldReduceMotion =
    useReducedMotion();
  const { t } = useI18n();

  const isLoading = mode === "loading";

  return (
    <section
      role={
        isLoading
          ? "status"
          : undefined
      }
      aria-live={
        isLoading
          ? "polite"
          : undefined
      }
      className="relative isolate flex min-h-[calc(100dvh-64px)] items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,212,0,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,212,0,0.12)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,212,0,0.08),transparent_55%)]"
      />

      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 35,
                scale: 0.94,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 20,
        }}
        className="relative z-10 w-full max-w-xl bg-black p-1 shadow-[8px_8px_0_0_#FF8C00]"
      >
        <div className="border-4 border-accent bg-[#111111] p-1">
          <div className="relative flex flex-col items-center border-2 border-white/15 px-4 py-8 text-center sm:px-6 sm:py-9 md:px-10">
            <span className="absolute -top-5 left-1/2 max-w-[calc(100%_-_1rem)] -translate-x-1/2 border-2 border-black bg-accent px-3 py-1 text-center font-pixel text-lg leading-tight text-black shadow-[3px_3px_0_0_#FF8C00] sm:px-4 sm:text-xl sm:whitespace-nowrap">
              {t("Quest Master")}
            </span>

            {!isLoading && (
              <motion.p
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: -15,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="font-pixel text-6xl leading-none text-accent [text-shadow:4px_4px_0_#FF8C00] sm:text-7xl md:text-9xl"
              >
                404
              </motion.p>
            )}

            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : isLoading
                    ? {
                        y: [
                          0,
                          -8,
                          0,
                        ],
                        rotate: [
                          0,
                          -1,
                          0,
                          1,
                          0,
                        ],
                      }
                    : {
                        y: [
                          0,
                          -3,
                          0,
                        ],
                      }
              }
              transition={{
                duration: isLoading
                  ? 2
                  : 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`relative overflow-hidden border-2 border-accent bg-black ${
                isLoading
                  ? "mt-2 size-44 md:size-52"
                  : "mt-5 size-36 md:size-44"
              }`}
            >
              <Image
                src={Token}
                alt={t("Token, the Quest Master")}
                fill
                priority
                unoptimized
                sizes={
                  isLoading
                    ? "(min-width: 768px) 208px, 176px"
                    : "(min-width: 768px) 176px, 144px"
                }
                className="origin-bottom object-contain [image-rendering:pixelated]"
                style={{
                  transform:
                    "scale(1.15, 1.15)",
                }}
              />
            </motion.div>

            <motion.h1
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 15,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
              }}
              className="mt-6 break-words font-pixel text-2xl text-accent [text-shadow:2px_2px_0_#000] sm:text-3xl md:text-4xl"
            >
              {isLoading
                ? t("Preparing your quest...")
                : t("This path isn't on the map")}
            </motion.h1>

            <motion.p
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                    }
              }
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.4,
              }}
              className="mt-3 max-w-md break-words font-pixel text-lg leading-relaxed text-white/65 sm:text-xl md:text-2xl"
            >
              {isLoading
                ? t(
                    "Token is gathering everything you need for the next adventure.",
                  )
                : t(
                    "It looks like this area hasn't been unlocked, or the path no longer exists.",
                  )}
            </motion.p>

            {isLoading ? (
              <div className="mt-7 w-full max-w-sm">
                <div className="h-4 overflow-hidden border-2 border-accent bg-black p-0.5">
                  <motion.div
                    animate={
                      shouldReduceMotion
                        ? {
                            x: "100%",
                          }
                        : {
                            x: [
                              "-110%",
                              "310%",
                            ],
                          }
                    }
                    transition={{
                      duration: 1.25,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-full w-1/3 bg-accent shadow-[0_0_8px_#FFD400]"
                  />
                </div>

                <div className="mt-3 flex justify-center gap-2">
                  {[0, 1, 2].map(
                    (dot) => (
                      <motion.span
                        key={dot}
                        aria-hidden="true"
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : {
                                opacity: [
                                  0.25,
                                  1,
                                  0.25,
                                ],
                                y: [
                                  0,
                                  -3,
                                  0,
                                ],
                              }
                        }
                        transition={{
                          duration: 0.8,
                          delay:
                            dot * 0.15,
                          repeat:
                            Infinity,
                        }}
                        className="size-2 bg-accent"
                      />
                    ),
                  )}
                </div>
              </div>
            ) : (
              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 18,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.55,
                  type: "spring",
                  stiffness: 220,
                  damping: 18,
                }}
                className="mt-7 flex w-full flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
              >
                <Button
                  variant="default"
                  className="group relative h-auto w-full cursor-pointer overflow-hidden border-2 border-black bg-accent px-5 py-3 font-pixel text-xl whitespace-normal text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-1 active:translate-y-1 active:shadow-none sm:w-auto sm:text-2xl"
                >
                  <Link href="/">
                    <span
                      aria-hidden="true"
                      className="absolute top-full left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
                    />

                    <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                      {t("Return home")}
                    </span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto w-full cursor-pointer border-2 border-white/20 bg-black px-5 py-3 font-pixel text-xl whitespace-normal text-white shadow-[4px_4px_0_0_#333] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:border-accent hover:bg-accent/10 hover:text-accent hover:shadow-[2px_2px_0_0_#FF8C00] sm:w-auto sm:text-2xl"
                >
                  <Link href="/courses">
                    {t("View courses")}
                  </Link>
                </Button>
              </motion.div>
            )}

            <span
              aria-hidden="true"
              className="absolute top-2 left-2 size-2 bg-accent"
            />

            <span
              aria-hidden="true"
              className="absolute top-2 right-2 size-2 bg-accent"
            />

            <span
              aria-hidden="true"
              className="absolute bottom-2 left-2 size-2 bg-accent"
            />

            <span
              aria-hidden="true"
              className="absolute right-2 bottom-2 size-2 bg-accent"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
