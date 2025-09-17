import { Sparkles, Image } from 'lucide-react'
import React, { useState } from 'react'

const GenerateImages = () => {

  const imageStyle = ['Realistic', 'Ghibli Style', 'Anime Style', 'Cartoon Style', 'Fantasy Style', 'Realistic Style', '3D Style', 'Portrait Style']
  const [selectType, setSelectType] = useState('Realistic')
  const [input, setInput] = useState('')
  const onSubmitHandler = async (e) => {
    e.preventDefault();
  }

  return (
   <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#248D27]'/>
          <h1 className='text-xl font-semibold'>AI Image Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Describe your image</p>
        <textarea onChange={(e) => setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border=gray-300' placeholder='Describe the image you want to generate.' required/>
        <p className='mt-4 text-sm font-medium'>
          Style
        </p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {imageStyle.map((item, index)=>(
            <span onClick={() => setSelectType(item)} className={`text=xs px-4 py-1 border rounded-full cursor-pointer ${selectType === item ? 'bg-green-50 text-green-700' : 'text-gray-500 border-gray-300'}`} key={index}>{item}</span>
          ))}
        </div>
        <br />
        <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#248D27] to-[#52C755] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          <Image className='w-5' />Generate Image
        </button>
      </form>
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-110'>
        <div className='flex items-center gap-3'>
          <Image className='w-5 h-5 text-[#248D27]'/>
          <h1 className='text-xl font-semibold'>Generated Image</h1>
        </div>
        <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
            <Image className='w-9 h-9'/>
            <p>Enter the description and click 'Generate image' to get started</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateImages
