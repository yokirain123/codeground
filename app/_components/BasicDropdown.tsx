"use client";

import { Button } from "@/components/ui/shadcn/button";
import { ChevronDown } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const DROPDOWN_OFFSET = 8;
const MIN_DROPDOWN_WIDTH = 190;

export interface DropdownItem {
  id: string | number;
  label: string;
  icon?: ReactNode;
}

interface BasicDropdownProps {
  label: string;
  items: DropdownItem[];
  className?: string;
  onChange?: (item: DropdownItem) => void;
}

export default function BasicDropdown({
  label,
  items,
  className = "",
  onChange,
}: BasicDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: MIN_DROPDOWN_WIDTH,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shouldReduceMotion = useReducedMotion();

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + DROPDOWN_OFFSET,
      left: rect.left,
      width: Math.max(rect.width, MIN_DROPDOWN_WIDTH),
    });
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(0);
  }, []);

  const handleToggle = useCallback(() => {
    if (!isOpen) {
      updatePosition();
    }

    setIsOpen((previousState) => !previousState);
  }, [isOpen, updatePosition]);

  const handleItemSelect = useCallback(
    (item: DropdownItem) => {
      closeDropdown();
      onChange?.(item);
    },
    [closeDropdown, onChange],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedTrigger = wrapperRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);

      if (!clickedTrigger && !clickedDropdown) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeDropdown]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
        buttonRef.current?.focus();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setFocusedIndex((currentIndex) =>
          currentIndex === items.length - 1
            ? 0
            : currentIndex + 1,
        );
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setFocusedIndex((currentIndex) =>
          currentIndex === 0
            ? items.length - 1
            : currentIndex - 1,
        );
      }

      if (event.key === "Home") {
        event.preventDefault();
        setFocusedIndex(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        setFocusedIndex(items.length - 1);
      }

      if (event.key === "Enter") {
        event.preventDefault();

        const selectedItem = items[focusedIndex];

        if (selectedItem) {
          handleItemSelect(selectedItem);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isOpen,
    items,
    focusedIndex,
    closeDropdown,
    handleItemSelect,
  ]);

  const dropdown = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : {
                  opacity: 0,
                  y: -10,
                  scaleY: 0.8,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
            scaleY: 1,
          }}
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  y: -10,
                  scaleY: 0.8,
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  type: "spring",
                  bounce: 0.1,
                  duration: 0.25,
                }
          }
          className="fixed z-50 origin-top overflow-hidden bg-background font-pixel shadow-[4px_4px_0_0_#FF8C00]"
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
          }}
        >
          <ul
            id="home-dropdown-items"
            role="listbox"
            aria-label={`${label} navigation`}
            className="p-2"
          >
            {items.map((item, index) => (
              <motion.li
                key={item.id}
                role="option"
                aria-selected={index === focusedIndex}
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : {
                        opacity: 0,
                        x: -10,
                      }
                }
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.2,
                  delay: shouldReduceMotion ? 0 : index * 0.04,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleItemSelect(item)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`flex w-full items-center px-4 py-2 text-left text-xl transition-colors hover:bg-accent hover:text-black focus-visible:outline-none ${
                    focusedIndex === index
                      ? "bg-accent text-black"
                      : "text-foreground"
                  }`}
                >
                  {item.icon && (
                    <span className="mr-2">{item.icon}</span>
                  )}

                  {item.label}
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        ref={wrapperRef}
        className="relative inline-block h-8 w-24"
      >
        <Button
          ref={buttonRef}
          type="button"
          variant="default"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="home-dropdown-items"
          onClick={handleToggle}
          className={`group relative h-8 w-24 shrink-0 cursor-pointer justify-center overflow-hidden border bg-accent px-0 text-2xl text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ${className}`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-full left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
          />

          <span className="relative z-10 flex items-center gap-1 transition-colors duration-500 group-hover:text-white">
            {label}

            <motion.span
              animate={{
                rotate: isOpen ? 180 : 0,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.2,
              }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </span>
        </Button>
      </div>

      {typeof document !== "undefined"
        ? createPortal(dropdown, document.body)
        : null}
    </>
  );
}