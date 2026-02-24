
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  sidebarItems?: { id: string; label: string; icon: string; path: string }[];
}

const Layout: React.FC<LayoutProps> = ({ children, className = "", sidebarItems }) => {
  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background-dark flex">
      {sidebarItems && <Sidebar items={sidebarItems} />}
      <div className={`flex-1 flex flex-col relative w-full overflow-x-hidden ${className}`}>
        {children}
        {sidebarItems && (
          <div className="lg:hidden">
            <BottomNav items={sidebarItems} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
