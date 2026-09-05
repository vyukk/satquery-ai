import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, LayoutDashboard, Image, History, Cpu, Map, Info } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui';

const navItems = [
  { path: '/workspace', label: 'Workspace', icon: LayoutDashboard },
  { path: '/change-detection', label: 'Change Detection', icon: Map },
  { path: '/models', label: 'Models', icon: Cpu },
  { path: '/history', label: 'History', icon: History },
  { path: '/about', label: 'About', icon: Info },
];

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-space-950/95 backdrop-blur-sm border-b border-space-800">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 text-space-100 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <Image className="w-5 h-5 text-space-950" />
            </div>
            <span className="font-semibold text-lg tracking-tight hidden sm:block">SatQuery AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-space-800 text-cyan-400'
                      : 'text-space-400 hover:text-space-100 hover:bg-space-800'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hidden sm:flex"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-space-800 bg-space-950/95 backdrop-blur-sm animate-slide-down">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-space-800 text-cyan-400'
                      : 'text-space-400 hover:text-space-100 hover:bg-space-800'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-space-800 flex items-center justify-center">
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start">
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
          </nav>
        </div>
      )}

      {userMenuOpen && (
        <div className="fixed inset-0 z-40 bg-transparent md:hidden" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  );
}