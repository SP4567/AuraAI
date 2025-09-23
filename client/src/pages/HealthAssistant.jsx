import { Sparkles, Stethoscope } from 'lucide-react';
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
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [healthIssue, setHealthIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      // ✅ Frontend validation
      if (!firstName || !lastName || !age || !gender || !location || !healthIssue) {
        toast.error("All fields are required");
        return;
      }

      setLoading(true);

      // Prompt for AI
      const prompt = `Generate a ${selectType} prescription for a person, based upon this data:
      - ${firstName}, 
      - ${lastName},
      - ${age},
      - ${gender},
      - ${location}, 
      - ${healthIssue}
      Based upon the patients location which is ${location} show all the contact details for healthcare providers/doctors in that area.`;

      // ✅ Send both prompt + raw fields (so backend validation passes)
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
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message || "No content returned from AI");
      }
    } catch (err) {
      toast.error(err.message || "Request failed");
    } finally {
      setLoading(false); // ✅ Always reset loading
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-7 text-slate-700">
      {/* FORM LEFT */}
      <form onSubmit={onSubmitHandler} className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#0077B6]" />
          <h1 className="text-xl font-semibold">Clinica: AI Health Assistant</h1>
        </div>

        {/* Inputs */}
        <p className="mt-6 text-sm font-medium">First Name</p>
        <input onChange={(e) => setFirstName(e.target.value)} value={firstName} type="text" className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300" placeholder="Enter the First Name" required />

        <p className="mt-6 text-sm font-medium">Last Name</p>
        <input onChange={(e) => setLastName(e.target.value)} value={lastName} type="text" className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300" placeholder="Enter the Last Name" required />

        <p className="mt-6 text-sm font-medium">Age</p>
        <input onChange={(e) => setAge(e.target.value)} value={age} type="number" className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300" placeholder="Enter the Age" required />

        <p className="mt-6 text-sm font-medium">Gender</p>
        <input onChange={(e) => setGender(e.target.value)} value={gender} type="text" className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300" placeholder="Enter the Gender" required />

        <p className="mt-6 text-sm font-medium">Location</p>
        <input onChange={(e) => setLocation(e.target.value)} value={location} type="text" className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300" placeholder="Enter your Location" required />

        <p className="mt-6 text-sm font-medium">Health Issue</p>
        <textarea rows={5} onChange={(e) => setHealthIssue(e.target.value)} value={healthIssue} className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300" placeholder="Describe your health issue" required />

        <p className="mt-4 text-sm font-medium">Response Style</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {responseStyle.map((item, index) => (
            <span
              key={index}
              onClick={() => setSelectType(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectType === item ? 'bg-cyan-50 text-blue-800 border-blue-400' : 'text-gray-500 border-gray-300'
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#1410e4] to-[#21e0e7] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
          ) : (
            <Stethoscope className="w-5" />
          )}
          Generate prescription
        </button>
      </form>

      {/* RESULT RIGHT */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[414px] max-h-[700px]">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-5 h-5 text-[#0077B6]" />
          <h1 className="text-xl font-semibold">Generated Prescription</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Stethoscope className="w-9 h-9" />
              <p>Enter the details and click 'Generate prescription'</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 overflow-y-auto text-sm text-slate-600 max-h-[600px]">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthAssistant;
