import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900">
      {/* Barre latérale fixe */}
      <Sidebar />

      {/* Zone de contenu à droite (décalée de la largeur de la sidebar) */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;