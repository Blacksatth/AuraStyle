import ProductSlider from './components/ProductSlider'
import ProductGrid from './components/ProductGrid'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import Baner from './components/Baner'
import Manifesto from './components/Manifesto'

export default function Home() {
  return (
    <main className="min-h-screen text-bone">
      <Baner />
      <ProductSlider />
      <ProductGrid />
      <Manifesto />
      <ContactSection />
      <Footer />
    </main>
  )
}
