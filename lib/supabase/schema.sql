-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'resident')) DEFAULT 'resident',
  unit_id UUID REFERENCES units(id),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  emergency_contact TEXT,
  move_in_date DATE
);

-- Create units table
CREATE TABLE units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  status TEXT CHECK (status IN ('occupied', 'vacant')) DEFAULT 'vacant',
  monthly_fee DECIMAL(10,2) NOT NULL,
  UNIQUE(block, unit_number)
);

-- Create amenities table
CREATE TABLE amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  hourly_rate DECIMAL(10,2),
  image_url TEXT
);

-- Create amenity_bookings table
CREATE TABLE amenity_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  guests INTEGER NOT NULL,
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending'
);

-- Create move_requests table
CREATE TABLE move_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('move-in', 'move-out')) NOT NULL,
  move_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  moving_company TEXT,
  reason TEXT NOT NULL,
  large_items TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending'
);

-- Create gatepass_requests table
CREATE TABLE gatepass_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transport_date DATE NOT NULL,
  transport_time TEXT NOT NULL,
  reason TEXT NOT NULL,
  items JSONB NOT NULL,
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending'
);

-- Create service_requests table
CREATE TABLE service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  preferred_schedule TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'assigned', 'in-progress', 'completed')) DEFAULT 'pending',
  assigned_to TEXT
);

-- Create visitors table
CREATE TABLE visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visit_date DATE NOT NULL,
  time_in TIME NOT NULL,
  time_out TIME,
  reason TEXT NOT NULL,
  vehicle_info TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'checked-in', 'checked-out')) DEFAULT 'pending'
);

-- Create complaints table
CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  complaint_type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium',
  image_url TEXT,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'resolved')) DEFAULT 'pending',
  admin_response TEXT
);

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  receipt_url TEXT
);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gatepass_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Amenity bookings policies
CREATE POLICY "Users can view own bookings" ON amenity_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" ON amenity_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON amenity_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view own requests" ON move_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own requests" ON move_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests" ON move_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample data for development
INSERT INTO units (block, unit_number, monthly_fee, status) VALUES
('A', '101', 350.00, 'vacant'),
('A', '102', 350.00, 'vacant'),
('A', '201', 375.00, 'vacant'),
('A', '202', 375.00, 'vacant'),
('B', '101', 350.00, 'vacant'),
('B', '102', 350.00, 'vacant'),
('B', '201', 375.00, 'vacant'),
('B', '202', 375.00, 'vacant');

INSERT INTO amenities (name, description, capacity, hourly_rate) VALUES
('Swimming Pool', 'Olympic-sized swimming pool with lifeguard', 20, 15.00),
('Function Hall', 'Large hall for events and gatherings', 50, 50.00),
('Tennis Court', 'Professional tennis court', 4, 20.00),
('Gym', 'Fully equipped fitness center', 15, 10.00),
('BBQ Area', 'Outdoor barbecue area with grills', 12, 25.00),
('Kids Playground', 'Safe playground for children', 20, 0.00);
