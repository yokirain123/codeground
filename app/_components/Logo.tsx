import React from 'react'
import Image from "next/image";
import moonImage from "@/components/images/logo.png";

function Logo() {
  return (
    <div className='flex flex-row items-center gap-2'>
        <Image src={moonImage} alt="Moon" width={50} height={50} className="rounded-full" />
        <div className='flex gap-0 items-center'>
          <h1 className='font-accent text-4xl text-white'>Code</h1>
        <h1 className='font-accent text-4xl text-accent'>Quest</h1>
        </div>
    </div>
  )
}

export default Logo