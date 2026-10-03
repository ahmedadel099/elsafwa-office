import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './app/AuthContext';
import { ThemeProvider } from './app/ThemeContext';
import { useEffect } from 'react';
import { matchPath, navigate, useLocation } from './lib/router';
import { ToastProvider } from './ui/Toast';
import type { Permission } from './data/meta';

import { PublicLayout } from './public/PublicLayout';
import { HomePage } from './public/HomePage';
import { ServicesPage } from './public/ServicesPage';
import { ServiceDetailPage } from './public/ServiceDetailPage';
import { ApplyPage } from './public/ApplyPage';
import { TrackPage } from './public/TrackPage';
import { PrivacyPage } from './public/PrivacyPage';

import { LoginPage } from './staff/LoginPage';
import { StaffLayout } from './staff/StaffLayout';
import { DashboardPage } from './staff/DashboardPage';
import { RequestsPage } from './staff/requests/RequestsPage';
import { RequestDetailPage } from './staff/requests/RequestDetailPage';
import { ClientsPage } from './staff/clients/ClientsPage';
import { ClientDetailPage } from './staff/clients/ClientDetailPage';
import { TreasuryPage } from './staff/TreasuryPage';
import { DocumentsPage } from './staff/DocumentsPage';
import { ServicesAdminPage } from './staff/admin/ServicesAdminPage';
import { UsersPage } from './staff/admin/UsersPage';
import { BranchesPage } from './staff/admin/BranchesPage';
import { AuditPage } from './staff/admin/AuditPage';
import { NotFound } from './staff/NotFound';

type Route = { pattern: string; permission?: Permission; render: (params: Record<string, string>) => ReactNode };

const STAFF_ROUTES: Route[] = [
  { pattern: '/app', render: () => <DashboardPage /> },
  { pattern: '/app/requests', permission: 'requests.view', render: () => <RequestsPage /> },
  { pattern: '/app/requests/:id', permission: 'requests.view', render: ({ id }) => <RequestDetailPage id={id} /> },
  { pattern: '/app/clients', permission: 'clients.view', render: () => <ClientsPage /> },
  { pattern: '/app/clients/:id', permission: 'clients.view', render: ({ id }) => <ClientDetailPage id={id} /> },
  { pattern: '/app/documents', permission: 'requests.view', render: () => <DocumentsPage /> },
  { pattern: '/app/treasury', permission: 'treasury.view', render: () => <TreasuryPage /> },
  { pattern: '/app/services', render: () => <ServicesAdminPage /> },
  { pattern: '/app/users', permission: 'users.manage', render: () => <UsersPage /> },
  { pattern: '/app/branches', permission: 'branches.manage', render: () => <BranchesPage /> },
  { pattern: '/app/audit', permission: 'audit.view', render: () => <AuditPage /> },
];

const PUBLIC_ROUTES: Route[] = [
  { pattern: '/', render: () => <HomePage /> },
  { pattern: '/services', render: () => <ServicesPage /> },
  { pattern: '/services/:id', render: ({ id }) => <ServiceDetailPage id={id} /> },
  { pattern: '/apply', render: () => <ApplyPage /> },
  { pattern: '/track', render: () => <TrackPage /> },
  { pattern: '/privacy', render: () => <PrivacyPage /> },
];

function resolve(routes: Route[], path: string, allowed: (p: Permission) => boolean = () => true): ReactNode | null {
  for (const route of routes) {
    const params = matchPath(route.pattern, path);
    if (params) return route.permission && !allowed(route.permission) ? null : route.render(params);
  }
  return null;
}

function PublicPage({ path }: { path: string }) {
  return <>{resolve(PUBLIC_ROUTES, path) ?? <HomePage />}</>;
}

function Redirect({ to }: { to: string }) {
  useEffect(() => navigate(to, { replace: true }), [to]);
  return null;
}

function Router() {
  const { path, query } = useLocation();
  const { user, can } = useAuth();

  // Note: "/apply" also starts with "/app" — match the staff area by segment, not prefix.
  const staffArea = path === '/app' || path.startsWith('/app/');

  if (path === '/staff/login' && user) return <Redirect to="/app" />;
  if (path === '/staff/login' || (staffArea && !user)) {
    return <LoginPage />;
  }

  if (staffArea) {
    return <StaffLayout key={user?.id}>{resolve(STAFF_ROUTES, path, can) ?? <NotFound />}</StaffLayout>;
  }

  // Remount public pages on every URL change so e.g. a shown tracking result doesn't linger.
  return (
    <PublicLayout>
      <PublicPage key={`${path}?${query.toString()}`} path={path} />
    </PublicLayout>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
