import React from 'react'
import {PricingTable} from '@clerk/clerk-react'
const Plan = () => {
  return (
    <div className='max-w-2xl mx-auto z-20 my-25'>

      <div className='text-center px-4 sm:px-20 xl:px-32 py-24'>
        <h2 className='text-slate-700 max-w-lg text-[42px] font-semibold'>Choose Your Plan</h2>
        <p className='text-gray-500 max-w-lg mx-auto'>Start for free and scale up as you grow. Find the perfect plan for your content creation needs.</p>
      </div>

      <div>
        <PricingTable className='p-10 mt-14 max-sm:mx-8'/>
      </div>

    </div>
  )
}

export default Plan
