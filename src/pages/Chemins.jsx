import { useState } from "react";
import { Search, Map, Trash2, CheckCircle, PlusCircle, X, Video, Loader2, Plus, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { usePathsList, usePathActions, useCreatePath } from "../api/hooks";

const STATUS_COLORS = {
  draft: "bg-yellow-100 text-yellow-600",
  published: "bg-green-100 text-green-600",
  hidden: "bg-gray-100 text-gray-600",
  deleted: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  published: "Publie",
  hidden: "Cache",
  deleted: "Supprime",
};

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "tektal_videos");
  const res = await fetch("https://api.cloudinary.com/v1_1/dqcc8n1th/video/upload", {
    method: "POST",
    body: fd,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || "Upload echoue");
  return { secure_url: data.secure_url, duration: Math.round(data.duration || 60) };
};

// ✅ Modal détail chemin
const CheminDetailModal = ({ chemin, onClose }) => {
  if (!chemin) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900">{chemin.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Vidéo */}
          {chemin.video_url && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Video</h3>
              <video
                src={chemin.video_url}
                controls
                className="w-full rounded-xl max-h-64 bg-black"
              />
            </div>
          )}

          {/* Infos générales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Depart</p>
              <p className="font-semibold text-slate-800">{chemin.start_label || "-"}</p>
              {chemin.start_lat && (
                <p className="text-xs text-gray-400 mt-1">
                  {chemin.start_lat}, {chemin.start_lng}
                </p>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Arrivee</p>
              <p className="font-semibold text-slate-800">{chemin.end_label || "-"}</p>
              {chemin.end_lat && (
                <p className="text-xs text-gray-400 mt-1">
                  {chemin.end_lat}, {chemin.end_lng}
                </p>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Auteur</p>
              <p className="font-semibold text-slate-800">{chemin.author || "-"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Duree</p>
              <p className="font-semibold text-slate-800">{chemin.duration ? `${chemin.duration}s` : "-"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Statut</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[chemin.status] || "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABELS[chemin.status] || chemin.status}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Officiel</p>
              <p className="font-semibold text-slate-800">{chemin.is_official ? "Oui" : "Non"}</p>
            </div>
          </div>

          {/* Étapes */}
          {chemin.steps && chemin.steps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Etapes ({chemin.steps.length})
              </h3>
              <div className="space-y-2">
                {chemin.steps.map((step, index) => (
                  <div key={index} className="border rounded-xl p-3 bg-gray-50 flex gap-4 items-start">
                    <div className="w-7 h-7 rounded-full bg-[#FEBD00] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {step.step_number}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 font-medium">{step.text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {step.start_time}s → {step.end_time}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date de création */}
          {chemin.created_at && (
            <p className="text-xs text-gray-400 text-right">
              Cree le : {new Date(chemin.created_at).toLocaleDateString("fr-FR")}
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
  const { approve, reject, remove } = usePathActions(refetch);
  const { create, loading: creating } = useCreatePath(refetch);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedChemin, setSelectedChemin] = useState(null); // ✅ chemin sélectionné pour le détail
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [videoName, setVideoName] = useState("");
  const [expandedVideo, setExpandedVideo] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    start_label: "",
    end_label: "",
    start_lat: "",
    start_lng: "",
    end_lat: "",
    end_lng: "",
    video_url: "",
    duration: 0,
    steps: [
      { step_number: 1, start_time: 0, end_time: 10, text: "" },
      { step_number: 2, start_time: 10, end_time: 20, text: "" },
    ],
  });

  const filteredChemins = chemins.filter((c) =>
    (c.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoName(file.name);
    setUploadError("");
    setUploading(true);
    try {
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
      steps: [
        ...prev.steps,
        { step_number: prev.steps.length + 1, start_time: 0, end_time: 10, text: "" },
      ],
    }));
  };

  const removeStep = (index) => {
    if (formData.steps.length <= 2) return;
    const newSteps = formData.steps
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, step_number: i + 1 }));
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: field.includes("time") ? parseInt(value) || 0 : value,
    };
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.video_url) {
      setUploadError("Veuillez uploader une video.");
      return;
    }
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
    setVideoName("");
    setUploadError("");
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestion des Chemins</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-xl transition w-full sm:w-auto"
        >
          <PlusCircle size={18} /> Creer un parcours
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un chemin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FEBD00] outline-none text-sm"
        />
      </div>

      {loading && <p className="text-gray-500 text-center">Chargement...</p>}
      {error && <p className="text-red-500 text-center text-sm">Erreur</p>}

      {!loading && filteredChemins.length === 0 && (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
          <Map className="mx-auto mb-2 opacity-10" size={48} />
          <p>Aucun chemin trouve.</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredChemins.map((chemin) => (
          <div key={chemin.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">{chemin.title}</h3>
                <p className="text-xs text-gray-400">{chemin.start_label} → {chemin.end_label}</p>
                <p className="text-xs text-gray-400">Auteur : {chemin.author}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[chemin.status] || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[chemin.status] || chemin.status}
                  </span>
                  {/* ✅ Nombre d'étapes */}
                  {chemin.steps && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                      {chemin.steps.length} etape{chemin.steps.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 self-end sm:self-auto items-center flex-wrap">
                {/* ✅ Bouton détail */}
                <button
                  onClick={() => setSelectedChemin(chemin)}
                  className="flex items-center gap-1 text-xs text-slate-600 font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                >
                  <Eye size={14} /> Detail
                </button>

                {/* Bouton vidéo */}
                {chemin.video_url && (
                  <button
                    onClick={() => setExpandedVideo(expandedVideo === chemin.id ? null : chemin.id)}
                    className="flex items-center gap-1 text-xs text-blue-500 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Video size={14} />
                    {expandedVideo === chemin.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}

                <button onClick={() => approve(chemin.id)} className="text-green-500 hover:scale-110 transition" title="Approuver">
                  <CheckCircle size={22} />
                </button>
                <button onClick={() => reject(chemin.id)} className="text-orange-400 hover:scale-110 transition" title="Refuser">
                  <X size={22} />
                </button>
                <button onClick={() => remove(chemin.id)} className="text-red-500 hover:scale-110 transition" title="Supprimer">
                  <Trash2 size={22} />
                </button>
              </div>
            </div>

            {expandedVideo === chemin.id && chemin.video_url && (
              <div className="px-4 pb-4">
                <video src={chemin.video_url} controls className="w-full rounded-xl max-h-64 bg-black" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Modal détail */}
      {selectedChemin && (
        <CheminDetailModal
          chemin={selectedChemin}
          onClose={() => setSelectedChemin(null)}
        />
      )}

      {/* Modal création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4 overflow-y-auto py-8">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl space-y-4 relative">
            <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-black">
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold">Nouveau Parcours</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text" placeholder="Titre du parcours"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Depart (ex: Dakar)"
                  value={formData.start_label}
                  onChange={(e) => setFormData({ ...formData, start_label: e.target.value })}
                  className="border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none"
                  required
                />
                <input type="text" placeholder="Arrivee (ex: Paris)"
                  value={formData.end_label}
                  onChange={(e) => setFormData({ ...formData, end_label: e.target.value })}
                  className="border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Lat depart (optionnel)"
                  value={formData.start_lat}
                  onChange={(e) => setFormData({ ...formData, start_lat: e.target.value })}
                  className="border rounded-xl px-4 py-3 text-sm outline-none" step="any"
                />
                <input type="number" placeholder="Lng depart (optionnel)"
                  value={formData.start_lng}
                  onChange={(e) => setFormData({ ...formData, start_lng: e.target.value })}
                  className="border rounded-xl px-4 py-3 text-sm outline-none" step="any"
                />
                <input type="number" placeholder="Lat arrivee (optionnel)"
                  value={formData.end_lat}
                  onChange={(e) => setFormData({ ...formData, end_lat: e.target.value })}
                  className="border rounded-xl px-4 py-3 text-sm outline-none" step="any"
                />
                <input type="number" placeholder="Lng arrivee (optionnel)"
                  value={formData.end_lng}
                  onChange={(e) => setFormData({ ...formData, end_lng: e.target.value })}
                  className="border rounded-xl px-4 py-3 text-sm outline-none" step="any"
                />
              </div>

              <label className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-4 flex flex-col items-center cursor-pointer hover:border-[#FEBD00] transition">
                {uploading ? <Loader2 size={24} className="animate-spin text-[#FEBD00]" /> : <Video size={24} className="text-gray-400 mb-2" />}
                <span className="text-sm text-gray-500 mt-1">
                  {uploading ? "Upload en cours..." : videoName ? videoName : "Choisir une video"}
                </span>
                {formData.video_url && <span className="text-xs text-green-500 mt-1">Video uploadee ✅</span>}
                {formData.duration > 0 && <span className="text-xs text-gray-400">Duree: {formData.duration}s</span>}
                {uploadError && <span className="text-xs text-red-500 mt-1">{uploadError}</span>}
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
              </label>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm">Etapes ({formData.steps.length}/6)</h3>
                  {formData.steps.length < 6 && (
                    <button type="button" onClick={addStep}
                      className="flex items-center gap-1 text-xs text-[#FEBD00] font-semibold">
                      <Plus size={14} /> Ajouter etape
                    </button>
                  )}
                </div>

                {formData.steps.map((step, index) => (
                  <div key={index} className="border rounded-xl p-3 space-y-2 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-600">Etape {step.step_number}</span>
                      {formData.steps.length > 2 && (
                        <button type="button" onClick={() => removeStep(index)} className="text-red-400 text-xs">
                          Supprimer
                        </button>
                      )}
                    </div>
                    <input
                      type="text" placeholder="Description de l'etape"
                      value={step.text}
                      onChange={(e) => updateStep(index, "text", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FEBD00]"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number" placeholder="Debut (secondes)"
                        value={step.start_time}
                        onChange={(e) => updateStep(index, "start_time", e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm outline-none"
                        min="0" required
                      />
                      <input
                        type="number" placeholder="Fin (secondes)"
                        value={step.end_time}
                        onChange={(e) => updateStep(index, "end_time", e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm outline-none"
                        min="1" required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={creating || uploading}
                className="w-full bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition flex justify-center items-center gap-2"
              >
                {creating ? <><Loader2 size={18} className="animate-spin" /> Creation...</> : "Creer le parcours"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chemins;