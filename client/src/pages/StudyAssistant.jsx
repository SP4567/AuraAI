import React, { useState } from "react";
import { Brain, BookOpen } from "lucide-react";
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
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("Please enter a topic before generating.");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }

      const { data } = await axios.post(
        "/api/ai/generate-study-content", // make sure this matches backend
        { input, mode: selectedMode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setContent(data.content.trim());
      } else {
        toast.error(data.message || "Something went wrong.");
        setContent("");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.message || "Request failed.");
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setInput("");
    setContent("");
    setSelectedMode("Q&A");
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700">
      {/* Left Section: Input Form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
      >
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-700 mb-4">
          <Brain className="w-6 h-6 text-blue-600" /> Study Assistant
        </h2>

        {/* Study Input */}
        <p className="mt-6 my-3 text-sm font-medium">Describe your Topic a bit.</p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your study topic or notes..."
          className="w-full h-28 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 font-light">Be specific in describing.</p>

        {/* Mode Selector */}
        <p className="mt-6 text-sm font-medium">Select Mode</p>
        <div className="mt-4 flex gap-3">
          {["Q&A", "Flashcards", "Summarizer"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSelectedMode(mode)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedMode === mode
                  ? "bg-blue-50 text-blue-800"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-7">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition bg-gradient-to-r from-[#0658bd] to-[#3db7d6]"
          >
            {loading ? (
              <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
            ) : (
              <BookOpen className="w-4" />
            )}
            Generate
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg border hover:bg-slate-200"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Right Section: Results */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 shadow-sm min-h-[280px]">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-700 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" /> Results
        </h2>

        {content ? (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <BookOpen className="w-9 h-9" />
              <p>Enter/Describe a topic and click 'Generate' to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyAssistant;
