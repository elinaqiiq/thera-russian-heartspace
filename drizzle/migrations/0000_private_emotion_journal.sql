CREATE TABLE public.emotion_entries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, mood smallint NOT NULL CHECK (mood BETWEEN 1 AND 5), emotion text NOT NULL CHECK (char_length(emotion) BETWEEN 1 AND 50), note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 3000), audio_base64 text CHECK (char_length(audio_base64) <= 2800000), audio_type text CHECK (audio_type IN ('audio/webm','audio/mp4','audio/ogg')), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, DELETE ON public.emotion_entries TO authenticated;
GRANT ALL ON public.emotion_entries TO service_role;
ALTER TABLE public.emotion_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY emotion_read_own ON public.emotion_entries FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY emotion_insert_own ON public.emotion_entries FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY emotion_delete_own ON public.emotion_entries FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE INDEX emotion_entries_owner_date ON public.emotion_entries(user_id, created_at DESC);