
-- 1. Add nickname fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nickname text,
  ADD COLUMN IF NOT EXISTS nickname_changed_at timestamp with time zone;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_nickname_unique ON public.profiles (nickname) WHERE nickname IS NOT NULL;

-- 2. Add budget breakdown and escrow fields to assignments
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS material_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS escrow_status text NOT NULL DEFAULT 'none';

-- 3. Expand agent_reviews for 1-10 scale with category ratings
ALTER TABLE public.agent_reviews
  ADD COLUMN IF NOT EXISTS quality_rating integer,
  ADD COLUMN IF NOT EXISTS communication_rating integer,
  ADD COLUMN IF NOT EXISTS timeliness_rating integer,
  ADD COLUMN IF NOT EXISTS accuracy_rating integer;

-- Remove old check constraint on rating if exists, allow 1-10
-- Use a validation trigger instead
CREATE OR REPLACE FUNCTION public.validate_review_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 10 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 10';
  END IF;
  IF NEW.quality_rating IS NOT NULL AND (NEW.quality_rating < 1 OR NEW.quality_rating > 10) THEN
    RAISE EXCEPTION 'Quality rating must be between 1 and 10';
  END IF;
  IF NEW.communication_rating IS NOT NULL AND (NEW.communication_rating < 1 OR NEW.communication_rating > 10) THEN
    RAISE EXCEPTION 'Communication rating must be between 1 and 10';
  END IF;
  IF NEW.timeliness_rating IS NOT NULL AND (NEW.timeliness_rating < 1 OR NEW.timeliness_rating > 10) THEN
    RAISE EXCEPTION 'Timeliness rating must be between 1 and 10';
  END IF;
  IF NEW.accuracy_rating IS NOT NULL AND (NEW.accuracy_rating < 1 OR NEW.accuracy_rating > 10) THEN
    RAISE EXCEPTION 'Accuracy rating must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_review_ratings_trigger
  BEFORE INSERT OR UPDATE ON public.agent_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_review_ratings();

-- 4. Create disputes table
CREATE TABLE public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  opened_by uuid NOT NULL,
  reason text NOT NULL,
  evidence_url text,
  status text NOT NULL DEFAULT 'open',
  admin_notes text,
  resolved_at timestamp with time zone,
  resolution_amount numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Students can create disputes for their own assignments
CREATE POLICY "Students can create disputes"
  ON public.disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = opened_by
    AND EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = disputes.assignment_id AND a.student_id = auth.uid()
    )
  );

-- Users can view disputes on their assignments
CREATE POLICY "Users can view their disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (
    opened_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = disputes.assignment_id AND (a.student_id = auth.uid() OR a.agent_id = auth.uid())
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Admins can update disputes
CREATE POLICY "Admins can update disputes"
  ON public.disputes FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete disputes
CREATE POLICY "Admins can delete disputes"
  ON public.disputes FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at on disputes
CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
