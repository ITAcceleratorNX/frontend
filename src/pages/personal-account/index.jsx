import React, { useState } from 'react';
import { Header } from '../../widgets';
import Sidebar from './ui/Sidebar';
import PersonalData from './ui/PersonalData';
import Contracts from './ui/Contracts';
import Settings from './ui/Settings';

const PersonalAccountPage = () => {
  const [activeNav, setActiveNav] = useState('personal');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        <main className="flex-1 flex flex-col items-start justify-center py-12 px-10 bg-white">
          {activeNav === 'personal' && <PersonalData />}
          {activeNav === 'contracts' && <Contracts />}
          {activeNav === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export default PersonalAccountPage; 