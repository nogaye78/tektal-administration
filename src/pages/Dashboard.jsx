import StatCard from "../components/StatCard";
import { usePathsList, useConnectedUsers } from "../api/hooks";

const Dashboard = () => {
  const { data: chemins, loading: loadingPaths } = usePathsList();
  const { data: users, loading: loadingUsers } = useConnectedUsers();

  const totalChemins = chemins?.length || 0;
  const totalUsers = users?.length || 0;
  const totalOfficiels = chemins?.filter(c => c.status === "APPROVED")?.length || 0;
  const totalVues = chemins?.reduce((acc, c) => acc + (c.views || 0), 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-gray-500 text-sm sm:text-base">Aperçu global de la plateforme Tektal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard label="Chemins" value={loadingPaths ? "..." : totalChemins} />
        <StatCard label="Utilisateurs" value={loadingUsers ? "..." : totalUsers} />
        <StatCard label="Approuvés" value={loadingPaths ? "..." : totalOfficiels} />
        <StatCard label="Vues totales" value={loadingPaths ? "..." : totalVues} />
      </div>
    </div>
  );
};

export default Dashboard;