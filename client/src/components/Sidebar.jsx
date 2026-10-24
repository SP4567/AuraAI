import React from 'react'
import { useClerk, useUser } from '@clerk/clerk-react'
import { NavLink } from 'react-router-dom'
import { 
  Hash, 
  House, 
  SquarePen, 
  Image, 
  Eraser, 
  Scissors, 
  FileText, 
  Stethoscope, 
  Book, 
  LogOut, 
  User, 
  PanelsTopLeft,
  Users
} from 'lucide-react'

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: House },
  { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
  { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
  { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
  { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
  { to: '/ai/remove-objects', label: 'Remove Objects', Icon: Scissors },
  { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
  { to: '/ai/health-assistant', label: 'Health Assistant', Icon: Stethoscope },
  { to: '/ai/study-assistant', label: 'Study Assistant', Icon: Book },
  { to: '/ai/community', label: 'Community', Icon: Users},
]

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()

  return (
    <div
      className={`z-20 w-60 h-full overflow-y-auto bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-16 bottom-0
        ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} 
        transition-all duration-300 ease-in-out`}
    >
      {/* Profile */}
      <div className="my-5 w-full text-center">
        <img 
          src={user.imageUrl} 
          alt="profile" 
          className="w-12 h-12 rounded-full mx-auto cursor-pointer"
          onClick={() => openUserProfile()} 
        />
        <h1 className="mt-2 text-sm font-medium">{user.fullName}</h1>
      </div>

      {/* Nav Links */}
      <div className="flex flex-col w-full px-3 gap-1">
        {navItems.map((navItem) => (
          <NavLink
            key={navItem.to}
            to={navItem.to}
            end={navItem.to === '/ai'}
            onClick={() => setSidebar(false)}
            className={({ isActive }) =>
              `px-3.5 py-3 flex items-center gap-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {React.createElement(navItem.Icon, { className: 'w-4 h-4' })}
            {navItem.label}
          </NavLink>
        ))}
      </div>

      {/* Footer (Profile + Logout) */}
      <div className="w-full border-t border-gray-200 px-3 py-4 flex flex-col gap-2">
        <button
          onClick={() => openUserProfile()}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded text-gray-700 hover:bg-gray-100"
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar