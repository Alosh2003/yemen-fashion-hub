
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '💳',
  color TEXT NOT NULL DEFAULT 'from-blue-500 to-blue-700',
  phone_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Everyone can read active wallets
CREATE POLICY "Anyone can view active wallets" ON public.wallets
  FOR SELECT USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage wallets" ON public.wallets
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Seed existing wallets
INSERT INTO public.wallets (name, icon, color, phone_number, is_active, sort_order) VALUES
  ('فلوسك', '💳', 'from-blue-500 to-blue-700', NULL, true, 1),
  ('محفظتي', '📱', 'from-green-500 to-green-700', NULL, true, 2),
  ('جوال كاش', '📲', 'from-orange-500 to-orange-700', NULL, true, 3),
  ('الدفع عند الاستلام', '💵', 'from-yellow-600 to-yellow-800', NULL, true, 4);
