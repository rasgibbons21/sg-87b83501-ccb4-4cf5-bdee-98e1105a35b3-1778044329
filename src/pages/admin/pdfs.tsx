import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

export default function AdminPDFs() {
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    payhip_url: "",
    short_link: "",
    cover_emoji: "",
    page_count: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("pdf_products")
      .select("*")
      .order("sort_order", { ascending: true });
    setProducts(data || []);
  };

  const handleAdd = async () => {
    const { error } = await supabase.from("pdf_products").insert({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      payhip_url: formData.payhip_url,
      short_link: formData.short_link,
      cover_emoji: formData.cover_emoji,
      page_count: parseInt(formData.page_count),
      is_active: true,
      sort_order: products.length + 1
    });

    if (!error) {
      setFormData({
        title: "",
        description: "",
        price: "",
        payhip_url: "",
        short_link: "",
        cover_emoji: "",
        page_count: ""
      });
      fetchProducts();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await supabase
      .from("pdf_products")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this PDF product?")) return;
    await supabase.from("pdf_products").delete().eq("id", id);
    fetchProducts();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-sage-900">PDF Products</h1>
          <p className="text-sage-600 mt-1">Manage downloadable guides and resources</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">Add New Product</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Title</label>
              <Input
                placeholder="ETFs Explained: Your First $100"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Price ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="7.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-sage-700 mb-1">Description</label>
              <Textarea
                rows={2}
                placeholder="Learn the fundamentals of ETF investing with clear examples..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Payhip URL</label>
              <Input
                placeholder="https://payhip.com/b/xxxxx"
                value={formData.payhip_url}
                onChange={(e) => setFormData({ ...formData, payhip_url: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Short Link</label>
              <Input
                placeholder="bloom.io/etfs"
                value={formData.short_link}
                onChange={(e) => setFormData({ ...formData, short_link: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Cover Emoji</label>
              <Input
                placeholder="📚"
                value={formData.cover_emoji}
                onChange={(e) => setFormData({ ...formData, cover_emoji: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Page Count</label>
              <Input
                type="number"
                placeholder="24"
                value={formData.page_count}
                onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleAdd}
              disabled={!formData.title || !formData.price}
              className="bg-sage-800 hover:bg-sage-900"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">All Products</h3>
          
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border border-sage-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{product.cover_emoji}</div>
                  <div>
                    <p className="font-medium text-sage-900">{product.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-sage-600">${product.price}</span>
                      <span className="text-sm text-sage-400">•</span>
                      <span className="text-sm text-sage-600">{product.page_count} pages</span>
                      <span className="text-sm text-sage-400">•</span>
                      <span className="text-xs text-sage-500">{product.short_link}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={() => handleToggleActive(product.id, product.is_active)}
                    />
                    <span className="text-sm text-sage-600">
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleDelete(product.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}