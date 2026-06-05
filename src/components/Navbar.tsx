import { ShoppingCart, Search, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

type NavCategory = { name: string; slug: string };

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const { settings } = useSiteSettings();

  useEffect(() => {
    supabase.from("categories").select("name, slug").eq("is_active", true).order("sort_order").then(({ data }) => {
      setCategories(data || []);
    });
  }, []);

  const navLinks = [
    { label: "الرئيسية", href: "/" },
    ...categories.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
    { label: "العروض", href: "/offers" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-2xl font-black gold-text tracking-tight">{settings.site_name}</span>
            )}
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                className="w-full bg-secondary rounded-lg py-2 px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 gold-gradient text-primary-foreground text-[10px] w-5 h-5 flex items-center justify-center p-0 rounded-full border-0">
                  {totalItems}
                </Badge>
              )}
            </Link>
            <Link to="/account" className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 pb-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                className="w-full bg-secondary rounded-lg py-2 px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
