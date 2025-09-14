import AiTools from "../components/AiTools";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Testimonials from "../components/Testimonials";
import Plan from "../components/Plan";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="bg-[url('/blue-pink-halftone-background_53876-99004.jpg')] bg-cover bg-no-repeat bg-fixed min-h-screen">
      <Navbar />
      <Hero />
      <AiTools />
      <Testimonials />
      <Plan />
      <Footer />
    </div>
  );
};

export default Home;
