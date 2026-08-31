import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  Branch, 
  ServiceType, 
  Client, 
  RequestRecord, 
  RequestStatusHistory, 
  DocumentRecord, 
  PaymentRecord,
  DashboardMetrics,
  RequestStatus
} from '../types';
import { sqliteEngine } from '../db/sqliteEngine';
import { useAuth } from './AuthContext';

interface DataContextType {
  branches: Branch[];
  serviceTypes: ServiceType[];
  clients: Client[];
  requests: RequestRecord[];
  metrics: DashboardMetrics;
  refreshData: () => void;
  resetDatabase: () => void;
  
  // Mutations
  saveClient: (client: Parameters<typeof sqliteEngine.saveClient>[0]) => Client;
  createRequest: (data: Parameters<typeof sqliteEngine.createRequest>[0]) => RequestRecord;
  submitPublicRequest: (data: Parameters<typeof sqliteEngine.submitPublicRequest>[0]) => { tracking_ref: string; request_id: string };
  updateRequestStatus: (data: Parameters<typeof sqliteEngine.updateRequestStatus>[0]) => RequestRecord;
  updateRequestDetails: (id: string, updates: Partial<RequestRecord>) => RequestRecord;
  uploadDocument: (doc: Parameters<typeof sqliteEngine.uploadDocument>[0]) => DocumentRecord;
  deleteDocument: (docId: string) => void;
  addPayment: (pay: Parameters<typeof sqliteEngine.addPayment>[0]) => PaymentRecord;
  saveServiceType: (srv: Parameters<typeof sqliteEngine.saveServiceType>[0]) => ServiceType;
  saveBranch: (br: Parameters<typeof sqliteEngine.saveBranch>[0]) => Branch;
  saveProfile: (p: Parameters<typeof sqliteEngine.saveProfile>[0]) => void;
  getRequestStatusHistory: (requestId: string) => RequestStatusHistory[];
  getRequestDocuments: (requestId: string) => DocumentRecord[];
  getRequestPayments: (requestId: string) => PaymentRecord[];
  trackPublicRequest: (ref: string, phone: string) => ReturnType<typeof sqliteEngine.trackPublicRequest>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentBranchId } = useAuth();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRequests: 0,
    newSubmissionsCount: 0,
    pendingReviewCount: 0,
    dueOverdueCount: 0,
    approvedCount: 0,
    completedCount: 0,
    totalFeesCollectedThisMonth: 0,
    totalBalanceDue: 0,
    statusBreakdown: { new: 0, under_review: 0, docs_missing: 0, submitted_authority: 0, under_inspection: 0, approved: 0, rejected: 0, completed: 0, cancelled: 0 },
    branchBreakdown: {}
  });

  const refreshData = useCallback(() => {
    setBranches(sqliteEngine.getBranches());
    setServiceTypes(sqliteEngine.getServiceTypes());
    setClients(sqliteEngine.getClients(currentBranchId));
    setRequests(sqliteEngine.getRequests({ branchId: currentBranchId }));
    setMetrics(sqliteEngine.getDashboardMetrics(currentBranchId));
  }, [currentBranchId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const resetDatabase = () => {
    sqliteEngine.resetToSeed();
    refreshData();
  };

  const saveClient = (data: Parameters<typeof sqliteEngine.saveClient>[0]) => {
    const res = sqliteEngine.saveClient(data);
    refreshData();
    return res;
  };

  const createRequest = (data: Parameters<typeof sqliteEngine.createRequest>[0]) => {
    const res = sqliteEngine.createRequest(data);
    refreshData();
    return res;
  };

  const submitPublicRequest = (data: Parameters<typeof sqliteEngine.submitPublicRequest>[0]) => {
    const res = sqliteEngine.submitPublicRequest(data);
    refreshData();
    return res;
  };

  const updateRequestStatus = (data: Parameters<typeof sqliteEngine.updateRequestStatus>[0]) => {
    const res = sqliteEngine.updateRequestStatus(data);
    refreshData();
    return res;
  };

  const updateRequestDetails = (id: string, updates: Partial<RequestRecord>) => {
    const res = sqliteEngine.updateRequestDetails(id, updates);
    refreshData();
    return res;
  };

  const uploadDocument = (doc: Parameters<typeof sqliteEngine.uploadDocument>[0]) => {
    const res = sqliteEngine.uploadDocument(doc);
    refreshData();
    return res;
  };

  const deleteDocument = (docId: string) => {
    sqliteEngine.deleteDocument(docId);
    refreshData();
  };

  const addPayment = (pay: Parameters<typeof sqliteEngine.addPayment>[0]) => {
    const res = sqliteEngine.addPayment(pay);
    refreshData();
    return res;
  };

  const saveServiceType = (srv: Parameters<typeof sqliteEngine.saveServiceType>[0]) => {
    const res = sqliteEngine.saveServiceType(srv);
    refreshData();
    return res;
  };

  const saveBranch = (br: Parameters<typeof sqliteEngine.saveBranch>[0]) => {
    const res = sqliteEngine.saveBranch(br);
    refreshData();
    return res;
  };

  const saveProfile = (p: Parameters<typeof sqliteEngine.saveProfile>[0]) => {
    sqliteEngine.saveProfile(p);
    refreshData();
  };

  const getRequestStatusHistory = (requestId: string) => {
    return sqliteEngine.getStatusHistory(requestId);
  };

  const getRequestDocuments = (requestId: string) => {
    return sqliteEngine.getDocuments(requestId);
  };

  const getRequestPayments = (requestId: string) => {
    return sqliteEngine.getPayments(requestId);
  };

  const trackPublicRequest = (ref: string, phone: string) => {
    return sqliteEngine.trackPublicRequest(ref, phone);
  };

  return (
    <DataContext.Provider value={{
      branches,
      serviceTypes,
      clients,
      requests,
      metrics,
      refreshData,
      resetDatabase,
      saveClient,
      createRequest,
      submitPublicRequest,
      updateRequestStatus,
      updateRequestDetails,
      uploadDocument,
      deleteDocument,
      addPayment,
      saveServiceType,
      saveBranch,
      saveProfile,
      getRequestStatusHistory,
      getRequestDocuments,
      getRequestPayments,
      trackPublicRequest
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
