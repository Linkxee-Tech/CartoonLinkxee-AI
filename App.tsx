
import React, { useState } from 'react';
import { Tab } from './types';
import BottomNav from './components/BottomNav';
import CreatorStudio from './components/CreatorStudio';
import MyCharacters from './components/MyCharacters';
import Discover from './components/Discover';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Studio);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Studio:
        return <CreatorStudio />;
      case Tab.Characters:
        return <MyCharacters />;
      case Tab.Discover:
        return <Discover />;
      case Tab.Profile:
        return <Profile />;
      default:
        return <CreatorStudio />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 pb-24">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;