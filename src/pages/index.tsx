import { SEO } from "@/components/SEO";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Calculator } from "@/components/landing/Calculator";
import { Testimonials } from "@/components/landing/Testimonials";
import { Brokers } from "@/components/landing/Brokers";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { CrawlerTicker } from "@/components/CrawlerTicker";

export default function LandingPage() {
  return (
    <>
      <SEO />
      <CrawlerTicker />
      <Header />
      <Hero />
      <Calculator />
      <Testimonials />
      <Brokers />
      <Pricing />
      <Footer />
    </>
  );
}