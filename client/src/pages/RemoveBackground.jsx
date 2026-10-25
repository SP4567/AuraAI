import { Download, Eraser, RotateCcw, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const { getToken } = useAuth();
     
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!input) {
      toast.error('Please select an image file');
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', input);
      
      const token = await getToken();
      
      const { data } = await axios.post(
        '/api/ai/remove-image-background',
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      if (data.success) {
        setContent(data.content);
        toast.success('Background removed successfully!');
      } else {
        toast.error(data.message || 'Failed to remove background');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      
      setInput(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setInput(null);
    setPreview('');
    setContent('');
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-5 bg-white rounded-xl border border-gray-200 shadow-sm'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#FF4938]'/>
          <h1 className='text-xl font-semibold'>Background Removal</h1>
        </div>
        
        <p className='mt-6 text-sm font-medium'>Upload Image</p>
        <input 
          onChange={handleFileChange} 
          type="file" 
          accept='image/*' 
          className='w-full p-2.5 px-3 mt-2 outline-none text-sm rounded-lg border border-gray-300 text-gray-600 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100' 
          required
        />
        <p className='text-xs text-gray-500 font-light mt-1.5'>
          Supports JPG, PNG, and WebP up to 10MB
          {input && ` • ${input.name} (${(input.size / (1024 * 1024)).toFixed(2)} MB)`}
        </p>

        {preview && (
          <div className='mt-4 p-2 bg-gray-50 rounded-lg border border-gray-200'>
            <p className='text-xs font-medium text-gray-500 mb-1.5'>Original Preview</p>
            <img src={preview} alt="Upload preview" className='max-h-40 object-contain rounded-md mx-auto' />
          </div>
        )}

        <div className='flex gap-2.5 mt-6'>
          <button 
            type="submit"
            disabled={loading || !input} 
            className='flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
          >
            {loading ? (
              <span className='w-4 h-4 my-1 rounded-full border-2 border-white border-t-transparent animate-spin'></span>
            ) : (
              <Eraser className='w-4 h-4'/>
            )}
            {loading ? 'Processing...' : 'Remove Background'}
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

      <div className='w-full max-w-lg p-5 bg-white rounded-xl flex flex-col border border-gray-200 shadow-sm min-h-[420px]'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <Eraser className='w-5 h-5 text-[#FF4938]'/>
            <h1 className='text-xl font-semibold'>Result</h1>
          </div>
          {content && (
            <a
              href={content}
              target="_blank"
              rel="noreferrer"
              download="background-removed.png"
              className='inline-flex items-center gap-1.5 text-xs font-medium bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-100 transition'
            >
              <Download className='w-3.5 h-3.5' /> Download PNG
            </a>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-4 text-gray-400 text-center px-4'>
              <div className='w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF4938]'>
                <Eraser className='w-7 h-7'/>
              </div>
              <p>Upload an image and click 'Remove Background' to see the transparent cutout</p>
            </div>
          </div>
        ) : (
          <div className='mt-4 flex flex-col flex-1 justify-center items-center'>
            <div className='p-3 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] rounded-lg border border-gray-200 max-h-[460px] flex items-center justify-center overflow-hidden'>
              <img src={content} alt='Cutout preview' className='max-h-[420px] w-auto object-contain rounded-md' />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RemoveBackground
