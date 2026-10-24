import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'
import BrandLogo from '../components/BrandLogo'
import ThemeToggle from '../components/ThemeToggle'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser()

  return  user ? (
    <div className="app-shell flex flex-col items-start justify-start h-screen relative">
      <nav className="w-full px-5 sm:px-8 min-h-16 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--surface-bg)]">
        <button type="button" aria-label="Aura AI home" onClick={() => navigate('/')} className="cursor-pointer">
          <BrandLogo />
        </button>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {sidebar ? <X onClick={() => setSidebar(false)} className="w-6 h-6 text-[var(--text-secondary)] sm:hidden cursor-pointer" /> : <Menu onClick={() => setSidebar(true)} className="w-6 h-6 text-[var(--text-secondary)] sm:hidden cursor-pointer" />}
        </div>
      </nav>
      <div className="flex-1 w-full flex min-h-0">
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <div className="flex-1 min-w-0 bg-[var(--page-bg)] text-[var(--text-primary)]">
          <Outlet />
        </div>
      </div>  
    </div>
  ): (
    <div className='flex items-center justify-center h-screen'>
      <SignIn />
    </div>
  )
}

export default Layout
