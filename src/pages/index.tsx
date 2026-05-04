import { CrawlerTicker } from "@/components/CrawlerTicker";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Calculator } from "@/components/landing/Calculator";
import { Testimonials } from "@/components/landing/Testimonials";
import { PDFGuides } from "@/components/landing/PDFGuides";
import { Brokers } from "@/components/landing/Brokers";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <CrawlerTicker />
      <Header />
      <main className="min-h-screen bg-ivory">
        <Hero />
        <Calculator />
        <Testimonials />
        <PDFGuides />
        <Brokers />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}