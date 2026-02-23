import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Route, Users, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Chemins', path: '/chemins', icon: <Route size={20} /> },
    { name: 'Utilisateurs', path: '/utilisateurs', icon: <Users size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-30
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900">Tektal Admin</h1>
          <p className="text-sm text-gray-500 font-medium">Panneau de contrôle</p>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#FEBD00] text-white font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FEBD00] text-white flex items-center justify-center font-bold">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@tektal.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;