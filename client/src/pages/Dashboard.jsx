import { Protect, useAuth } from '@clerk/clerk-react'
import { Gem, Key, Sparkles } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import CreationItem from '../components/CreationItem'

const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getToken } = useAuth() // Get Clerk auth token

  const getDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get Clerk authentication token
      const token = await getToken()
      
      // Using your VITE_BASE_URL from .env
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/'
      
      // Using the correct endpoint from your userRoutes.js
      const response = await fetch(`${baseUrl}api/user/get-user-creation`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include Clerk auth token
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCreations(data.creations || data) // Adjust based on your API response structure
    } catch (err) {
      console.error('Error fetching creations:', err)
      setError(err.message)
      // Fallback to empty array or dummy data
      setCreations([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  const handleDeleteCreation = async (creationId) => {
    try {
      // Get Clerk authentication token
      const token = await getToken()
      
      // Using your VITE_BASE_URL from .env
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/'
      
      // Make delete request to your backend
      const response = await fetch(`${baseUrl}api/user/delete-creation/${creationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Remove the deleted creation from the local state
      setCreations(prevCreations => 
        prevCreations.filter(creation => creation.id !== creationId)
      )
      
      // Optional: Show success message
      console.log('Creation deleted successfully!')
      
    } catch (error) {
      console.error('Failed to delete creation:', error)
      throw error // Re-throw to let CreationItem handle the error state
    }
  }

  useEffect(() => {
    getDashboardData()
  }, [getDashboardData])
  useEffect(() => {
    const interval = setInterval(() => {
      getDashboardData()
    }, 30000) // Fetch every 30 seconds

    return () => clearInterval(interval) // Cleanup on unmount
  }, [getDashboardData])

  if (loading) {
    return (
      <div className='h-full flex justify-center items-center'>
        <div className='text-gray-500'>Loading creations...</div>
      </div>
    )
  }

  return (
    <div className='h-full overflow-y-scroll p-6 sm:p-8'>
      <div className="mb-7">
        <p className="text-sm font-medium text-violet-500">Your workspace</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-800">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Pick up where your creativity left off.</p>
      </div>
      <div className='flex justify-start gap-4 flex-wrap'>
        <div className='flex justify-between items-center w-72 p-5 px-6 bg-white rounded-2xl border border-gray-200 shadow-sm'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creation</p>
            <h2 className='text-xl font-semibold'>{creations.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
            <Sparkles className='w-5 text-white'/>
          </div>
        </div>
        <div className='flex justify-between items-center w-72 p-5 px-6 bg-white rounded-2xl border border-gray-200 shadow-sm'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              <Protect plan='premium' fallback='Free'>Premium</Protect>
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center'>
            <Gem className='w-5 text-white'/>
          </div>
        </div>
      </div>
      
      <div className='space-y-3'>
        <p className='mt-8 mb-4 text-lg font-semibold tracking-tight'>Recent Creations</p>
        {error && (
          <div className='text-red-500 text-sm mb-4'>
            Error loading creations: {error}
          </div>
        )}
        {creations.length === 0 ? (
          <div className='text-gray-500 text-center py-8'>
            No creations found
          </div>
        ) : (
          creations.map((item) => (
            <CreationItem 
              key={item.id} 
              item={item} 
              onDelete={handleDeleteCreation}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard