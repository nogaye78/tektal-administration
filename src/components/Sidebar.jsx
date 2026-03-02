import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Route, Users, LogOut, Building2 } from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", role: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ✅ Menu selon le rôle
  const adminMenu = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Chemins", path: "/chemins", icon: <Route size={20} /> },
    { name: "Utilisateurs", path: "/utilisateurs", icon: <Users size={20} /> },
    { name: "Etablissements", path: "/etablissements", icon: <Building2 size={20} /> },
  ];

  const etablissementMenu = [
    { name: "Mes Chemins", path: "/mes-chemins", icon: <Route size={20} /> },
  ];

  const menuItems = user.role === "etablissement" ? etablissementMenu : adminMenu;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-30
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-slate-900">
            {user.role === "etablissement" ? "Tektal Etablissement" : "Tektal Admin"}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {user.role === "etablissement" ? "Espace etablissement" : "Panneau de controle"}
          </p>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-[#FEBD00] text-black font-bold shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FEBD00] text-white flex items-center justify-center font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.role === "etablissement" ? "E" : "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.name || (user.role === "etablissement" ? "Etablissement" : "Admin")}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email || ""}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                user.role === "admin" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
              }`}>
                {user.role === "admin" ? "Admin" : "Etablissement"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Deconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;