import { useState, useEffect } from "react";
import { Search, Map, CheckCircle, PlusCircle, X, Video, Loader2, Plus, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { usePathsList, usePathActions, useCreatePath } from "../api/hooks";
import { fetchEtablissements } from "../api/apiService";

const STATUS_COLORS = {
  draft: "bg-yellow-100 text-yellow-600",
  published: "bg-green-100 text-green-600",
  hidden: "bg-gray-100 text-gray-600",
  deleted: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  draft: "En attente",
  published: "Approuve",
  hidden: "Refuse",
  deleted: "Supprime",
};

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "tektal_videos");
  const res = await fetch("https://api.cloudinary.com/v1_1/dqcc8n1th/video/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || "Upload echoue");
  return { secure_url: data.secure_url, duration: Math.round(data.duration || 60) };
};

const CheminDetailModal = ({ chemin, onClose }) => {
  if (!chemin) return null;
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Video</p>
              <video src={chemin.video_url} controls className="w-full rounded-xl max-h-48 bg-black" />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Informations</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Depart", value: chemin.start_label },
                { label: "Arrivee", value: chemin.end_label },
                { label: "Auteur", value: chemin.author },
                { label: "Duree", value: chemin.duration ? `${chemin.duration}s` : "-" },
                { label: "Officiel", value: chemin.is_official ? "Oui" : "Non" },
                {
                  label: "Statut", value: (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[chemin.status] || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[chemin.status] || chemin.status}
                    </span>
                  )
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="font-semibold text-slate-800 text-sm">{item.value || "-"}</p>
                </div>
              ))}
            </div>
          </div>
          {chemin.steps?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Etapes ({chemin.steps.length})</p>
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
              Cree le {new Date(chemin.created_at).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Chemins = () => {
  const { data, loading, error, refetch } = usePathsList();
  const chemins = data || [];
  const { approve, reject } = usePathActions(refetch);
  const { create, loading: creating } = useCreatePath(refetch);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedChemin, setSelectedChemin] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [videoName, setVideoName] = useState("");
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [etablissements, setEtablissements] = useState([]);

  const [formData, setFormData] = useState({
    title: "", start_label: "", end_label: "",
    start_lat: "", start_lng: "", end_lat: "", end_lng: "",
    video_url: "", duration: 0,
    steps: [
      { step_number: 1, start_time: 0, end_time: 10, text: "" },
      { step_number: 2, start_time: 10, end_time: 20, text: "" },
    ],
  });

  // ✅ Charger les établissements
  useEffect(() => {
    const loadEtablissements = async () => {
      try {
        const data = await fetchEtablissements();
        const list = data?.results || data || [];
        setEtablissements(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Erreur chargement etablissements:", err);
      }
    };
    loadEtablissements();
  }, []);

  const filteredChemins = chemins.filter((c) => {
    const matchSearch = (c.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: chemins.length,
    draft: chemins.filter((c) => c.status === "draft").length,
    published: chemins.filter((c) => c.status === "published").length,
    hidden: chemins.filter((c) => c.status === "hidden").length,
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoName(file.name);
    setUploadError("");
    setUploading(true);
    try {
      const { secure_url, duration } = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, video_url: secure_url, duration }));
    } catch (err) { setUploadError(err.message); }
    finally { setUploading(false); }
  };

  const addStep = () => {
    if (formData.steps.length >= 6) return;
    setFormData((prev) => ({ ...prev, steps: [...prev.steps, { step_number: prev.steps.length + 1, start_time: 0, end_time: 10, text: "" }] }));
  };

  const removeStep = (index) => {
    if (formData.steps.length <= 2) return;
    setFormData((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_number: i + 1 })) }));
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: field.includes("time") ? parseInt(value) || 0 : value };
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.video_url) { setUploadError("Veuillez uploader une video."); return; }
    await create({
      title: formData.title,
      start_label: formData.start_label,
      end_label: formData.end_label,
      start_lat: formData.start_lat || null,
      start_lng: formData.start_lng || null,
      end_lat: formData.end_lat || null,
      end_lng: formData.end_lng || null,
      video_url: formData.video_url,
      duration: formData.duration,
      steps: formData.steps,
    });
    setFormData({
      title: "", start_label: "", end_label: "",
      start_lat: "", start_lng: "", end_lat: "", end_lng: "",
      video_url: "", duration: 0,
      steps: [
        { step_number: 1, start_time: 0, end_time: 10, text: "" },
        { step_number: 2, start_time: 10, end_time: 20, text: "" },
      ],
    });
    setVideoName(""); setUploadError(""); setShowModal(false);
  };

  const tabs = [
    { key: "all", label: "Tous" },
    { key: "draft", label: "En attente" },
    { key: "published", label: "Approuves" },
    { key: "hidden", label: "Refuses" },
  ];

  return (
    <div className="space-y-6">

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
            <div className="bg-[#FEBD00]/10 border border-[#FEBD00]/20 rounded-xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-2xl font-bold text-[#FEBD00]">{counts.draft}</p>
              <p className="text-xs text-slate-400 mt-0.5">En attente</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-2xl font-bold text-white">{counts.published}</p>
              <p className="text-xs text-slate-400 mt-0.5">Approuves</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-2xl font-bold text-white">{counts.hidden}</p>
              <p className="text-xs text-slate-400 mt-0.5">Refuses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Tabs + Bouton */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text" placeholder="Rechercher un chemin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm bg-white"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm flex-shrink-0"
          >
            <PlusCircle size={18} />
            <span className="hidden sm:inline">Creer</span>
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterStatus === tab.key
                  ? "bg-[#FEBD00] text-black shadow-sm"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                filterStatus === tab.key ? "bg-black/10 text-black" : "bg-gray-100 text-gray-500"
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#FEBD00]" size={32} /></div>}
      {error && <p className="text-red-500 text-center text-sm bg-red-50 p-3 rounded-xl">Erreur de chargement</p>}

      {!loading && filteredChemins.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
          <Map className="mx-auto mb-3 opacity-10" size={48} />
          <p className="font-medium">Aucun chemin trouve</p>
          <p className="text-xs mt-1">Modifiez vos filtres</p>
        </div>
      )}

      {/* Liste */}
      <div className="space-y-2">
        {filteredChemins.map((chemin) => (
          <div key={chemin.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all group ${
            chemin.status === "draft" ? "border-[#FEBD00]/30" : "border-gray-100"
          }`}>
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  chemin.status === "draft" ? "bg-[#FEBD00] text-black" : STATUS_COLORS[chemin.status] || "bg-gray-100 text-gray-500"
                }`}>
                  <Map size={18} />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">{chemin.title}</h3>
                  <p className="text-xs text-gray-400">{chemin.start_label} → {chemin.end_label}</p>
                  <p className="text-xs text-gray-400">Par <span className="font-semibold text-slate-600">{chemin.author}</span></p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[chemin.status] || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[chemin.status] || chemin.status}
                    </span>
                    {chemin.steps && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#FEBD00]/10 text-yellow-700 font-medium">
                        {chemin.steps.length} etape{chemin.steps.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {chemin.duration && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 font-medium">
                        {chemin.duration}s
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 self-end sm:self-auto items-center flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setSelectedChemin(chemin)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 font-medium border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  <Eye size={13} /> Detail
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
                <button
                  onClick={() => approve(chemin.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#FEBD00]/10 text-yellow-700 hover:bg-[#FEBD00] hover:text-black transition cursor-pointer"
                  title="Approuver"
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  onClick={() => reject(chemin.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                  title="Refuser"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {expandedVideo === chemin.id && chemin.video_url && (
              <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                <video src={chemin.video_url} controls className="w-full rounded-xl max-h-56 bg-black" />
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedChemin && <CheminDetailModal chemin={selectedChemin} onClose={() => setSelectedChemin(null)} />}

      {/* Modal création */}
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

                {/* Titre */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Titre *</label>
                  <input type="text" placeholder="Ex: Chemin vers la plage"
                    value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none" required
                  />
                </div>

                {/* Trajet */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Trajet *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Départ */}
                    <input
                      type="text" placeholder="Depart"
                      value={formData.start_label}
                      onChange={(e) => setFormData({ ...formData, start_label: e.target.value })}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none"
                      required
                    />
                    {/* ✅ Destination = sélection établissement */}
                    <select
                      value={formData.end_label}
                      onChange={(e) => {
                        const selected = etablissements.find(et => et.name === e.target.value);
                        setFormData({
                          ...formData,
                          end_label: e.target.value,
                          end_lat: selected?.lat || "",
                          end_lng: selected?.lng || "",
                        });
                      }}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none bg-white"
                      required
                    >
                      <option value="">Choisir un etablissement</option>
                      {etablissements.map((et) => (
                        <option key={et.id} value={et.name}>
                          {et.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ✅ Aperçu établissement sélectionné */}
                  {formData.end_label && (
                    <div className="mt-2 flex items-center gap-2 bg-[#FEBD00]/10 border border-[#FEBD00]/20 rounded-xl px-3 py-2">
                      <Map size={14} className="text-[#FEBD00] flex-shrink-0" />
                      <span className="text-xs font-semibold text-yellow-700">Destination : {formData.end_label}</span>
                      {formData.end_lat && (
                        <span className="text-xs text-gray-400 ml-auto">{formData.end_lat}, {formData.end_lng}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* GPS départ */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">GPS depart (optionnel)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Latitude" value={formData.start_lat} onChange={(e) => setFormData({ ...formData, start_lat: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" step="any" />
                    <input type="number" placeholder="Longitude" value={formData.start_lng} onChange={(e) => setFormData({ ...formData, start_lng: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" step="any" />
                  </div>
                </div>

                {/* Video */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Video *</label>
                  <label className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-5 flex flex-col items-center cursor-pointer hover:border-[#FEBD00] hover:bg-[#FEBD00]/5 transition">
                    {uploading ? <Loader2 size={24} className="animate-spin text-[#FEBD00]" /> : <Video size={24} className="text-gray-300 mb-2" />}
                    <span className="text-sm text-gray-400 mt-1 font-medium">
                      {uploading ? "Upload en cours..." : videoName || "Cliquer pour choisir une video"}
                    </span>
                    {formData.video_url && <span className="text-xs text-green-500 mt-1 font-semibold">Video uploadee ✅</span>}
                    {formData.duration > 0 && <span className="text-xs text-gray-400 mt-0.5">Duree : {formData.duration}s</span>}
                    {uploadError && <span className="text-xs text-red-500 mt-1">{uploadError}</span>}
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                  </label>
                </div>

                {/* Etapes */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Etapes ({formData.steps.length}/6)</label>
                    {formData.steps.length < 6 && (
                      <button type="button" onClick={addStep} className="flex items-center gap-1 text-xs text-[#FEBD00] font-semibold cursor-pointer hover:text-yellow-600">
                        <Plus size={14} /> Ajouter
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {formData.steps.map((step, index) => (
                      <div key={index} className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50/50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#FEBD00] text-black text-xs font-bold flex items-center justify-center">{step.step_number}</div>
                            <span className="text-xs font-semibold text-gray-500">Etape {step.step_number}</span>
                          </div>
                          {formData.steps.length > 2 && (
                            <button type="button" onClick={() => removeStep(index)} className="text-red-400 text-xs cursor-pointer hover:text-red-600">Supprimer</button>
                          )}
                        </div>
                        <input type="text" placeholder="Description" value={step.text} onChange={(e) => updateStep(index, "text", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FEBD00] bg-white" required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" placeholder="Debut (s)" value={step.start_time} onChange={(e) => updateStep(index, "start_time", e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white" min="0" required />
                          <input type="number" placeholder="Fin (s)" value={step.end_time} onChange={(e) => updateStep(index, "end_time", e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white" min="1" required />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={creating || uploading}
                  className="w-full bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {creating ? <><Loader2 size={18} className="animate-spin" /> Creation...</> : "Creer le parcours"}
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