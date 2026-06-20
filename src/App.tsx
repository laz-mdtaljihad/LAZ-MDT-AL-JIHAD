/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DashboardPublic } from './components/DashboardPublic';
import { DashboardAdmin } from './components/DashboardAdmin';
import { MascotChat } from './components/MascotChat';

const MainNavigator: React.FC = () => {
  const { currentRole, setCurrentRole } = useApp();
  const [isAdminView, setIsAdminView] = useState(false);

  const handleEnterPortal = () => {
    // Default to 'pantauan' role when entering portal initially for sandbox demonstration.
    // The user can easily toggle role in the sandbox selector bar.
    setCurrentRole('pantauan');
    setIsAdminView(true);
  };

  const handleExitPortal = () => {
    setCurrentRole('umum');
    setIsAdminView(false);
  };

  if (isAdminView && currentRole !== 'umum') {
    return <DashboardAdmin onExitPortal={handleExitPortal} />;
  }

  return (
    <>
      <DashboardPublic onEnterPortal={handleEnterPortal} />
      <MascotChat />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainNavigator />
    </AppProvider>
  );
}
