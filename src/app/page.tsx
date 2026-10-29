
import ProductSlider from "./components/ProductSlider";
import ProductGrid from "./components/ProductGrid";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import Baner from "./components/Baner";

export default function Home() {
  return (
     <main className="min-h-screen bg-gray-900 text-white px-4">
      <ProductSlider />
      <Baner />
      <ProductGrid />
      <ContactSection />
      <Footer />
    </main>
  );
}
