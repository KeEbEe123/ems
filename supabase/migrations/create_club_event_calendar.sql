-- Create club_event_calendar table
CREATE TABLE IF NOT EXISTS public.club_event_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  report_status TEXT DEFAULT 'Not Submitted',
  reviewer_comment TEXT,
  review_request TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.club_event_calendar ENABLE ROW LEVEL SECURITY;

-- Policy: Clubs can view their own calendar events
CREATE POLICY "Clubs can view their own calendar events"
  ON public.club_event_calendar
  FOR SELECT
  USING (club_id = auth.uid());

-- Policy: Clubs can insert their own calendar events
CREATE POLICY "Clubs can insert their own calendar events"
  ON public.club_event_calendar
  FOR INSERT
  WITH CHECK (club_id = auth.uid());

-- Policy: Clubs can update their own calendar events
CREATE POLICY "Clubs can update their own calendar events"
  ON public.club_event_calendar
  FOR UPDATE
  USING (club_id = auth.uid())
  WITH CHECK (club_id = auth.uid());

-- Policy: Clubs can delete their own calendar events
CREATE POLICY "Clubs can delete their own calendar events"
  ON public.club_event_calendar
  FOR DELETE
  USING (club_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_club_event_calendar_event_id ON public.club_event_calendar(event_id);
CREATE INDEX IF NOT EXISTS idx_club_event_calendar_club_id ON public.club_event_calendar(club_id);
CREATE INDEX IF NOT EXISTS idx_club_event_calendar_added_at ON public.club_event_calendar(added_at DESC);

-- Create unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_club_event_calendar_unique 
  ON public.club_event_calendar(event_id, club_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_club_event_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_club_event_calendar_updated_at
  BEFORE UPDATE ON public.club_event_calendar
  FOR EACH ROW
  EXECUTE FUNCTION update_club_event_calendar_updated_at();
