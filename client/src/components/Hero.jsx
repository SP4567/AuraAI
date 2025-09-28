import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import user_group from '../assets/user_group.png';

const Hero = () => {
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="px-4 sm:px-20 xl:px-32 relative flex flex-col w-full justify-center bg-[url('/blue-pink-halftone-background_53876-99004.jpg')] bg-cover bg-no-repeat bg-fixed min-h-screen">
      
      {/* Hero Text */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto leading-[1.2]">
          Create amazing content <br />
          <span className="text-primary">with AI tools</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl 2xl:text-3xl">
          Unleash your creativity with our powerful AI-driven platform.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs">
        <button
          onClick={() => navigate('/ai')}
          className="bg-primary text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer"
        >
          Start Creating Now
        </button>

        <button
          onClick={() => setIsVideoOpen(true)}
          className="bg-white px-10 py-3 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer"
        >
          Watch Demo
        </button>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="relative w-full max-w-5xl h-[100vh] sm:h-[70vh] md:h-[80vh]">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/qkvn9tu5-i0?autoplay=1&mute=1"
              title="Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-lg"
            ></iframe>

            {/* Close button */}
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-black font-bold hover:bg-gray-200 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Trusted by Section */}
      <div className="flex items-center gap-4 mt-8 mx-auto text-gray-600">
        <img src={user_group} alt="Description of image" className="mx-auto" />
        Trusted By 10k+ people.
      </div>
    </div>
  );
};

export default Hero;
