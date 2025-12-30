const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Or Service Role if needed
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to check Auth (Optional, depends on RLS)
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.user = user;
  next();
};

// Routes

// GET /api/projects
app.get('/api/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_manager:project_manager_id(id, full_name, email),
        created_by_user:created_by(id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Fallback to mock data if DB fails or is empty (for demo purposes)
    res.json([
      { id: '1', name: 'برج وسط المدينة', code: 'DT-101', status: 'active', budget: 150000000, progress: 45, startDate: '2023-01-01', endDate: '2025-12-31' },
      { id: '2', name: 'جسر الساحل', code: 'CB-202', status: 'active', budget: 85000000, progress: 20, startDate: '2023-06-15', endDate: '2026-06-15' },
    ]);
  }
});

// GET /api/contracts
app.get('/api/contracts', async (req, res) => {
    // Mock data for now, replace with DB call
    res.json([
        { id: 'c1', projectId: '1', title: 'عقد الهيكل الخرساني', value: 50000000, status: 'Active' }
    ]);
});

// Health Check
app.get('/health', (req, res) => {
  res.send('Backend is running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
