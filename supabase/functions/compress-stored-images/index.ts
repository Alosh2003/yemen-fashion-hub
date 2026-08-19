import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { decode, Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX = 1000;

async function shrink(dataUrl: string | null): Promise<string | null> {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) return dataUrl;
  const base64 = dataUrl.split(",")[1];
  if (!base64) return dataUrl;
  if (base64.length < 120_000) return dataUrl; // already small enough
  try {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const decoded = await decode(bytes);
    const img = decoded as Image;
    const scale = Math.min(1, MAX / Math.max(img.width, img.height));
    const resized = scale < 1
      ? img.resize(Math.round(img.width * scale), Math.round(img.height * scale))
      : img;
    const out = await resized.encodeJPEG(72);
    let bin = "";
    for (const b of out) bin += String.fromCharCode(b);
    return `data:image/jpeg;base64,${btoa(bin)}`;
  } catch (_e) {
    return dataUrl;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const url = new URL(req.url);
  const budget = Number(url.searchParams.get("budget") ?? "3"); // images per invocation
  let processed = 0;
  const report: Record<string, number> = { products: 0, categories: 0, receipts: 0, done: 0 };
  const outOfBudget = () => processed >= budget;

  const { data: products } = await supabase.from("products").select("id,image,images");
  for (const p of products ?? []) {
    if ((p.images ?? []).length === 0 && !(p.image ?? "").startsWith("data:image/")) continue;
    if (outOfBudget()) break;
    const image = await shrink(p.image);
    const images: string[] = [];
    for (const i of (p.images ?? []) as string[]) images.push((await shrink(i)) ?? i);
    if (image !== p.image || JSON.stringify(images) !== JSON.stringify((p.images ?? []) as string[])) {
      await supabase.from("products").update({ image, images }).eq("id", p.id);
      report.products++;
      processed++;
    }
  }

  const { data: cats } = await supabase.from("categories").select("id,image");
  for (const c of cats ?? []) {
    if (outOfBudget()) break;
    const image = await shrink(c.image);
    if (image !== c.image) {
      await supabase.from("categories").update({ image }).eq("id", c.id);
      report.categories++;
      processed++;
    }
  }

  const { data: orders } = await supabase.from("orders").select("id,payment_receipt_image").not("payment_receipt_image", "is", null);
  for (const o of orders ?? []) {
    if (outOfBudget()) break;
    const img = await shrink(o.payment_receipt_image);
    if (img !== o.payment_receipt_image) {
      await supabase.from("orders").update({ payment_receipt_image: img }).eq("id", o.id);
      report.receipts++;
      processed++;
    }
  }

  report.done = outOfBudget() ? 0 : 1;
  return new Response(JSON.stringify(report), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
