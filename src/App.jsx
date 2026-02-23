import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chemins from "./pages/Chemins";
import Utilisateurs from "./pages/Utilisateurs";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-h-screen bg-gray-50">
        {/* Header mobile avec hamburger */}
        <div className="lg:hidden flex items-center gap-4 p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-700 hover:text-[#FEBD00] transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-slate-900">Tektal Admin</h1>
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
        <Route path="/" element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } />
        <Route path="/chemins" element={
          <PrivateRoute>
            <Layout><Chemins /></Layout>
          </PrivateRoute>
        } />
        <Route path="/utilisateurs" element={
          <PrivateRoute>
            <Layout><Utilisateurs /></Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;