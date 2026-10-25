import { Eraser, Scissors, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObjects = () => {
  const [input, setInput] = useState(null)
  const [object, setObject] = useState('')
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState(''); // Add preview for uploaded image
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
      
      // Create preview of uploaded image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to format image data
  const formatImageData = (imageData) => {
    console.log('🔍 Raw image data received:', typeof imageData, imageData?.substring?.(0, 100));
    
    // Handle null or undefined
    if (!imageData) {
      console.error('❌ No image data received');
      return null;
    }
    
    // Convert to string if it's not already
    const dataStr = String(imageData);
    
    // Check if it's already a proper data URL
    if (dataStr.startsWith('data:image/')) {
      console.log('✅ Already proper data URL');
      return dataStr;
    }
    
    // Check if it's a URL
    if (dataStr.startsWith('http')) {
      console.log('✅ HTTP URL detected');
      return dataStr;
    }
    
    // Check if it's a file path
    if (dataStr.startsWith('/') || dataStr.startsWith('./')) {
      console.log('✅ File path detected');
      return `${axios.defaults.baseURL}${dataStr.startsWith('/') ? dataStr.slice(1) : dataStr}`;
    }
    
    // Remove any whitespace
    const cleanData = dataStr.trim();
    
    // Validate base64 format (basic check)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(cleanData)) {
      console.error('❌ Invalid base64 format detected');
      console.log('Data sample:', cleanData.substring(0, 100));
      return null;
    }
    
    // If it looks like base64, add proper prefix
    console.log('✅ Adding data URL prefix to base64');
    return `data:image/png;base64,${cleanData}`;
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
      formData.append('image', input);
      formData.append('object', object.trim());
      
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (key === 'image') {
          console.log(`- ${key}: File (${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`- ${key}: ${value}`);
        }
      }
      
      // Get auth token
      const token = await getToken();
      console.log('Sending remove object request with token:', !!token);
      console.log('Object to remove:', object.trim());
      
      // Make API call
      const response = await axios.post(
        '/api/ai/remove-image-object',
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 120000 // 2 minute timeout for image processing
        }
      );

      console.log('Remove object response:', response.data);
      
      const { data } = response;
      
      if (data.success) {
        console.log('🎉 API Success! Processing image data...');
        console.log('Raw response content:', typeof data.content, data.content?.substring?.(0, 200));
        
        // Format the image data properly
        const formattedImageData = formatImageData(data.content);
        
        if (!formattedImageData) {
          console.error('❌ Failed to format image data');
          toast.error('Received invalid image data from server');
          return;
        }
        
        console.log('✅ Formatted image data ready');
        console.log('Final image src preview:', formattedImageData.substring(0, 100) + '...');
        
        setContent(formattedImageData);
        toast.success(`Successfully removed "${object}" from the image!`);
      } else {
        console.log('❌ API returned success: false');
        console.log('Error message:', data.message);
        toast.error(data.message || 'Failed to remove object from image');
      }
    } catch (error) {
      console.error('Remove object error:', error);
      
      // Enhanced error handling
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        if (error.response.status === 413) {
          toast.error('File too large. Please upload a smaller image.');
        } else if (error.response.status === 404) {
          toast.error('Object removal endpoint not found. Check your backend configuration.');
        } else if (error.response.status === 500) {
          toast.error('Server error during image processing. Please try again.');
        } else {
          toast.error(error.response?.data?.message || 'Failed to process image');
        }
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Image processing took too long. Try with a smaller image.');
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setInput(null);
    setObject('');
    setContent('');
    setImagePreview('');
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#3e7bec]'/>
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>
        
        <p className='mt-6 text-sm font-medium'>Upload Image</p>
        <input 
          onChange={handleFileChange} 
          type="file" 
          accept='image/*' 
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' 
          required
        />
        <p className='text-xs text-gray-500 font-light mt-1'>
          Supports JPG, PNG, and other image formats (Max: 10MB)
          {input && ` • Selected: ${input.name} (${(input.size / 1024 / 1024).toFixed(2)}MB)`}
        </p>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className='mt-4'>
            <p className='text-sm font-medium mb-2'>Preview:</p>
            <img 
              src={imagePreview} 
              alt="Upload preview" 
              className='w-full max-h-48 object-contain rounded-lg border border-gray-200'
            />
          </div>
        )}
        
        <p className='mt-6 text-sm font-medium'>
          Describe the object to be removed from the image
        </p>
        <textarea 
          onChange={(e) => setObject(e.target.value)} 
          value={object} 
          placeholder='Example: red car, person in blue shirt, tree on the left, etc.'
          rows={4} 
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' 
          required 
        />
        <p className='text-xs text-gray-500 font-light mt-1'>
          Be specific about the object you want to remove
        </p>
        
        <div className='flex gap-2 mt-6'>
          <button 
            type="submit"
            disabled={loading || !input || !object.trim()} 
            className='flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#ec3ed5] to-[#00eeff] text-white px-4 py-2 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
            ) : (
              <Scissors className='w-5' />
            )}
            {loading ? 'Processing...' : 'Remove Object'}
          </button>
          
          {(input || content) && (
            <button
              type="button"
              onClick={resetForm}
              className='px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50'
            >
              <Eraser className='w-4 h-4' />
            </button>
          )}
        </div>
      </form>
      
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-103.5'>
        <div className='flex items-center gap-3'>
          <Scissors className='w-5 h-5 text-[#3e7bec]'/>
          <h1 className='text-xl font-semibold'>Result</h1>
        </div>
        
        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Scissors className='w-9 h-9'/>
              <p>Upload an image and describe what to remove</p>
            </div>
          </div>
        ) : (
          <div className='mt-4 flex flex-col'>
            <p className='text-sm font-medium mb-2 text-green-600'>
              ✅ Object removed successfully!
            </p>
            <img 
              src={content} 
              alt="Result after object removal" 
              className='rounded-lg object-contain max-h-96 border border-gray-200'
              onError={(e) => {
                console.error('🚨 IMAGE LOAD ERROR:');
                console.error('- Image src:', e.target.src?.substring(0, 100));
                console.error('- Error event:', e);
                console.error('- Image naturalWidth:', e.target.naturalWidth);
                console.error('- Image naturalHeight:', e.target.naturalHeight);
                
                // Try to determine the issue
                if (e.target.src?.startsWith('data:image/')) {
                  console.error('- Issue: Base64 data URL might be corrupted');
                  toast.error('The processed image data appears to be corrupted');
                } else if (e.target.src?.startsWith('http')) {
                  console.error('- Issue: URL might be inaccessible or CORS issue');
                  toast.error('Cannot access the processed image URL');
                } else {
                  console.error('- Issue: Invalid image source format');
                  toast.error('Invalid image format received from server');
                }
              }}
              onLoad={(e) => {
                console.log('✅ IMAGE LOADED SUCCESSFULLY:');
                console.log('- Image naturalWidth:', e.target.naturalWidth);
                console.log('- Image naturalHeight:', e.target.naturalHeight);
                console.log('- Image src length:', e.target.src?.length);
              }}
            />
            <div className='mt-2 flex gap-2'>
              <a 
                href={content} 
                download="removed_object.png" 
                className='text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600'
              >
                Download
              </a>
            </div>
          </div>
        )}
      </div>
      
      {/* Debug info in development */}
      {import.meta.env.DEV && content && (
        <div className='w-full p-4 bg-gray-100 rounded-lg text-xs font-mono'>
          <p><strong>🔍 Debug Info:</strong></p>
          <p>• Image data type: <code>{typeof content}</code></p>
          <p>• Image data length: <code>{content.length}</code></p>
          <p>• Data starts with: <code>{content.substring(0, 50)}...</code></p>
          <p>• Is data URL: <code>{content.startsWith('data:') ? '✅ Yes' : '❌ No'}</code></p>
          <p>• Is HTTP URL: <code>{content.startsWith('http') ? '✅ Yes' : '❌ No'}</code></p>
          <p>• Contains base64 prefix: <code>{content.includes('base64,') ? '✅ Yes' : '❌ No'}</code></p>
          
          {/* Test image data validity */}
          <div className='mt-2 p-2 bg-white rounded border'>
            <p><strong>🧪 Image Validity Test:</strong></p>
            <img 
              src={content} 
              alt="Debug test" 
              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              onLoad={() => console.log('✅ Debug image loaded')}
              onError={() => console.log('❌ Debug image failed')}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default RemoveObjects