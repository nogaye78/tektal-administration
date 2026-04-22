
import { useState, useEffect } from "react";
import {
  Search, Map, CheckCircle, PlusCircle, X, Video,
  Loader2, Plus, ChevronDown, ChevronUp, Eye, Trash2,
  EyeOff, ChevronLeft, ChevronRight,
} from "lucide-react";
import { usePathsList, usePathActions, useCreatePath } from "../api/hooks";
import { fetchEtablissements } from "../api/apiService";
import VideoPlayer from "../components/VideoPlayer";

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 50;

const STATUS_COLORS = {
  draft:     "bg-yellow-100 text-yellow-600",
  published: "bg-green-100 text-green-600",
  hidden:    "bg-gray-100 text-gray-600",
  deleted:   "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  draft:     "En attente",
  published: "Approuvé",
  hidden:    "Masqué",
  deleted:   "Supprimé",
};

const ACTION_CONFIG = {
  approve: {
    label:    "Approuver",
    message:  "Voulez-vous approuver ce chemin ?",
    btnClass: "bg-[#FEBD00] text-black hover:bg-yellow-400",
    toastMsg: "Chemin approuvé ✅",
  },
  hide: {
    label:    "Masquer",
    message:  "Voulez-vous masquer ce chemin ?",
    btnClass: "bg-slate-700 text-white hover:bg-slate-800",
    toastMsg: "Chemin masqué",
  },
  delete: {
    label:    "Supprimer",
    message:  "Voulez-vous supprimer définitivement ce chemin ?",
    btnClass: "bg-red-500 text-white hover:bg-red-600",
    toastMsg: "Chemin supprimé",
  },
};

const TABS = [
  { key: "all",      label: "Tous" },
  { key: "draft",    label: "En attente" },
  { key: "published",label: "Approuvés" },
  { key: "hidden",   label: "Masqués" },
  { key: "web",      label: "Web" },
  { key: "mobile",   label: "Mobile" },
];

const EMPTY_FORM = {
  title: "", start_label: "", end_label: "",
  establishment_id: null,
  start_lat: "", start_lng: "", end_lat: "", end_lng: "",
  video_url: "", duration: 0,
  steps: [
    { step_number: 1, start_time: 0,  end_time: 10, text: "" },
    { step_number: 2, start_time: 10, end_time: 20, text: "" },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const CheminDetailModal = ({ chemin, onClose }) => {
  if (!chemin) return null;

  const infoFields = [
    { label: "Départ",   value: chemin.start_label },
    { label: "Arrivée",  value: chemin.end_label },
    { label: "Auteur",   value: chemin.author },
    { label: "Durée",    value: chemin.duration ? `${chemin.duration}s` : "-" },
    { label: "Officiel", value: chemin.is_official ? "Oui ✅" : "Non" },
    {
      label: "Statut",
      value: (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[chemin.status] || "bg-gray-100 text-gray-600"}`}>
          {STATUS_LABELS[chemin.status] || chemin.status}
        </span>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4 py-8">
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{chemin.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{chemin.start_label} → {chemin.end_label}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {chemin.video_url && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Vidéo</p>
              <VideoPlayer url={chemin.video_url} maxHeight="max-h-48" />
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Informations</p>
            <div className="grid grid-cols-2 gap-2">
              {infoFields.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="font-semibold text-slate-800 text-sm">{item.value || "-"}</p>
                </div>
              ))}
            </div>
          </div>

          {chemin.steps?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Étapes ({chemin.steps.length})
              </p>
              <div className="space-y-2">
                {chemin.steps.map((step, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50 flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#FEBD00] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {step.step_number}
                    </div>
                    <div>
                      <p className="text-sm text-slate-800 font-medium">{step.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{step.start_time}s → {step.end_time}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chemin.created_at && (
            <p className="text-xs text-gray-400 text-right border-t pt-2">
              Créé le {new Date(chemin.created_at).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Chemins = () => {
  const { data, loading, error, refetch, updatePath, removePath, addPath } = usePathsList();
  const chemins = data || [];
  const { approve, hide, remove } = usePathActions(updatePath, removePath);
  const { create, loading: creating } = useCreatePath(addPath, refetch);

  // UI state
  const [searchTerm,    setSearchTerm]    = useState("");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [showModal,     setShowModal]     = useState(false);
  const [selectedChemin,setSelectedChemin]= useState(null);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [toast,         setToast]         = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actioning,     setActioning]     = useState(false);

  // Form state
  const [formData,     setFormData]     = useState(EMPTY_FORM);
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState("");
  const [videoName,    setVideoName]    = useState("");
  const [etablissements, setEtablissements] = useState([]);

  // ── Side effects ─────────────────────────────────────────────────────────

  useEffect(() => {
    const loadEtablissements = async () => {
      try {
        const res  = await fetchEtablissements();
        const list = res?.results || res || [];
        setEtablissements(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Erreur chargement etablissements:", err);
      }
    };
    loadEtablissements();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const clearVideoCache = (videoUrl) => {
    if (!videoUrl) return;
    document.querySelectorAll("video").forEach((video) => {
      const sources   = [...video.querySelectorAll("source")];
      const hasUrl    = sources.some((s) => s.src.includes(videoUrl)) || video.src.includes(videoUrl);
      if (!hasUrl) return;
      video.pause();
      sources.forEach((s) => s.removeAttribute("src"));
      video.removeAttribute("src");
      video.load();
    });
  };

  // ── Filtering & pagination ────────────────────────────────────────────────

  const filteredChemins = chemins.filter((c) => {
    const matchSearch = (c.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    let matchStatus   = false;
    if      (filterStatus === "all")    matchStatus = true;
    else if (filterStatus === "web")    matchStatus = c.platform === "web";
    else if (filterStatus === "mobile") matchStatus = c.platform === "mobile" || !c.platform;
    else                                matchStatus = c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalItems = filteredChemins.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filteredChemins.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const counts = {
    all:       chemins.length,
    draft:     chemins.filter((c) => c.status === "draft").length,
    published: chemins.filter((c) => c.status === "published").length,
    hidden:    chemins.filter((c) => c.status === "hidden").length,
    web:       chemins.filter((c) => c.platform === "web").length,
    mobile:    chemins.filter((c) => c.platform === "mobile" || !c.platform).length,
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (safePage > 3) pages.push("...");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleFilterChange = (key) => { setFilterStatus(key); setCurrentPage(1); };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setActioning(true);
    const { chemin, type } = confirmAction;
    if      (type === "approve") await approve(chemin.id);
    else if (type === "hide")    await hide(chemin.id);
    else if (type === "delete") {
      if (chemin.video_url) clearVideoCache(chemin.video_url);
      await remove(chemin.id);
      setTimeout(() => refetch(), 150);
    }
    setActioning(false);
    setConfirmAction(null);
    showToast(ACTION_CONFIG[type].toastMsg, type === "delete" ? "error" : "success");
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoName(file.name);
    setUploadError("");
    setUploading(true);
    try {
      const { uploadToCloudinary } = await import("../api/apiService");
      const { secure_url, duration } = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, video_url: secure_url, duration }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const addStep = () => {
    if (formData.steps.length >= 6) return;
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, { step_number: prev.steps.length + 1, start_time: 0, end_time: 10, text: "" }],
    }));
  };

  const removeStep = (index) => {
    if (formData.steps.length <= 2) return;
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_number: i + 1 })),
    }));
  };

  const updateStep = (index, field, value) => {
    const newSteps    = [...formData.steps];
    newSteps[index]   = { ...newSteps[index], [field]: field.includes("time") ? parseInt(value) || 0 : value };
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.video_url)      { setUploadError("Veuillez uploader une vidéo.");       return; }
    if (!formData.establishment_id){ setUploadError("Veuillez choisir un établissement."); return; }
    await create({
      title:            formData.title,
      start_label:      formData.start_label,
      end_label:        formData.end_label,
      establishment_id: formData.establishment_id,
      start_lat:        formData.start_lat || null,
      start_lng:        formData.start_lng || null,
      end_lat:          formData.end_lat   || null,
      end_lng:          formData.end_lng   || null,
      video_url:        formData.video_url,
      duration:         formData.duration,
      steps:            formData.steps,
    });
    setFormData(EMPTY_FORM);
    setVideoName("");
    setUploadError("");
    setShowModal(false);
    showToast("Chemin créé avec succès ✅");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const HEADER_STATS = [
    { count: counts.draft,     label: "En attente", colorClass: "bg-[#FEBD00]/10 border border-[#FEBD00]/20", textClass: "text-[#FEBD00]", subClass: "text-gray-500" },
    { count: counts.published, label: "Approuvés",  colorClass: "bg-white/10",                                textClass: "text-white",      subClass: "text-slate-400" },
    { count: counts.hidden,    label: "Masqués",    colorClass: "bg-white/10",                                textClass: "text-white",      subClass: "text-slate-400" },
    { count: counts.web,       label: "Web",        colorClass: "bg-blue-50 border border-blue-100",          textClass: "text-blue-600",   subClass: "text-gray-500" },
    { count: counts.mobile,    label: "Mobile",     colorClass: "bg-purple-50 border border-purple-100",      textClass: "text-purple-600", subClass: "text-gray-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2 ${toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
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
                <Map size={14} className="text-[#FEBD00]" />
              </div>
              <span className="text-[#FEBD00] text-sm font-medium">Gestion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Chemins</h1>
            <p className="text-slate-400 text-sm mt-1">{chemins.length} chemin{chemins.length > 1 ? "s" : ""} au total</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {HEADER_STATS.map(({ count, label, colorClass, textClass, subClass }) => (
              <div key={label} className={`${colorClass} rounded-xl px-4 py-3 text-center min-w-[64px]`}>
                <p className={`text-2xl font-bold ${textClass}`}>{count}</p>
                <p className={`text-xs mt-0.5 ${subClass}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un chemin..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm bg-white"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm flex-shrink-0"
          >
            <PlusCircle size={18} />
            <span className="hidden sm:inline">Créer</span>
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${filterStatus === tab.key ? "bg-[#FEBD00] text-black shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${filterStatus === tab.key ? "bg-black/10 text-black" : "bg-gray-100 text-gray-500"}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#FEBD00]" size={32} /></div>}
      {error   && <p className="text-red-500 text-center text-sm bg-red-50 p-3 rounded-xl">Erreur de chargement</p>}
      {!loading && filteredChemins.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
          <Map className="mx-auto mb-3 opacity-10" size={48} />
          <p className="font-medium">Aucun chemin trouvé</p>
        </div>
      )}

      {/* Liste */}
      {!loading && paginated.length > 0 && (
        <div className="space-y-2">
          {paginated.map((chemin) => (
            <div
              key={chemin.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all group ${chemin.status === "draft" ? "border-[#FEBD00]/30" : "border-gray-100"}`}
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                {/* Info */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${chemin.status === "draft" ? "bg-[#FEBD00] text-black" : STATUS_COLORS[chemin.status] || "bg-gray-100 text-gray-500"}`}>
                    <Map size={18} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{chemin.title}</h3>
                    <p className="text-xs text-gray-400">{chemin.start_label} → {chemin.end_label}</p>
                    <p className="text-xs text-gray-400">Par <span className="font-semibold text-slate-600">{chemin.author}</span></p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Statut */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[chemin.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[chemin.status] || chemin.status}
                      </span>
                      {/* Plateforme */}
                      {chemin.platform === "web" ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Web</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">Mobile</span>
                      )}
                      {/* Étapes */}
                      {chemin.steps && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FEBD00]/10 text-yellow-700 font-medium">
                          {chemin.steps.length} étape{chemin.steps.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {/* Durée */}
                      {chemin.duration && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 font-medium">
                          {chemin.duration}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 self-end sm:self-auto items-center flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setSelectedChemin(chemin)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 font-medium border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                  >
                    <Eye size={13} /> Détail
                  </button>
                  {chemin.video_url && (
                    <button
                      onClick={() => setExpandedVideo(expandedVideo === chemin.id ? null : chemin.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 font-medium border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                    >
                      <Video size={13} />
                      {expandedVideo === chemin.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  )}
                  <button onClick={() => setConfirmAction({ chemin, type: "approve" })} title="Approuver"
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#FEBD00]/10 text-yellow-700 hover:bg-[#FEBD00] hover:text-black transition cursor-pointer">
                    <CheckCircle size={16} />
                  </button>
                  <button onClick={() => setConfirmAction({ chemin, type: "hide" })} title="Masquer"
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer">
                    <EyeOff size={16} />
                  </button>
                  <button onClick={() => setConfirmAction({ chemin, type: "delete" })} title="Supprimer"
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Video expanded */}
              {expandedVideo === chemin.id && chemin.video_url && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                  <VideoPlayer url={chemin.video_url} maxHeight="max-h-56" />
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-3">
              <p className="text-xs text-gray-400">
                {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, totalItems)} sur{" "}
                <span className="font-semibold text-gray-600">{totalItems}</span> chemins
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
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition cursor-pointer ${safePage === page ? "bg-[#FEBD00] text-black shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
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

      {/* Detail modal */}
      {selectedChemin && <CheminDetailModal chemin={selectedChemin} onClose={() => setSelectedChemin(null)} />}

      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Confirmer l'action</h2>
              <button onClick={() => setConfirmAction(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>
            <div className={`flex items-center gap-3 rounded-xl p-3.5 border ${confirmAction.type === "delete" ? "bg-red-50 border-red-100" : "bg-[#FEBD00]/10 border-[#FEBD00]/20"}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${confirmAction.type === "delete" ? "bg-red-100 text-red-500" : "bg-[#FEBD00] text-black"}`}>
                <Map size={18} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{confirmAction.chemin.title}</p>
                <p className="text-xs text-gray-400">{confirmAction.chemin.start_label} → {confirmAction.chemin.end_label}</p>
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
                onClick={handleConfirmAction}
                disabled={actioning}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${ACTION_CONFIG[confirmAction.type].btnClass}`}
              >
                {actioning ? <><Loader2 size={16} className="animate-spin" /> En cours...</> : ACTION_CONFIG[confirmAction.type].label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl w-full max-w-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Nouveau Parcours</h2>
                <p className="text-xs text-gray-400 mt-0.5">Remplissez les informations du chemin</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Titre *</label>
                  <input
                    type="text" placeholder="Ex: Chemin vers la plage" value={formData.title} required
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Trajet *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text" placeholder="Départ" value={formData.start_label} required
                      onChange={(e) => setFormData({ ...formData, start_label: e.target.value })}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none"
                    />
                    <select
                      value={formData.end_label} required
                      onChange={(e) => {
                        const selected = etablissements.find((et) => et.name === e.target.value);
                        setFormData({ ...formData, end_label: e.target.value, establishment_id: selected?.id || null });
                      }}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none bg-white"
                    >
                      <option value="">Choisir un établissement</option>
                      {etablissements.map((et) => <option key={et.id} value={et.name}>{et.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Vidéo *</label>
                  <label className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-5 flex flex-col items-center cursor-pointer hover:border-[#FEBD00] hover:bg-[#FEBD00]/5 transition">
                    {uploading ? <Loader2 size={24} className="animate-spin text-[#FEBD00]" /> : <Video size={24} className="text-gray-300 mb-2" />}
                    <span className="text-sm text-gray-400 mt-1 font-medium">
                      {uploading ? "Upload en cours..." : videoName || "Cliquer pour choisir une vidéo"}
                    </span>
                    {formData.video_url && <span className="text-xs text-green-500 mt-1 font-semibold">Vidéo uploadée ✅</span>}
                    {uploadError       && <span className="text-xs text-red-500 mt-1">{uploadError}</span>}
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                  </label>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Étapes ({formData.steps.length}/6)
                    </label>
                    {formData.steps.length < 6 && (
                      <button type="button" onClick={addStep} className="flex items-center gap-1 text-xs text-[#FEBD00] font-semibold cursor-pointer">
                        <Plus size={14} /> Ajouter
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {formData.steps.map((step, index) => (
                      <div key={index} className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50/50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#FEBD00] text-black text-xs font-bold flex items-center justify-center">
                              {step.step_number}
                            </div>
                            <span className="text-xs font-semibold text-gray-500">Étape {step.step_number}</span>
                          </div>
                          {formData.steps.length > 2 && (
                            <button type="button" onClick={() => removeStep(index)} className="text-red-400 text-xs cursor-pointer">
                              Supprimer
                            </button>
                          )}
                        </div>
                        <input
                          type="text" placeholder="Description" value={step.text} required
                          onChange={(e) => updateStep(index, "text", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FEBD00] bg-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" placeholder="Début (s)" value={step.start_time} min="0" required
                            onChange={(e) => updateStep(index, "start_time", e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white" />
                          <input type="number" placeholder="Fin (s)" value={step.end_time} min="1" required
                            onChange={(e) => updateStep(index, "end_time", e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={creating || uploading}
                  className="w-full bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {creating ? <><Loader2 size={18} className="animate-spin" /> Création...</> : "Créer le parcours"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chemins;