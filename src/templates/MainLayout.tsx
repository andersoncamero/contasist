import { ReactNode } from 'react';
import { Sidebar, MobileHeader } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 md:pt-0 md:ml-64 min-h-screen p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
