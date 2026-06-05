import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const Footer = () => {
  const { settings } = useSiteSettings();
  const socials = [
    { url: settings.facebook_url, Icon: Facebook, label: "Facebook" },
    { url: settings.instagram_url, Icon: Instagram, label: "Instagram" },
    { url: settings.twitter_url, Icon: Twitter, label: "Twitter" },
    { url: settings.tiktok_url, Icon: MessageCircle, label: "TikTok" },
  ].filter((s) => !!s.url);

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {settings.logo_url && (
                <img src={settings.logo_url} alt={settings.site_name} className="h-10 w-auto object-contain" />
              )}
              <h3 className="text-xl font-black gold-text">{settings.site_name}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              متجرك المتكامل لجميع أنواع الملابس والأزياء. نوفر لك أحدث صيحات الموضة بأسعار تنافسية.
            </p>
            {socials.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                {socials.map(({ url, Icon, label }) => (
                  <a key={label} href={url!} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground">روابط سريعة</h4>
            <div className="space-y-2 text-sm">
              {[
                { l: "الرئيسية", to: "/" },
                { l: "العروض", to: "/offers" },
                { l: "السلة", to: "/cart" },
                { l: "حسابي", to: "/account" },
              ].map((x) => (
                <Link key={x.l} to={x.to} className="block text-muted-foreground hover:text-primary transition-colors">{x.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground">خدمة العملاء</h4>
            <div className="space-y-2 text-sm">
              {["سياسة الإرجاع", "الشحن والتوصيل", "الأسئلة الشائعة", "تتبع الطلب", "الدعم الفني"].map((l) => (
                <span key={l} className="block text-muted-foreground">{l}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground">تواصل معنا</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              {settings.contact_phone && (
                <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-2 hover:text-primary" dir="ltr">
                  <Phone className="w-4 h-4 text-primary" /> {settings.contact_phone}
                </a>
              )}
              {settings.whatsapp_number && (
                <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary" dir="ltr">
                  <MessageCircle className="w-4 h-4 text-primary" /> {settings.whatsapp_number}
                </a>
              )}
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 hover:text-primary" dir="ltr">
                  <Mail className="w-4 h-4 text-primary" /> {settings.contact_email}
                </a>
              )}
              {settings.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> {settings.address}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {settings.site_name}. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
