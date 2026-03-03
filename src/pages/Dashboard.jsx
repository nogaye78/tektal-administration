import { useEffect } from "react";
import { usePathsList, useConnectedUsers } from "../api/hooks";
import { Map, Users, CheckCircle, Clock, XCircle, Building2 } from "lucide-react";

const StatCard = ({ label, value, icon, bgColor, textColor, subtitle }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
    <div className="flex items-center justify-between">
      <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center`}>
        <span className={textColor}>{icon}</span>
      </div>
      {subtitle && (
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{subtitle}</span>
      )}
    </div>
    <div>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      <p className="text-sm text-gray-400 mt-0.5 font-medium">{label}</p>
    </div>
  </div>
);

const SummaryRow = ({ label, value, color, bg, icon, loading }) => (
  <div className={`flex items-center justify-between p-3.5 ${bg} rounded-xl`}>
    <div className={`flex items-center gap-2 ${color} font-medium text-sm`}>
      {icon}
      {label}
    </div>
    <span className={`font-bold text-lg ${color}`}>
      {loading ? "..." : value}
    </span>
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

  const cheminsEtablissements = chemins?.filter((c) => c.author_role === "etablissement") || [];
  const totalCheiminsEtab = cheminsEtablissements.length;
  const cheminsApprouvesEtab = cheminsEtablissements.filter((c) => c.status === "published").length;
  const cheminsRefusesEtab = cheminsEtablissements.filter((c) => c.status === "hidden").length;
  const cheminsAttenteEtab = cheminsEtablissements.filter((c) => c.status === "draft").length;
  const totalEtablissements = users?.filter((u) => u.role === "etablissement")?.length || 0;

  const totalChemins = chemins?.length || 0;
  const totalUsers = users?.length || 0;
  const cheminsApprouves = chemins?.filter((c) => c.status === "published")?.length || 0;
  const cheminsRefuses = chemins?.filter((c) => c.status === "hidden")?.length || 0;
  const cheminsEnAttente = chemins?.filter((c) => c.status === "draft")?.length || 0;

  // ===========================
  // DASHBOARD ETABLISSEMENT
  // ===========================
  if (isEtablissement) {
    return (
      <div className="space-y-6">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FEBD00]/10 rounded-full translate-y-10 -translate-x-10" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Building2 size={16} className="text-blue-400" />
                </div>
                <span className="text-blue-400 text-sm font-medium">Espace Etablissement</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Bonjour, {user.username || "Etablissement"} 👋
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Voici l'apercu de votre activite
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-white">{isLoading ? "..." : totalCheiminsEtab}</p>
                <p className="text-xs text-slate-400 mt-0.5">Chemins</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-green-400">{isLoading ? "..." : cheminsApprouvesEtab}</p>
                <p className="text-xs text-slate-400 mt-0.5">Approuves</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Etablissements"
            value={isLoading ? "..." : totalEtablissements}
            icon={<Building2 size={20} />}
            bgColor="bg-orange-100"
            textColor="text-orange-500"
          />
          <StatCard
            label="Total Chemins"
            value={isLoading ? "..." : totalCheiminsEtab}
            icon={<Map size={20} />}
            bgColor="bg-blue-100"
            textColor="text-blue-500"
          />
          <StatCard
            label="Approuves"
            value={isLoading ? "..." : cheminsApprouvesEtab}
            icon={<CheckCircle size={20} />}
            bgColor="bg-green-100"
            textColor="text-green-500"
          />
          <StatCard
            label="Refuses"
            value={isLoading ? "..." : cheminsRefusesEtab}
            icon={<XCircle size={20} />}
            bgColor="bg-red-100"
            textColor="text-red-500"
          />
        </div>

        {/* Resume */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-slate-800 mb-4">Resume des chemins</h2>
          <SummaryRow label="Chemins approuves" value={cheminsApprouvesEtab} color="text-green-500" bg="bg-green-50" icon={<CheckCircle size={16} />} loading={isLoading} />
          <SummaryRow label="Chemins en attente" value={cheminsAttenteEtab} color="text-yellow-600" bg="bg-yellow-50" icon={<Clock size={16} />} loading={isLoading} />
          <SummaryRow label="Chemins refuses" value={cheminsRefusesEtab} color="text-red-500" bg="bg-red-50" icon={<XCircle size={16} />} loading={isLoading} />
        </div>

      </div>
    );
  }

  // ===========================
  // DASHBOARD ADMIN
  // ===========================
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FEBD00]/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#FEBD00]/20 flex items-center justify-center">
                <Users size={16} className="text-[#FEBD00]" />
              </div>
              <span className="text-[#FEBD00] text-sm font-medium">Panneau Administrateur</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Apercu global de la plateforme Tektal</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold text-white">{isLoading ? "..." : totalChemins}</p>
              <p className="text-xs text-slate-400 mt-0.5">Chemins</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold text-[#FEBD00]">{isLoading ? "..." : totalUsers}</p>
              <p className="text-xs text-slate-400 mt-0.5">Utilisateurs</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold text-orange-400">{isLoading ? "..." : totalEtablissements}</p>
              <p className="text-xs text-slate-400 mt-0.5">Etablissements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats principales */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Vue d'ensemble
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Chemins"
            value={isLoading ? "..." : totalChemins}
            icon={<Map size={20} />}
            bgColor="bg-blue-100"
            textColor="text-blue-500"
            subtitle="Tous statuts"
          />
          <StatCard
            label="Utilisateurs"
            value={isLoading ? "..." : totalUsers}
            icon={<Users size={20} />}
            bgColor="bg-purple-100"
            textColor="text-purple-500"
            subtitle="Actifs"
          />
          <StatCard
            label="Etablissements"
            value={isLoading ? "..." : totalEtablissements}
            icon={<Building2 size={20} />}
            bgColor="bg-orange-100"
            textColor="text-orange-500"
            subtitle="Enregistres"
          />
        </div>
      </div>

      {/* Stats chemins + Resume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Stats chemins */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Statut des chemins
          </p>
          <div className="grid grid-cols-1 gap-3">
            <StatCard
              label="Approuves"
              value={isLoading ? "..." : cheminsApprouves}
              icon={<CheckCircle size={20} />}
              bgColor="bg-green-100"
              textColor="text-green-500"
            />
            <StatCard
              label="En Attente"
              value={isLoading ? "..." : cheminsEnAttente}
              icon={<Clock size={20} />}
              bgColor="bg-yellow-100"
              textColor="text-yellow-600"
            />
            <StatCard
              label="Refuses"
              value={isLoading ? "..." : cheminsRefuses}
              icon={<XCircle size={20} />}
              bgColor="bg-red-100"
              textColor="text-red-500"
            />
          </div>
        </div>

        {/* Resume rapide */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-slate-800 mb-4">Resume rapide</h2>
          <SummaryRow label="Chemins approuves" value={cheminsApprouves} color="text-green-500" bg="bg-green-50" icon={<CheckCircle size={16} />} loading={isLoading} />
          <SummaryRow label="Chemins en attente" value={cheminsEnAttente} color="text-yellow-600" bg="bg-yellow-50" icon={<Clock size={16} />} loading={isLoading} />
          <SummaryRow label="Chemins refuses" value={cheminsRefuses} color="text-red-500" bg="bg-red-50" icon={<XCircle size={16} />} loading={isLoading} />
          <SummaryRow label="Etablissements" value={totalEtablissements} color="text-orange-500" bg="bg-orange-50" icon={<Building2 size={16} />} loading={isLoading} />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;