DROP POLICY IF EXISTS thera_clinician_directory ON public.thera_clinicians;
CREATE POLICY thera_clinician_related ON public.thera_clinicians FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.thera_progress_notes n WHERE n.clinician_id = thera_clinicians.id AND n.user_id = (SELECT auth.uid())));
CREATE OR REPLACE FUNCTION public.thera_clinician_options()
RETURNS TABLE(id uuid, label text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, c.label FROM public.thera_clinicians c WHERE auth.uid() IS NOT NULL ORDER BY c.label
$$;
REVOKE ALL ON FUNCTION public.thera_clinician_options() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.thera_clinician_options() TO authenticated;