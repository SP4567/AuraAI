import { Eraser, Scissors, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObjects = () => {
  const [input, setInput] = useState(null) // Changed to null initially
  const [object, setObject] = useState('')
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      
      setInput(file);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!input) {
      toast.error('Please select an image file');
      return;
    }
    
    if (!object || object.trim() === '') {
      toast.error('Please specify what object to remove');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', input); // input should be the file object
      formData.append('object', object.trim()); // object to remove
      
      // Get auth token
      const token = await getToken();
      console.log('Sending remove object request with token:', !!token);
      console.log('Object to remove:', object.trim());
      
      // Make API call
      const { data } = await axios.post(
        '/api/ai/remove-image-object', // Make sure this matches your backend route
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      console.log('Remove object response:', data);
      
      if (data.success) {
        setContent(data.content);
        toast.success(`Successfully removed "${object}" from the image!`);
      } else {
        toast.error(data.message || 'Failed to remove object from image');
      }
    } catch (error) {
      console.error('Remove object error:', error);
      toast.error(error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#3e7bec]'/>
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload</p>
        <input 
          onChange={handleFileChange} 
          type="file" 
          accept='image/*' 
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' 
          required
        />
        <p className='text-xs text-gray-500 font-light mt-1'>Supports JPG, PNG, and other image formats</p>
        
        <p className='mt-6 text-sm font-medium'>
          Describe the object to be removed from the image.
        </p>
        <textarea 
          onChange={(e) => setObject(e.target.value)} 
          value={object} 
          placeholder='example watch, spoon, only single object name.'
          rows={4} 
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' 
          required 
        />
        <p className='text-xs text-gray-500 font-light mt-1'>Be specific and little bit descriptive in what you remove</p>
        
        <button 
          disabled={loading || !input || !object.trim()} 
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#ec3ed5] to-[#00eeff] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {
            loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Scissors className='w-5' />
          }
          Remove Objects
        </button>
      </form>
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-103.5'>
        <div className='flex items-center gap-3'>
          <Scissors className='w-5 h-5 text-[#3e7bec]'/>
          <h1 className='text-xl font-semibold'>Remove Objects</h1>
        </div>
        { !content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Scissors className='w-9 h-9'/>
              <p>Upload the image and click 'Remove Objects' to get started</p>
            </div>
          </div>
        ) : (
          <img src={content} alt="result" className='mt-4 rounded-lg object-contain'/>
        )}
      </div>
    </div>
  )
}
export default RemoveObjects