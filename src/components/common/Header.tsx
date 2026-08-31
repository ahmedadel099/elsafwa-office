import React from 'react';
import { 
  Building2, 
  Globe, 
  Moon, 
  Sun, 
  PhoneCall, 
  Award, 
  LogOut, 
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    currentBranchId, 
    isAuthenticated, 
    isPublicMode, 
    loginWithDemoAccount, 
    logout, 
    switchToPublicPortal 
  } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { themeMode, toggleThemeMode } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 transition-colors duration-150 no-print">
      {/* Top Essential Contact & License Bar */}
      <div className="bg-slate-900 text-slate-100 dark:bg-slate-950 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 text-slate-950" />
              {t('ترخيص رقم ٦٧٩ (مجموعة ب)', 'License No. 679 Group B')}
            </span>
            <span className="font-bold text-slate-200 text-[11px] hidden sm:inline">
              {t('شركة الصفوة للخدمات الحكومية والإلكترونية وخدمات الجماهير', 'El Safwa Government & Public Services Company')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>01115345157 / 01020384273</span>
            </div>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:inline font-semibold text-[11px] text-slate-400">
              {t('منيا القمح - العزيزية - الشرقية', 'Sharqia - Minya El Qamh')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Minimalist Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Minimal Emblem & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={switchToPublicPortal}>
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-amber-400 dark:text-slate-950 font-black text-xl flex items-center justify-center shadow-sm shrink-0">
            ص
          </div>
          <div>
            <h1 className="font-black text-base text-slate-900 dark:text-white tracking-tight leading-none">
              {t('الصفوة للخدمات الحكومية', 'El Safwa Office')}
            </h1>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-bold">
              {t('منظومة المعاملات والتراخيص', 'Licensing & Services Management')}
            </p>
          </div>
        </div>

        {/* Minimal Role Switcher Bar */}
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2.5">
            {t('الدور:', 'Role:')}
          </span>

          <button
            onClick={() => loginWithDemoAccount('admin')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              currentRole === 'admin' && !isPublicMode
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('أدمن', 'Admin')}
          </button>

          <button
            onClick={() => loginWithDemoAccount('branch_manager', 'br-minya-el-qamh')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              currentRole === 'branch_manager' && currentBranchId === 'br-minya-el-qamh' && !isPublicMode
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('منيا القمح', 'Mgr Minya')}
          </button>

          <button
            onClick={() => loginWithDemoAccount('branch_manager', 'br-aziziyya')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              currentRole === 'branch_manager' && currentBranchId === 'br-aziziyya' && !isPublicMode
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('العزيزية', 'Mgr Aziziyya')}
          </button>

          <button
            onClick={() => loginWithDemoAccount('employee', 'br-minya-el-qamh')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              currentRole === 'employee' && !isPublicMode
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('موظف', 'Employee')}
          </button>

          <button
            onClick={switchToPublicPortal}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              isPublicMode 
                ? 'bg-emerald-600 text-white shadow-sm font-extrabold' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('بوابة الجمهور', 'Public Portal')}
          </button>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={themeMode === 'dark' ? t('التحويل للمظهر المضيء', 'Switch to Light Mode') : t('التحويل للمظهر المظلم', 'Switch to Dark Mode')}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* User Logout */}
          {isAuthenticated && !isPublicMode && currentUser && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition text-xs font-bold hover:bg-rose-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('خروج', 'Logout')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
