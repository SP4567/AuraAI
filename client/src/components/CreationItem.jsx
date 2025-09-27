import React, { useState } from 'react'
import Markdown from 'react-markdown'

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      onClick={() => setExpanded(!expanded)} 
      className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow'
    >
      <div className='flex justify-between items-center gap-4'>
        <div>
          <h2 className='font-medium text-gray-900'>{item.prompt}</h2>
          <p className='text-gray-500 text-xs mt-1'>
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <button className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full text-xs font-medium'>
          {item.type}
        </button>
      </div>
      
      {expanded && (
        <div className='mt-4 border-t border-gray-100 pt-4'>
          {item.type === 'image' ? (
            <div>
              <img 
                src={item.content} 
                alt='Generated creation' 
                className='mt-3 w-full max-w-md rounded-lg shadow-sm' 
              />
            </div>
          ) : (
            <div className='mt-3 max-h-96 overflow-y-auto text-sm text-slate-700'>
              <div className='prose prose-sm max-w-none'>
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Optional: Add expand/collapse indicator */}
      <div className='flex justify-center mt-2'>
        <div className={`text-gray-400 text-xs transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </div>
    </div>
  )
}

export default CreationItem