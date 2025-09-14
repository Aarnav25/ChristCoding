import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/Button';
import { DarkModeToggle } from '../components/DarkModeToggle';

export function DashboardLayout() {
  const { role, logout } = useAuthStore();
  const navigate = useNavigate();

  const studentNav = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/daily', label: 'Daily Challenge' },
    { to: '/progress', label: 'My Progress' },
  ];
  const adminNav = [
    { to: '/questions', label: 'Questions' },
    { to: '/upload', label: 'Upload PDF' },
    { to: '/students', label: 'Students' },
    { to: '/users', label: 'All Users' },
  ];

  const navItems = role === 'admin' ? adminNav : studentNav;

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-rose-50 to-sky-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="flex">
        <aside className="w-72 bg-white/85 dark:bg-gray-800/85 backdrop-blur border-r border-gray-200 dark:border-gray-700 min-h-screen p-5 sticky top-0 transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
            <Link to="/dashboard" className="text-2xl font-extrabold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-fuchsia-600">DCC</span> Portal
            </Link>
            <DarkModeToggle />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Navigation</div>
          <nav className="space-y-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white shadow'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-fuchsia-50 dark:hover:from-gray-700 dark:hover:to-gray-600'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 p-3 rounded-xl bg-gradient-to-r from-sky-50 to-violet-50 dark:from-gray-700 dark:to-gray-600 border dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">
            Signed in as <span className="font-semibold text-blue-700 dark:text-blue-400">{role ?? 'guest'}</span>
          </div>
          <div className="mt-6">
            <Button variant="secondary" className="w-full" onClick={onLogout}>Logout</Button>
          </div>
        </aside>
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
