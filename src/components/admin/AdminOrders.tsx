const orders = [
  { id: "#1234", customer: "أحمد محمد", date: "2026-03-31", total: "15,000 ر.ي", status: "قيد التوصيل", statusColor: "text-yellow-400 bg-yellow-400/10" },
  { id: "#1233", customer: "سارة علي", date: "2026-03-30", total: "25,000 ر.ي", status: "مكتمل", statusColor: "text-green-400 bg-green-400/10" },
  { id: "#1232", customer: "خالد عمر", date: "2026-03-30", total: "8,500 ر.ي", status: "جديد", statusColor: "text-blue-400 bg-blue-400/10" },
  { id: "#1231", customer: "فاطمة حسن", date: "2026-03-29", total: "45,000 ر.ي", status: "ملغي", statusColor: "text-destructive bg-destructive/10" },
];

const AdminOrders = () => (
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-right p-4 font-medium text-muted-foreground">رقم الطلب</th>
            <th className="text-right p-4 font-medium text-muted-foreground">العميل</th>
            <th className="text-right p-4 font-medium text-muted-foreground">التاريخ</th>
            <th className="text-right p-4 font-medium text-muted-foreground">الإجمالي</th>
            <th className="text-right p-4 font-medium text-muted-foreground">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
              <td className="p-4 font-medium">{o.id}</td>
              <td className="p-4">{o.customer}</td>
              <td className="p-4 text-muted-foreground">{o.date}</td>
              <td className="p-4 font-bold text-primary">{o.total}</td>
              <td className="p-4">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${o.statusColor}`}>
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminOrders;
