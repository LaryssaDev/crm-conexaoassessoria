import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Target,
  Trophy,
  Calendar,
  FileText,
  DollarSign,
  Briefcase,
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADM', 'SUPERVISOR_COMERCIAL', 'CONSULTOR_COMERCIAL', 'SUPERVISOR_JURIDICO', 'CONSULTOR_JURIDICO'] },
    { to: '/leads', icon: Users, label: 'Leads', roles: ['ADM', 'SUPERVISOR_COMERCIAL', 'CONSULTOR_COMERCIAL', 'SUPERVISOR_JURIDICO', 'CONSULTOR_JURIDICO'] },
    { to: '/history', icon: Activity, label: 'Andamento', roles: ['ADM', 'SUPERVISOR_COMERCIAL', 'CONSULTOR_COMERCIAL', 'SUPERVISOR_JURIDICO', 'CONSULTOR_JURIDICO'] },
    { to: '/attribution', icon: Briefcase, label: 'Atribuição', roles: ['ADM', 'SUPERVISOR_COMERCIAL', 'SUPERVISOR_JURIDICO'] },
    { to: '/funnel', icon: Target, label: 'Funil', roles: ['ADM', 'SUPERVISOR_COMERCIAL', 'CONSULTOR_COMERCIAL'] },
    { to: '/ranking', icon: Trophy, label: 'Ranking', roles: ['ADM', 'SUPERVISOR_COMERCIAL'] },
    { to: '/agenda', icon: Calendar, label: 'Agenda', roles: ['ADM', 'SUPERVISOR_COMERCIAL', 'CONSULTOR_COMERCIAL', 'SUPERVISOR_JURIDICO', 'CONSULTOR_JURIDICO'] },
    { to: '/team', icon: Users, label: 'Equipe', roles: ['ADM'] },
    { to: '/contract', icon: FileText, label: 'Contrato', roles: ['ADM', 'SUPERVISOR_COMERCIAL', 'CONSULTOR_COMERCIAL'] },
    { to: '/costs', icon: DollarSign, label: 'Custos Fixos', roles: ['ADM', 'FINANCEIRO'] },
    { to: '/financial', icon: DollarSign, label: 'Financeiro', roles: ['ADM', 'FINANCEIRO'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-purple-700 text-white rounded-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-purple-700">CONEXÃO</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {filteredNavItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                {user?.name.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate w-40">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate w-40">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
