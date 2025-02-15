// @ts-nocheck
/* eslint-disable */
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  User,
  MessageSquare,
  TrendingUp,
  Compass,
  Bookmark,
  Lightbulb,
  Award,
  Trophy,
  Clipboard,
  BarChart,
  Calendar,
  Rocket,
  Settings,
  HelpCircle,
} from 'lucide-react';

type SidebarItem = {
  label: string;
  icon: JSX.Element;
};

const SidebarWrapper: React.FC = () => {
  const pathname = usePathname();
  let sidebarItems: SidebarItem[] = [];

  if (pathname === '/') {
    // Explore Mode Sidebar Items
    sidebarItems = [
      { label: 'Profile', icon: <User size={16} /> },
      { label: 'Past Interactions', icon: <MessageSquare size={16} /> },
      { label: 'Trending Topics', icon: <TrendingUp size={16} /> },
      { label: 'Recommended Explorations', icon: <Compass size={16} /> },
      { label: 'Bookmarks/Saved Items', icon: <Bookmark size={16} /> },
      { label: 'Quick Tips & Insights', icon: <Lightbulb size={16} /> },
    ];
  } else if (pathname === '/playground') {
    // Playground Mode Sidebar Items
    sidebarItems = [
      { label: 'Leaderboard', icon: <Award size={16} /> },
      { label: 'Quests (Prizes)', icon: <Trophy size={16} /> },
      { label: 'Profile', icon: <User size={16} /> },
      { label: 'Past Questions', icon: <Clipboard size={16} /> },
      { label: 'Progress Tracker', icon: <BarChart size={16} /> },
      { label: 'Daily Challenge', icon: <Calendar size={16} /> },
    ];
  }

  // Bottom items that are always shown
  const bottomSidebarItems: SidebarItem[] = [
    { label: 'Upgrade', icon: <Rocket size={16} /> },
    { label: 'Settings', icon: <Settings size={16} /> },
    { label: 'Help', icon: <HelpCircle size={16} /> },
  ];

  // If there are no sidebar items, don't render the sidebar.
  if (sidebarItems.length === 0 && bottomSidebarItems.length === 0) return null;

  return (
    <aside className="fixed -right-16 top-[80px] bottom-[60px] w-80 bg-gray-800 p-6 overflow-y-auto rounded-3xl">
      <div className="flex flex-col h-full justify-between">
        {/* Main Sidebar Items */}
        <ul className="space-y-4">
          {sidebarItems.map((item, index) => (
            <li
              key={index}
              className="cursor-pointer flex items-center hover:text-[#3b82f6] gap-3 px-4 py-2 rounded-xl transition-colors hover:bg-[#0f172a] "
            >
              {item.icon}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-gray-700">
          <ul className="space-y-4">
            {bottomSidebarItems.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer flex items-center gap-3 px-4 py-2 rounded-xl transition-colors hover:bg-[#0f172a] hover:text-gray-300"
              >
                {item.icon}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default SidebarWrapper;
