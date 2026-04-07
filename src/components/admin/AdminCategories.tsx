import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, X, Loader2, Save, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/image-upload";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string | null;
  sort_order: number;
  is_active: boolean;
};

const emptyCategory: Omit<Category, "id"> = {
  name: "", slug: "", icon: "📦", image: "", sort_order: 0, is_active: true,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, "id">>(emptyCategory);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    setCategories((data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      toast({ title: "خطأ", description: "الاسم والمعرّف مطلوبان", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from("categories")
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq("id", editing.id);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تم التحديث بنجاح" });
      }
    } else {
      const { error } = await supabase.from("categories").insert(form);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تمت الإضافة بنجاح" });
      }
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm(emptyCategory);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم الحذف بنجاح" });
      fetchCategories();
    }
  };

  const toggleActive = async (cat: Category) => {
    await supabase.from("categories").update({ is_active: !cat.is_active }).eq("id", cat.id);
    fetchCategories();
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, image: cat.image, sort_order: cat.sort_order, is_active: cat.is_active });
    setShowForm(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">الفئات ({categories.length})</h3>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyCategory); }} className="gold-gradient text-primary-foreground">
          <Plus className="w-4 h-4 ml-2" /> إضافة فئة
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">{editing ? "تعديل الفئة" : "إضافة فئة جديدة"}</h4>
            <button onClick={() => { setShowForm(false); setEditing(null); }}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">اسم الفئة *</label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({ ...f, name, slug: editing ? f.slug : generateSlug(name) }));
                }}
                placeholder="مثال: رجالي"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">المعرّف (slug) *</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="مثال: men"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الأيقونة (إيموجي)</label>
              <Input
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="👔"
              />
            </div>
            <div>
              <ImageUpload value={form.image || null} onChange={(val) => setForm((f) => ({ ...f, image: val }))} label="صورة الفئة" maxSizeMB={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الترتيب</label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
              <span className="text-sm">مفعّلة</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={saving} className="gold-gradient text-primary-foreground">
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
              {editing ? "تحديث" : "إضافة"}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="p-3 text-right">الترتيب</th>
              <th className="p-3 text-right">الأيقونة</th>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">المعرّف</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-border hover:bg-secondary/50">
                <td className="p-3">{cat.sort_order}</td>
                <td className="p-3 text-xl">{cat.icon}</td>
                <td className="p-3 font-medium">{cat.name}</td>
                <td className="p-3 text-muted-foreground" dir="ltr">{cat.slug}</td>
                <td className="p-3">
                  <Switch checked={cat.is_active} onCheckedChange={() => toggleActive(cat)} />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-secondary">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">لا توجد فئات</div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
