CREATE OR REPLACE FUNCTION public.submit_order_receipt(
  p_order_id uuid,
  p_receipt_number text,
  p_receipt_image text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET payment_receipt_number = NULLIF(trim(coalesce(p_receipt_number, '')), ''),
      payment_receipt_image = NULLIF(coalesce(p_receipt_image, ''), ''),
      payment_status = 'pending'::payment_status,
      updated_at = now()
  WHERE id = p_order_id
    AND user_id = auth.uid()
    AND payment_method <> 'cash_on_delivery'
    AND status NOT IN ('delivered', 'cancelled', 'returned');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_order_receipt(uuid, text, text) TO authenticated;