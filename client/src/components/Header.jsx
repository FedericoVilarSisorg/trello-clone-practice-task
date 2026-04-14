import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="bg-glass border-b border-gray-200 dark:border-white/[0.06] h-12 flex items-center justify-between px-5 fixed top-0 left-0 right-0 z-50">
      <Link
        to="/boards"
        className="font-display text-base font-bold tracking-wide text-gradient hover:opacity-80 transition-opacity"
      >
        NEXUS BOARD
      </Link>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-amber-500 dark:hover:text-neon-cyan transition-all"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 hover:bg-gray-100 dark:hover:bg-white/[0.04] rounded-lg px-3 py-1.5 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-indigo to-neon-cyan flex items-center justify-center text-xs font-bold text-white shadow-glow-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
              <svg
                className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-void-800 rounded-xl border border-gray-200 dark:border-white/[0.08] shadow-lg dark:shadow-2xl dark:shadow-black/50 py-1 animate-fade-in">
                <div className="px-4 py-2.5 text-xs text-gray-500 border-b border-gray-100 dark:border-white/[0.06] font-mono">
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
