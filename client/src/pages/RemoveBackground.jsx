import { Eraser, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState(null) // Changed to null initially
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const { getToken } = useAuth();
     
  const onSubmitHandler = async (e) => {
      e.preventDefault();
      
      // Validate file input
      if (!input) {
        toast.error('Please select an image file');
        return;
      }
      
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('image', input); // input is already the file object
        
        const token = await getToken();
        console.log('Sending request with token:', !!token); // Debug log
        
        const { data } = await axios.post(
          '/api/ai/remove-image-background',
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data' // Explicitly set content type
            } 
          }
        );
        
        console.log('Response:', data); // Debug log
        
        if (data.success) {
          setContent(data.content)
          toast.success('Background removed successfully!');
        } else {
          toast.error(data.message || 'Failed to remove background');
        }
      } catch (error) {
        console.error('Error:', error); // Debug log
        toast.error(error.response?.data?.message || error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
  }

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
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#FF4938]'/>
          <h1 className='text-xl font-semibold'>Background Removal</h1>
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
        <button 
          disabled={loading || !input} 
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {
            loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> 
             : <Eraser className='w-5'/>
          }
          Remove Background
        </button>
      </form>
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-103.5'>
        <div className='flex items-center gap-3'>
          <Eraser className='w-5 h-5 text-[#FF4938]'/>
          <h1 className='text-xl font-semibold'>Remove Background</h1>
        </div>
        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
            <Eraser className='w-9 h-9'/>
            <p>Upload the image and click 'Remove Background' to get started</p>
          </div>
          </div>) : (
            <img src={content} alt='image' className='mt-3 w-full h-full'/>
          )}
      </div>
    </div>
  )
}

export default RemoveBackground










export const removeImageBackground = async (req, res) => {
  try {
    console.log('🎬 REMOVE BACKGROUND FUNCTION CALLED');
    
    const { userId } = req.auth();
    console.log('👤 User ID:', userId);
    
    const plan = req.plan;
    console.log('📋 Plan:', plan);
    
    // Check premium status first
    if (plan !== 'premium') {
      console.log('❌ BLOCKING: Not premium user');
      return res.json({
        success: false,
        message: "This feature is available for premium users!"
      });
    }
    
    console.log('✅ Premium user confirmed');
    
    // Debug file information
    console.log('📁 req.file:', req.file);
    console.log('📁 req.files:', req.files);
    
    if (!req.file) {
      return res.json({
        success: false,
        message: "No image file uploaded. Please select an image."
      });
    }
    
    console.log('🖼️ File details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
      path: req.file.path,
      destination: req.file.destination
    });
    
    let imageSource;
    
    // Handle different multer configurations
    if (req.file.path) {
      // Disk storage - use file path
      imageSource = req.file.path;
      console.log('📍 Using file path:', imageSource);
    } else if (req.file.buffer) {
      // Memory storage - use buffer as base64
      imageSource = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      console.log('💾 Using buffer as base64');
    } else {
      console.log('❌ No valid file path or buffer found');
      return res.json({
        success: false,
        message: "Invalid file upload. Please try again."
      });
    }
    
    console.log('☁️ Uploading to Cloudinary...');
    
    const { secure_url } = await cloudinary.uploader.upload(imageSource, {
      transformation: [
        {
          effect: 'background_removal',
          background_removal: 'remove_the_background'
        }
      ]
    });
    
    console.log('✅ Cloudinary upload successful:', secure_url);
    
    // Save to database
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from the image', ${secure_url}, 'image')`;
    
    console.log('✅ Database insert successful');
    
    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error('💥 Error in removeImageBackground:', error);
    res.json({ success: false, message: error.message });
  }
};