CREATE TABLE public.thera_site_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  helped text NOT NULL CHECK (helped IN ('yes','partial','no')),
  improve text NOT NULL DEFAULT '' CHECK (char_length(improve) <= 1000),
  disliked text NOT NULL DEFAULT '' CHECK (char_length(disliked) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.thera_site_feedback TO anon, authenticated;
GRANT ALL ON public.thera_site_feedback TO service_role;
ALTER TABLE public.thera_site_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY thera_feedback_submit ON public.thera_site_feedback FOR INSERT TO anon, authenticated
  WITH CHECK (helped IN ('yes','partial','no'));

CREATE OR REPLACE FUNCTION public.thera_feedback_list()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.thera_registry_admins WHERE user_id = auth.uid()) THEN
    RETURN NULL;
  END IF;
  RETURN jsonb_build_object(
    'counts', (SELECT jsonb_build_object(
      'yes', count(*) FILTER (WHERE helped='yes'),
      'partial', count(*) FILTER (WHERE helped='partial'),
      'no', count(*) FILTER (WHERE helped='no')) FROM public.thera_site_feedback),
    'items', COALESCE((SELECT jsonb_agg(jsonb_build_object('id',id,'helped',helped,'improve',improve,'disliked',disliked,'created_at',created_at) ORDER BY created_at DESC) FROM public.thera_site_feedback), '[]'::jsonb)
  );
END $$;
REVOKE ALL ON FUNCTION public.thera_feedback_list() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.thera_feedback_list() TO authenticated;