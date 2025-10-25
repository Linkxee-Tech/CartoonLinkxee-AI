
import React from 'react';
import { Tab } from '../types';
import { HomeIcon, SparklesIcon, UserIcon, Squares2X2Icon } from './Icons';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const navItems = [
  { tab: Tab.Studio, label: 'Studio', icon: HomeIcon },
  { tab: Tab.Characters, label: 'Characters', icon: Squares2X2Icon },
  { tab: Tab.Discover, label: 'Discover', icon: SparklesIcon },
  { tab: Tab.Profile, label: 'Profile', icon: UserIcon },
];

const NavItem: React.FC<{
  item: typeof navItems[0];
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  const activeClass = isActive ? 'text-purple-400' : 'text-gray-400';
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ease-in-out ${activeClass} hover:text-purple-300`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs mt-1">{item.label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg z-50">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.tab}
            item={item}
            isActive={activeTab === item.tab}
            onClick={() => setActiveTab(item.tab)}
          />
        ))}
      </div>
    </footer>
  );
};

export default BottomNav;
