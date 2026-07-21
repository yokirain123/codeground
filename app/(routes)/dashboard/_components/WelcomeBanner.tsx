import React from 'react'
import Image from 'next/image'
import pixWelcome from '@/components/images/pc.gif'
import { useUser } from '@clerk/nextjs'

function WelcomeBanner() {
    const {user} = useUser(); 
  return (
    <div className='flex gap-3 items-center'>
        <Image src={pixWelcome} width={120} height={120} alt="Welcome" className='-scale-x-100'/>
        <h2 className='text-3xl text-primary border border-accent font-bold py-2 px-4 mb-10 rounded-full rounded-bl-none'>Welcome back, <span className="text-accent">{user?.fullName}</span>! Ready to learn something new?</h2>
    </div>
  )
}

export default WelcomeBanner