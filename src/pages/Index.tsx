import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PromoBar from "@/components/PromoBar";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <PromoBar />
    <CategoryGrid />
    <FeaturedProducts />
    <Footer />
  </div>
);

export default Index;
