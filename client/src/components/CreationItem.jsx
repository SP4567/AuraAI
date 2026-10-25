import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { Check, ChevronDown, ChevronUp, Copy, Download, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const typeBadgeStyles = {
  article: 'bg-blue-50 text-blue-700 border-blue-200',
  'blog-title': 'bg-purple-50 text-purple-700 border-purple-200',
  image: 'bg-green-50 text-green-700 border-green-200',
  'resume-review': 'bg-teal-50 text-teal-700 border-teal-200',
  prescription: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'study-content': 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

const CreationItem = ({ item, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(item.content)
      setCopied(true)
      toast.success('Content copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy content')
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this creation?')) {
      return
    }
    try {
      setIsDeleting(true)
      if (onDelete) {
        await onDelete(item.id)
        toast.success('Creation deleted')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete creation')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = (e) => {
    e.stopPropagation()
    if (item.type === 'image') {
      window.open(item.content, '_blank')
    } else {
      const blob = new Blob([item.content], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${item.type}-${item.id}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const badgeClass = typeBadgeStyles[item.type] || 'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <div 
      onClick={() => setExpanded(!expanded)} 
      className='p-5 max-w-5xl text-sm bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:shadow-md transition duration-200 shadow-xs'
    >
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div className='flex-1 pr-4'>
          <h2 className='font-semibold text-gray-900 text-base leading-snug line-clamp-1'>
            {item.prompt}
          </h2>
          <p className='text-gray-400 text-xs mt-1.5 flex items-center gap-2'>
            <span>{new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            {item.publish && (
              <span className='inline-block text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-medium'>
                Public
              </span>
            )}
          </p>
        </div>

        <div className='flex items-center gap-2 self-end sm:self-center'>
          <span className={`border px-3 py-1 rounded-full text-xs font-semibold capitalize ${badgeClass}`}>
            {item.type}
          </span>

          <button
            onClick={handleCopy}
            title="Copy content"
            className='p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition'
          >
            {copied ? <Check className='w-4 h-4 text-green-600' /> : <Copy className='w-4 h-4' />}
          </button>

          <button
            onClick={handleDownload}
            title={item.type === 'image' ? 'Open image' : 'Download markdown'}
            className='p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition'
          >
            <Download className='w-4 h-4' />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete creation"
            className='p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50'
          >
            <Trash2 className='w-4 h-4' />
          </button>

          <div className='text-gray-400 p-1'>
            {expanded ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className='mt-4 border-t border-gray-100 pt-4' onClick={(e) => e.stopPropagation()}>
          {item.type === 'image' ? (
            <div className='flex flex-col items-start'>
              <img 
                src={item.content} 
                alt={item.prompt} 
                className='mt-2 max-w-full max-h-[440px] rounded-xl object-contain border border-gray-200 shadow-sm' 
              />
            </div>
          ) : (
            <div className='mt-2 max-h-[460px] overflow-y-auto text-sm text-slate-700 bg-gray-50/70 p-4 rounded-xl border border-gray-100'>
              <div className='prose prose-sm max-w-none leading-relaxed reset-tw'>
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreationItem
