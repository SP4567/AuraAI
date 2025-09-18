import React, { useState, useEffect } from 'react'
import { Sparkles, BookOpen, ClipboardList, Timer, CheckCircle, Youtube } from 'lucide-react'

const StudyAssistant = () => {
  const [input, setInput] = useState("")
  const [selectedMode, setSelectedMode] = useState("Q&A")
  const [progress, setProgress] = useState(0)
  const [timer, setTimer] = useState(25 * 60) // 25 mins
  const [isRunning, setIsRunning] = useState(false)
  const [topic, setTopic] = useState("")
  const [videos, setVideos] = useState([])

  const modes = ["Q&A", "Summarizer", "Flashcards", "Progress Tracker"]

  // Timer effect
  useEffect(() => {
    let interval
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timer])

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const onSubmitHandler = (e) => {
    e.preventDefault()
    setProgress((prev) => Math.min(prev + 20, 100)) // simulate study progress
    console.log("Submitted:", input, "Mode:", selectedMode)
  }

  const generateQuestions = () => {
    return [
      "What are the key concepts of this topic?",
      "Explain in your own words.",
      "List 3 real-world applications."
    ]
  }

  const recommendVideos = () => {
    // mock data for now; later integrate with YouTube Data API
    const sampleVideos = [
      { title: `Intro to ${topic}`, url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { title: `${topic} Explained Simply`, url: "https://www.youtube.com/watch?v=H14bBuluwB8" },
      { title: `Top 5 ${topic} Tutorials`, url: "https://www.youtube.com/watch?v=KxJb6hR9XzQ" }
    ]
    setVideos(sampleVideos)
  }

  return (
    <div className="h-full overflow-y-scroll p-6 flex flex-wrap gap-7 text-slate-700">
      {/* Input + Features Section */}
      <form 
        onSubmit={onSubmitHandler} 
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-indigo-600" />
          <h1 className="text-xl font-semibold">AI Study Assistant</h1>
        </div>

        {/* Mode Selection */}
        <p className="mt-6 text-sm font-medium">Select Mode</p>
        <div className="mt-3 flex gap-3 flex-wrap">
          {modes.map((item, index) => (
            <span 
              onClick={() => setSelectedMode(item)} 
              key={index}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition 
                ${selectedMode === item 
                  ? "bg-indigo-50 text-indigo-700 border-indigo-300" 
                  : "text-gray-500 border-gray-300 hover:bg-gray-100"}`}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Input */}
        <p className="mt-6 text-sm font-medium">Your Question / Notes</p>
        <textarea 
          onChange={(e) => setInput(e.target.value)} 
          value={input}
          className="w-full p-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-400"
          placeholder={`Enter text for ${selectedMode}...`}
          required
        />

        {/* Submit Button */}
        <button 
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#4338CA] to-[#6366F1] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer hover:shadow-md transition"
        >
          <BookOpen className="w-5" />
          Generate {selectedMode}
        </button>
      </form>

      {/* Output Section */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 shadow-sm min-h-[280px]">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-semibold">Results</h1>
        </div>

        <div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-5 text-gray-400 text-center">
            <CheckCircle className="w-9 h-9" />
            <p>Enter something above and click "Generate" to get started</p>
          </div>
        </div>
      </div>

      {/* Interactive Study Tools */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <Timer className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-semibold">Study Tools</h1>
        </div>

        {/* Timer */}
        <div>
          <p className="text-sm font-medium">⏳ Pomodoro Timer</p>
          <p className="mt-1 text-lg font-bold">{formatTime(timer)}</p>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => setIsRunning(true)}
              className="px-3 py-1 bg-indigo-500 text-white rounded-md text-sm"
            >
              Start
            </button>
            <button 
              onClick={() => { setIsRunning(false); setTimer(25 * 60) }}
              className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div>
          <p className="text-sm font-medium">📈 Progress Tracker</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs mt-1 text-gray-500">{progress}% completed</p>
        </div>

        {/* Practice Questions */}
        <div>
          <p className="text-sm font-medium">📝 Practice Questions</p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
            {generateQuestions().map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        </div>

        {/* YouTube Recommendations */}
        <div>
          <p className="text-sm font-medium flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" /> Recommended Videos
          </p>
          <div className="mt-2 flex gap-2">
            <input 
              value={topic} 
              onChange={(e) => setTopic(e.target.value)} 
              className="flex-1 p-2 text-sm border rounded-md outline-none"
              placeholder="Enter subject/topic..."
            />
            <button 
              onClick={recommendVideos} 
              type="button"
              className="px-3 py-1 bg-indigo-500 text-white text-sm rounded-md"
            >
              Search
            </button>
          </div>
          <ul className="mt-3 text-sm text-blue-600 space-y-1">
            {videos.map((v, i) => (
              <li key={i}>
                <a href={v.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {v.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default StudyAssistant
