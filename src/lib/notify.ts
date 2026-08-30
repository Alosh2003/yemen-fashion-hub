// أدوات مساعدة لتنبيهات واتساب وتنزيل الملفات

export const normalizePhone = (phone: string) => {
  let p = (phone || "").replace(/[^\d+]/g, "");
  p = p.replace(/^\+/, "");
  p = p.replace(/^00/, "");
  if (p.startsWith("0")) p = p.slice(1);
  if (!p.startsWith("967")) p = `967${p}`;
  return p;
};

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

const paymentMessages: Record<string, (orderNumber: string, total: string) => string> = {
  pending: (n) =>
    `مرحباً 👋\nطلبك رقم ${n}: استلمنا بيانات الدفع عبر المحفظة وهو الآن بانتظار التحقق من الإشعار ⏳\nسنعلمك فور اعتماد المبلغ.`,
  paid: (n, t) =>
    `مرحباً 👋\nتم التحقق من دفعتك بنجاح ✅\nالطلب رقم ${n} — المبلغ ${t}\nحالة الدفع: مدفوع 💰. جارٍ تجهيز طلبك.`,
  failed: (n) =>
    `مرحباً 👋\nللأسف تعذّر التحقق من إشعار الدفع الخاص بالطلب رقم ${n} 🚫\nيرجى مراجعة الإشعار وإعادة إرساله أو التواصل معنا.`,
  refunded: (n) => `مرحباً 👋\nتم استرجاع مبلغ الطلب رقم ${n} ↩️.`,
};

export const buildPaymentWhatsAppUrl = (
  customerPhone: string,
  status: PaymentStatus | string,
  orderNumber: string,
  total: string
) => {
  const builder = paymentMessages[status] || paymentMessages.pending;
  const text = encodeURIComponent(builder(orderNumber, total));
  return `https://wa.me/${normalizePhone(customerPhone)}?text=${text}`;
};

export const downloadFile = async (src: string, filename: string) => {
  try {
    let href = src;
    if (!src.startsWith("data:")) {
      const res = await fetch(src);
      const blob = await res.blob();
      href = URL.createObjectURL(blob);
    }
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (href !== src) URL.revokeObjectURL(href);
  } catch {
    window.open(src, "_blank");
  }
};
