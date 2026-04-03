import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Star, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id!).single();
      setProduct(data as Product | null);
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground text-xl">المنتج غير موجود</div>
        <Footer />
      </div>
    );
  }

  const handleAdd = () => {
    const size = selectedSize || product.sizes?.[0] || "";
    const color = selectedColor || product.colors?.[0] || "";
    for (let i = 0; i < qty; i++) addItem(product, size, color);
    toast.success(`تمت إضافة "${product.name}" إلى السلة`);
  };

  const formatPrice = (price: number) => price.toLocaleString("ar-YE");

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="rounded-2xl overflow-hidden aspect-square bg-card border border-border">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-6">
            {product.badge && (
              <span className="inline-block gold-gradient text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full">
                {product.badge}
              </span>
            )}
            <h1 className="text-3xl font-black">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} تقييم)</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-primary">{formatPrice(product.price)} ر.ي</span>
              {product.original_price && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.original_price)} ر.ي</span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground">{product.description}</p>
            )}

            {product.sizes?.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-2">المقاس</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        (selectedSize || product.sizes[0]) === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary text-muted-foreground"
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-2">اللون</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        (selectedColor || product.colors[0]) === c
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary text-muted-foreground"
                      }`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-secondary transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="px-4 font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-secondary transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <Button onClick={handleAdd} size="lg" className="flex-1 gold-gradient text-primary-foreground font-bold hover:opacity-90">
                <ShoppingCart className="w-4 h-4 ml-2" /> أضف للسلة
              </Button>
            </div>

            {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
              <p className="text-sm text-destructive">⚠️ متبقي {product.stock} قطع فقط!</p>
            )}

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              {[
                { icon: Truck, text: "توصيل سريع" },
                { icon: Shield, text: "ضمان الجودة" },
                { icon: RotateCcw, text: "إرجاع مجاني" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="text-center">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <span className="text-xs text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
