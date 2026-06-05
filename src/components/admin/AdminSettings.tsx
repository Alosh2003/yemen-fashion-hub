import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Save, Loader2, Settings as SettingsIcon } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { useSiteSettings, SiteSettings } from "@/contexts/SiteSettingsContext";

// HEX <-> HSL helpers
const hexToHsl = (hex: string): string => {
  const m = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(m)) return "45 90% 55%";
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const hslToHex = (hsl: string | null): string => {
  if (!hsl) return "#eab308";
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return "#eab308";
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const AdminSettings = () => {
  const { settings, refresh } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const payload: any = {
      site_name: form.site_name,
      logo_url: form.logo_url,
      primary_color: form.primary_color,
      accent_color: form.accent_color,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email,
      whatsapp_number: form.whatsapp_number,
      facebook_url: form.facebook_url,
      instagram_url: form.instagram_url,
      twitter_url: form.twitter_url,
      tiktok_url: form.tiktok_url,
      address: form.address,
    };
    let error;
    if (form.id) {
      ({ error } = await (supabase as any).from("site_settings").update(payload).eq("id", form.id));
    } else {
      ({ error } = await (supabase as any).from("site_settings").insert(payload));
    }
    setSaving(false);
    if (error) {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات", variant: "destructive" });
    } else {
      toast({ title: "تم الحفظ", description: "تم تحديث إعدادات الموقع بنجاح" });
      refresh();
    }
  };

  const set = (k: keyof SiteSettings, v: any) => setForm({ ...form, [k]: v });

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary" /> إعدادات الموقع
        </h3>
        <Button onClick={handleSave} disabled={saving} className="gold-gradient text-primary-foreground font-bold gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التغييرات
        </Button>
      </div>

      {/* Brand */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h4 className="font-bold">العلامة التجارية</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اسم الموقع</Label>
            <Input value={form.site_name} onChange={(e) => set("site_name", e.target.value)} className="text-right" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>شعار الموقع</Label>
          <ImageUpload
            value={form.logo_url || ""}
            onChange={(url) => set("logo_url", url)}
            bucket="categories"
            folder="logos"
          />
        </div>
      </div>

      {/* Colors */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h4 className="font-bold">ألوان الموقع</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اللون الأساسي</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hslToHex(form.primary_color)}
                onChange={(e) => set("primary_color", hexToHsl(e.target.value))}
                className="w-14 h-10 rounded-lg border border-border bg-transparent cursor-pointer"
              />
              <Input value={form.primary_color || ""} onChange={(e) => set("primary_color", e.target.value)} placeholder="45 90% 55%" dir="ltr" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>اللون المميز</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hslToHex(form.accent_color)}
                onChange={(e) => set("accent_color", hexToHsl(e.target.value))}
                className="w-14 h-10 rounded-lg border border-border bg-transparent cursor-pointer"
              />
              <Input value={form.accent_color || ""} onChange={(e) => set("accent_color", e.target.value)} placeholder="45 90% 55%" dir="ltr" />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">القيمة بصيغة HSL (مثال: 45 90% 55%) — يمكنك استخدام منتقي الألوان</p>
      </div>

      {/* Contact */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h4 className="font-bold">معلومات التواصل</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input value={form.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+967 XXX XXX XXX" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>رقم واتساب</Label>
            <Input value={form.whatsapp_number || ""} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder="967XXXXXXXXX" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input value={form.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} placeholder="info@example.com" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} placeholder="صنعاء، اليمن" className="text-right" />
          </div>
        </div>
      </div>

      {/* Social */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h4 className="font-bold">روابط التواصل الاجتماعي</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>فيسبوك</Label>
            <Input value={form.facebook_url || ""} onChange={(e) => set("facebook_url", e.target.value)} placeholder="https://facebook.com/..." dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>إنستغرام</Label>
            <Input value={form.instagram_url || ""} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/..." dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>تويتر / X</Label>
            <Input value={form.twitter_url || ""} onChange={(e) => set("twitter_url", e.target.value)} placeholder="https://twitter.com/..." dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>تيك توك</Label>
            <Input value={form.tiktok_url || ""} onChange={(e) => set("tiktok_url", e.target.value)} placeholder="https://tiktok.com/@..." dir="ltr" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
