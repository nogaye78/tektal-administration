import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/apiService";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await login(email, password);

      // ✅ Admin et etablissement redirigent vers /dashboard
      if (user.role === "admin" || user.role === "etablissement") {
        navigate("/dashboard");
      } else {
        setError("Acces non autorise.");
        localStorage.clear();
      }
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-sm space-y-5"
      >
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#FEBD00]">Tektal</h1>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Connexion</h2>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="relative">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
            <Mail size={18} />
          </span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none border-gray-200"
            required
          />
        </div>

        <div className="relative">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
            <Lock size={18} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl pl-10 pr-12 py-3 text-sm focus:ring-2 focus:ring-[#FEBD00] outline-none border-gray-200"
            required
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FEBD00] hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition flex justify-center items-center disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Connexion..." : "Connexion"}
        </button>
      </form>
    </div>
  );
};

export default Login;