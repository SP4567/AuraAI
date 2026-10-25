import { Protect, useAuth } from '@clerk/clerk-react'
import { FileText, Gem, Image, RefreshCw, Search, Sparkles } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreationItem from '../components/CreationItem'

const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const getDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = await getToken()
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/'
      
      const response = await fetch(`${baseUrl}api/user/get-user-creation`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCreations(Array.isArray(data.creations) ? data.creations : [])
    } catch (err) {
      console.error('Error fetching creations:', err)
      setError(err.message)
      setCreations([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  const handleDeleteCreation = async (creationId) => {
    const token = await getToken()
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/'
    
    const response = await fetch(`${baseUrl}api/user/delete-creation/${creationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to delete creation (HTTP ${response.status})`)
    }

    setCreations(prev => prev.filter(c => c.id !== creationId))
  }

  useEffect(() => {
    getDashboardData()
  }, [getDashboardData])

  useEffect(() => {
    const interval = setInterval(() => {
      getDashboardData()
    }, 45000)
    return () => clearInterval(interval)
  }, [getDashboardData])

  const imageCreationsCount = useMemo(() => {
    return creations.filter(c => c.type === 'image').length
  }, [creations])

  const textCreationsCount = useMemo(() => {
    return creations.filter(c => c.type !== 'image').length
  }, [creations])

  const filteredCreations = useMemo(() => {
    return creations.filter(item => {
      const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter
      const matchesSearch = searchQuery.trim() === '' || 
        item.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [creations, selectedFilter, searchQuery])

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'article', label: 'Articles' },
    { id: 'blog-title', label: 'Titles' },
    { id: 'image', label: 'Images' },
    { id: 'resume-review', label: 'Resumes' },
    { id: 'prescription', label: 'Health' },
    { id: 'study-content', label: 'Study' },
  ]

  return (
    <div className='h-full overflow-y-scroll p-6 sm:p-8'>
      {/* Header */}
      <div className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Your Creative Workspace</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Welcome Back</h1>
          <p className="mt-1 text-sm text-slate-500">Review, manage, and export all your generative AI creations.</p>
        </div>

        <button
          onClick={getDashboardData}
          className="self-start sm:self-auto inline-flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='flex justify-between items-center p-5 px-6 bg-white rounded-2xl border border-gray-200 shadow-xs'>
          <div className='text-slate-600'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Total Creations</p>
            <h2 className='text-2xl font-bold text-gray-900 mt-1'>{creations.length}</h2>
          </div>
          <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center shadow-xs'>
            <Sparkles className='w-5 h-5 text-white'/>
          </div>
        </div>

        <div className='flex justify-between items-center p-5 px-6 bg-white rounded-2xl border border-gray-200 shadow-xs'>
          <div className='text-slate-600'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Images & Cutouts</p>
            <h2 className='text-2xl font-bold text-gray-900 mt-1'>{imageCreationsCount}</h2>
          </div>
          <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-[#20C363] to-[#11B97E] text-white flex justify-center items-center shadow-xs'>
            <Image className='w-5 h-5 text-white'/>
          </div>
        </div>

        <div className='flex justify-between items-center p-5 px-6 bg-white rounded-2xl border border-gray-200 shadow-xs'>
          <div className='text-slate-600'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Text Outputs</p>
            <h2 className='text-2xl font-bold text-gray-900 mt-1'>{textCreationsCount}</h2>
          </div>
          <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] text-white flex justify-center items-center shadow-xs'>
            <FileText className='w-5 h-5 text-white'/>
          </div>
        </div>

        <div className='flex justify-between items-center p-5 px-6 bg-white rounded-2xl border border-gray-200 shadow-xs'>
          <div className='text-slate-600'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Subscription Plan</p>
            <h2 className='text-2xl font-bold text-gray-900 mt-1'>
              <Protect plan='premium' fallback='Free Tier'>Premium VIP</Protect>
            </h2>
          </div>
          <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center shadow-xs'>
            <Gem className='w-5 h-5 text-white'/>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className='mt-8 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0'>
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
                selectedFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className='relative w-full md:w-72'>
          <Search className='absolute left-3 top-2.5 w-4 h-4 text-gray-400' />
          <input
            type="text"
            placeholder="Search prompt or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Recent Creations List */}
      <div className='space-y-3.5'>
        {error && (
          <div className='p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl'>
            Error loading creations: {error}
          </div>
        )}

        {loading ? (
          <div className='space-y-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='p-6 bg-white rounded-xl border border-gray-200 animate-pulse'>
                <div className='h-4 bg-gray-200 rounded w-1/3 mb-2'></div>
                <div className='h-3 bg-gray-100 rounded w-1/4'></div>
              </div>
            ))}
          </div>
        ) : filteredCreations.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-200 text-center py-16 px-4'>
            <div className='w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3'>
              <Sparkles className='w-7 h-7' />
            </div>
            <h3 className='text-base font-semibold text-gray-800'>No creations match your query</h3>
            <p className='text-xs text-gray-500 mt-1 max-w-sm mx-auto'>
              {searchQuery ? 'Try adjusting your search terms or filters.' : 'Start generating articles, images, or study guides to see them here.'}
            </p>
            <button
              onClick={() => navigate('/ai/write-article')}
              className='mt-4 inline-flex items-center gap-2 text-xs font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer shadow-xs'
            >
              Start Generating
            </button>
          </div>
        ) : (
          filteredCreations.map((item) => (
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
