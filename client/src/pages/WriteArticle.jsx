import { Check, Copy, Download, Edit, RotateCcw, Sparkles, Zap } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: 'Short (500-800 words)' },
    { length: 1200, text: 'Medium (800-1200 words)' },
    { length: 1600, text: 'Long (1200+ words)' },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [usage, setUsage] = useState(null);
  const [copied, setCopied] = useState(false);
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error('Please enter an article topic');
      return;
    }

    try {
      setLoading(true);
      const prompt = `Write a well-researched, high quality, and engaging article about: "${input}" in ${selectedLength.text}. Include a catchy title, introduction, structured subsections with clear headers, bullet points where appropriate, and a thoughtful conclusion.`;
      const token = await getToken();
      const { data } = await axios.post(
        '/api/ai/generate-article',
        { prompt, length: selectedLength.length },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setContent(data.content);
        if (data.usage) setUsage(data.usage);
        toast.success('Article generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate article');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Article copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const downloadMarkdown = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aura-article-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Markdown downloaded');
  };

  const resetForm = () => {
    setInput('');
    setContent('');
    setUsage(null);
    setSelectedLength(articleLength[0]);
  };

  const stats = useMemo(() => {
    if (!content) return { words: 0, characters: 0, readingMinutes: 0 };
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const characters = content.length;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, characters, readingMinutes };
  }, [content]);

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700">
      {/* Article Config Form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-5 bg-white rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Article Topic or Premise</p>
        <textarea
          rows={3}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          className="w-full p-2.5 px-3 mt-2 outline-none text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          placeholder="e.g. The transformation of renewable energy storage systems over the next decade..."
          required
        />

        <p className="mt-4 text-sm font-medium">Desired Article Length</p>
        <div className="mt-2.5 flex gap-2.5 flex-wrap sm:max-w-9/11">
          {articleLength.map((item, index) => (
            <button
              type="button"
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-3.5 py-1.5 border rounded-full cursor-pointer transition font-medium ${
                selectedLength.text === item.text
                  ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs'
                  : 'text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              key={index}
            >
              {item.text}
            </button>
          ))}
        </div>

        <div className="flex gap-2.5 mt-7">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <span className="w-4 h-4 my-1 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <Edit className="w-4 h-4" />
            )}
            {loading ? 'Composing Article...' : 'Generate Article'}
          </button>

          {(input || content) && (
            <button
              type="button"
              onClick={resetForm}
              title="Reset Form"
              className="px-3.5 py-2.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Generated Article Display */}
      <div className="w-full max-w-xl p-5 bg-white rounded-xl flex flex-col border border-gray-200 shadow-sm min-h-[460px] max-h-[750px]">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Edit className="w-5 h-5 text-[#4A7AFF]" />
            <h1 className="text-xl font-semibold">Generated Article</h1>
          </div>
          {content && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={downloadMarkdown}
                title="Download Markdown"
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> .MD
              </button>
            </div>
          )}
        </div>

        {content && (
          <div className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span>{stats.words} words</span>
              <span>•</span>
              <span>{stats.characters} chars</span>
              <span>•</span>
              <span>~{stats.readingMinutes} min read</span>
            </div>

            {usage && (
              <div 
                title={`Prompt tokens: ${usage.prompt_tokens} | Output tokens: ${usage.completion_tokens - usage.reasoning_tokens} | Reasoning tokens: ${usage.reasoning_tokens}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md"
              >
                <Zap className="w-3 h-3 text-indigo-500" />
                <span>{usage.total_tokens.toLocaleString()} tokens ({usage.completion_tokens - usage.reasoning_tokens} output + {usage.reasoning_tokens} reasoning)</span>
              </div>
            )}
          </div>
        )}

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-400 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#4A7AFF]">
                <Edit className="w-7 h-7" />
              </div>
              <p>Enter a topic and click 'Generate Article' to write a publication-ready piece</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex-1 overflow-y-scroll text-sm text-slate-700 leading-relaxed pr-1">
            <div className="prose prose-sm max-w-none reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;
