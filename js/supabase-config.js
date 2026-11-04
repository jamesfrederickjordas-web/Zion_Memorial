// Supabase Configuration
const SUPABASE_URL = 'https://mjhkglatnwcudwcpbzsp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaGtnbGF0bndjdWR3Y3BienNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjQ0OTksImV4cCI6MjEwODk0MDQ5OX0.BI-1Jxwra6t8-IwVuS05AAWJ2YLSRoJxIy4o9AxalLA';

// Create the Supabase client (using a different name to avoid conflict)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient;
