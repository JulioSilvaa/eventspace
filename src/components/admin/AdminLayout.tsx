import React from 'react';
import { useAdminAuth } from '../../contexts/admin/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, FileText, BarChart, Settings } from 'lucide-react';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut, admin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white tracking-tight">EventSpace <span className="text-blue-500">Admin</span></h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <a href="/admin" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </a>
          <a href="/admin/users" className="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl transition-colors">
            <Users className="w-5 h-5 mr-3" />
            Usuários
          </a>
          <a href="/admin/ads" className="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl transition-colors">
            <FileText className="w-5 h-5 mr-3" />
            Anúncios
          </a>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
              {admin?.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{admin?.email}</p>
              <p className="text-xs text-slate-400">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
