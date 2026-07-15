import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { publicSupabase } from "@/integrations/supabase/publicClient";

export interface SiteSettings {
  id?: string;
  site_name: string;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  whatsapp_number: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  tiktok_url: string | null;
  address: string | null;
}

const defaultSettings: SiteSettings = {
  site_name: "متجر اليمن",
  logo_url: null,
  primary_color: "45 90% 55%",
  accent_color: "45 90% 55%",
  contact_phone: null,
  contact_email: null,
  whatsapp_number: null,
  facebook_url: null,
  instagram_url: null,
  twitter_url: null,
  tiktok_url: null,
  address: null,
};

interface Ctx {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteSettingsContext = createContext<Ctx>({
  settings: defaultSettings,
  loading: true,
  refresh: async () => {},
});

export const useSiteSettings = () => useContext(SiteSettingsContext);

const applyTheme = (s: SiteSettings) => {
  const root = document.documentElement;
  if (s.primary_color) root.style.setProperty("--primary", s.primary_color);
  if (s.accent_color) root.style.setProperty("--accent", s.accent_color);
  if (s.site_name) document.title = s.site_name;
};

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await publicSupabase
        .from("site_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const merged = { ...defaultSettings, ...(data || {}) };
      setSettings(merged);
      applyTheme(merged);
    } catch (error) {
      console.error("Failed to load site settings", error);
      applyTheme(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);


  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
