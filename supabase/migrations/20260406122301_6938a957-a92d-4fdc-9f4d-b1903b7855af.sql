
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS payment_receipt_number TEXT,
  ADD COLUMN IF NOT EXISTS payment_receipt_image TEXT;
