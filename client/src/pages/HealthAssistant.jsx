import { AlertTriangle, Check, Copy, Download, RotateCcw, Sparkles, Stethoscope } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const HealthAssistant = () => {
  const responseStyle = ['Summarised', 'Detailed'];
  const [selectType, setSelectType] = useState('Summarised');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Not Specified');
  const [location, setLocation] = useState('');
  const [healthIssue, setHealthIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !age || !location.trim() || !healthIssue.trim()) {
      toast.error("Please fill in all patient details");
      return;
    }

    try {
      setLoading(true);
      const prompt = `Generate a ${selectType} health advisory & lifestyle recovery guide for a patient with the following profile:
      - Name: ${firstName} ${lastName}
      - Age: ${age}
      - Gender: ${gender}
      - Location: ${location}
      - Health Concern / Symptoms: ${healthIssue}

      Structure the response clearly:
      1. Clinical Observations & Potential Causes
      2. Symptom Care & Recovery Protocol
      3. Lifestyle, Nutrition & Hydration Guidance
      4. Warning Signs Requiring Immediate Emergency Care
      5. Recommended Doctor Specialties & Healthcare Facilities near ${location}`;

      const token = await getToken();
      const { data } = await axios.post(
        '/api/ai/generate-prescription',
        {
          prompt,
          firstName,
          lastName,
          age,
          gender,
          location,
          healthIssue,
          responseStyle: selectType,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Health advisory generated!");
      } else {
        toast.error(data.message || "Failed to generate response");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Health advisory copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadReport = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-advisory-${firstName || 'patient'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Advisory downloaded");
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setAge('');
    setGender('Not Specified');
    setLocation('');
    setHealthIssue('');
    setContent('');
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700">
      {/* FORM LEFT */}
      <form onSubmit={onSubmitHandler} className="w-full max-w-lg p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#0077B6]" />
          <h1 className="text-xl font-semibold">Clinica: AI Health Assistant</h1>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Educational use only:</strong> AuraAI does not provide medical diagnoses or prescriptions. In an emergency, dial local emergency services immediately.
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div>
            <label className="text-xs font-medium text-gray-700">First Name</label>
            <input 
              onChange={(e) => setFirstName(e.target.value)} 
              value={firstName} 
              type="text" 
              className="w-full p-2.5 px-3 mt-1 outline-none text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition" 
              placeholder="e.g. Alex" 
              required 
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Last Name</label>
            <input 
              onChange={(e) => setLastName(e.target.value)} 
              value={lastName} 
              type="text" 
              className="w-full p-2.5 px-3 mt-1 outline-none text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition" 
              placeholder="e.g. Mercer" 
              required 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-xs font-medium text-gray-700">Age</label>
            <input 
              onChange={(e) => setAge(e.target.value)} 
              value={age} 
              type="number" 
              min="1"
              max="125"
              className="w-full p-2.5 px-3 mt-1 outline-none text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition" 
              placeholder="e.g. 28" 
              required 
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2.5 px-3 mt-1 outline-none text-xs rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Other">Other / Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="text-xs font-medium text-gray-700">City / Location</label>
          <input 
            onChange={(e) => setLocation(e.target.value)} 
            value={location} 
            type="text" 
            className="w-full p-2.5 px-3 mt-1 outline-none text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition" 
            placeholder="e.g. San Francisco, CA or London, UK" 
            required 
          />
        </div>

        <div className="mt-3">
          <label className="text-xs font-medium text-gray-700">Reported Symptoms & Duration</label>
          <textarea 
            rows={4} 
            onChange={(e) => setHealthIssue(e.target.value)} 
            value={healthIssue} 
            className="w-full p-2.5 px-3 mt-1 outline-none text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition" 
            placeholder="Describe symptoms, onset time, pain scale (1-10), and any pre-existing conditions..." 
            required 
          />
        </div>

        <p className="mt-3.5 text-xs font-medium text-gray-700">Response Depth</p>
        <div className="mt-1.5 flex gap-2">
          {responseStyle.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectType(item)}
              className={`text-xs px-3.5 py-1.5 border rounded-full cursor-pointer transition font-medium ${
                selectType === item ? 'bg-cyan-50 text-cyan-800 border-cyan-400 shadow-xs' : 'text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex gap-2.5 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#1410e4] to-[#21e0e7] text-white px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
            ) : (
              <Stethoscope className="w-4 h-4" />
            )}
            {loading ? "Generating Advisory..." : "Generate Health Guidance"}
          </button>

          {(firstName || healthIssue || content) && (
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

      {/* RESULT RIGHT */}
      <div className="w-full max-w-xl p-5 bg-white rounded-xl flex flex-col border border-gray-200 shadow-sm min-h-[460px] max-h-[750px]">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Stethoscope className="w-5 h-5 text-[#0077B6]" />
            <h1 className="text-xl font-semibold">Health Guidance Report</h1>
          </div>
          {content && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-cyan-50 text-cyan-800 px-3 py-1.5 rounded-lg border border-cyan-200 hover:bg-cyan-100 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={downloadReport}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          )}
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-400 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-[#0077B6]">
                <Stethoscope className="w-7 h-7" />
              </div>
              <p>Enter patient symptoms and location to generate a personalized wellness plan and doctor suggestions</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex-1 overflow-y-auto text-sm text-slate-700 leading-relaxed pr-1">
            <div className="reset-tw prose prose-sm max-w-none">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthAssistant;
