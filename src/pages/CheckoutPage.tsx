import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import {
  MapPin,
  Phone,
  User,
  Wallet,
  Truck,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Building2,
  Banknote,
} from "lucide-react";

const yemeniWallets = [
  { id: "floosak", name: "فلوسك", icon: "💳", color: "from-blue-500 to-blue-700" },
  { id: "mahfadati", name: "محفظتي", icon: "📱", color: "from-green-500 to-green-700" },
  { id: "jawal_cash", name: "جوال كاش", icon: "📲", color: "from-orange-500 to-orange-700" },
  { id: "cash_on_delivery", name: "الدفع عند الاستلام", icon: "💵", color: "from-yellow-600 to-yellow-800" },
];

const yemeniCities = [
  "صنعاء", "عدن", "تعز", "الحديدة", "إب", "ذمار", "المكلا", "سيئون",
  "عمران", "حجة", "صعدة", "البيضاء", "لحج", "أبين", "شبوة", "مأرب",
];

type Step = "delivery" | "payment" | "confirmation";

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("delivery");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [delivery, setDelivery] = useState({
    fullName: "",
    phone: "",
    city: "",
    area: "",
    address: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [walletPhone, setWalletPhone] = useState("");

  const formatPrice = (price: number) => price.toLocaleString("ar-YE");
  const deliveryFee = totalPrice >= 50000 ? 0 : 2000;
  const grandTotal = totalPrice + deliveryFee;

  const validateDelivery = () => {
    if (!delivery.fullName || !delivery.phone || !delivery.city || !delivery.address) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return false;
    }
    if (!/^(7[0-9]{8}|0[0-9]{9})$/.test(delivery.phone.replace(/\s/g, ""))) {
      toast({ title: "خطأ", description: "رقم الهاتف غير صحيح", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (paymentMethod !== "cash_on_delivery" && !walletPhone) {
      toast({ title: "خطأ", description: "يرجى إدخال رقم المحفظة", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handlePlaceOrder = () => {
    if (!validatePayment()) return;
    setOrderPlaced(true);
    clearCart();
  };

  if (items.length === 0 && !orderPlaced) {
    navigate("/cart");
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            </div>
            <h1 className="text-3xl font-black mb-4">تم تأكيد <span className="gold-text">طلبك</span></h1>
            <p className="text-muted-foreground mb-2">شكراً لتسوقك من متجر الحكومة</p>
            <p className="text-muted-foreground mb-8">سيتم التواصل معك قريباً لتأكيد التوصيل</p>
            <div className="glass-card rounded-xl p-4 mb-8 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم الطلب</span>
                <span className="font-bold text-primary">#{Math.floor(Math.random() * 900000 + 100000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">طريقة الدفع</span>
                <span>{yemeniWallets.find((w) => w.id === paymentMethod)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">التوصيل إلى</span>
                <span>{delivery.city} - {delivery.area}</span>
              </div>
            </div>
            <Button onClick={() => navigate("/")} className="gold-gradient text-primary-foreground font-bold px-10 py-6">
              متابعة التسوق
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "delivery", label: "التوصيل", icon: <Truck className="w-5 h-5" /> },
    { key: "payment", label: "الدفع", icon: <Wallet className="w-5 h-5" /> },
    { key: "confirmation", label: "التأكيد", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-8">إتمام <span className="gold-text">الشراء</span></h1>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <button
                onClick={() => i < stepIndex && setStep(s.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  i === stepIndex
                    ? "gold-gradient text-primary-foreground"
                    : i < stepIndex
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${i < stepIndex ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery */}
            {step === "delivery" && (
              <div className="glass-card rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">بيانات التوصيل</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User className="w-4 h-4" /> الاسم الكامل *</Label>
                    <Input
                      value={delivery.fullName}
                      onChange={(e) => setDelivery({ ...delivery, fullName: e.target.value })}
                      placeholder="أدخل اسمك الكامل"
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> رقم الهاتف *</Label>
                    <Input
                      value={delivery.phone}
                      onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                      placeholder="7XXXXXXXX"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المدينة *</Label>
                    <select
                      value={delivery.city}
                      onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-right"
                    >
                      <option value="">اختر المدينة</option>
                      {yemeniCities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>المنطقة / الحي *</Label>
                    <Input
                      value={delivery.area}
                      onChange={(e) => setDelivery({ ...delivery, area: e.target.value })}
                      placeholder="مثال: حي الجامعة"
                      className="text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>العنوان التفصيلي *</Label>
                  <Input
                    value={delivery.address}
                    onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                    placeholder="الشارع، رقم المبنى، بالقرب من..."
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label>ملاحظات إضافية</Label>
                  <Textarea
                    value={delivery.notes}
                    onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                    placeholder="أي تعليمات خاصة للتوصيل..."
                    className="text-right"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => validateDelivery() && setStep("payment")}
                  className="w-full gold-gradient text-primary-foreground font-bold py-6 text-base"
                >
                  متابعة إلى الدفع
                </Button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === "payment" && (
              <div className="glass-card rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">طريقة الدفع</h2>
                </div>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {yemeniWallets.map((w) => (
                    <label
                      key={w.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === w.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <RadioGroupItem value={w.id} />
                      <span className={`text-2xl w-10 h-10 rounded-lg bg-gradient-to-br ${w.color} flex items-center justify-center`}>
                        {w.icon}
                      </span>
                      <span className="font-bold text-foreground">{w.name}</span>
                    </label>
                  ))}
                </RadioGroup>

                {paymentMethod !== "cash_on_delivery" && (
                  <div className="space-y-2 p-4 bg-secondary/50 rounded-xl">
                    <Label className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> رقم المحفظة
                    </Label>
                    <Input
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      placeholder="أدخل رقم المحفظة"
                      dir="ltr"
                      className="text-right"
                    />
                    <p className="text-xs text-muted-foreground">
                      سيتم إرسال طلب الدفع إلى هذا الرقم بعد تأكيد الطلب
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("delivery")} className="flex-1 py-6">
                    رجوع
                  </Button>
                  <Button
                    onClick={() => validatePayment() && setStep("confirmation")}
                    className="flex-1 gold-gradient text-primary-foreground font-bold py-6"
                  >
                    مراجعة الطلب
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === "confirmation" && (
              <div className="space-y-4">
                {/* Delivery Summary */}
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> عنوان التوصيل</h3>
                    <button onClick={() => setStep("delivery")} className="text-xs text-primary hover:underline">تعديل</button>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="text-foreground font-medium">{delivery.fullName}</p>
                    <p>{delivery.phone}</p>
                    <p>{delivery.city} - {delivery.area}</p>
                    <p>{delivery.address}</p>
                    {delivery.notes && <p className="italic">"{delivery.notes}"</p>}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> طريقة الدفع</h3>
                    <button onClick={() => setStep("payment")} className="text-xs text-primary hover:underline">تعديل</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{yemeniWallets.find((w) => w.id === paymentMethod)?.icon}</span>
                    <div>
                      <p className="font-medium">{yemeniWallets.find((w) => w.id === paymentMethod)?.name}</p>
                      {walletPhone && <p className="text-sm text-muted-foreground">{walletPhone}</p>}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-bold flex items-center gap-2 mb-3"><Building2 className="w-5 h-5 text-primary" /> المنتجات ({items.length})</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product.id + item.size} className="flex items-center gap-3 text-sm">
                        <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{item.size} | {item.color} | x{item.quantity}</p>
                        </div>
                        <span className="font-bold">{formatPrice(item.product.price * item.quantity)} ر.ي</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("payment")} className="flex-1 py-6">
                    رجوع
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    className="flex-1 gold-gradient text-primary-foreground font-bold py-6 text-base"
                  >
                    <Banknote className="w-5 h-5 ml-2" />
                    تأكيد الطلب — {formatPrice(grandTotal)} ر.ي
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="glass-card rounded-xl p-6 h-fit sticky top-24 space-y-4">
            <h3 className="font-bold text-lg">ملخص الطلب</h3>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id + item.size} className="flex justify-between">
                  <span className="text-muted-foreground truncate max-w-[60%]">{item.product.name} x{item.quantity}</span>
                  <span>{formatPrice(item.product.price * item.quantity)} ر.ي</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span>{formatPrice(totalPrice)} ر.ي</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">التوصيل</span>
                <span className={deliveryFee === 0 ? "text-green-400" : ""}>
                  {deliveryFee === 0 ? "مجاني" : `${formatPrice(deliveryFee)} ر.ي`}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-muted-foreground">توصيل مجاني للطلبات فوق 50,000 ر.ي</p>
              )}
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-black text-lg">
              <span>الإجمالي</span>
              <span className="text-primary">{formatPrice(grandTotal)} ر.ي</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
