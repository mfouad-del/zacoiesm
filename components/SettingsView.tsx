import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { User, Shield, Bell, Globe, Mail, Save, Trash2, Plus, X, Loader2 } from 'lucide-react';
import { fetchUsers, createUser, deleteUser, changePassword } from '../lib/api';

const SettingsView: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New User Form State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'user', phone: '' });

  // Change Password State
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createUser(newUser);
      setSuccessMsg('User created successfully');
      setIsAddingUser(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'user', phone: '' });
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (err: any) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
    }
    setLoading(true);
    setError(null);
    try {
        await changePassword(newPassword);
        setSuccessMsg('Password changed successfully');
        setNewPassword('');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.settings}</h1>
        <p className="text-gray-500 text-sm">{lang === 'ar' ? 'إدارة تفضيلات النظام والمستخدمين.' : 'Manage system preferences and users.'}</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">{error}</div>}
      {successMsg && <div className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-200">{successMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {[
            { icon: <User size={18} />, label: lang === 'ar' ? 'الملف الشخصي' : 'Profile' },
            { icon: <Shield size={18} />, label: t.userManagement },
            { icon: <Bell size={18} />, label: lang === 'ar' ? 'الإشعارات' : 'Notifications' },
            { icon: <Globe size={18} />, label: lang === 'ar' ? 'اللغة والموقع' : 'Language & Region' },
          ].map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
              ${i === 0 ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Change Password Section */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-8 border-b pb-4">{lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">{lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                <div className="relative">
                  <LockIcon className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full ${lang === 'ar' ? 'pr-10' : 'pl-10'} p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100`} 
                    placeholder="******"
                  />
                </div>
              </div>
              <button 
                onClick={handleChangePassword}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              </button>
            </div>
          </div>

          {/* User Management Section */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">{t.userManagement}</h3>
                <button 
                    onClick={() => setIsAddingUser(!isAddingUser)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100"
                >
                    {isAddingUser ? <X size={16} /> : <Plus size={16} />}
                    {isAddingUser ? (lang === 'ar' ? 'إلغاء' : 'Cancel') : (lang === 'ar' ? 'إضافة مستخدم' : 'Add User')}
                </button>
            </div>

            {isAddingUser && (
                <form onSubmit={handleAddUser} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                            <input required type="email" className="w-full p-2 border rounded-lg" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
                            <input required type="password" className="w-full p-2 border rounded-lg" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                            <input required type="text" className="w-full p-2 border rounded-lg" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Role</label>
                            <select className="w-full p-2 border rounded-lg" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
              {users.map((user, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {user.full_name ? user.full_name[0] : '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                    </span>
                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                  <div className="text-center py-8 text-gray-400">No users found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

export default SettingsView;

