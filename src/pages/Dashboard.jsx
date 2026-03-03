import { useEffect } from "react";
import StatCard from "../components/StatCard";
import { usePathsList, useConnectedUsers } from "../api/hooks";
import { Map, Users, CheckCircle, Clock, XCircle, Building2 } from "lucide-react";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isEtablissement = user.role === "etablissement";

  const { data: chemins, loading: loadingPaths, refetch: refetchPaths } = usePathsList();
  const { data: users, loading: loadingUsers, refetch: refetchUsers } = useConnectedUsers();

  useEffect(() => {
    refetchPaths();
    if (!isEtablissement) refetchUsers();
  }, []);

  // ✅ Stats communes
  const totalChemins = chemins?.length || 0;
  const cheminsApprouves = chemins?.filter((c) => c.status === "published")?.length || 0;
  const cheminsRefuses = chemins?.filter((c) => c.status === "hidden")?.length || 0;
  const cheminsEnAttente = chemins?.filter((c) => c.status === "draft")?.length || 0;

  // ✅ Stats admin uniquement
  const totalUsers = users?.length || 0;
  const totalEtablissements = users?.filter((u) => u.role === "etablissement")?.length || 0;

  const isLoading = loadingPaths || (!isEtablissement && loadingUsers);

  // ✅ Dashboard Etablissement
  if (isEtablissement) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Bonjour, {user.username || "Etablissement"} 👋
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Apercu de votre espace etablissement
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            label="Mes Chemins"
            value={isLoading ? "..." : totalChemins}
            icon={<Map size={24} />}
            bgColor="bg-blue-100"
            textColor="text-blue-600"
          />
          <StatCard
            label="Chemins Approuves"
            value={isLoading ? "..." : cheminsApprouves}
            icon={<CheckCircle size={24} />}
            bgColor="bg-green-100"
            textColor="text-green-600"
          />
          <StatCard
            label="Chemins Refuses"
            value={isLoading ? "..." : cheminsRefuses}
            icon={<XCircle size={24} />}
            bgColor="bg-red-100"
            textColor="text-red-600"
          />
          <StatCard
            label="En Attente"
            value={isLoading ? "..." : cheminsEnAttente}
            icon={<Clock size={24} />}
            bgColor="bg-yellow-100"
            textColor="text-yellow-600"
          />
        </div>
      </div>
    );
  }

  // ✅ Dashboard Admin
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-gray-500 text-sm sm:text-base">Apercu global de la plateforme Tektal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Total Chemins"
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
        <StatCard
          label="Chemins Approuves"
          value={isLoading ? "..." : cheminsApprouves}
          icon={<CheckCircle size={24} />}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatCard
          label="Chemins Refuses"
          value={isLoading ? "..." : cheminsRefuses}
          icon={<XCircle size={24} />}
          bgColor="bg-red-100"
          textColor="text-red-600"
        />
        <StatCard
          label="En Attente"
          value={isLoading ? "..." : cheminsEnAttente}
          icon={<Clock size={24} />}
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
        <StatCard
          label="Etablissements"
          value={isLoading ? "..." : totalEtablissements}
          icon={<Building2 size={24} />}
          bgColor="bg-orange-100"
          textColor="text-orange-600"
        />
      </div>
    </div>
  );
};

export default Dashboard;