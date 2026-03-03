import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chemins from "./pages/Chemins";
import Utilisateurs from "./pages/Utilisateurs";
import Etablissements from "./pages/Etablissements";
import MesChemins from "./pages/MesChemins";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-h-screen bg-gray-50">
        <div className="lg:hidden flex items-center gap-4 p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-700 hover:text-[#FEBD00] transition-colors cursor-pointer"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-slate-900">
            {user.role === "etablissement" ? "Tektal Etablissement" : "Tektal Admin"}
          </h1>
        </div>
        <main className="p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* ✅ Redirige / vers /dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ✅ Dashboard - accessible aux 2 rôles */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } />

        {/* ✅ Admin uniquement */}
        <Route path="/chemins" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Layout><Chemins /></Layout>
          </PrivateRoute>
        } />
        <Route path="/utilisateurs" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Layout><Utilisateurs /></Layout>
          </PrivateRoute>
        } />
        <Route path="/etablissements" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Layout><Etablissements /></Layout>
          </PrivateRoute>
        } />

        {/* ✅ Etablissement uniquement */}
        <Route path="/mes-chemins" element={
          <PrivateRoute allowedRoles={["etablissement"]}>
            <Layout><MesChemins /></Layout>
          </PrivateRoute>
        } />

        {/* ✅ Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;