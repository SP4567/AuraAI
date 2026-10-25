import React, { useState } from "react";
import { Brain, BookOpen, Check, Copy, Download, RotateCcw, Sparkles } from "lucide-react";
import Markdown from "react-markdown";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const StudyAssistant = () => {
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState("Q&A");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { getToken } = useAuth();

  const studyModes = [
    { id: "Q&A", label: "Practice Q&A", desc: "Generate 25 graded practice questions" },
    { id: "Flashcards", label: "Flashcards", desc: "Key concept prompt-and-answer pairs" },
    { id: "Summarizer", label: "Notes Summarizer", desc: "Distill complex chapters into core takeaways" },
  ];

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("Please enter a study topic or paste your notes");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required. Please sign in.");
        return;
      }

      const { data } = await axios.post(
        "/api/ai/generate-study-content",
        { input, mode: selectedMode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setContent(data.content.trim());
        toast.success("Study material generated!");
      } else {
        toast.error(data.message || "Failed to generate study content");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Study guide copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadMarkdown = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-${selectedMode.toLowerCase()}-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Study material downloaded");
  };

  const resetForm = () => {
    setInput("");
    setContent("");
    setSelectedMode("Q&A");
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700">
      {/* Left Section: Input Form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-5 bg-white rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold">AI Study Assistant</h1>
        </div>

        {/* Study Input */}
        <p className="mt-6 text-sm font-medium">Topic or Study Notes</p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste lecture notes, textbook chapters, or enter topics like: 'Photosynthesis light reactions' or 'Operating System Concurrency'..."
          rows={5}
          className="w-full p-2.5 px-3 mt-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
        <p className="text-xs text-gray-400 font-light mt-1">
          Provide sufficient detail for richer, tailored review materials.
        </p>

        {/* Mode Selector */}
        <p className="mt-5 text-sm font-medium">Study Format</p>
        <div className="mt-2.5 flex flex-col gap-2">
          {studyModes.map((mode) => (
            <label
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                selectedMode === mode.id
                  ? "border-blue-500 bg-blue-50/60 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div>
                <span className="text-sm font-semibold text-gray-800">{mode.label}</span>
                <p className="text-xs text-gray-500 mt-0.5">{mode.desc}</p>
              </div>
              <input
                type="radio"
                name="studyMode"
                checked={selectedMode === mode.id}
                onChange={() => setSelectedMode(mode.id)}
                className="w-4 h-4 text-blue-600"
              />
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 mt-7">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#0658bd] to-[#3db7d6] text-white px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <span className="w-4 h-4 my-1 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <BookOpen className="w-4 h-4" />
            )}
            {loading ? "Generating Study Pack..." : "Generate Material"}
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

      {/* Right Section: Results */}
      <div className="w-full max-w-xl p-5 bg-white rounded-xl flex flex-col border border-gray-200 shadow-sm min-h-[460px] max-h-[750px]">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-semibold">Study Deck & Notes</h1>
          </div>
          {content && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={downloadMarkdown}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> .MD
              </button>
            </div>
          )}
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-400 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Brain className="w-7 h-7" />
              </div>
              <p>Enter a study topic, select a format, and click 'Generate Material' to start learning</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex-1 overflow-y-scroll text-sm text-slate-700 leading-relaxed pr-1">
            <div className="reset-tw prose prose-sm max-w-none">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyAssistant;
