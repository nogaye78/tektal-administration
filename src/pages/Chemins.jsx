// Chemins.jsx
import { useState } from "react";
import {
  Search,
  Map,
  Trash2,
  CheckCircle,
  PlusCircle,
  X,
  Video,
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { usePathsList, usePathActions, useCreatePath } from "../api/hooks";

const STATUS_COLORS = {
  draft: "bg-yellow-100 text-yellow-600",
  published: "bg-green-100 text-green-600",
  hidden: "bg-gray-100 text-gray-600",
  APPROVED: "bg-green-100 text-green-600",
  REJECTED: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  published: "Publie",
  hidden: "Cache",
  APPROVED: "Approuvé",
  REJECTED: "Refusé",
};

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "tektal_videos");
  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dqcc8n1th/video/upload",
    { method: "POST", body: fd }
  );
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || "Upload echoue");
  return { secure_url: data.secure_url, duration: Math.round(data.duration || 60) };
};

const DeleteToast = ({ cheminTitle, onConfirm, onCancel }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
    <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center gap-4 min-w-[320px] max-w-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Supprimer ce chemin ?</p>
          <p className="text-xs text-gray-400 mt-0.5 max-w-[180px] truncate">« {cheminTitle} »</p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
);

const Chemins = () => {
  const { data, loading, error, refetch } = usePathsList();
  const chemins = data || [];
  const { approve, reject, remove } = usePathActions(refetch);
  const { create, loading: creating } = useCreatePath(refetch);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [videoName, setVideoName] = useState("");
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [deleteToast, setDeleteToast] = useState(null);

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
      { id: Date.now(), step_number: 1, start_time: 0, end_time: 10, text: "" },
      { id: Date.now() + 1, step_number: 2, start_time: 10, end_time: 20, text: "" },
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
        {
          id: Date.now(),
          step_number: prev.steps.length + 1,
          start_time: 0,
          end_time: 10,
          text: "",
        },
      ],
    }));
  };

  const removeStep = (id) => {
    if (formData.steps.length <= 2) return;
    const newSteps = formData.steps
      .filter((s) => s.id !== id)
      .map((s, index) => ({ ...s, step_number: index + 1 }));
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const updateStep = (id, field, value) => {
    const newSteps = formData.steps.map((s) =>
      s.id === id
        ? { ...s, [field]: field.includes("time") ? parseInt(value) || 0 : value }
        : s
    );
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
        { id: Date.now(), step_number: 1, start_time: 0, end_time: 10, text: "" },
        { id: Date.now() + 1, step_number: 2, start_time: 10, end_time: 20, text: "" },
      ],
    });
    setVideoName("");
    setUploadError("");
    setShowModal(false);
  };

  const handleDeleteClick = (chemin) => setDeleteToast({ id: chemin.id, title: chemin.title });
  const handleDeleteConfirm = async () => {
    if (deleteToast) {
      await remove(deleteToast.id);
      setDeleteToast(null);
      refetch();
    }
  };
  const handleDeleteCancel = () => setDeleteToast(null);

  const handleApprove = async (id) => {
    await approve(id);
    refetch();
  };
  const handleReject = async (id) => {
    await reject(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestion des Chemins</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-xl transition w-full sm:w-auto"
        >
          <PlusCircle size={18} /> Creer un parcours
        </button>
      </div>

      {/* Search */}
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

      {/* List of Chemins */}
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
                <p className="text-xs text-gray-400">Auteur : {chemin.user?.username || chemin.author}</p>
                {chemin.duration && <p className="text-xs text-gray-400">Duree : {chemin.duration}s</p>}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[chemin.status] || "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[chemin.status] || chemin.status}
                </span>
              </div>

              <div className="flex gap-3 self-end sm:self-auto items-center">
                {chemin.video_url && (
                  <button
                    onClick={() => setExpandedVideo(expandedVideo === chemin.id ? null : chemin.id)}
                    className="flex items-center gap-1 text-xs text-blue-500 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Video size={14} />
                    {expandedVideo === chemin.id ? "Cacher" : "Voir video"}
                    {expandedVideo === chemin.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
                <button onClick={() => handleApprove(chemin.id)} className="text-green-500 hover:scale-110 transition" title="Approuver">
                  <CheckCircle size={22} />
                </button>
                <button onClick={() => handleReject(chemin.id)} className="text-orange-400 hover:scale-110 transition" title="Refuser">
                  <X size={22} />
                </button>
                <button onClick={() => handleDeleteClick(chemin)} className="text-red-500 hover:scale-110 transition" title="Supprimer">
                  <Trash2 size={22} />
                </button>
              </div>
            </div>

            {expandedVideo === chemin.id && chemin.video_url && (
              <div className="px-4 pb-4">
                <video src={chemin.video_url} controls className="w-full rounded-xl max-h-64 bg-black">
                  Votre navigateur ne supporte pas la lecture video.
                </video>
              </div>
            )}
          </div>
        ))}
      </div>

      {deleteToast && (
        <DeleteToast
          cheminTitle={deleteToast.title}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* Modal création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-5">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition"
            >
              <X size={16} />
            </button>
            <h2 className="text-lg font-bold mb-4">Nouveau Parcours</h2>

            {/* Formulaire création */}
            <form onSubmit={handleCreate} className="space-y-3">
              {/* ... inputs + upload + steps comme avant ... */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chemins;