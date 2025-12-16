import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  History,
  Users,
  HelpCircle,
  ChevronLeft,
  FileText,
  LogOut,
} from 'lucide-react';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import logoImage from 'figma:asset/10c7427c8662ca0a1527b4984b4aa1b2dd869deb.png';
import { useResponsive } from '../../hooks/useResponsive';

interface NavItem {
  label: string;
  icon: any;
  path: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Applications',
    icon: FolderOpen,
    path: '/applications',
  },
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    label: 'History',
    icon: History,
    path: '/history',
  },
  {
    label: 'Users',
    icon: Users,
    path: '/users',
    roles: ['admin'],
  },
  {
    label: 'Help',
    icon: HelpCircle,
    path: '/help',
  },
];

export function Sidebar() {
  const { isOpen, toggle, close } = useSidebar();
  const { hasRole, logout } = useAuth();
  const location = useLocation();
  const { isMobile } = useResponsive();

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || hasRole(item.roles)
  );

  const handleLogout = () => {
    logout();
  };

  const handleNavClick = () => {
    if (isMobile) {
      close();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300',
          isMobile
            ? isOpen
              ? 'w-64 translate-x-0'
              : 'w-64 -translate-x-full'
            : isOpen
            ? 'w-64'
            : 'w-16'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            {isOpen ? (
              <div className="flex items-center gap-2">
                <img src={logoImage} alt="Truverizen" className="h-8 w-8" />
                <span className="font-semibold">Truverizen</span>
              </div>
            ) : (
              <button onClick={toggle} className="mx-auto">
                <img src={logoImage} alt="Truverizen" className="h-8 w-8" />
              </button>
            )}
            {isOpen && (
              <Button variant="ghost" size="icon" onClick={toggle}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path} onClick={handleNavClick}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      !isOpen && 'justify-center px-2'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {isOpen && <span>{item.label}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Logout at bottom */}
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10',
                !isOpen && 'justify-center px-2'
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {isOpen && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
