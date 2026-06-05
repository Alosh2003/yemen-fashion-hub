import { useState } from "react";
import {
  LayoutDashboard, Package, Users, Headphones, ShoppingBag,
  Settings, ChevronLeft, ChevronRight, LogOut, TrendingUp, FolderOpen, Wallet
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminSupport from "@/components/admin/AdminSupport";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminWallets from "@/components/admin/AdminWallets";
import AdminSettings from "@/components/admin/AdminSettings";

const tabs = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "categories", label: "الفئات", icon: FolderOpen },
  { id: "products", label: "المنتجات", icon: Package },
  { id: "orders", label: "الطلبات", icon: ShoppingBag },
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "wallets", label: "المحافظ", icon: Wallet },
  { id: "support", label: "الدعم الفني", icon: Headphones },
  { id: "settings", label: "إعدادات الموقع", icon: Settings },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <AdminOverview />;
      case "categories": return <AdminCategories />;
      case "wallets": return <AdminWallets />;
      case "products": return <AdminProducts />;
      case "orders": return <AdminOrders />;
      case "users": return <AdminUsers />;
      case "support": return <AdminSupport />;
      case "settings": return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-64"} bg-card border-l border-border flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!collapsed && <span className="font-black gold-text text-lg">لوحة التحكم</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-secondary">
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "gold-gradient text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <TrendingUp className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>المتجر</span>}
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>خروج</span>}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-14 border-b border-border flex items-center justify-between px-6">
          <h2 className="font-bold">{tabs.find(t => t.id === activeTab)?.label}</h2>
          <span className="text-sm text-muted-foreground">مرحباً، {profile?.full_name || "مدير"}</span>
        </header>
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
