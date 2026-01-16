-- =====================================================
-- FUTURE ME AI - DATABASE SETUP
-- =====================================================

-- 1. Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Create test_results table to save user test results
CREATE TABLE public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('holland', 'bigfive', 'combined')),
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on test_results
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_results
CREATE POLICY "Users can view their own test results" 
ON public.test_results FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test results" 
ON public.test_results FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test results" 
ON public.test_results FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Create chat_conversations table for AI chat history
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_type TEXT NOT NULL DEFAULT 'advisor' CHECK (chat_type IN ('advisor', 'roadmap')),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat_conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view their own conversations" 
ON public.chat_conversations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" 
ON public.chat_conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.chat_conversations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.chat_conversations FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create roadmaps table to save user roadmaps
CREATE TABLE public.roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on roadmaps
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roadmaps
CREATE POLICY "Users can view their own roadmaps" 
ON public.roadmaps FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmaps" 
ON public.roadmaps FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps" 
ON public.roadmaps FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps" 
ON public.roadmaps FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Create todo_lists table (separate from roadmaps)
CREATE TABLE public.todo_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE SET NULL,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on todo_lists
ALTER TABLE public.todo_lists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for todo_lists
CREATE POLICY "Users can view their own todo lists" 
ON public.todo_lists FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todo lists" 
ON public.todo_lists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todo lists" 
ON public.todo_lists FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todo lists" 
ON public.todo_lists FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'meo132114@gmail.com' THEN 'admin' ELSE 'user' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at
  BEFORE UPDATE ON public.roadmaps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_todo_lists_updated_at
  BEFORE UPDATE ON public.todo_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Add RLS to existing tables that don't have them
-- Enable RLS on existing tables (if not already enabled)
ALTER TABLE public."CÁC NHÓM HOLLAND TEST" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CÁC TRƯỜNG ĐẠI HỌC" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CÂU HỎI BIG FIVE" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CÂU HỎI HOLLAND TEST" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."HƯỚNG DẪN HOLLAND TEST" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_metadata ENABLE ROW LEVEL SECURITY;

-- Add public read policies for reference tables
CREATE POLICY "Allow public read access to Holland groups"
ON public."CÁC NHÓM HOLLAND TEST" FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to universities"
ON public."CÁC TRƯỜNG ĐẠI HỌC" FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to Big Five questions"
ON public."CÂU HỎI BIG FIVE" FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to Holland questions"
ON public."CÂU HỎI HOLLAND TEST" FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to Holland guide"
ON public."HƯỚNG DẪN HOLLAND TEST" FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to test metadata"
ON public.test_metadata FOR SELECT
USING (true);