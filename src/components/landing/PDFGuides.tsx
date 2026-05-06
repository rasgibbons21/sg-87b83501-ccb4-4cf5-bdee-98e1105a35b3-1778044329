import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PDFProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  payhip_url: string;
  cover_emoji: string;
  page_count: number;
}

export function PDFGuides() {
  const [products, setProducts] = useState<PDFProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("pdf_products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching PDF products:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section id="guides" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-terracotta-500 uppercase tracking-wider text-sm font-semibold mb-3">
              Your Investing Library
            </p>
            <h2 className="font-serif text-4xl text-sage-800">PDF Guides</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-sage-50 rounded-lg p-6 animate-pulse">
                <div className="h-32 bg-sage-200 rounded mb-4"></div>
                <div className="h-4 bg-sage-200 rounded mb-2"></div>
                <div className="h-4 bg-sage-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="guides" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-terracotta-500 uppercase tracking-wider text-sm font-semibold mb-3">
            Your Investing Library
          </p>
          <h2 className="font-serif text-4xl text-sage-800">PDF Guides</h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
            Bite-sized guides that break down complex investing topics into clear, actionable steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-sage-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <img
                  src={`/api/qr?url=${encodeURIComponent(product.payhip_url)}&size=56`}
                  alt={`QR code for ${product.title}`}
                  className="w-14 h-14"
                />
              </div>

              {/* Cover Emoji */}
              <div className="text-center text-5xl mb-4">
                {product.cover_emoji}
              </div>

              {/* Title */}
              <h3 className="font-serif text-xl text-sage-800 mb-2 text-center">
                {product.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 mb-4 text-center min-h-[60px]">
                {product.description}
              </p>

              {/* Price and Page Count */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-sage-100">
                <span className="font-serif text-2xl text-sage-800">
                  ${product.price}
                </span>
                <span className="text-sm text-slate-500">
                  {product.page_count} pages
                </span>
              </div>

              {/* Buy Link */}
              <a
                href={product.payhip_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2.5 bg-white border border-terracotta-500 text-terracotta-500 rounded-lg hover:bg-terracotta-500 hover:text-white transition-colors font-medium"
              >
                Buy on Payhip →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}