// @ts-nocheck
/* eslint-disable */
'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Compass, Gamepad2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  sidebarItems?: string[];
}

export const Layout: React.FC<LayoutProps> = ({ children, sidebarItems }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
    window.dispatchEvent(new CustomEvent('resetExplore'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      {/* Top Logo Bar */}
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-lg z-40">
        <div className="flex justify-center items-center h-14 px-4">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center bg-[#3b82f6]">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
                <path
                  fill="currentColor"
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">educasm</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-14 mb-[5.5rem]">
        <div className="max-w-4xl mx-auto px-4 flex gap-4">
          {/* Main content area */}
          <div className="flex-1">{children}</div>
          {/* Sidebar - rendered only if sidebarItems are provided */}
          {sidebarItems && (
            <aside className="w-64 bg-gray-800 p-4 rounded-lg">
              <ul className="space-y-4">
                {sidebarItems.map((item, index) => (
                  <li
                    key={index}
                    className="cursor-pointer hover:text-gray-300 transition-colors"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-gray-800 z-40 border-2">
        <div className="flex justify-around items-center h-12 max-w-4xl mx-auto">
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg transition-colors ${
              pathname === '/'
                ? 'text-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px]">Explore</span>
          </Link>

          <Link
            href="/playground"
            className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg transition-colors ${
              pathname === '/playground'
                ? 'text-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="text-[10px]">Playground</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
