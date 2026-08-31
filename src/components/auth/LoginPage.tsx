import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  UserCheck, 
  Award, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  KeyRound,
  Building,
  User,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, loginWithDemoAccount, switchToPublicPortal } = useAuth();
  const { t, dir } = useLanguage();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Register Form State
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'employee' as UserRole,
    branch: 'br-minya-el-qamh'
  });
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      return setError(t('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'Please enter email and password'));
    }

    const success = login(email, password);
    if (!success) {
      setError(t('البريد الإلكتروني غير صحيح أو الحساب غير مسجل. جرب أزرار الدخول السريع أدناه.', 'Invalid credentials. Try quick demo login buttons below.'));
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(true);
    setTimeout(() => {
      loginWithDemoAccount(regData.role, regData.branch);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8faf6] dark:bg-[#070a12] text-slate-900 dark:text-white font-tajawal relative overflow-hidden transition-colors duration-200">
      {/* Background Glowing Gradients */}
      <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Top Header & El Safwa Badge */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl emerald-primary-gradient text-amber-400 font-black text-3xl mx-auto flex items-center justify-center shadow-lg border border-amber-400/40">
            ص
          </div>

          <div>
            <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-400/20 text-amber-900 dark:text-amber-300 px-3.5 py-0.5 rounded-full text-[11px] font-black border border-amber-300 dark:border-amber-400/30 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {t('ترخيص رقم ٦٧٩ ( مجموعة ب )', 'License No. 679 Group B')}
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('شركة الصفوة للخدمات الحكومية', 'El Safwa Office Portal')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {t('منظومة تسجيل الدخول للجهات والموظفين', 'Staff Authentication Portal')}
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 rounded-xl transition ${activeTab === 'login' ? 'emerald-primary-gradient text-white shadow-sm font-extrabold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            {t('تسجيل الدخول', 'Login')}
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-xl transition ${activeTab === 'register' ? 'emerald-primary-gradient text-white shadow-sm font-extrabold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            {t('طلب حساب موظف', 'Register Staff')}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                {t('البريد الإلكتروني للموظف', 'Staff Email')} *
              </label>
              <input
                type="email"
                required
                placeholder="admin@elsafwa.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                {t('كلمة المرور', 'Password')} *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl emerald-primary-gradient text-white font-extrabold text-xs shadow-lg transition hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>{t('تسجيل الدخول للمنظومة', 'Sign In')}</span>
            </button>

            {/* Google OAuth Login Button */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{t('تسجيل الدخول باستخدام Google', 'Sign in with Google')}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            {regSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-center font-bold">
                {t('تم تسجيل طلبك بنجاح! جاري تحويلك للمنظومة...', 'Account registered! Logging in...')}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  required
                  placeholder={t('اسم الموظف الثلاثي', 'Staff Full Name')}
                  value={regData.fullName}
                  onChange={e => setRegData({ ...regData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                />
                <input
                  type="email"
                  required
                  placeholder="name@elsafwa.com"
                  value={regData.email}
                  onChange={e => setRegData({ ...regData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold"
                />
                <input
                  type="tel"
                  required
                  placeholder="010XXXXXXXX"
                  value={regData.phone}
                  onChange={e => setRegData({ ...regData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold"
                />
                <select
                  value={regData.role}
                  onChange={e => setRegData({ ...regData, role: e.target.value as UserRole })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                >
                  <option value="employee">موظف تنفيذ وتراخيص</option>
                  <option value="branch_manager">مدير فرع</option>
                </select>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl emerald-primary-gradient text-white font-extrabold text-xs shadow-md"
                >
                  {t('إرسال طلب الانضمام', 'Submit Account Request')}
                </button>
              </>
            )}
          </form>
        )}

        {/* 1-Click Quick Demo Login Accounts Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-2 text-center">
            {t('⚡ تجربة سريعة لدخول الأدوار (Quick Demo Accounts):', '⚡ Instant Demo Role Login:')}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => loginWithDemoAccount('admin')}
              className="px-2.5 py-2 rounded-xl bg-purple-50 dark:bg-slate-950 border border-purple-200 dark:border-slate-800 text-purple-900 dark:text-purple-300 font-extrabold hover:bg-purple-100 transition text-[11px] text-center shadow-sm"
            >
              👑 {t('أدمن النظام', 'Admin')}
            </button>
            <button
              onClick={() => loginWithDemoAccount('branch_manager', 'br-minya-el-qamh')}
              className="px-2.5 py-2 rounded-xl bg-blue-50 dark:bg-slate-950 border border-blue-200 dark:border-slate-800 text-blue-900 dark:text-blue-300 font-extrabold hover:bg-blue-100 transition text-[11px] text-center shadow-sm"
            >
              🏢 {t('مدير منيا القمح', 'Mgr Minya')}
            </button>
            <button
              onClick={() => loginWithDemoAccount('branch_manager', 'br-aziziyya')}
              className="px-2.5 py-2 rounded-xl bg-amber-50 dark:bg-slate-950 border border-amber-200 dark:border-slate-800 text-amber-900 dark:text-amber-300 font-extrabold hover:bg-amber-100 transition text-[11px] text-center shadow-sm"
            >
              🏢 {t('مدير العزيزية', 'Mgr Aziziyya')}
            </button>
            <button
              onClick={() => loginWithDemoAccount('employee', 'br-minya-el-qamh')}
              className="px-2.5 py-2 rounded-xl bg-emerald-50 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 text-emerald-900 dark:text-emerald-300 font-extrabold hover:bg-emerald-100 transition text-[11px] text-center shadow-sm"
            >
              👤 {t('موظف تنفيذ', 'Employee')}
            </button>
          </div>
        </div>

        {/* Return to Public Portal Button */}
        <div className="pt-2 text-center">
          <button
            onClick={switchToPublicPortal}
            className="text-xs font-extrabold text-emerald-800 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
          >
            <span>{t('العودة لبوابة الجمهور الخارجية العامة', 'Back to Public Portal')}</span>
            {dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
