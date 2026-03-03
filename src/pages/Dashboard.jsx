import { useEffect } from "react";
import { usePathsList, useConnectedUsers } from "../api/hooks";
import { Map, Users, CheckCircle, Clock, XCircle, Building2, TrendingUp } from "lucide-react";

const StatCard = ({ label, value, icon, bgColor, textColor, trend }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
      <span className={textColor}>{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide truncate">{label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${textColor}`}>{value}</p>
      {trend !== undefined && (
        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
          <TrendingUp size={10} /> ce mois
        </p>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isEtablissement = user.role === "etablissement";

  const { data: chemins, loading: loadingPaths, refetch: refetchPaths } = usePathsList();
  const { data: users, loading: loadingUsers, refetch: refetchUsers } = useConnectedUsers();

  useEffect(() => {
    refetchPaths();
    refetchUsers();
  }, []);

  const isLoading = loadingPaths || loadingUsers;

  // ✅ Stats Etablissement
  const cheminsEtablissements = chemins?.filter((c) => c.author_role === "etablissement") || [];
  const totalCheiminsEtab = cheminsEtablissements.length;
  const cheminsApprouvesEtab = cheminsEtablissements.filter((c) => c.status === "published").length;
  const cheminsRefusesEtab = cheminsEtablissements.filter((c) => c.status === "hidden").length;
  const totalEtablissements = users?.filter((u) => u.role === "etablissement")?.length || 0;

  // ✅ Stats Admin
  const totalChemins = chemins?.length || 0;
  const totalUsers = users?.length || 0;
  const cheminsApprouves = chemins?.filter((c) => c.status === "published")?.length || 0;
  const cheminsRefuses = chemins?.filter((c) => c.status === "hidden")?.length || 0;
  const cheminsEnAttente = chemins?.filter((c) => c.status === "draft")?.length || 0;

  // ✅ Dashboard Etablissement
  if (isEtablissement) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400 font-medium">Bienvenue 👋</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
              {user.username || "Etablissement"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Apercu de votre espace etablissement
            </p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold self-start sm:self-auto flex items-center gap-2">
            <Building2 size={16} />
            Etablissement
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Vue d'ensemble
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <StatCard
              label="Nombre d'Etablissements"
              value={isLoading ? "..." : totalEtablissements}
              icon={<Building2 size={22} />}
              bgColor="bg-orange-100"
              textColor="text-orange-600"
            />
            <StatCard
              label="Chemins des Etablissements"
              value={isLoading ? "..." : totalCheiminsEtab}
              icon={<Map size={22} />}
              bgColor="bg-blue-100"
              textColor="text-blue-600"
            />
            <StatCard
              label="Chemins Approuves"
              value={isLoading ? "..." : cheminsApprouvesEtab}
              icon={<CheckCircle size={22} />}
              bgColor="bg-green-100"
              textColor="text-green-600"
            />
            <StatCard
              label="Chemins Refuses"
              value={isLoading ? "..." : cheminsRefusesEtab}
              icon={<XCircle size={22} />}
              bgColor="bg-red-100"
              textColor="text-red-600"
            />
          </div>
        </div>

        {/* Barre de progression approbation */}
        {totalCheiminsEtab > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Taux d'approbation</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Approuves</span>
                  <span>{Math.round((cheminsApprouvesEtab / totalCheiminsEtab) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(cheminsApprouvesEtab / totalCheiminsEtab) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Refuses</span>
                  <span>{Math.round((cheminsRefusesEtab / totalCheiminsEtab) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${(cheminsRefusesEtab / totalCheiminsEtab) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ✅ Dashboard Admin
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 font-medium">Bienvenue 👋</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Apercu global de la plateforme Tektal</p>
        </div>
        <div className="bg-[#FEBD00]/20 text-yellow-700 px-4 py-2 rounded-xl text-sm font-semibold self-start sm:self-auto flex items-center gap-2">
          <Users size={16} />
          Administrateur
        </div>
      </div>

      {/* Stats principales */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Vue d'ensemble
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total Chemins"
            value={isLoading ? "..." : totalChemins}
            icon={<Map size={22} />}
            bgColor="bg-blue-100"
            textColor="text-blue-600"
          />
          <StatCard
            label="Utilisateurs"
            value={isLoading ? "..." : totalUsers}
            icon={<Users size={22} />}
            bgColor="bg-purple-100"
            textColor="text-purple-600"
          />
          <StatCard
            label="Etablissements"
            value={isLoading ? "..." : totalEtablissements}
            icon={<Building2 size={22} />}
            bgColor="bg-orange-100"
            textColor="text-orange-600"
          />
        </div>
      </div>

      {/* Stats chemins */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Statut des chemins
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Approuves"
            value={isLoading ? "..." : cheminsApprouves}
            icon={<CheckCircle size={22} />}
            bgColor="bg-green-100"
            textColor="text-green-600"
          />
          <StatCard
            label="En Attente"
            value={isLoading ? "..." : cheminsEnAttente}
            icon={<Clock size={22} />}
            bgColor="bg-yellow-100"
            textColor="text-yellow-600"
          />
          <StatCard
            label="Refuses"
            value={isLoading ? "..." : cheminsRefuses}
            icon={<XCircle size={22} />}
            bgColor="bg-red-100"
            textColor="text-red-600"
          />
        </div>
      </div>

      {/* Barre de progression */}
      {totalChemins > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Taux d'approbation global</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Approuves</span>
                <span>{Math.round((cheminsApprouves / totalChemins) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(cheminsApprouves / totalChemins) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>En attente</span>
                <span>{Math.round((cheminsEnAttente / totalChemins) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FEBD00] rounded-full transition-all duration-500"
                  style={{ width: `${(cheminsEnAttente / totalChemins) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Refuses</span>
                <span>{Math.round((cheminsRefuses / totalChemins) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full transition-all duration-500"
                  style={{ width: `${(cheminsRefuses / totalChemins) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;