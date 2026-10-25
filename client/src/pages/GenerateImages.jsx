import { Download, ExternalLink, Image, RotateCcw, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const imageStyles = [
    'Realistic', 
    'Ghibli Style', 
    'Anime Style', 
    'Cyberpunk', 
    'Fantasy Art', 
    '3D Render', 
    'Cinematic', 
    'Oil Painting'
  ];

  const [selectType, setSelectType] = useState('Realistic')
  const [publish, setPublish] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error('Please describe the image you want to create');
      return;
    }

    try {
      setLoading(true);
      const prompt = `Generate an image of ${input} in this style ${selectType}`;
      const { data } = await axios.post(
        '/api/ai/generate-images',
        { prompt, publish },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        setContent(data.content);
        toast.success('Image generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate image');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Image generation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setInput('');
    setContent('');
    setSelectType('Realistic');
    setPublish(false);
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-5 bg-white rounded-xl border border-gray-200 shadow-sm'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#248D27]'/>
          <h1 className='text-xl font-semibold'>AI Image Generator</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Describe your image</p>
        <textarea 
          rows={4} 
          onChange={(e) => setInput(e.target.value)} 
          value={input} 
          className='w-full p-2.5 px-3 mt-2 outline-none text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-transparent transition' 
          placeholder='e.g. A serene Japanese garden in autumn with koi fish pond, soft golden hour lighting, ultra high detail.' 
          required
        />

        <p className='mt-4 text-sm font-medium'>Visual Style</p>
        <div className='mt-2.5 flex gap-2 flex-wrap sm:max-w-9/11'>
          {imageStyles.map((item) => (
            <button
              type="button"
              onClick={() => setSelectType(item)} 
              className={`text-xs px-3.5 py-1.5 border rounded-full cursor-pointer transition font-medium ${
                selectType === item 
                  ? 'bg-green-50 text-green-700 border-green-400 shadow-xs' 
                  : 'text-gray-600 border-gray-200 hover:border-gray-300'
              }`} 
              key={item}
            >
              {item}
            </button>
          ))}
        </div>

        <div className='my-5 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'>
          <div className='flex flex-col'>
            <span className='text-sm font-medium text-gray-800'>Publish to Community Feed</span>
            <span className='text-xs text-gray-500'>Allow other creators to see and like this image</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              onChange={(e) => setPublish(e.target.checked)} 
              checked={publish} 
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-600 transition-all"></div>
            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-xs"></span>
          </label>
        </div>

        <div className='flex gap-2.5 mt-6'>
          <button 
            type="submit"
            disabled={loading || !input.trim()} 
            className='flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#248D27] to-[#52C755] text-white px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
          >
            {loading ? (
              <span className='w-4 h-4 my-1 rounded-full border-2 border-white border-t-transparent animate-spin'></span>
            ) : (
              <Image className='w-4 h-4'/>
            )}
            {loading ? 'Synthesizing Image...' : 'Generate Image'}
          </button>

          {(input || content) && (
            <button
              type="button"
              onClick={resetForm}
              title="Reset Form"
              className='px-3.5 py-2.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition'
            >
              <RotateCcw className='w-4 h-4' />
            </button>
          )}
        </div>
      </form>

      <div className='w-full max-w-lg p-5 bg-white rounded-xl flex flex-col border border-gray-200 shadow-sm min-h-[460px]'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <Image className='w-5 h-5 text-[#248D27]'/>
            <h1 className='text-xl font-semibold'>Generated Image</h1>
          </div>
          {content && (
            <div className='flex items-center gap-2'>
              <a
                href={content}
                target="_blank"
                rel="noreferrer"
                download="aura-generated.png"
                className='inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition'
              >
                <Download className='w-3.5 h-3.5' /> Download
              </a>
              <a
                href={content}
                target="_blank"
                rel="noreferrer"
                title="Open in new tab"
                className='p-1.5 text-gray-500 hover:text-gray-800 rounded-lg border border-gray-200 hover:bg-gray-50 transition'
              >
                <ExternalLink className='w-3.5 h-3.5' />
              </a>
            </div>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-4 text-gray-400 text-center px-4'>
              <div className='w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-[#248D27]'>
                <Image className='w-7 h-7'/>
              </div>
              <p>Enter a description, choose your preferred style, and click 'Generate Image'</p>
            </div>
          </div>
        ) : (
          <div className='mt-4 flex-1 flex flex-col justify-center items-center'>
            <div className='w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm max-h-[480px] flex items-center justify-center bg-black/5'>
              <img src={content} alt='AI Generated creation' className='w-full h-auto object-contain max-h-[480px] rounded-lg' />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GenerateImages
