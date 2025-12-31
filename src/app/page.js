import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import SobreSection from '@/components/SobreSection/SobreSection';
import BeneficiosSection from '@/components/BeneficiosSection/BeneficiosSection';
import ServicosSection from '@/components/ServicosSection/ServicosSection';
import DepoimentosSection from '@/components/DepoimentosSection/DepoimentosSection';
import CTASection from '@/components/CTASection/CTASection';
import Footer from '@/components/Footer/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <SobreSection />
      <BeneficiosSection />
      <ServicosSection />
      <DepoimentosSection />
      <CTASection />
      <Footer />
    </main>
  );
}
