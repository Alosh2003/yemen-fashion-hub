import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Product } from "@/data/products";
import { publicSupabase } from "@/integrations/supabase/publicClient";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  Star,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Price from "@/components/Price";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.955L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { settings } = useSiteSettings();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      try {
        const { data, error } = await publicSupabase
          .from("products")
          .select("*")
          .eq("id", id!)
          .eq("is_active", true)
          .maybeSingle();

        if (error) throw error;
        if (mounted) setProduct(data as Product | null);
      } catch (error) {
        console.error("Failed to load product", error);
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (id) fetchProduct();
    return () => { mounted = false; };
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

  // Build images array from both fields
  const allImages = (product.images && product.images.length > 0)
    ? product.images
    : product.image ? [product.image] : ["/placeholder.svg"];

  const handleAdd = () => {
    const size = selectedSize || product.sizes?.[0] || "";
    const color = selectedColor || product.colors?.[0] || "";
    for (let i = 0; i < qty; i++) addItem(product, size, color);
    toast.success(`تمت إضافة "${product.name}" إلى السلة`);
  };

  const formatPrice = (price: number) => price.toLocaleString("ar-YE");

  const buildWhatsAppLink = () => {
    const raw = settings.whatsapp_number || "";
    const number = raw.replace(/\D/g, "");
    if (!number || !product) return "#";
    const productUrl = typeof window !== "undefined" ? window.location.href : "";
    const size = selectedSize || product.sizes?.[0] || "غير محدد";
    const color = selectedColor || product.colors?.[0] || "غير محدد";
    const message = [
      `مرحباً، أنا مهتم بالاستفسار عن منتجكم:`,
      `*${product.name}*`,
      `السعر: ${formatPrice(product.price)} ${settings.currency_old_label || "ريال"}`,
      `المقاس: ${size}`,
      `اللون: ${color}`,
      `الكمية: ${qty}`,
      productUrl,
    ].join("\n");
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Image carousel */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-card border border-border">
              <img src={allImages[currentImageIndex]} alt={product.name} className="w-full h-full object-cover" />
              {allImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur rounded-full p-2 hover:bg-background transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button onClick={nextImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur rounded-full p-2 hover:bg-background transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button key={i} onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? "bg-primary" : "bg-background/60"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImageIndex(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${i === currentImageIndex ? "border-primary" : "border-border"}`}>
                    <img src={img} alt={`صورة ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
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
            <div className="space-y-1">
              <Price value={product.price} size="lg" />
              {product.original_price && (
                <div className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </div>
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

            {settings.whatsapp_number && (
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold text-white rounded-lg px-5 py-3 transition-colors hover:opacity-90 w-full sm:w-auto"
                style={{ backgroundColor: "#25D366" }}
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>حجز أو استفسار عبر واتساب</span>
              </a>
            )}

            {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
              <p className="text-sm text-destructive">⚠️ متبقي {product.stock} قطع فقط!</p>
            )}
            {product.stock !== undefined && product.stock === 0 && (
              <p className="text-sm text-destructive font-bold">❌ نفذ من المخزون</p>
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
