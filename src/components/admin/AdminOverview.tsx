import { Package, Users, ShoppingBag, TrendingUp } from "lucide-react";

const stats = [
  { label: "إجمالي المنتجات", value: "245", icon: Package, change: "+12%" },
  { label: "العملاء", value: "1,234", icon: Users, change: "+8%" },
  { label: "الطلبات اليوم", value: "45", icon: ShoppingBag, change: "+23%" },
  { label: "الإيرادات", value: "2.5M ر.ي", icon: TrendingUp, change: "+15%" },
];

const AdminOverview = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <stat.icon className="w-8 h-8 text-primary" />
            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{stat.change}</span>
          </div>
          <p className="text-2xl font-black">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
        </div>
      ))}
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-bold mb-4">آخر الطلبات</h3>
        <div className="space-y-3">
          {[
            { id: "#1234", customer: "أحمد محمد", amount: "15,000 ر.ي", status: "قيد التوصيل" },
            { id: "#1233", customer: "سارة علي", amount: "25,000 ر.ي", status: "مكتمل" },
            { id: "#1232", customer: "خالد عمر", amount: "8,500 ر.ي", status: "جديد" },
          ].map((order) => (
            <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <span className="font-medium text-sm">{order.id}</span>
                <p className="text-xs text-muted-foreground">{order.customer}</p>
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-primary">{order.amount}</span>
                <p className="text-xs text-muted-foreground">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-bold mb-4">الأنشطة الأخيرة</h3>
        <div className="space-y-3">
          {[
            { text: "تم إضافة منتج جديد: قميص كلاسيكي", time: "منذ 5 دقائق" },
            { text: "طلب جديد #1234 من أحمد محمد", time: "منذ 15 دقيقة" },
            { text: "تم تحديث مخزون: بدلة رجالية فاخرة", time: "منذ ساعة" },
            { text: "تسجيل عميل جديد: سارة علي", time: "منذ ساعتين" },
          ].map((activity, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <div className="w-2 h-2 rounded-full gold-gradient mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminOverview;
