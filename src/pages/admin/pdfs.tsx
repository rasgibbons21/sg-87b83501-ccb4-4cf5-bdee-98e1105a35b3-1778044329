import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit } from "lucide-react";

export default function PDFProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    payhip_url: "",
    short_link: "",
    description: "",
    cover_emoji: "",
    page_count: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("pdf_products").select("*").order("sort_order");
    if (data) setProducts(data);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.payhip_url) {
      showToast("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("pdf_products").insert({
        title: formData.title,
        price: parseFloat(formData.price),
        payhip_url: formData.payhip_url,
        short_link: formData.short_link,
        description: formData.description,
        cover_emoji: formData.cover_emoji,
        page_count: parseInt(formData.page_count) || 0,
        is_active: true,
        sort_order: products.length
      });

      if (error) throw error;

      showToast("Product added successfully!");
      setFormData({ title: "", price: "", payhip_url: "", short_link: "", description: "", cover_emoji: "", page_count: "" });
      fetchProducts();
    } catch (error) {
      console.error("Add product error:", error);
      showToast("Failed to add product");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await supabase.from("pdf_products").delete().eq("id", id);
      showToast("Product removed");
      fetchProducts();
    } catch (error) {
      console.error("Remove error:", error);
      showToast("Failed to remove product");
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-sage-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-serif text-4xl text-sage-800 mb-2">PDF Products</h1>
        <p className="text-slate-600">Manage digital guides and resources</p>
      </div>

      <div className="bg-white rounded-xl border border-sage-200 p-8 mb-8">
        <h2 className="font-serif text-2xl text-sage-800 mb-6">Add New Product</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label className="mb-2 block">Title</Label>
            <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="ETFs Explained: Your First $100" />
          </div>
          <div>
            <Label className="mb-2 block">Price ($)</Label>
            <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="7.00" />
          </div>
          <div>
            <Label className="mb-2 block">Payhip URL</Label>
            <Input value={formData.payhip_url} onChange={(e) => setFormData({...formData, payhip_url: e.target.value})} placeholder="https://payhip.com/b/..." />
          </div>
          <div>
            <Label className="mb-2 block">Short Link (Optional)</Label>
            <Input value={formData.short_link} onChange={(e) => setFormData({...formData, short_link: e.target.value})} placeholder="bloom.fyi/etf-guide" />
          </div>
          <div>
            <Label className="mb-2 block">Cover Emoji</Label>
            <Input value={formData.cover_emoji} onChange={(e) => setFormData({...formData, cover_emoji: e.target.value})} placeholder="📘" />
          </div>
          <div>
            <Label className="mb-2 block">Page Count</Label>
            <Input type="number" value={formData.page_count} onChange={(e) => setFormData({...formData, page_count: e.target.value})} placeholder="18" />
          </div>
        </div>

        <div className="mb-6">
          <Label className="mb-2 block">Description</Label>
          <Textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="A beginner-friendly guide to understanding ETFs..."
            rows={3}
          />
        </div>

        <Button onClick={handleSubmit} className="bg-sage-800 hover:bg-sage-900 text-white">
          Add Product
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-sage-200 p-8">
        <h2 className="font-serif text-2xl text-sage-800 mb-6">Active Products</h2>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-sage-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{product.cover_emoji}</span>
                <div>
                  <div className="font-medium text-sage-900">{product.title}</div>
                  <div className="text-sm text-slate-500">${product.price} • {product.page_count} pages</div>
                </div>
              </div>
              <button onClick={() => handleRemove(product.id)} className="text-terracotta-600 hover:text-terracotta-700">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}