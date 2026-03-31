import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-card border-t border-border mt-20">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-black gold-text mb-4">الحكومة</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            متجرك اليمني المتكامل لجميع أنواع الملابس والأزياء. نوفر لك أحدث صيحات الموضة بأسعار تنافسية.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-foreground">روابط سريعة</h4>
          <div className="space-y-2 text-sm">
            {["رجالي", "نسائي", "أطفال", "رياضي", "العروض"].map((l) => (
              <Link key={l} to="/" className="block text-muted-foreground hover:text-primary transition-colors">{l}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-foreground">خدمة العملاء</h4>
          <div className="space-y-2 text-sm">
            {["سياسة الإرجاع", "الشحن والتوصيل", "الأسئلة الشائعة", "تتبع الطلب", "الدعم الفني"].map((l) => (
              <Link key={l} to="/" className="block text-muted-foreground hover:text-primary transition-colors">{l}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-foreground">تواصل معنا</h4>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +967 XXX XXX XXX</div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> info@alhokoma.com</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> صنعاء، اليمن</div>
          </div>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
        © 2026 الحكومة للأزياء. جميع الحقوق محفوظة.
      </div>
    </div>
  </footer>
);

export default Footer;
