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
} from "lucide-react";
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

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dqcc8n1th/video/upload",
    { method: "POST", body: fd }
  );

  const data = await res.json();
  if (!data.secure_url)
    throw new Error(data.error?.message || "Upload echoue");

  return {
    secure_url: data.secure_url,
    duration: Math.round(data.duration || 60),
  };
};

const Chemins = () => {
  const { data, loading, error, refetch } = usePathsList();
  const chemins = data || [];
  const { approve, reject, remove } = usePathActions(refetch);
  const { create, loading: creating } = useCreatePath(refetch);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [videoName, setVideoName] = useState("");

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
        {
          step_number: prev.steps.length + 1,
          start_time: 0,
          end_time: 10,
          text: "",
        },
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
      ...formData,
      start_lat: formData.start_lat || null,
      start_lng: formData.start_lng || null,
      end_lat: formData.end_lat || null,
      end_lng: formData.end_lng || null,
    });

    setShowModal(false);
    refetch();
  };

  const confirmDelete = async () => {
    await remove(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 relative">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Chemins</h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-xl"
        >
          <PlusCircle size={18} />
          Creer un parcours
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#FEBD00] outline-none"
        />
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filteredChemins.map((chemin) => (
          <div key={chemin.id} className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{chemin.title}</h3>
                <p className="text-xs text-gray-400">
                  {chemin.start_label} → {chemin.end_label}
                </p>

                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    STATUS_COLORS[chemin.status]
                  }`}
                >
                  {STATUS_LABELS[chemin.status]}
                </span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => approve(chemin.id)} className="text-green-500">
                  <CheckCircle size={22} />
                </button>

                <button onClick={() => reject(chemin.id)} className="text-orange-400">
                  <X size={22} />
                </button>

                <button
                  onClick={() => setDeleteId(chemin.id)}
                  className="text-red-500"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            </div>

            {chemin.video_url && (
              <div className="px-4 pb-4">
                <video
                  src={chemin.video_url}
                  controls
                  className="w-full rounded-xl max-h-64 bg-black"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL CREATION */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
          <div className="bg-white w-full max-w-xl rounded-2xl p-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold mb-4">Nouveau Parcours</h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Titre"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Depart"
                  value={formData.start_label}
                  onChange={(e) =>
                    setFormData({ ...formData, start_label: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Arrivee"
                  value={formData.end_label}
                  onChange={(e) =>
                    setFormData({ ...formData, end_label: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <label className="w-full border-2 border-dashed rounded-lg p-3 flex flex-col items-center cursor-pointer">
                {uploading ? (
                  <Loader2 size={20} className="animate-spin text-[#FEBD00]" />
                ) : (
                  <Video size={20} />
                )}
                <span className="text-xs mt-1">
                  {videoName || "Choisir une video"}
                </span>

                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoChange}
                />
              </label>

              {/* STEPS */}
              {formData.steps.map((step, index) => (
                <div key={index} className="border p-3 rounded-lg space-y-2">
                  <input
                    type="text"
                    placeholder="Description"
                    value={step.text}
                    onChange={(e) =>
                      updateStep(index, "text", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1 text-sm"
                    required
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={creating || uploading}
                className="w-full bg-[#FEBD00] py-2 rounded-lg font-semibold"
              >
                {creating ? "Creation..." : "Creer le parcours"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TOAST DELETE */}
      {deleteId && (
        <div className="fixed bottom-6 right-6 bg-white shadow-xl border rounded-xl p-4 w-80">
          <p className="text-sm font-medium">
            Voulez-vous vraiment supprimer ?
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setDeleteId(null)}
              className="px-3 py-1 text-sm border rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={confirmDelete}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg"
            >
              Confirmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chemins;