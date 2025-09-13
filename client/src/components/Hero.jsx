import React, { use } from 'react'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
    const navigate = useNavigate();
  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url(/blue-pink-halftone-background_53876-99004.jpg)] bg-cover bg-no-repeat min-h-screen'>
        <div className='text-center mb-6'>
            <h1 className='text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto leading-[1.2]'>Create amazing content <br /> <span className='text-primary'>with AI tools</span></h1>
            <p className='text-lg sm:text-xl md:text-2xl 2xl:text-3xl'>Unleash your creativity with our powerful AI-driven platform.</p>
        </div>
        <div className='flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs'>
            <button onClick={() => navigate('/ai')} className='bg-primary text-white px-10 py-3 rounded-lg
            hover:scale-102 active:scale-95 transition cursor-pointer'>Start Creating Now</button>
            <button className='bg-white px-10 py-3 rounded-lg border
            border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer'>Watch Demo</button>
        </div>
    </div>
  )
}

export default Hero
