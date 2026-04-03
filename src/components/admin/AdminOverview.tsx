import { useEffect, useState } from "react";
import { Package, Users, ShoppingBag, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminOverview = () => {
  const [stats, setStats] = useState({ products: 0, users: 0, ordersToday: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [productsRes, usersRes, ordersRes, allOrdersRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      const deliveredOrders = await supabase.from("orders").select("total").eq("status", "delivered");
      const revenue = deliveredOrders.data?.reduce((s, o) => s + Number(o.total), 0) || 0;

      setStats({
        products: productsRes.count || 0,
        users: usersRes.count || 0,
        ordersToday: ordersRes.count || 0,
        revenue,
      });
      setRecentOrders(allOrdersRes.data || []);
      setLoading(false);
    };
    fetchData();

    const channel = supabase
      .channel("admin-overview")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatPrice = (n: number) => n.toLocaleString("ar-YE");

  const statusLabels: Record<string, string> = {
    pending: "معلق", confirmed: "مؤكد", processing: "قيد التجهيز",
    shipping: "قيد الشحن", delivered: "تم التوصيل", cancelled: "ملغي", returned: "مرتجع",
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const statCards = [
    { label: "إجمالي المنتجات", value: stats.products.toString(), icon: Package },
    { label: "العملاء", value: stats.users.toString(), icon: Users },
    { label: "الطلبات اليوم", value: stats.ordersToday.toString(), icon: ShoppingBag },
    { label: "الإيرادات", value: `${formatPrice(stats.revenue)} ر.ي`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-8 h-8 text-primary" />
            </div>
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-bold mb-4">آخر الطلبات</h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">لا توجد طلبات بعد</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <span className="font-medium text-sm">{order.order_number}</span>
                  <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-primary">{formatPrice(Number(order.total))} ر.ي</span>
                  <p className="text-xs text-muted-foreground">{statusLabels[order.status] || order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
