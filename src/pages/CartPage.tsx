import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const formatPrice = (price: number) => price.toLocaleString("ar-YE");

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-8">سلة <span className="gold-text">المشتريات</span></h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-6">سلتك فارغة</p>
            <Link to="/">
              <Button className="gold-gradient text-primary-foreground font-bold">تسوق الآن</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.product.id + item.size + item.color} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                  <img src={item.product.image} alt={item.product.name} className="w-24 h-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">المقاس: {item.size} | اللون: {item.color}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-lg">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-secondary"><Minus className="w-3 h-3" /></button>
                        <span className="px-3 text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:bg-secondary"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="font-bold text-primary">{formatPrice(item.product.price * item.quantity)} ر.ي</span>
                      <button onClick={() => removeItem(item.product.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="glass-card rounded-xl p-6 h-fit sticky top-24 space-y-4">
              <h3 className="font-bold text-lg">ملخص الطلب</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">المجموع الفرعي</span><span>{formatPrice(totalPrice)} ر.ي</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">التوصيل</span><span className="text-green-400">مجاني</span></div>
              </div>
              <div className="border-t border-border pt-4 flex justify-between font-black text-lg">
                <span>الإجمالي</span>
                <span className="text-primary">{formatPrice(totalPrice)} ر.ي</span>
              </div>
              <Button className="w-full gold-gradient text-primary-foreground font-bold text-base py-6 hover:opacity-90">
                إتمام الشراء
              </Button>
              <button onClick={clearCart} className="w-full text-center text-sm text-muted-foreground hover:text-destructive transition-colors">
                إفراغ السلة
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
