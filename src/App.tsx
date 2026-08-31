import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import { Header } from './components/common/Header';
import { Sidebar, TabKey } from './components/common/Sidebar';

// Public Portal Views
import { LandingHero } from './components/public/LandingHero';
import { ServiceCatalog } from './components/public/ServiceCatalog';
import { PublicSubmissionForm } from './components/public/PublicSubmissionForm';
import { PublicTracker } from './components/public/PublicTracker';
import { BranchInfoCards } from './components/public/BranchInfoCards';

// Auth View
import { LoginPage } from './components/auth/LoginPage';

// Back Office Views
import { DashboardOverview } from './components/backoffice/dashboard/DashboardOverview';
import { RequestList } from './components/backoffice/requests/RequestList';
import { ClientList } from './components/backoffice/clients/ClientList';
import { DocumentManager } from './components/backoffice/documents/DocumentManager';
import { PaymentManager } from './components/backoffice/payments/PaymentManager';
import { ServiceTypeManager } from './components/backoffice/service_types/ServiceTypeManager';
import { UserManager } from './components/backoffice/users/UserManager';
import { BranchManager } from './components/backoffice/branches/BranchManager';

// Request Creation Modal
import { RequestFormModal } from './components/backoffice/requests/RequestFormModal';
import { Search, PlusCircle, LogOut, Lock, User, ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { isAuthenticated, isPublicMode, currentUser, currentRole, logout, switchToPublicPortal, switchToBackOffice } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [publicSubView, setPublicSubView] = useState<'landing' | 'submit' | 'track'>('landing');
  const [selectedServiceToApply, setSelectedServiceToApply] = useState<string | undefined>(undefined);
  const [trackPreFill, setTrackPreFill] = useState<{ ref: string; phone: string }>({ ref: '', phone: '' });

  const [isGlobalCreateModalOpen, setIsGlobalCreateModalOpen] = useState(false);

  // If Public Citizen Portal Mode
  if (isPublicMode) {
    return (
      <div className="min-h-screen flex flex-col transition-colors duration-200">
        <Header />

        {/* Public Sub-Navigation Bar */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm py-2.5 px-4 sticky top-[68px] z-30 no-print">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto text-xs font-extrabold">
              <button
                onClick={() => setPublicSubView('landing')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                  publicSubView === 'landing' 
                    ? 'theme-primary-btn shadow-md' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('دليل الخدمات والفروع', 'Services & Branches')}
              </button>

              <button
                onClick={() => {
                  setSelectedServiceToApply(undefined);
                  setPublicSubView('submit');
                }}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  publicSubView === 'submit' 
                    ? 'theme-primary-btn shadow-md' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('تقديم طلب جديد', 'Submit Request')}</span>
              </button>

              <button
                onClick={() => setPublicSubView('track')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  publicSubView === 'track' 
                    ? 'theme-primary-btn shadow-md' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('تتبع حالة الطلب', 'Track Request')}</span>
              </button>
            </div>

            <button
              onClick={() => switchToBackOffice()}
              className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 hover:underline hidden sm:flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAuthenticated ? t('الانتقال للوحة العمل الداخلية ←', 'Go to Back Office →') : t('دخول الموظفين والجهات ←', 'Staff Login →')}</span>
            </button>
          </div>
        </div>

        {/* Public Body Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-10">
          {publicSubView === 'landing' && (
            <>
              <LandingHero
                onNavigateToForm={() => setPublicSubView('submit')}
                onNavigateToTracker={() => setPublicSubView('track')}
              />
              <ServiceCatalog
                onSelectServiceToApply={(srvId) => {
                  setSelectedServiceToApply(srvId);
                  setPublicSubView('submit');
                }}
              />
              <BranchInfoCards />
            </>
          )}

          {publicSubView === 'submit' && (
            <PublicSubmissionForm
              initialServiceTypeId={selectedServiceToApply}
              onSuccessNavigateToTracker={(ref, phone) => {
                setTrackPreFill({ ref, phone });
                setPublicSubView('track');
              }}
              onCancel={() => setPublicSubView('landing')}
            />
          )}

          {publicSubView === 'track' && (
            <PublicTracker
              initialRef={trackPreFill.ref}
              initialPhone={trackPreFill.phone}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-xs border-t border-slate-800 no-print">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="font-extrabold text-white text-sm">
                {t('شركة الصفوة للخدمات الحكومية والإلكترونية وخدمات الجماهير', 'El Safwa Public Services Company')}
              </div>
              <div className="mt-1 font-medium">
                {t('ترخيص رقم ٦٧٩ ( مجموعة ب ) - منيا القمح - العزيزية - الشرقية', 'License No. 679 Group B - Minya El Qamh - Sharqia')}
              </div>
            </div>

            <div className="font-mono text-amber-400 font-bold">
              01115345157 / 01020384273 / 01210285290
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // If Not Authenticated and user wants Back Office -> Show Authentication Screen
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Authenticated Back Office Layout
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      <Header />

      {/* Authenticated Staff Top Bar with Logout Button */}
      <div className="theme-gradient-banner text-white px-6 py-2 border-b border-emerald-900 dark:border-slate-800 flex items-center justify-between text-xs font-bold no-print">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>
            {t('أهلاً بك،', 'Welcome,')} <strong>{currentUser?.full_name}</strong> ({currentRole === 'admin' ? 'مدير نظام' : currentRole === 'branch_manager' ? 'مدير فرع' : 'موظف تنفيذ'})
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={switchToPublicPortal}
            className="text-amber-200 hover:text-white transition"
          >
            {t('عرض بوابة الجمهور', 'View Public Portal')}
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-900/80 text-rose-100 hover:bg-rose-800 transition border border-rose-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('تسجيل الخروج', 'Logout')}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onOpenCreateRequest={() => setIsGlobalCreateModalOpen(true)}
            />
          )}

          {activeTab === 'requests' && <RequestList />}

          {activeTab === 'clients' && <ClientList />}

          {activeTab === 'documents' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {t('أرشيف المستندات العام بالمنظومة', 'Global Documents Archive')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t('يرجى تحديد المعاملة من قائمة المعاملات لإدارة مستنداتها المرفوعة والمسح الضوئي بشكل مباشر', 'Please select a specific request from the Queue to manage its archived files and scanner tools.')}
              </p>
            </div>
          )}

          {activeTab === 'payments' && <PaymentManager />}

          {activeTab === 'service_types' && <ServiceTypeManager />}

          {activeTab === 'users' && <UserManager />}

          {activeTab === 'branches' && <BranchManager />}
        </main>
      </div>

      {isGlobalCreateModalOpen && (
        <RequestFormModal
          isOpen={isGlobalCreateModalOpen}
          onClose={() => setIsGlobalCreateModalOpen(false)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <DataProvider>
            <MainApp />
          </DataProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
