import { Check, Copy, Edit, Hash, RotateCcw, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = ['General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food']
  
  const [selectedCategory, setSelectedCategory] = useState('General')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [copied, setCopied] = useState(false)
  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Generate 5 catchy, high-CTR blog titles for the keyword: "${input}" in the category: "${selectedCategory}". Format as a numbered list with a brief reason why each title works.`;
      const { data } = await axios.post(
        '/api/ai/generate-blog-title',
        { prompt },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        setContent(data.content);
        toast.success('Titles generated successfully!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Titles copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const resetForm = () => {
    setInput('');
    setContent('');
    setSelectedCategory('General');
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-5 bg-white rounded-xl border border-gray-200 shadow-sm'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#8E37EB]'/>
          <h1 className='text-xl font-semibold'>AI Title Generator</h1>
        </div>
        
        <p className='mt-6 text-sm font-medium'>Keyword / Topic</p>
        <input 
          onChange={(e) => setInput(e.target.value)} 
          value={input} 
          type="text" 
          className='w-full p-2.5 px-3 mt-2 outline-none text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition' 
          placeholder='e.g. Artificial Intelligence in 2026, Remote Work Habits' 
          required
        />

        <p className='mt-5 text-sm font-medium'>Category</p>
        <div className='mt-2.5 flex gap-2.5 flex-wrap sm:max-w-9/11'>
          {blogCategories.map((item, index) => (
            <button
              type="button"
              onClick={() => setSelectedCategory(item)} 
              className={`text-xs px-3.5 py-1.5 border rounded-full cursor-pointer transition font-medium ${
                selectedCategory === item 
                  ? 'bg-purple-50 text-purple-700 border-purple-400 shadow-xs' 
                  : 'text-gray-600 border-gray-200 hover:border-gray-300'
              }`} 
              key={index}
            >
              {item}
            </button>
          ))}
        </div>

        <div className='flex gap-2.5 mt-7'>
          <button  
            type="submit"
            disabled={loading || !input.trim()} 
            className='flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
          >
            {loading ? (
              <span className='w-4 h-4 my-1 rounded-full border-2 border-white border-t-transparent animate-spin'></span>
            ) : (
              <Hash className='w-4 h-4' />
            )}
            {loading ? 'Generating...' : 'Generate Titles'}
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

      {/* Generated Titles Display */}
      <div className="w-full max-w-lg p-5 bg-white rounded-xl flex flex-col border border-gray-200 shadow-sm min-h-[420px] max-h-[700px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Edit className="w-5 h-5 text-[#8E37EB]" />
            <h1 className="text-xl font-semibold">Generated Titles</h1>
          </div>
          {content && (
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-100 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-400 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-[#8E37EB]">
                <Edit className="w-7 h-7" />
              </div>
              <p>Enter a topic and click 'Generate Titles' to get high-converting title options</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 h-full overflow-y-scroll text-sm text-slate-600 leading-relaxed">
            <div className='reset-tw prose prose-sm max-w-none'>
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogTitles
