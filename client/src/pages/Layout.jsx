import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import image from '../assets/newImage.png'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser()

  return  user ? (
    <div className='flex flex-col items-start justify-start h-screen bg-black relative'>
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
        <img src={image} className='w-32 sm:w-30 flex items-center gap-2 rounded-full text-sm cursor-pointer' alt="logo" onClick={() => navigate('/')}/>
        {
          sidebar ? <X onClick={() => setSidebar(false)} className="w-6 h-6 text-white sm:hidden cursor-pointer" /> : <Menu onClick={() => setSidebar(true)} className='w-6 h-6 text-white sm:hidden cursor-pointer'/>
        }
      </nav>
      <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <div className='flex-1 bg-[#F4F7FB]'>
          <Outlet />
        </div>
        {sidebar && (
          <div 
            className="fixed inset-0 bg-black/20 sm:hidden z-[60]"
            onClick={() => setSidebar(false)}
          />
        )}
      </div>  
    </div>
  ): (
    <div className='flex items-center justify-center h-screen'>
      <SignIn />
    </div>
  )
}

export default Layout
