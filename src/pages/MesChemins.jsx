import { useState, useEffect } from "react";
import { 
  Search, Map, CheckCircle, X, Video, Loader2, Plus, 
  ChevronDown, ChevronUp, Eye, PlusCircle 
} from "lucide-react";
import { useEtablissementPaths, useEtablissementPathActions } from "../api/hooks";
import { createPath, uploadToCloudinary } from "../api/apiService";
import useCurrentUser from "../hooks/useCurrentUser";

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

const CheminDetailModal = ({ chemin, onClose }) => {
  if (!chemin) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4 py-8">
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900">{chemin.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black cursor-pointer p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {chemin.video_url && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Video</h3>
              <video src={chemin.video_url} controls className="w-full rounded-xl max-h-48 bg-black" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Depart</p>
              <p className="font-semibold text-slate-800 text-sm">{chemin.start_label || "-"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Arrivee</p>
              <p className="font-semibold text-slate-800 text-sm">{chemin.end_label || "-"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Duree</p>
              <p className="font-semibold text-slate-800 text-sm">{chemin.duration ? `${chemin.duration}s` : "-"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Statut</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[chemin.status] || "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABELS[chemin.status] || chemin.status}
              </span>
            </div>
          </div>

          {chemin.steps && chemin.steps.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Etapes ({chemin.steps.length})
              </h3>
              <div className="space-y-2">
                {chemin.steps.map((step, index) => (
                  <div key={index} className="border rounded-xl p-3 bg-gray-50 flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#FEBD00] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {step.step_number}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 font-medium">{step.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{step.start_time}s → {step.end_time}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

const MesChemins = () => {
  const { data, loading, error, refetch } = useEtablissementPaths();
  const chemins = data || [];
  const { approve, reject } = useEtablissementPathActions(refetch);

  const { user, loadingUser } = useCurrentUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedChemin, setSelectedChemin] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [videoName, setVideoName] = useState("");
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [creating, setCreating] = useState(false);

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

  // 🔹 Met à jour end_label automatiquement quand user est chargé
  useEffect(() => {
    if (user?.establishment_name) {
      setFormData(prev => ({
        ...prev,
        end_label: user.establishment_name,
        end_lat: user.lat || "",
        end_lng: user.lng || "",
      }));
    }
  }, [user]);

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
    setCreating(true);
    try {
      await createPath({ ...formData });
      setFormData({
        title: "",
        start_label: "",
        end_label: user?.establishment_name || "",
        start_lat: "",
        start_lng: "",
        end_lat: user?.lat || "",
        end_lng: user?.lng || "",
        video_url: "",
        duration: 0,
        steps: [
          { step_number: 1, start_time: 0, end_time: 10, text: "" },
          { step_number: 2, start_time: 10, end_time: 20, text: "" },
        ],
      });
      setVideoName("");
      setUploadError("");
      setShowModal(false);
      refetch();
    } catch (err) {
      setUploadError(err.message || "Erreur lors de la creation.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mon Etablissement</h1>
          {user && (
            <p className="text-sm text-gray-500 mt-1">
              {user.establishment_name}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-xl transition cursor-pointer w-full sm:w-auto"
        >
          <PlusCircle size={18} /> Creer un chemin
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

      {loading && <p className="text-gray-500 text-center">Chargement...</p>}
      {error && <p className="text-red-500 text-center text-sm">Erreur de chargement</p>}

      {!loading && filteredChemins.length === 0 && (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
          <Map className="mx-auto mb-2 opacity-10" size={48} />
          <p>Aucun chemin trouve.</p>
        </div>
      )}

      {/* Liste chemins */}
      <div className="space-y-3">
        {filteredChemins.map((chemin) => (
          <div key={chemin.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">{chemin.title}</h3>
                <p className="text-xs text-gray-400">{chemin.start_label} → {chemin.end_label}</p>
                <p className="text-xs text-gray-400">Auteur : {chemin.author}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[chemin.status] || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[chemin.status] || chemin.status}
                  </span>
                  {chemin.steps && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                      {chemin.steps.length} etape{chemin.steps.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 self-end sm:self-auto items-center flex-wrap">
                <button
                  onClick={() => setSelectedChemin(chemin)}
                  className="flex items-center gap-1 text-xs text-slate-600 font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  <Eye size={14} /> Detail
                </button>

                {chemin.video_url && (
                  <button
                    onClick={() => setExpandedVideo(expandedVideo === chemin.id ? null : chemin.id)}
                    className="flex items-center gap-1 text-xs text-blue-500 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                  >
                    <Video size={14} />
                    {expandedVideo === chemin.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}

                <button
                  onClick={() => approve(chemin.id)}
                  className="text-green-500 hover:text-green-600 transition cursor-pointer"
                  title="Approuver"
                >
                  <CheckCircle size={22} />
                </button>

                <button
                  onClick={() => reject(chemin.id)}
                  className="text-orange-400 hover:text-orange-500 transition cursor-pointer"
                  title="Refuser"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {expandedVideo === chemin.id && chemin.video_url && (
              <div className="px-4 pb-4">
                <video src={chemin.video_url} controls className="w-full rounded-xl max-h-56 bg-black" />
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedChemin && (
        <CheminDetailModal chemin={selectedChemin} onClose={() => setSelectedChemin(null)} />
      )}

      {/* Modal création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl space-y-4 relative my-auto">
            <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-black cursor-pointer">
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold">Nouveau Chemin</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* ... formulaire inchangé ... */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesChemins;