import React, { useState } from "react"
import { Brain, BookOpen, Video, CheckCircle } from "lucide-react"

const StudyAssistant = () => {
  const [input, setInput] = useState("")
  const [topic, setTopic] = useState("")
  const [selectedMode, setSelectedMode] = useState("Q&A")
  const [progress, setProgress] = useState(0)
  const [questions, setQuestions] = useState("")
  const [videos, setVideos] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    setProgress((prev) => Math.min(prev + 20, 100))

    try {
      const res = await fetch("/api/generate-study-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          mode: selectedMode,
          topic
        })
      })
      const data = await res.json()
      if (data.success) {
        // Split Gemini output into sections
        const parts = data.content.split("YouTube Recommendations:")
        setQuestions(parts[0]?.trim() || "")
        setVideos(parts[1]?.trim() || "")
      } else {
        setQuestions("⚠️ " + data.message)
        setVideos("")
      }
    } catch (err) {
      setQuestions("Error fetching study content.")
      setVideos("")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setInput("")
    setTopic("")
    setQuestions("")
    setVideos("")
    setProgress(0)
    setSelectedMode("Q&A")
  }

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
                  ? "bg-blue-50 text-deep to-blue-800"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* YouTube Topic */}
        <div className="mt-4, my-6">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Optional: Enter a topic for YouTube video recommendations"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
           <p className="text-xs text-gray-500 font-light mt-2">Mention keywords or topic title.</p>
        </div>

        <p className="">Progress Bar</p>
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 mt-6 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition bg-gradient-to-r from-[#0658bd] to-[#3db7d6]"
          >
            {loading ? "Generating..." : "Generate"}
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

        {questions || videos ? (
          <div className="space-y-6 text-sm text-gray-700 whitespace-pre-line">
            {questions && (
              <div>
                <h3 className="font-semibold text-indigo-600 mb-2">
                  Practice Content
                </h3>
                <p>{questions}</p>
              </div>
            )}
            {videos && (
              <div>
                <h3 className="font-semibold text-indigo-600 mb-2">
                  🎥 YouTube Recommendations
                </h3>
                <p>{videos}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-center">
            <CheckCircle className="w-9 h-9 mx-auto mb-3" />
            <p>
              Enter something above and click <b>"Generate"</b> to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudyAssistant
