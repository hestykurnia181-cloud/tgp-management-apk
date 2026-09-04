import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import { TgpBottomBar } from './components/TgpBottomBar';
import { TgpTopBar } from './components/TgpTopBar';
import { TgpProvider, useTgp } from './context/TgpContext';
import { ApprovalScreen } from './screens/ApprovalScreen';
import { AttendanceScreen } from './screens/AttendanceScreen';
import { AuditLogViewerScreen } from './screens/AuditLogViewerScreen';
import { BusinessHomeScreen } from './screens/BusinessHomeScreen';
import { DamagedGoodsScreen } from './screens/DamagedGoodsScreen';
import { FinanceScreen } from './screens/FinanceScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { LoginScreen } from './screens/LoginScreen';
import { MasterDashboardScreen } from './screens/MasterDashboardScreen';
import { OwnerDashboardScreen } from './screens/OwnerDashboardScreen';
import { PosScreen } from './screens/PosScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { StanOutletScreen } from './screens/StanOutletScreen';
import { TransferScreen } from './screens/TransferScreen';

const MainAppContent: React.FC = () => {
  const { currentSession, activeScreen, userMessage, errorMessage, clearMessages } = useTgp();

  if (!currentSession || activeScreen === 'LOGIN') {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <TgpTopBar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-20 sm:pb-8">
        {/* Floating / Top Alert Banners */}
        {userMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{userMessage}</span>
            </div>
            <button
              onClick={clearMessages}
              className="p-1 text-emerald-700 hover:text-emerald-950 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={clearMessages}
              className="p-1 text-rose-700 hover:text-rose-950 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Screen Routing */}
        {activeScreen === 'MASTER_DASHBOARD' && <MasterDashboardScreen />}
        {activeScreen === 'OWNER_DASHBOARD' && <OwnerDashboardScreen />}
        {activeScreen === 'BUSINESS_HOME' && <BusinessHomeScreen />}
        {activeScreen === 'POS_MODULE' && <PosScreen />}
        {activeScreen === 'STAN_OUTLET_MODULE' && <StanOutletScreen />}
        {activeScreen === 'INVENTORY_MODULE' && <InventoryScreen />}
        {activeScreen === 'TRANSFER_MODULE' && <TransferScreen />}
        {activeScreen === 'APPROVAL_MODULE' && <ApprovalScreen />}
        {activeScreen === 'FINANCE_MODULE' && <FinanceScreen />}
        {activeScreen === 'DAMAGED_GOODS_MODULE' && <DamagedGoodsScreen />}
        {activeScreen === 'ATTENDANCE_MODULE' && <AttendanceScreen />}
        {activeScreen === 'REPORTS_MODULE' && <ReportsScreen />}
        {activeScreen === 'AUDIT_LOG_VIEWER' && <AuditLogViewerScreen />}
      </main>

      <TgpBottomBar />
    </div>
  );
};

export default function App() {
  return (
    <TgpProvider>
      <MainAppContent />
    </TgpProvider>
  );
}
