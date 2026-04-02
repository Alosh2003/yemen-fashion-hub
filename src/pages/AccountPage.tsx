import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, LogOut, Shield, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccountPage = () => {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  const roleLabels: Record<string, string> = {
    admin: "مدير النظام",
    customer: "عميل",
    support: "دعم فني",
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-8">حسابي <span className="gold-text">الشخصي</span></h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-lg mb-4">المعلومات الشخصية</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الاسم</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input defaultValue={profile?.full_name || ""} className="pr-10 bg-secondary" readOnly />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">البريد</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input defaultValue={user.email || ""} className="pr-10 bg-secondary" readOnly />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input defaultValue={profile?.phone || ""} className="pr-10 bg-secondary" readOnly />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">المدينة</label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input defaultValue={profile?.city || ""} className="pr-10 bg-secondary" readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-16 h-16 rounded-full gold-gradient mx-auto mb-3 flex items-center justify-center text-primary-foreground text-2xl font-black">
                {(profile?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
              </div>
              <h3 className="font-bold">{profile?.full_name || "مستخدم"}</h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Shield className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">{roleLabels[role || "customer"]}</span>
              </div>
            </div>

            {role === "admin" && (
              <Button
                onClick={() => navigate("/admin")}
                className="w-full gold-gradient text-primary-foreground font-bold hover:opacity-90"
              >
                لوحة التحكم
              </Button>
            )}

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-4 h-4 ml-2" /> تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountPage;
