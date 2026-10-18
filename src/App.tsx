/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/Header.tsx';
import { Navigation } from './components/Navigation.tsx';
import { QuickSafetyReport } from './components/QuickSafetyReport.tsx';
import { SafetyReportsView } from './components/SafetyReportsView.tsx';
import { AuditsModule } from './components/AuditsModule.tsx';
import { SPIManager } from './components/SPIManager.tsx';
import { SafetyKPIDashboardView } from './components/SafetyKPIDashboardView.tsx';
import { SafetyBulletinsView } from './components/SafetyBulletinsView.tsx';
import { ManagementOfChangeView } from './components/ManagementOfChangeView.tsx';
import { GSEFleetView } from './components/GSEFleetView.tsx';
import { TrainingMatrixView } from './components/TrainingMatrixView.tsx';
import { ManagementReviewReportView } from './components/ManagementReviewReportView.tsx';
import { UsersAndAccessMatrixView } from './components/UsersAndAccessMatrixView.tsx';
import { SafetyFormConfigView } from './components/SafetyFormConfigView.tsx';
import { RbacAccessDeniedView } from './components/RbacAccessDeniedView.tsx';

const AppContent: React.FC = () => {
  const { activeView, activeRole, theme, isViewPermitted } = useApp();

  const renderActiveView = () => {
    // RBAC Guard: If user navigated to a view not permitted for their active role
    if (!isViewPermitted(activeView, activeRole)) {
      return <RbacAccessDeniedView attemptedView={activeView} />;
    }

    switch (activeView) {
      case 'quickReport':
        return <QuickSafetyReport />;
      case 'kpiDashboard':
        return <SafetyKPIDashboardView />;
      case 'incidentLogs':
        return <SafetyReportsView />;
      case 'audits':
        return <AuditsModule />;
      case 'spiManager':
        return <SPIManager />;
      case 'bulletins':
        return <SafetyBulletinsView />;
      case 'moc':
        return <ManagementOfChangeView />;
      case 'gseFleet':
        return <GSEFleetView />;
      case 'training':
        return <TrainingMatrixView />;
      case 'mgmtReview':
        return <ManagementReviewReportView />;
      case 'usersAndAccess':
        return <UsersAndAccessMatrixView />;
      case 'formConfig':
        return <SafetyFormConfigView />;
      default:
        return <QuickSafetyReport />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} transition-colors flex flex-col font-sans`}>
      <Header />
      
      <div className="flex-1 flex flex-col lg:flex-row">
        <Navigation />
        
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
