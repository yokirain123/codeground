"use client"

import React from 'react'
import WelcomeBanner from './_components/WelcomeBanner'
import EnrolledCourses from './_components/EnrolledCourses'
import ExploreMore from './_components/ExploreMore'
import InviteFriend from './_components/InviteFriend'
import UserStatus from './_components/UserStatus'

function Dashboard() {
  return (
    <div className='p-10 md:px-20 lg:px-32 xl:px-48'>
      <div className='grid grid-cols-3 gap-7'>
        <div className='col-span-2 flex gap-8 flex-col'>
          <WelcomeBanner/>
          <EnrolledCourses/>
          <ExploreMore/>
          <InviteFriend/>
          </div>
          <div><UserStatus/></div>
      </div>
      
    </div>
  )
}

export default Dashboard