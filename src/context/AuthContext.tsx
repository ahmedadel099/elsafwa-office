import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, Branch } from '../types';
import { sqliteEngine } from '../db/sqliteEngine';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: Profile | null;
  currentRole: UserRole;
  currentBranchId?: string;
  isPublicMode: boolean;
  login: (email: string, pass: string) => boolean;
  loginWithGoogle: () => void;
  loginWithDemoAccount: (role: UserRole, branchId?: string) => void;
  logout: () => void;
  switchToPublicPortal: () => void;
  switchToBackOffice: () => void;
  allProfiles: Profile[];
  allBranches: Branch[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ELSafwa_Is_Authenticated') === 'true';
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('ELSafwa_Active_Role') as UserRole) || 'admin';
  });

  const [currentBranchId, setCurrentBranchId] = useState<string | undefined>(() => {
    return localStorage.getItem('ELSafwa_Active_Branch') || 'br-minya-el-qamh';
  });

  const [isPublicMode, setIsPublicMode] = useState<boolean>(() => {
    return localStorage.getItem('ELSafwa_View_Mode') === 'public';
  });

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  useEffect(() => {
    const profiles = sqliteEngine.getProfiles();
    const branches = sqliteEngine.getAllBranches();
    setAllProfiles(profiles);
    setAllBranches(branches);

    if (!isAuthenticated) {
      setCurrentUser(null);
    } else {
      let matched = profiles.find(p => p.role === currentRole && p.branch_id === currentBranchId);
      if (!matched) {
        matched = profiles.find(p => p.role === currentRole) || profiles[0];
      }
      setCurrentUser(matched || null);
    }
  }, [isAuthenticated, currentRole, currentBranchId]);

  const login = (email: string, pass: string): boolean => {
    const profiles = sqliteEngine.getProfiles();
    const matched = profiles.find(p => p.email.toLowerCase() === email.toLowerCase().trim());
    
    if (matched) {
      setIsAuthenticated(true);
      setCurrentRole(matched.role);
      setCurrentBranchId(matched.branch_id);
      setCurrentUser(matched);
      setIsPublicMode(false);

      localStorage.setItem('ELSafwa_Is_Authenticated', 'true');
      localStorage.setItem('ELSafwa_Active_Role', matched.role);
      localStorage.setItem('ELSafwa_Active_Branch', matched.branch_id);
      localStorage.setItem('ELSafwa_View_Mode', 'backoffice');
      return true;
    }
    return false;
  };

  const loginWithGoogle = () => {
    const profiles = sqliteEngine.getProfiles();
    const adminUser = profiles.find(p => p.role === 'admin') || profiles[0];
    
    setIsAuthenticated(true);
    setCurrentRole(adminUser.role);
    setCurrentBranchId(adminUser.branch_id);
    setCurrentUser(adminUser);
    setIsPublicMode(false);

    localStorage.setItem('ELSafwa_Is_Authenticated', 'true');
    localStorage.setItem('ELSafwa_Active_Role', adminUser.role);
    localStorage.setItem('ELSafwa_Active_Branch', adminUser.branch_id);
    localStorage.setItem('ELSafwa_View_Mode', 'backoffice');
  };

  const loginWithDemoAccount = (role: UserRole, branchId?: string) => {
    const profiles = sqliteEngine.getProfiles();
    let matched = profiles.find(p => p.role === role && (!branchId || p.branch_id === branchId));
    if (!matched) matched = profiles.find(p => p.role === role) || profiles[0];

    setIsAuthenticated(true);
    setCurrentRole(matched.role);
    setCurrentBranchId(matched.branch_id);
    setCurrentUser(matched);
    setIsPublicMode(false);

    localStorage.setItem('ELSafwa_Is_Authenticated', 'true');
    localStorage.setItem('ELSafwa_Active_Role', matched.role);
    localStorage.setItem('ELSafwa_Active_Branch', matched.branch_id);
    localStorage.setItem('ELSafwa_View_Mode', 'backoffice');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsPublicMode(true);

    localStorage.removeItem('ELSafwa_Is_Authenticated');
    localStorage.setItem('ELSafwa_View_Mode', 'public');
  };

  const switchToPublicPortal = () => {
    setIsPublicMode(true);
    localStorage.setItem('ELSafwa_View_Mode', 'public');
  };

  const switchToBackOffice = () => {
    setIsPublicMode(false);
    localStorage.setItem('ELSafwa_View_Mode', 'backoffice');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      currentRole,
      currentBranchId: currentRole === 'admin' ? undefined : currentBranchId,
      isPublicMode,
      login,
      loginWithGoogle,
      loginWithDemoAccount,
      logout,
      switchToPublicPortal,
      switchToBackOffice,
      allProfiles,
      allBranches
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
