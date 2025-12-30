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
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client for user management (requires Service Role Key)
let supabaseAdmin = null;
if (supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn("Warning: SUPABASE_SERVICE_ROLE_KEY is missing. Admin features (User Management) will not work.");
}

// Middleware to check Auth
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

// Middleware to check Admin Role
const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Check role in public.users table
    const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .single();

    if (error || !data || (data.role !== 'admin' && data.role !== 'super_admin')) {
        return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    next();
};

// Routes

// --- User Management Routes ---

// Seed Admin User
app.post('/api/seed-admin', async (req, res) => {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Server misconfigured: Missing Service Role Key' });
    }

    const email = 'admin@zaco.sa';
    const password = 'admin123';
    const fullName = 'System Admin';

    try {
        // 1. Check if user exists in Auth
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = users.find(u => u.email === email);
        let userId;

        if (existingUser) {
            userId = existingUser.id;
            console.log('Admin user already exists in Auth.');
            // Optional: Update password if needed
            // await supabaseAdmin.auth.admin.updateUserById(userId, { password: password });
        } else {
            // 2. Create user in Auth
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true
            });
            if (createError) throw createError;
            userId = newUser.user.id;
            console.log('Created admin user in Auth.');
        }

        // 3. Ensure user exists in public.users with admin role
        const { data: publicUser, error: publicError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (!publicUser) {
            const { error: insertError } = await supabaseAdmin
                .from('users')
                .insert([{
                    id: userId,
                    email: email,
                    full_name: fullName,
                    role: 'super_admin'
                }]);
            if (insertError) throw insertError;
            console.log('Inserted admin into public.users.');
        } else {
             // Update role just in case
             const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({ role: 'super_admin' })
                .eq('id', userId);
             if (updateError) throw updateError;
             console.log('Updated admin role in public.users.');
        }

        res.json({ message: 'Admin user seeded successfully', email });

    } catch (error) {
        console.error('Error seeding admin:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get All Users (Admin only)
app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create User (Admin only)
app.post('/api/users', requireAuth, requireAdmin, async (req, res) => {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Missing Service Role Key' });
    
    const { email, password, full_name, role, phone } = req.body;

    try {
        // 1. Create in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name }
        });

        if (authError) throw authError;
        const userId = authData.user.id;

        // 2. Create in public.users
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .insert([{
                id: userId,
                email,
                full_name,
                role: role || 'user',
                phone
            }]);

        if (dbError) {
            // Rollback auth creation if DB fails (optional but good practice)
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw dbError;
        }

        res.status(201).json({ message: 'User created successfully', user: { id: userId, email, full_name, role } });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update User (Admin only)
app.put('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Missing Service Role Key' });

    const { id } = req.params;
    const { email, password, full_name, role, phone } = req.body;

    try {
        // 1. Update Auth (if email/password changed)
        const authUpdates = {};
        if (email) authUpdates.email = email;
        if (password) authUpdates.password = password;
        
        if (Object.keys(authUpdates).length > 0) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
            if (authError) throw authError;
        }

        // 2. Update public.users
        const dbUpdates = {};
        if (email) dbUpdates.email = email;
        if (full_name) dbUpdates.full_name = full_name;
        if (role) dbUpdates.role = role;
        if (phone) dbUpdates.phone = phone;

        if (Object.keys(dbUpdates).length > 0) {
            const { error: dbError } = await supabaseAdmin
                .from('users')
                .update(dbUpdates)
                .eq('id', id);
            if (dbError) throw dbError;
        }

        res.json({ message: 'User updated successfully' });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete User (Admin only)
app.delete('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Missing Service Role Key' });

    const { id } = req.params;

    try {
        // Deleting from Auth should cascade to public.users if set up correctly.
        // If not, we might need to delete from public.users first.
        // Assuming CASCADE is set on the foreign key in public.users.
        
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (error) throw error;

        res.json({ message: 'User deleted successfully' });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Change Password (Authenticated User)
app.post('/api/change-password', requireAuth, async (req, res) => {
    const { password } = req.body;
    
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        const { error } = await supabase.auth.updateUser({ password: password });
        if (error) throw error;

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


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
