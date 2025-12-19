-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  expiry_date DATE NOT NULL,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  supplier TEXT NOT NULL,
  batch_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id)
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  file_url TEXT,
  medicines_requested JSONB,
  availability_status JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create demand forecasts table
CREATE TABLE IF NOT EXISTS public.demand_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE,
  predicted_demand INTEGER NOT NULL,
  confidence_level DECIMAL(5, 2) NOT NULL,
  forecast_date DATE NOT NULL,
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create price comparisons table
CREATE TABLE IF NOT EXISTS public.price_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_name TEXT NOT NULL,
  supplier TEXT NOT NULL,
  supplier_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(5, 2),
  is_best_deal BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for medicines (admin and manager can view all)
CREATE POLICY "Authenticated users can view medicines" ON public.medicines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert medicines" ON public.medicines FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update medicines" ON public.medicines FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete medicines" ON public.medicines FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for sales
CREATE POLICY "Authenticated users can view sales" ON public.sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert sales" ON public.sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for alerts
CREATE POLICY "Authenticated users can view alerts" ON public.alerts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert alerts" ON public.alerts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update alerts" ON public.alerts FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for prescriptions
CREATE POLICY "Authenticated users can view prescriptions" ON public.prescriptions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for demand forecasts
CREATE POLICY "Authenticated users can view forecasts" ON public.demand_forecasts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert forecasts" ON public.demand_forecasts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for price comparisons
CREATE POLICY "Authenticated users can view prices" ON public.price_comparisons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert prices" ON public.price_comparisons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update prices" ON public.price_comparisons FOR UPDATE USING (auth.role() = 'authenticated');
