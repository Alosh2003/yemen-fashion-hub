import { MessageCircle, Clock } from "lucide-react";

const tickets = [
  { id: 1, subject: "مشكلة في التوصيل", customer: "أحمد محمد", status: "مفتوح", time: "منذ 30 دقيقة", priority: "عالي" },
  { id: 2, subject: "استفسار عن المقاسات", customer: "سارة علي", status: "قيد المعالجة", time: "منذ ساعة", priority: "متوسط" },
  { id: 3, subject: "طلب إرجاع منتج", customer: "خالد عمر", status: "مغلق", time: "منذ يوم", priority: "منخفض" },
];

const priorityColors: Record<string, string> = {
  "عالي": "text-destructive bg-destructive/10",
  "متوسط": "text-yellow-400 bg-yellow-400/10",
  "منخفض": "text-green-400 bg-green-400/10",
};

const statusColors: Record<string, string> = {
  "مفتوح": "text-blue-400 bg-blue-400/10",
  "قيد المعالجة": "text-yellow-400 bg-yellow-400/10",
  "مغلق": "text-muted-foreground bg-muted",
};

const AdminSupport = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "تذاكر مفتوحة", value: "12", color: "text-blue-400" },
        { label: "قيد المعالجة", value: "5", color: "text-yellow-400" },
        { label: "مغلقة اليوم", value: "8", color: "text-green-400" },
      ].map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-5 text-center">
          <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
        </div>
      ))}
    </div>

    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right p-4 font-medium text-muted-foreground">الموضوع</th>
              <th className="text-right p-4 font-medium text-muted-foreground">العميل</th>
              <th className="text-right p-4 font-medium text-muted-foreground">الأولوية</th>
              <th className="text-right p-4 font-medium text-muted-foreground">الحالة</th>
              <th className="text-right p-4 font-medium text-muted-foreground">الوقت</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="p-4 font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" /> {t.subject}
                </td>
                <td className="p-4">{t.customer}</td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${priorityColors[t.priority]}`}>{t.priority}</span>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[t.status]}`}>{t.status}</span>
                </td>
                <td className="p-4 text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AdminSupport;
