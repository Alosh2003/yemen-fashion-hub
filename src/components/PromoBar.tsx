import { Truck, CreditCard, Headphones, RotateCcw } from "lucide-react";

const features = [
  { icon: Truck, title: "توصيل سريع", desc: "لجميع المحافظات" },
  { icon: CreditCard, title: "دفع آمن", desc: "محافظ إلكترونية" },
  { icon: Headphones, title: "دعم فني", desc: "24/7 متاح دائماً" },
  { icon: RotateCcw, title: "إرجاع مجاني", desc: "خلال 14 يوم" },
];

const PromoBar = () => (
  <section className="container mx-auto px-4 py-10">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {features.map((f) => (
        <div key={f.title} className="glass-card rounded-xl p-5 text-center">
          <f.icon className="w-8 h-8 text-primary mx-auto mb-3" />
          <h4 className="font-bold text-sm text-foreground">{f.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default PromoBar;
