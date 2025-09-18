import { Sparkles, Stethoscope } from 'lucide-react'
import React, { useState } from 'react'

const HealthAssistant = () => {
  
  const responseStyle = ['Summarised', 'Detailed']
  const [selectType, setSelectType] = useState('Short Summary')
  const [input, setInput] = useState('')
  const onSubmitHandler = async (e) => {
    e.preventDefault();
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#0077B6]'/>
          <h1 className='text-xl font-semibold'>Clinica: AI Health Assistant</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Enter the First Name</p>
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border=gray-300' placeholder='Enter the First Name' required/>
        <p className='mt-6 text-sm font-medium'>Enter the Last Name</p>
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border=gray-300' placeholder='Enter the First Name' required/>
        <p className='mt-6 text-sm font-medium'>Enter the Age</p>
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border=gray-300' placeholder='Enter the Age' required/>
        <p className='mt-6 text-sm font-medium'>Enter the Gender</p>
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border=gray-300' placeholder='Enter the Gender' required/>
        <p className='mt-6 text-sm font-medium'>Enter your Location</p>
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border=gray-300' placeholder='Enter your location' required/>
        <p className='mt-4 text-sm font-medium'>
          Response Style
        </p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {responseStyle.map((item, index)=>(
            <span onClick={() => setSelectType(item)} className={`text=xs px-4 py-1 border rounded-full cursor-pointer ${selectType === item ? 'bg-cyan-50 text-deep to-blue-800' : 'text-gray-500 border-gray-300'}`} key={index}>{item}</span>
          ))}
        </div>
        <br />
        <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#0A2342] via-[#0077B6] to-[#00FFFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          <Stethoscope className='w-5' />Generate prescription
        </button>
      </form>
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-110'>
        <div className='flex items-center gap-3'>
          <Stethoscope className='w-5 h-5 text-[#0077B6]'/>
          <h1 className='text-xl font-semibold'>Generated Prescription</h1>
        </div>
        <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
            <Stethoscope className='w-9 h-9'/>
            <p>Enter the Details and click 'Generate prescription' to get started</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthAssistant
