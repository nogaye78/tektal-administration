import { useState, useEffect } from "react";
import { Building2, Search, Trash2, X, MapPin, Mail, Route, Loader2, Map, EyeOff, ChevronDown, ChevronUp, Eye, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchEtablissements, deleteEtablissement, deleteEtablissementPath, hideEtablissementPath, approveEtablissementPath } from "../api/apiService";

const ITEMS_PER_PAGE = 10;

const STATUS_COLORS = {
  draft: "bg-yellow-100 text-yellow-600",
  published: "bg-green-100 text-green-600",
  hidden: "bg-gray-100 text-gray-600",
  deleted: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  draft: "En attente",
  published: "Approuve",
  hidden: "Masque",
  deleted: "Supprime",
};

const Etablissements = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [etabToDelete, setEtabToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Expanded paths par établissement
  const [expandedEtab, setExpandedEtab] = useState(null);
  const [expandedVideo, setExpandedVideo] = useState(null);

  // ✅ Confirmation action sur chemin
  const [confirmAction, setConfirmAction] = useState(null); // { path, etabId, type: 'hide'|'delete' }
  const [actioning, setActioning] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchEtablissements();
      const list = response?.results || response || [];
      setData(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDeleteEtab = async () => {
    setDeleting(true);
    try {
      await deleteEtablissement(etabToDelete.id);
      setEtabToDelete(null);
      load();
      showToast("Etablissement supprimé avec succès");
    } catch (err) {
      console.error(err);
    }
    setDeleting(false);
  };

  // ✅ Action sur chemin d'un établissement
  const handleConfirmPathAction = async () => {
    if (!confirmAction) return;
    setActioning(true);
    const { path, type } = confirmAction;
    try {
      if (type === "delete") {
        const res = await deleteEtablissementPath(path.id);
        if (res.ok || res.status === 204 || res.status === 200) {
          showToast("Chemin supprimé", "success");
        }
      } else if (type === "hide") {
        await hideEtablissementPath(path.id);
        showToast("Chemin masqué", "success");
      } else if (type === "approve") {
        await approveEtablissementPath(path.id);
        showToast("Chemin approuvé ✅", "success");
      }
      await load();
    } catch (err) {
      console.error(err);
      showToast("Une erreur est survenue", "error");
    }
    setActioning(false);
    setConfirmAction(null);
  };

  const ACTION_CONFIG = {
    approve: {
      label: "Approuver",
      message: "Voulez-vous approuver ce chemin ?",
      btnClass: "bg-[#FEBD00] text-black hover:bg-yellow-400",
    },
    hide: {
      label: "Masquer",
      message: "Voulez-vous masquer ce chemin ?",
      btnClass: "bg-slate-700 text-white hover:bg-slate-800",
    },
    delete: {
      label: "Supprimer",
      message: "Voulez-vous supprimer définitivement ce chemin ?",
      btnClass: "bg-red-500 text-white hover:bg-red-600",
    },
  };

  const filtered = data.filter((e) =>
    (e.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.user_email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Pagination
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-2xl shadow-lg text-sm font-bold flex items-center gap-2 ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          {toast.type === "error" ? "🚫" : "✅"} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FEBD00]/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FEBD00]/5 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#FEBD00]/20 flex items-center justify-center">
                <Building2 size={14} className="text-[#FEBD00]" />
              </div>
              <span className="text-[#FEBD00] text-sm font-medium">Gestion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Etablissements</h1>
            <p className="text-slate-400 text-sm mt-1">
              {data.length} etablissement{data.length > 1 ? "s" : ""} enregistres
            </p>
          </div>
          <div className="bg-[#FEBD00]/10 border border-[#FEBD00]/20 rounded-xl px-5 py-3 text-center">
            <p className="text-3xl font-bold text-[#FEBD00]">{data.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher un etablissement..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm bg-white"
        />
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#FEBD00]" size={32} /></div>}
      {error && <p className="text-red-500 text-center text-sm bg-red-50 p-3 rounded-xl">Erreur de chargement</p>}

      {!loading && filtered.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
          <Building2 className="mx-auto mb-3 opacity-10" size={48} />
          <p className="font-medium">Aucun etablissement trouve</p>
          <p className="text-xs mt-1">Modifiez votre recherche</p>
        </div>
      )}

      {/* ✅ Liste paginée */}
      {!loading && paginated.length > 0 && (
        <div className="space-y-2">
          {paginated.map((etab) => (
            <div key={etab.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">

              {/* Ligne principale établissement */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#FEBD00] text-black flex items-center justify-center font-bold text-base flex-shrink-0">
                    {etab.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{etab.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Mail size={11} className="flex-shrink-0" />
                      {etab.user_email || "-"}
                    </p>
                    {etab.lat && etab.lng && (
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <MapPin size={11} className="flex-shrink-0" />
                        {etab.lat}, {etab.lng}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#FEBD00]/10 text-yellow-700 font-medium flex items-center gap-1">
                        <Route size={10} />
                        {etab.total_paths || 0} chemin{etab.total_paths > 1 ? "s" : ""}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                        Cree le {new Date(etab.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-auto flex-shrink-0 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  {/* ✅ Bouton voir les chemins */}
                  {etab.paths?.length > 0 && (
                    <button
                      onClick={() => setExpandedEtab(expandedEtab === etab.id ? null : etab.id)}
                      className="flex items-center gap-1.5 text-xs text-slate-600 font-medium border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                    >
                      <Map size={13} />
                      Chemins ({etab.paths.length})
                      {expandedEtab === etab.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  )}
                  {/* Supprimer établissement */}
                  <button
                    onClick={() => setEtabToDelete(etab)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              {/* ✅ Section chemins de l'établissement (dépliable) */}
              {expandedEtab === etab.id && etab.paths?.length > 0 && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Chemins de {etab.name}
                  </p>
                  {etab.paths.map((path) => (
                    <div key={path.id} className={`rounded-xl border overflow-hidden ${
                      path.status === "draft" ? "border-[#FEBD00]/30 bg-[#FEBD00]/5" : "border-gray-100 bg-gray-50/50"
                    }`}>
                      <div className="p-3 flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            STATUS_COLORS[path.status] || "bg-gray-100 text-gray-500"
                          }`}>
                            <Map size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">{path.title}</p>
                            <p className="text-xs text-gray-400">{path.start_label} → {path.end_label}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[path.status] || "bg-gray-100 text-gray-600"}`}>
                                {STATUS_LABELS[path.status] || path.status}
                              </span>
                              {path.duration && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                  {path.duration}s
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions chemin */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {path.video_url && (
                            <button
                              onClick={() => setExpandedVideo(expandedVideo === path.id ? null : path.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 transition cursor-pointer"
                              title="Voir video"
                            >
                              {expandedVideo === path.id ? <ChevronUp size={13} /> : <Eye size={13} />}
                            </button>
                          )}
                          {/* Approuver */}
                          <button
                            onClick={() => setConfirmAction({ path, etabId: etab.id, type: "approve" })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FEBD00]/10 text-yellow-700 hover:bg-[#FEBD00] hover:text-black transition cursor-pointer"
                            title="Approuver"
                          >
                            <CheckCircle size={14} />
                          </button>
                          {/* Masquer */}
                          <button
                            onClick={() => setConfirmAction({ path, etabId: etab.id, type: "hide" })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-slate-200 hover:text-slate-600 transition cursor-pointer"
                            title="Masquer"
                          >
                            <EyeOff size={14} />
                          </button>
                          {/* Supprimer chemin */}
                          <button
                            onClick={() => setConfirmAction({ path, etabId: etab.id, type: "delete" })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Video dépliable */}
                      {expandedVideo === path.id && path.video_url && (
                        <div className="px-3 pb-3 border-t border-gray-100 pt-2">
                          <video src={path.video_url} controls className="w-full rounded-xl max-h-48 bg-black" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* ✅ Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-3">
              <p className="text-xs text-gray-400">
                {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, totalItems)} sur{" "}
                <span className="font-semibold text-gray-600">{totalItems}</span> etablissements
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                {getPageNumbers().map((page, i) =>
                  page === "..." ? (
                    <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        safePage === page ? "bg-[#FEBD00] text-black shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ Modal confirmation action chemin */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Confirmer l'action</h2>
              <button onClick={() => setConfirmAction(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>
            <div className={`flex items-center gap-3 rounded-xl p-3.5 border ${
              confirmAction.type === "delete" ? "bg-red-50 border-red-100" : "bg-[#FEBD00]/10 border-[#FEBD00]/20"
            }`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                confirmAction.type === "delete" ? "bg-red-100 text-red-500" : "bg-[#FEBD00] text-black"
              }`}>
                <Map size={18} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{confirmAction.path.title}</p>
                <p className="text-xs text-gray-400">{confirmAction.path.start_label} → {confirmAction.path.end_label}</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {ACTION_CONFIG[confirmAction.type].message}
              {confirmAction.type === "delete" && (
                <span className="text-red-500 font-semibold"> Cette action est irréversible.</span>
              )}
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm cursor-pointer font-semibold">
                Annuler
              </button>
              <button
                onClick={handleConfirmPathAction}
                disabled={actioning}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${ACTION_CONFIG[confirmAction.type].btnClass}`}
              >
                {actioning ? <><Loader2 size={16} className="animate-spin" /> En cours...</> : ACTION_CONFIG[confirmAction.type].label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression établissement */}
      {etabToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Supprimer l'etablissement</h2>
              <button onClick={() => setEtabToDelete(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FEBD00] text-black flex items-center justify-center font-bold text-base flex-shrink-0">
                {etabToDelete.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{etabToDelete.name}</p>
                <p className="text-xs text-gray-400">{etabToDelete.user_email}</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Cette action est <span className="text-red-500 font-semibold">irreversible</span>. L'etablissement et son compte utilisateur seront definitivement supprimes.
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEtabToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm cursor-pointer font-semibold">
                Annuler
              </button>
              <button
                onClick={handleDeleteEtab}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition text-sm cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <><Loader2 size={16} className="animate-spin" /> Suppression...</> : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Etablissements;