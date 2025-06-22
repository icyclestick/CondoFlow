-- Update complaints table to include "cancelled" status
ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check;

ALTER TABLE complaints ADD CONSTRAINT complaints_status_check CHECK (
  status = ANY (ARRAY[
    'pending'::text,
    'in-progress'::text,
    'resolved'::text,
    'cancelled'::text
  ])
); 