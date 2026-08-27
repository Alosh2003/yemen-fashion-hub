-- 1) has_role becomes SECURITY INVOKER (users can read their own role rows)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) Policies that call has_role must never run for anonymous visitors
DROP POLICY IF EXISTS "Admins can manage wallets" ON public.wallets;
CREATE POLICY "Admins can manage wallets"
  ON public.wallets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3) Replace the SECURITY DEFINER receipt RPC with a plain RLS-protected table
DROP FUNCTION IF EXISTS public.submit_order_receipt(uuid, text, text);

CREATE TABLE IF NOT EXISTS public.order_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  receipt_number text,
  receipt_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.order_receipts TO authenticated;
GRANT ALL ON public.order_receipts TO service_role;

ALTER TABLE public.order_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipts"
  ON public.order_receipts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "Admins can view all receipts"
  ON public.order_receipts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can add own receipt"
  ON public.order_receipts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id
      AND o.user_id = auth.uid()
      AND o.payment_method <> 'cash_on_delivery'
      AND o.status NOT IN ('delivered', 'cancelled', 'returned')
      AND o.payment_status <> 'paid'
  ));

CREATE POLICY "Users can update own receipt"
  ON public.order_receipts FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id
      AND o.user_id = auth.uid()
      AND o.payment_method <> 'cash_on_delivery'
      AND o.status NOT IN ('delivered', 'cancelled', 'returned')
      AND o.payment_status <> 'paid'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.user_id = auth.uid()
  ));

CREATE TRIGGER update_order_receipts_updated_at
  BEFORE UPDATE ON public.order_receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_order_receipts_order_id ON public.order_receipts(order_id);

-- Backfill receipts already stored on orders
INSERT INTO public.order_receipts (order_id, receipt_number, receipt_image)
SELECT id, payment_receipt_number, payment_receipt_image
FROM public.orders
WHERE (payment_receipt_number IS NOT NULL OR payment_receipt_image IS NOT NULL)
ON CONFLICT (order_id) DO NOTHING;