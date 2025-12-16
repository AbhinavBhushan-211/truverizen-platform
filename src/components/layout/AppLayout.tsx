import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebar } from '../../hooks/useSidebar';
import { useResponsive } from '../../hooks/useResponsive';
import { cn } from '../../lib/utils';

export function AppLayout() {
  const { isOpen } = useSidebar();
  const { isMobile } = useResponsive();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          isMobile ? 'ml-0' : isOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}