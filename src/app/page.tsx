import ProductSlider from '@/components/product/ProductSlider'
import ProductGrid from '@/components/product/ProductGrid'
import ContactSection from '@/components/sections/ContactSection'
import Footer from '@/components/layout/Footer'
import Banner from '@/components/sections/Banner'
import Manifesto from '@/components/sections/Manifesto'

export default function Home() {
  return (
    <main className="min-h-screen text-bone">
      <Banner />
      <ProductSlider />
      <ProductGrid />
      <Manifesto />
      <ContactSection />
      <Footer />
    </main>
  )
}
