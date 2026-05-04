"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

interface PDFProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  payhip_url: string;
  short_link: string;
  cover_emoji: string;
  page_count: number;
}

export function PDFGuides() {
  const [products, setProducts] = useState<PDFProduct[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("pdf_products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (data) setProducts(data);
      if (error) console.error("Error fetching PDF products:", error);
    };

    fetchProducts();
  }, []);

  return (
    <section id="guides" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-sage-900 mb-4">
            Take our best guides <em className="text-sage-700">anywhere</em>
          </h2>
          <p className="text-lg text-sage-600 max-w-2xl mx-auto">
            Beautifully designed PDF guides you can read offline, highlight, and keep forever. No subscription required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-sage-200 p-6 hover:shadow-xl transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-sage-50 rounded-lg flex items-center justify-center mb-4 border border-sage-200">
                  <Image
                    src={`/api/qr?url=${encodeURIComponent(product.payhip_url)}&size=56`}
                    alt={`QR code for ${product.title}`}
                    width={56}
                    height={56}
                    className="rounded"
                  />
                </div>
                
                <div className="text-4xl mb-3">{product.cover_emoji}</div>
                
                <h3 className="text-xl font-serif font-semibold text-sage-900 mb-2">
                  {product.title}
                </h3>
                
                <p className="text-sm text-sage-600 mb-4 leading-relaxed">
                  {product.description}
                </p>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-serif font-semibold text-sage-900">
                    ${product.price}
                  </span>
                  <span className="text-sm text-sage-600">· {product.page_count} pages</span>
                </div>
                
                <a
                  href={product.payhip_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-terracotta-600 font-medium hover:text-terracotta-700 transition-colors group-hover:underline"
                >
                  Buy on Payhip
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}