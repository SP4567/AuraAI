import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import user_group from '../assets/user_group.png';

const Hero = () => {
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="hero-shell px-4 pt-28 pb-16 sm:px-12 xl:px-24 relative flex flex-col w-full justify-center min-h-screen">

      {/* Hero Text */}
      <div className="text-center mb-8">
        <span className="hero-eyebrow">Your ideas, amplified</span>
        <h1 className="text-4xl sm:text-6xl md:text-7xl 2xl:text-8xl font-semibold mx-auto leading-[1.08] tracking-tight">
          Create amazing content <br />
          <span className="text-primary">with AI tools</span>
        </h1>
        <p className="hero-description text-lg sm:text-xl md:text-2xl">
          Unleash your creativity with our powerful AI-driven platform.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs">
        <button
          onClick={() => navigate('/ai')}
          className="bg-primary text-white px-7 py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-102 active:scale-95 transition cursor-pointer"
        >
          Start Creating Now
        </button>

        <button
          onClick={() => setIsVideoOpen(true)}
          className="hero-secondary-button px-7 py-3.5 rounded-xl border hover:scale-102 active:scale-95 transition cursor-pointer"
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

      {/* Trusted By */}
      {/* Trusted By Section */}
      <div className="flex items-center gap-4 mt-8 mx-auto text-gray-600">
        <img src={user_group} alt="People" className="mx-auto" />
        Trusted By 10k+ people.
      </div>
      <br />
      {/* Marquee */}
      <div className="overflow-hidden w-full mt-8">
        <div
          className="marquee-track flex items-center gap-10"
        >
          {[
            "slack",
            "framer",
            "netflix",
            "google",
            "linkedin",
            "instagram",
            "facebook",
          ].map((logo, index) => (
            <img
              key={index}
              alt={logo}
              className="h-10 w-auto object-contain mx-6"
              src={`https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/companyLogo/${logo}.svg`}
            />
          ))}

          {/* Duplicate for infinite scroll */}
          {[
            "slack",
            "framer",
            "netflix",
            "google",
            "linkedin",
            "instagram",
            "facebook",
          ].map((logo, index) => (
            <img
              key={"dup-" + index}
              alt={logo}
              className="h-10 w-auto object-contain mx-6"
              src={`https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/companyLogo/${logo}.svg`}
            />
          ))}
        </div>
      </div>
    </div >
  );
};

export default Hero;
