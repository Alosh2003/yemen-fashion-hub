import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
        alt="أزياء"
        className="w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-background via-background/80 to-transparent" />
    </div>
    <div className="relative container mx-auto px-4 py-24 md:py-36">
      <div className="max-w-2xl">
        <span className="inline-block gold-gradient text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full mb-6">
          🔥 تخفيضات تصل إلى 50%
        </span>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          أناقتك <span className="gold-text">تبدأ</span> من هنا
        </h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
          اكتشف أحدث تشكيلات الملابس لجميع الأذواق والأعمار. توصيل لجميع محافظات اليمن مع خيارات دفع متعددة.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/category/men">
            <Button size="lg" className="gold-gradient text-primary-foreground font-bold text-base px-8 hover:opacity-90 transition-opacity">
              تسوق الآن <ArrowLeft className="mr-2 w-4 h-4" />
            </Button>
          </Link>
          <Link to="/offers">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold text-base px-8">
              العروض الحصرية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
