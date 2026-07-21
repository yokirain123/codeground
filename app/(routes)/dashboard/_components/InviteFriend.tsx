"use client"

import React from 'react'
import Image from 'next/image'
import Mail from '@/components/images/mail.png'
import { Button } from '@/components/ui/shadcn/button'
import { Input } from '@/components/ui/shadcn/input'

function InviteFriend() {
  return (
    <div>
        <div className="flex flex-col gap-3 w-full justify-center items-center border border-accent pb-10 pt-8 px-8 shadow-[4px_4px_0_0_#FF8C00]">
           <Image src={Mail} alt='Invite Friend' width={80} height={80}/>
          <h2 className="text-4xl text-accent">
            Invite friend
          </h2>
          <p className='text-2xl'>Having fun? Share the love with a friend!</p>
          <div className='flex items-center gap-3 w-[75%]'>
            <Input placeholder="Enter friend's email"/>
            <Button
            variant="default"
            className="group relative px-2 py-4 cursor-pointer overflow-hidden border bg-accent text-xl text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
            />

            <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
              Invite
            </span>
          </Button>
          </div>
          
        </div>
    </div>
  )
}

export default InviteFriend