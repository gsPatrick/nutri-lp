import IntroAnimation from '@/components/IntroAnimation/IntroAnimation';
import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import SobreSection from '@/components/SobreSection/SobreSection';
import BeneficiosSection from '@/components/BeneficiosSection/BeneficiosSection';
import ServicosSection from '@/components/ServicosSection/ServicosSection';
import DepoimentosSection from '@/components/DepoimentosSection/DepoimentosSection';
import CTASection from '@/components/CTASection/CTASection';
import Footer from '@/components/Footer/Footer';

import fs from 'fs';
import path from 'path';

// Server Component function to get images
function getTestimonialImages() {
  try {
    const dirPath = path.join(process.cwd(), 'public', 'depoimentos');
    const files = fs.readdirSync(dirPath);
    return files
      .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
      .map(file => `/depoimentos/${file}`);
  } catch (error) {
    console.warn('Could not read depoimentos folder:', error);
    return [];
  }
}

export default function Home() {
  const testimonialImages = getTestimonialImages();

  return (
    <main>
      <IntroAnimation />
      <Header />
      <Hero />
      <SobreSection />
      <BeneficiosSection />
      <ServicosSection />
      <DepoimentosSection images={testimonialImages} />
      <CTASection />
      <Footer />
    </main>
  );
}
