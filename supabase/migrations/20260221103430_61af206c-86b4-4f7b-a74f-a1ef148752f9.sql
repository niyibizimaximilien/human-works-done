
-- =============================================
-- 1. STORAGE BUCKETS for file uploads
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('assignment-files', 'assignment-files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('deliverables', 'deliverables', false);

-- Students can upload to assignment-files/{assignment_id}/
CREATE POLICY "Students upload assignment files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'assignment-files');

CREATE POLICY "Authenticated users can view assignment files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'assignment-files');

CREATE POLICY "Agents upload deliverables"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'deliverables');

CREATE POLICY "Authenticated users can view deliverables"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'deliverables');

-- =============================================
-- 2. MESSAGES TABLE for in-app messaging
-- =============================================
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their assignments"
ON public.messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    WHERE a.id = assignment_id
    AND (a.student_id = auth.uid() OR a.agent_id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can send messages on their assignments"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.assignments a
    WHERE a.id = assignment_id
    AND (a.student_id = auth.uid() OR a.agent_id = auth.uid())
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- =============================================
-- 3. AGENT REVIEWS TABLE for reputation
-- =============================================
CREATE TABLE public.agent_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  on_time boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(assignment_id)
);

ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can create reviews"
ON public.agent_reviews FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Anyone authenticated can view reviews"
ON public.agent_reviews FOR SELECT TO authenticated
USING (true);

-- =============================================
-- 4. AUDIT LOG TABLE (append-only)
-- =============================================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- =============================================
-- 5. ADD SLA TIER & PRIORITY FIELDS to assignments
-- =============================================
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS sla_tier text NOT NULL DEFAULT 'standard';
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS priority_fee numeric DEFAULT 0;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS human_verified boolean DEFAULT false;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- =============================================
-- 6. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (true);
