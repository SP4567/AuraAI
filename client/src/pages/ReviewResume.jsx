import { Check, Copy, Download, FileText, RotateCcw, Sparkles, UploadCloud, Zap } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [usage, setUsage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { getToken } = useAuth();

  const validateFile = (file) => {
    if (!file) return false;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF document');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setInput(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setInput(file);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input) {
      toast.error('Please select a resume file first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', input);
      
      const token = await getToken();
      const response = await axios.post('/api/ai/resume-review', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 90000,
      });

      const { data } = response;
      if (data.success) {
        setContent(data.content);
        if (data.usage) setUsage(data.usage);
        toast.success('Resume analyzed successfully!');
      } else {
        toast.error(data.message || 'Failed to analyze resume');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to review resume');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Resume feedback copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const downloadReview = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-critique-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Review downloaded');
  };

  const resetForm = () => {
    setInput(null);
    setContent('');
    setUsage(null);
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-5 bg-white rounded-xl border border-gray-200 shadow-sm'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#12B7AC]'/>
          <h1 className='text-xl font-semibold'>AI Resume Reviewer</h1>
        </div>

        <p className='mt-5 text-sm font-medium'>Upload Resume (PDF format)</p>
        
        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`mt-2 p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition cursor-pointer ${
            isDragOver 
              ? 'border-teal-500 bg-teal-50/50' 
              : input 
                ? 'border-green-400 bg-green-50/30' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
          }`}
          onClick={() => document.getElementById('resumeFileInput')?.click()}
        >
          <input
            id="resumeFileInput"
            type="file"
            accept='application/pdf,.pdf'
            className='hidden'
            onChange={handleFileChange}
          />
          <UploadCloud className={`w-9 h-9 mb-2 ${input ? 'text-green-600' : 'text-teal-600'}`} />
          {input ? (
            <div>
              <p className='text-xs font-semibold text-gray-800'>{input.name}</p>
              <p className='text-[11px] text-gray-500 mt-0.5'>{(input.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze</p>
            </div>
          ) : (
            <div>
              <p className='text-xs font-medium text-gray-700'>
                <span className='text-teal-600 font-semibold'>Click to upload</span> or drag and drop
              </p>
              <p className='text-[11px] text-gray-400 mt-1'>PDF files only (max 5MB)</p>
            </div>
          )}
        </div>

        <div className="flex gap-2.5 mt-6">
          <button
            type="submit"
            disabled={loading || !input}
            className='flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#12B7AC] to-[#08B6CE] text-white px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
          >
            {loading ? (
              <span className='w-4 h-4 my-1 rounded-full border-2 border-white border-t-transparent animate-spin'></span>
            ) : (
              <FileText className='w-4 h-4' />
            )}
            {loading ? 'Evaluating Resume...' : 'Analyze Resume'}
          </button>
          
          {(input || content) && (
            <button
              type="button"
              onClick={resetForm}
              title="Reset"
              className='px-3.5 py-2.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition'
            >
              <RotateCcw className='w-4 h-4' />
            </button>
          )}
        </div>
      </form>

      {/* Results View */}
      <div className='w-full max-w-xl p-5 bg-white rounded-xl flex flex-col border border-gray-200 shadow-sm min-h-[460px] max-h-[750px]'>
        <div className='flex items-center justify-between border-b border-gray-100 pb-3'>
          <div className='flex items-center gap-2.5'>
            <FileText className='w-5 h-5 text-[#12B7AC]'/>
            <h1 className='text-xl font-semibold'>Resume Audit & Recommendations</h1>
          </div>
          {content && (
            <div className='flex items-center gap-2'>
              <button
                onClick={copyToClipboard}
                className='inline-flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100 transition cursor-pointer'
              >
                {copied ? <Check className='w-3.5 h-3.5' /> : <Copy className='w-3.5 h-3.5' />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={downloadReview}
                className='inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition cursor-pointer'
              >
                <Download className='w-3.5 h-3.5' /> .MD
              </button>
            </div>
          )}
        </div>

        {content && usage && (
          <div className="py-2 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>ATS Comprehensive Audit</span>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md">
              <Zap className="w-3 h-3 text-teal-600" />
              <span>{usage.total_tokens.toLocaleString()} tokens ({usage.completion_tokens - usage.reasoning_tokens} output + {usage.reasoning_tokens} reasoning)</span>
            </div>
          </div>
        )}

        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-4 text-gray-400 text-center px-4'>
              <div className='w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-[#12B7AC]'>
                <FileText className='w-7 h-7'/>
              </div>
              <p>Upload your resume PDF to receive ATS score critique, strength highlights, and rewrites</p>
            </div>
          </div>
        ) : (
          <div className='mt-3 flex-1 overflow-y-scroll text-sm text-slate-700 leading-relaxed pr-1'>
            <div className='reset-tw prose prose-sm max-w-none'>
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewResume;
