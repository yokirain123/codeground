"use client";

import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import Image from "next/image";
import bookCourses from "@/components/images/book.gif";
import { Button } from "@/components/ui/shadcn/button";

function EnrolledCourses() {
  const [enroledCourses, setEnrolledCourses] = useState([]);
  return (
    <div className="flex flex-col">
        <h2 className="text-4xl font-bold">Your enrolled courses</h2>
      {enroledCourses.length == 0 ? (
        
        <div className="flex flex-col gap-3 w-full justify-center items-center border border-accent py-8 px-8 shadow-[4px_4px_0_0_#FF8C00]">
          <Image src={bookCourses} width={90} height={90} alt="Welcome" />
          <h2 className="text-3xl">
            You have not enrolled in any courses yet!
          </h2>
          <Button
            variant="default"
            className="group relative px-2 py-4 cursor-pointer overflow-hidden border bg-accent text-3xl text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
            />

            <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
              Browse all courses
            </span>
          </Button>
        </div>
        
      ) : (
        <div>List</div>
      )}
    </div>
  );
}

export default EnrolledCourses;
