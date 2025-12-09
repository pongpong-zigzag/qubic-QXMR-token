import { Link, useLocation } from 'react-router-dom';
import { Users, CreditCard, Home } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl floating"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl floating" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl floating" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Link to="/users" className="flex items-center space-x-3 group">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/80 transition-all hover-lift">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">
                  Admin Panel
                </span>
              </Link>
            </div>
            <nav className="flex items-center space-x-2">
              <Link
                to="/users"
                className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold ${
                  isActive('/users')
                    ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white shadow-2xl shadow-blue-500/50 pulse-glow'
                    : 'glass text-white hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-cyan-500/30 hover:text-white hover-lift'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Users</span>
              </Link>
              <Link
                to="/transactions"
                className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold ${
                  isActive('/transactions')
                    ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 text-white shadow-2xl shadow-cyan-500/50 pulse-glow'
                    : 'glass text-white hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 hover:text-white hover-lift'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Transactions</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

