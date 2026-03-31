import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];

type UserWithRole = Profile & { role: string };

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");
      
      if (profiles && roles) {
        const merged = profiles.map((p) => ({
          ...p,
          role: roles.find((r) => r.user_id === p.user_id)?.role || "customer",
        }));
        setUsers(merged);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const roleLabels: Record<string, string> = {
    admin: "مدير",
    customer: "عميل",
    support: "دعم فني",
  };

  const roleColors: Record<string, string> = {
    admin: "text-primary bg-primary/10",
    customer: "text-green-400 bg-green-400/10",
    support: "text-blue-400 bg-blue-400/10",
  };

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>;
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right p-4 font-medium text-muted-foreground">المستخدم</th>
              <th className="text-right p-4 font-medium text-muted-foreground">الهاتف</th>
              <th className="text-right p-4 font-medium text-muted-foreground">المدينة</th>
              <th className="text-right p-4 font-medium text-muted-foreground">الدور</th>
              <th className="text-right p-4 font-medium text-muted-foreground">التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {(u.full_name?.[0] || "U").toUpperCase()}
                    </div>
                    <span className="font-medium">{u.full_name || "بدون اسم"}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{u.phone || "-"}</td>
                <td className="p-4 text-muted-foreground">{u.city || "-"}</td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 w-fit ${roleColors[u.role]}`}>
                    <Shield className="w-3 h-3" /> {roleLabels[u.role]}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground text-xs">
                  {new Date(u.created_at).toLocaleDateString("ar")}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا يوجد مستخدمون بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
