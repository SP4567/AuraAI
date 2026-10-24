import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import BrandLogo from './BrandLogo'

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  return (
    <div className="fixed z-5 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32">
      <button type="button" aria-label="Aura AI home" onClick={() => navigate('/')} className="cursor-pointer">
        <BrandLogo />
      </button>
      {
        user ? <UserButton />
          :
          (
            <button className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5" onClick={openSignIn}>
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          )
      }
    </div>
  )
}
export default Navbar
