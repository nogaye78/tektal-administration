import StatCard from "../components/StatCard";
import { usePathsList, useConnectedUsers } from "../api/hooks";
import { Map, Users, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const { data: chemins, loading: loadingPaths } = usePathsList();
  const { data: users, loading: loadingUsers } = useConnectedUsers();

  const totalChemins = chemins?.length || 0;
  const totalUsers = users?.length || 0;
  const totalOfficiels =
    chemins?.filter((c) => c.status === "APPROVED")?.length || 0;

  const isLoading = loadingPaths || loadingUsers;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Aperçu global de la plateforme Tektal
        </p>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Ligne 1 */}
        <StatCard
          label="Chemins"
          value={isLoading ? "..." : totalChemins}
          icon={<Map size={24} />}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />

        <StatCard
          label="Utilisateurs"
          value={isLoading ? "..." : totalUsers}
          icon={<Users size={24} />}
          bgColor="bg-purple-100"
          textColor="text-purple-600"
        />

        {/* Ligne 2 centrée */}
        <div className="md:col-span-2 flex justify-center">
          <div className="w-full md:w-1/2">
            <StatCard
              label="Chemins Approuvés"
              value={isLoading ? "..." : totalOfficiels}
              icon={<CheckCircle size={24} />}
              bgColor="bg-green-100"
              textColor="text-green-600"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;