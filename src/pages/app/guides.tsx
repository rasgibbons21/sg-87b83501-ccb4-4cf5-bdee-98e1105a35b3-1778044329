import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Guides() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from("pdf_products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    setProducts(data || []);
  };

  const handleClick = async (productName: string, payhipUrl: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from("affiliate_clicks").insert({
        user_id: session.user.id,
        product_name: productName,
        click_type: "pdf",
        clicked_at: new Date().toISOString()
      });
    }
    window.open(payhipUrl, "_blank");
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-serif text-sage-900 mb-2">Investment Guides</h1>
          <p className="text-sage-600">Downloadable PDF guides to accelerate your learning.</p>
        </div>

        <div className="bg-champagne-100 border border-champagne-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎉</div>
            <div>
              <div className="font-medium text-sage-900">Member Exclusive: 20% Off</div>
              <div className="text-sm text-sage-600">All guides are automatically discounted for Bloom members.</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-sage-200 rounded-xl p-6 space-y-4 hover:border-sage-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{product.cover_emoji}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-sage-600" />
                      <span className="text-xs text-sage-600">{product.page_count} pages</span>
                    </div>
                  </div>
                </div>
                <div className="bg-terracotta-100 text-terracotta-700 px-2 py-1 rounded text-xs font-medium">
                  -20%
                </div>
              </div>

              <div>
                <h3 className="text-xl font-serif text-sage-900 mb-2">{product.title}</h3>
                <p className="text-sm text-sage-600 leading-relaxed">{product.description}</p>
              </div>

              <div className="pt-4 border-t border-sage-100">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-serif text-sage-900">
                    ${(product.price * 0.8).toFixed(2)}
                  </span>
                  <span className="text-sm text-sage-500 line-through">${product.price}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <img
                    src={`/api/qr?url=${encodeURIComponent(product.payhip_url)}&size=56`}
                    alt={`QR code for ${product.title}`}
                    className="w-14 h-14 border border-sage-200 rounded"
                  />
                  <div className="text-xs text-sage-600">
                    Scan with phone<br />to buy instantly
                  </div>
                </div>

                <Button
                  onClick={() => handleClick(product.title, product.payhip_url)}
                  className="w-full bg-sage-800 hover:bg-sage-900 text-white"
                >
                  Buy on Payhip <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}