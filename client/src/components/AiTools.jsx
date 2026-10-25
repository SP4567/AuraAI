import React from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const AiTools = () => {
    const navigate = useNavigate();
    return (
    <div className="px-4 sm:px-12 xl:px-24 py-20">
        <div className='text-center'>
            <span className="section-eyebrow">Everything you need</span>
            <h2 className='text-slate-700 text-4xl sm:text-5xl font-semibold tracking-tight'>Powerful AI Tools</h2>
            <p className='text-slate-500 max-w-lg mx-auto mt-3'>Explore our suite of AI tools designed to help you create stunning content effortlessly with cutting edge technology.</p>
        </div>
        <div className='flex flex-wrap mt-10 justify-center'>  
            {AiToolsData.map((tool, index) => (
                <div key={index} className='surface-card p-7 m-3 max-w-3xs rounded-2xl shadow-sm border hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer' onClick={() => navigate(tool.path)}>
                    <tool.Icon className='w-12 h-12 p-3 rounded-xl' style={{ background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`}}/>
                    <h3 className='mt-6 mb-3 text-lg font-semibold'>{tool.title}</h3>
                    <p className='text-sm max-w-[95%] text-gray-500'>{tool.description}</p>
                </div>
            ))}
        </div>
    </div>
  )
}

export default AiTools
