import { Eraser, Scissors, Sparkles } from 'lucide-react'
import React, { useState } from 'react'

const RemoveObjects = () => {
  const [input, setInput] = useState('')
  const [object, setObject] = useState('')
    const onSubmitHandler = async (e) => {
      e.preventDefault();
  }
  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#3e7bec]'/>
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload</p>
        <input onChange={(e) => setInput(e.target.files[0])} type="file" accept='image/*' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' required/>
        <p className='text-xs text-gray-500 font-light mt-1'>Supports JPG, PNG, and other image formats</p>
         <p className='mt-6 text-sm font-medium'>
          Describe the object to be removed from the image.
        </p>
        <textarea onChange={(e) => setObject(e.target.textLength)} value={object} placeholder='example watch, spoon, only single object name.'
        type="file" rows={4} accept='image/*' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' required />
        <p className='text-xs text-gray-500 font-light mt-1'>Be specific and little bit descriptive in what you remove</p>
        <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#ec3ed5] to-[#00eeff] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          <Scissors className='w-5' />Remove Objects
        </button>
      </form>
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-103.5'>
        <div className='flex items-center gap-3'>
          <Scissors className='w-5 h-5 text-[#3e7bec]'/>
          <h1 className='text-xl font-semibold'>Remove Objects</h1>
        </div>
        <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
            <Scissors className='w-9 h-9'/>
            <p>Upload the image and click 'Remove Objects' to get started</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemoveObjects
