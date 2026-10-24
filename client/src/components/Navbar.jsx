import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import BrandLogo from './BrandLogo'
import ThemeToggle from './ThemeToggle'

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  return (
    <div className="fixed top-0 left-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--nav-bg)] backdrop-blur-xl flex justify-between items-center py-3 px-4 sm:px-12 xl:px-24">
      <button type="button" aria-label="Aura AI home" onClick={() => navigate('/')} className="cursor-pointer">
        <BrandLogo />
      </button>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user ? <UserButton /> : (
          <button className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-6 py-2.5 transition hover:brightness-110" onClick={openSignIn}>
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
export default Navbar
