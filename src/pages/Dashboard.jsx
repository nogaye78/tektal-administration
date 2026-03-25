import { useEffect } from "react";
import { usePathsList, useConnectedUsers } from "../api/hooks";
import { Map, Users, CheckCircle, Clock, XCircle, Building2 } from "lucide-react";

const StatCard = ({ label, value, icon, active, subtitle }) => (
  <div className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${
    active ? "bg-[#FEBD00] border-[#FEBD00]" : "bg-white border-gray-100"
  }`}>
    <div className="flex items-center justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
        active ? "bg-black/10" : "bg-[#FEBD00]/10"
      }`}>
        <span className={active ? "text-black" : "text-[#FEBD00]"}>{icon}</span>
      </div>
      {subtitle && (
        <span className={`text-xs px-2 py-1 rounded-lg ${active ? "bg-black/10 text-black" : "bg-gray-50 text-gray-400"}`}>
          {subtitle}
        </span>
      )}
    </div>
    <div>
      <p className={`text-3xl font-bold ${active ? "text-black" : "text-slate-800"}`}>{value}</p>
      <p className={`text-sm mt-0.5 font-medium ${active ? "text-black/60" : "text-gray-400"}`}>{label}</p>
    </div>
  </div>
);

const SummaryRow = ({ label, value, icon, loading, active }) => (
  <div className={`flex items-center justify-between p-3.5 rounded-xl ${
    active ? "bg-[#FEBD00]/10 border border-[#FEBD00]/20" : "bg-gray-50"
  }`}>
    <div className={`flex items-center gap-2 font-medium text-sm ${active ? "text-yellow-700" : "text-slate-600"}`}>
      {icon}
      {label}
    </div>
    <span className={`font-bold text-lg ${active ? "text-yellow-700" : "text-slate-700"}`}>
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
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FEBD00]/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FEBD00]/5 rounded-full translate-y-10 -translate-x-10" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FEBD00]/20 flex items-center justify-center">
                  <Building2 size={16} className="text-[#FEBD00]" />
                </div>
                <span className="text-[#FEBD00] text-sm font-medium">Espace Etablissement</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Bonjour, {user.username || "Etablissement"}
              </h1>
              <p className="text-slate-400 text-sm mt-1">Voici l'apercu de votre activite</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-[#FEBD00]/10 border border-[#FEBD00]/20 rounded-xl px-4 py-3 text-center min-w-[64px]">
                <p className="text-2xl font-bold text-[#FEBD00]">{isLoading ? "..." : totalCheiminsEtab}</p>
                <p className="text-xs text-slate-400 mt-0.5">Chemins</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[64px]">
                <p className="text-2xl font-bold text-white">{isLoading ? "..." : cheminsApprouvesEtab}</p>
                <p className="text-xs text-slate-400 mt-0.5">Approuves</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Etablissements" value={isLoading ? "..." : totalEtablissements} icon={<Building2 size={20} />} />
          <StatCard label="Total Chemins" value={isLoading ? "..." : totalCheiminsEtab} icon={<Map size={20} />} active />
          <StatCard label="Approuves" value={isLoading ? "..." : cheminsApprouvesEtab} icon={<CheckCircle size={20} />} />
          <StatCard label="Masques" value={isLoading ? "..." : cheminsRefusesEtab} icon={<XCircle size={20} />} />
        </div>

        {/* Resume */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-slate-800 mb-1">Resume des chemins</h2>
          <SummaryRow label="Chemins approuves" value={cheminsApprouvesEtab} icon={<CheckCircle size={15} />} loading={isLoading} />
          <SummaryRow label="Chemins en attente" value={cheminsAttenteEtab} icon={<Clock size={15} />} loading={isLoading} active />
          <SummaryRow label="Chemins Masqués" value={cheminsRefusesEtab} icon={<XCircle size={15} />} loading={isLoading} />
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
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FEBD00]/5 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#FEBD00]/20 flex items-center justify-center">
                <Users size={16} className="text-[#FEBD00]" />
              </div>
              <span className="text-[#FEBD00] text-sm font-medium">Panneau Administrateur</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Apercu global de la plateforme Tektal</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-[#FEBD00]/10 border border-[#FEBD00]/20 rounded-xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-2xl font-bold text-[#FEBD00]">{isLoading ? "..." : totalChemins}</p>
              <p className="text-xs text-slate-400 mt-0.5">Chemins</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-2xl font-bold text-white">{isLoading ? "..." : totalUsers}</p>
              <p className="text-xs text-slate-400 mt-0.5">Utilisateurs</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-2xl font-bold text-white">{isLoading ? "..." : totalEtablissements}</p>
              <p className="text-xs text-slate-400 mt-0.5">Etablissements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats principales */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Vue d'ensemble</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Chemins" value={isLoading ? "..." : totalChemins} icon={<Map size={20} />} active subtitle="Tous statuts" />
          <StatCard label="Utilisateurs" value={isLoading ? "..." : totalUsers} icon={<Users size={20} />} subtitle="Actifs" />
          <StatCard label="Etablissements" value={isLoading ? "..." : totalEtablissements} icon={<Building2 size={20} />} subtitle="Enregistres" />
        </div>
      </div>

      {/* Stats chemins + Resume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Statut des chemins</p>
          <StatCard label="Approuves" value={isLoading ? "..." : cheminsApprouves} icon={<CheckCircle size={20} />} />
          <StatCard label="En Attente" value={isLoading ? "..." : cheminsEnAttente} icon={<Clock size={20} />} active />
          <StatCard label="Masques" value={isLoading ? "..." : cheminsRefuses} icon={<XCircle size={20} />} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-slate-800 mb-1">Resume rapide</h2>
          <SummaryRow label="Chemins approuves" value={cheminsApprouves} icon={<CheckCircle size={15} />} loading={isLoading} />
          <SummaryRow label="En attente" value={cheminsEnAttente} icon={<Clock size={15} />} loading={isLoading} active />
          <SummaryRow label="Chemins Masques" value={cheminsRefuses} icon={<XCircle size={15} />} loading={isLoading} />
          <SummaryRow label="Etablissements" value={totalEtablissements} icon={<Building2 size={15} />} loading={isLoading} />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;