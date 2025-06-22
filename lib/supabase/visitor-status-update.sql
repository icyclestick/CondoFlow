-- Update visitors table to include "rejected" and "cancelled" status
ALTER TABLE visitors DROP CONSTRAINT IF EXISTS visitors_status_check;

ALTER TABLE visitors ADD CONSTRAINT visitors_status_check CHECK (
  status = ANY (ARRAY[
    'pending'::text,
    'approved'::text,
    'rejected'::text,
    'cancelled'::text,
    'checked-in'::text,
    'checked-out'::text
  ])
); 