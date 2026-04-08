import { Star, ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.sizes?.[0] || "", product.colors?.[0] || "");
    toast.success(`تمت إضافة "${product.name}" إلى السلة`);
  };

  const formatPrice = (price: number) => price.toLocaleString("ar-YE");

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-card rounded-xl overflow-hidden border border-border hover-lift">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={product.images?.[0] || product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.badge && (
            <span className="absolute top-3 right-3 gold-gradient text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full">
              {product.badge}
            </span>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="bg-card/80 backdrop-blur p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="absolute bottom-3 left-3 right-3 gold-gradient text-primary-foreground py-2.5 rounded-lg font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> أضف للسلة
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-sm text-foreground mb-1 line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
            <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-primary">{formatPrice(product.price)} ر.ي</span>
            {product.original_price && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
