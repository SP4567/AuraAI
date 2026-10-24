import AiTools from "../components/AiTools";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Testimonials from "../components/Testimonials";
import Plan from "../components/Plan";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="marketing-shell min-h-screen">
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
