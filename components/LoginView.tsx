import React, { useState, useEffect, useRef } from 'react';
import { Lock, Mail, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { secureStorage, checkRateLimit, generateCSRFToken } from '../lib/utils/security';
import toast, { Toaster } from 'react-hot-toast';
import { createClient } from '../lib/supabase/client';

// Use shared Supabase client
const supabase = createClient();

interface LoginViewProps {
  onLoginSuccess: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const captchaRef = useRef<unknown>(null);

  useEffect(() => {
    // Generate CSRF token on mount
    generateCSRFToken();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    // Check rate limiting (5 attempts per 15 minutes)
    const canProceed = checkRateLimit('login-attempt', { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
    if (!canProceed) {
      setError('محاولات تسجيل دخول كثيرة. حاول بعد 15 دقيقة');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Store token securely with encryption
        secureStorage.setItem('sb-access-token', data.session.access_token);
        toast.success('تم تسجيل الدخول بنجاح');
        onLoginSuccess();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل تسجيل الدخول';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
      setSeeding(true);
      setError(null);
      setMsg(null);
      try {
          // Admin seeding is now handled via SQL script
          setMsg('Please use the provided SQL script to seed the admin user.');
      } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          setError('Failed to seed admin: ' + message);
      } finally {
          setSeeding(false);
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] font-sans" dir="rtl">
      <Toaster position="top-center" />
      <div className="max-w-[400px] w-full bg-white rounded-[20px] shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
        {/* Top Bar Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#001f3f]"></div>

        <div className="text-center mb-8 mt-4">
          {/* Logo Area */}
          <div className="flex justify-center mb-6">
             <img src="/logo.png" alt="Zawaya Albina" className="h-20 object-contain" onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.nextElementSibling?.classList.remove('hidden');
             }} />
             <div className="hidden text-center">
                <h2 className="text-xl font-bold text-[#001f3f]">ZAWAYA ALBINA</h2>
                <p className="text-xs text-gray-500">ENGINEERING CONSULTANCY</p>
                <p className="text-xs text-gray-500">شركة زوايا البناء للإستشارات الهندسية</p>
             </div>
          </div>

          <h1 className="text-2xl font-bold text-[#001f3f] mb-2">بوابة الإدارة الهندسية</h1>
          <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">ENGINEERING MANAGEMENT PORTAL</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center animate-pulse">
            {error}
          </div>
        )}
        
        {msg && (
          <div className="mb-6 p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm text-center">
            {msg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 text-right">اسم المستخدم</label>
            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#001f3f] transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#001f3f]/20 focus:border-[#001f3f] outline-none transition-all text-right text-gray-800 placeholder-gray-400 font-medium"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 text-right">كلمة المرور</label>
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#001f3f] transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#001f3f]/20 focus:border-[#001f3f] outline-none transition-all text-right text-gray-800 placeholder-gray-400 font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#001f3f] text-white py-4 rounded-xl font-bold hover:bg-[#003366] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#001f3f]/20"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                جاري الدخول...
              </>
            ) : (
              <>
                <span>دخول آمن للنظام</span>
                <div className="bg-white/10 p-1.5 rounded-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10 17 15 12 10 7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                </div>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                <span>Secure Encrypted Connection</span>
                <ShieldCheck size={12} className="text-green-500" />
            </div>

            <p className="text-[10px] text-gray-400">
                جميع الحقوق محفوظة © {new Date().getFullYear()} زوايا البناء للإستشارات الهندسية
            </p>
        </div>
        
        {/* Hidden Seed Button for Admin */}
        <div className="mt-2 text-center opacity-0 hover:opacity-100 transition-opacity">
            <button 
                onClick={handleSeed}
                disabled={seeding}
                className="text-[10px] text-gray-300 hover:text-[#001f3f] flex items-center justify-center gap-1 mx-auto"
            >
                <ShieldAlert size={10} />
                {seeding ? 'Initializing...' : 'Init'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

