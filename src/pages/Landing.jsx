import CTASection from '../components/landing/CTASection';
import ClientLogos from '../components/landing/ClientLogos';
import FactorySection from '../components/landing/FactorySection';
import Hero from '../components/landing/Hero';
import LiveQuoteSection from '../components/landing/LiveQuoteSection';
import ManufacturingStats from '../components/landing/ManufacturingStats';
import PackagingCategories from '../components/landing/PackagingCategories';
import ProductionTimeline from '../components/landing/ProductionTimeline';
import Testimonials from '../components/landing/Testimonials';
import TrustBar from '../components/landing/TrustBar';

export default function Landing() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <TrustBar />
      <LiveQuoteSection />
      <PackagingCategories />
      <ManufacturingStats />
      <FactorySection />
      <ProductionTimeline />
      <ClientLogos />
      <Testimonials />
      <CTASection />
    </main>
  );
}
