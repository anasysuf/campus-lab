'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardShell({
  children,
  title,
  subtitle,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}
