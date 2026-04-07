import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, X, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ui/image-upload";

type Product = {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string | null;
  category: string;
  subcategory: string;
  sizes: string[];
  colors: string[];
  badge: string | null;
  rating: number;
  reviews: number;
  stock: number;
  is_active: boolean;
  description: string | null;
};

const emptyProduct: Omit<Product, "id"> = {
  name: "", price: 0, original_price: null, image: "", category: "", subcategory: "",
  sizes: [], colors: [], badge: null, rating: 0, reviews: 0, stock: 0, is_active: true, description: null,
};

const categoryOptions = [
  { value: "men", label: "رجالي" },
  { value: "women", label: "نسائي" },
  { value: "kids", label: "أطفال" },
  { value: "sports", label: "رياضي" },
  { value: "traditional", label: "تقليدي" },
  { value: "accessories", label: "إكسسوارات" },
];

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [sizesInput, setSizesInput] = useState("");
  const [colorsInput, setColorsInput] = useState("");

  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel("admin-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => fetchProducts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct);
    setSizesInput("");
    setColorsInput("");
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p });
    setSizesInput(p.sizes?.join(", ") || "");
    setColorsInput(p.colors?.join(", ") || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      sizes: sizesInput.split(",").map((s) => s.trim()).filter(Boolean),
      colors: colorsInput.split(",").map((s) => s.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    try {
      if (editing) {
        const { error } = await supabase.from("products").update(payload as any).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "تم التحديث", description: "تم تعديل المنتج بنجاح" });
      } else {
        const { error } = await supabase.from("products").insert(payload as any);
        if (error) throw error;
        toast({ title: "تمت الإضافة", description: "تم إضافة المنتج بنجاح" });
      }
      setShowForm(false);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح" });
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("products").update({ is_active: !current } as any).eq("id", id);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{products.length} منتج</p>
        <Button onClick={openAdd} className="gold-gradient text-primary-foreground font-bold hover:opacity-90">
          <Plus className="w-4 h-4 ml-2" /> إضافة منتج
        </Button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">{editing ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">اسم المنتج *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">الفئة *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="">اختر الفئة</option>
                  {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">الفئة الفرعية</label>
                <Input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">السعر (ر.ي) *</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">السعر الأصلي (ر.ي)</label>
                <Input type="number" value={form.original_price || ""} onChange={(e) => setForm({ ...form, original_price: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">المخزون</label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <ImageUpload value={form.image || null} onChange={(val) => setForm({ ...form, image: val || "" })} label="صورة المنتج" maxSizeMB={2} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">المقاسات (مفصولة بفواصل)</label>
                <Input value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} placeholder="S, M, L, XL" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">الألوان (مفصولة بفواصل)</label>
                <Input value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} placeholder="أزرق, أبيض" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">الشارة</label>
                <Input value={form.badge || ""} onChange={(e) => setForm({ ...form, badge: e.target.value || null })} placeholder="جديد، خصم 30%..." />
              </div>
              <div className="space-y-2 flex items-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-border" />
                  <span className="text-sm">منتج نشط</span>
                </label>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-muted-foreground">الوصف</label>
                <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value || null })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="gold-gradient text-primary-foreground font-bold flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                {editing ? "حفظ التعديلات" : "إضافة المنتج"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right p-4 font-medium text-muted-foreground">المنتج</th>
                <th className="text-right p-4 font-medium text-muted-foreground">الفئة</th>
                <th className="text-right p-4 font-medium text-muted-foreground">السعر</th>
                <th className="text-right p-4 font-medium text-muted-foreground">المخزون</th>
                <th className="text-right p-4 font-medium text-muted-foreground">الحالة</th>
                <th className="text-right p-4 font-medium text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <span className="font-medium">{p.name}</span>
                        {p.badge && <span className="mr-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{p.subcategory}</td>
                  <td className="p-4">
                    <span className="font-bold text-primary">{p.price.toLocaleString()} ر.ي</span>
                    {p.original_price && <span className="text-xs text-muted-foreground line-through mr-2">{p.original_price.toLocaleString()}</span>}
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${p.stock < 10 ? "text-destructive" : "text-foreground"}`}>{p.stock}</span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(p.id, p.is_active)}
                      className={`text-xs font-medium px-3 py-1 rounded-full cursor-pointer ${p.is_active ? "text-green-400 bg-green-400/10" : "text-muted-foreground bg-muted"}`}>
                      {p.is_active ? "نشط" : "معطل"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-secondary rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد منتجات بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
