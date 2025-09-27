import { Eraser, FileText, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    console.log('=== FRONTEND DEBUG START ===');
    console.log('1. Form submitted');
    console.log('2. Input file:', input);
    
    if (!input) {
      toast.error('Please select a resume file first');
      console.log('❌ No file selected');
      return;
    }

    // File size check (5MB limit)
    if (input.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      console.log('❌ File too large:', input.size);
      return;
    }

    // File type check
    if (input.type !== 'application/pdf') {
      toast.error('Please upload only PDF files');
      console.log('❌ Invalid file type:', input.type);
      return;
    }

    setLoading(true);
    try {
      console.log('3. Creating FormData...');
      const formData = new FormData();
      formData.append('resume', input);
      
      // Debug FormData
      console.log('4. FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`- ${key}:`, value);
      }
      
      console.log('5. Getting auth token...');
      const token = await getToken();
      console.log('Token exists:', !!token);
      
      // Fixed: Using the correct endpoint based on your server structure
      console.log('6. Making API request to:', `${axios.defaults.baseURL}api/ai/resume-review`);
      
      const response = await axios.post('/api/ai/resume-review', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000, // 60 second timeout for large files
      });

      console.log('7. Response received:');
      console.log('- Status:', response.status);
      console.log('- Data:', response.data);

      const { data } = response;

      if (data.success) {
        console.log('✅ Success! Content length:', data.content.length);
        setContent(data.content);
        toast.success('Resume analyzed successfully!');
      } else {
        console.log('❌ API returned success: false');
        console.log('Error message:', data.message);
        toast.error(data.message || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('💥 Frontend error:', error);
      
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        console.log('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.log('No response received:', error.request);
      } else {
        console.log('Request setup error:', error.message);
      }
      
      // Better error handling
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 413) {
        toast.error('File too large. Please upload a file smaller than 5MB.');
      } else if (error.response?.status === 404) {
        toast.error('Resume review endpoint not found. Please check your backend configuration.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Network error. Please check your connection.');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please try with a smaller file.');
      } else {
        toast.error('Failed to analyze resume. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('=== FRONTEND DEBUG END ===');
    }
  };

  const resetForm = () => {
    setInput('');
    setContent('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    if (file) {
      console.log('- Name:', file.name);
      console.log('- Size:', file.size, 'bytes');
      console.log('- Size (MB):', (file.size / 1024 / 1024).toFixed(2));
      console.log('- Type:', file.type);
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please select only PDF files');
        return;
      }
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
    }
    setInput(file);
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#11e20ab7]'/>
          <h1 className='text-xl font-semibold'>Review Resume</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload Resume (PDF only)</p>
        <input
          type="file"
          accept='application/pdf,.pdf'
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
          onChange={handleFileChange}
        />
        <p className='text-xs text-gray-500 font-light mt-1'>
          Supports PDFs up to 5MB. {input && `Selected: ${input.name} (${(input.size / 1024 / 1024).toFixed(2)}MB)`}
        </p>
        
        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            disabled={loading || !input}
            className='flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#11e20ab7] to-[#2629f5] text-white px-4 py-2 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
            ) : (
              <FileText className='w-5' />
            )}
            {loading ? 'Analyzing...' : 'Analyze Resume'}
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

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className='mt-4 p-2 bg-gray-100 rounded text-xs'>
            <p>Backend URL: {axios.defaults.baseURL}</p>
            <p>Endpoint: /api/ai/resume-review</p>
            {input && <p>File: {input.name} ({(input.size / 1024 / 1024).toFixed(2)}MB)</p>}
          </div>
        )}
      </form>

      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-103.5'>
        <div className='flex items-center gap-3'>
          <FileText className='w-5 h-5 text-[#11e20ab7]'/>
          <h1 className='text-xl font-semibold'>Resume Analysis</h1>
        </div>
        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <FileText className='w-9 h-9'/>
              <p>Upload a resume and click 'Analyze Resume' to get started</p>
            </div>
          </div>
        ) : (
          <div className='mt-4 text-sm text-gray-700 prose prose-sm max-w-none'>
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewResume;