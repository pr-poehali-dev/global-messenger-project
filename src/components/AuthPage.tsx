import { useState } from "react";
import Icon from "@/components/ui/icon";
import { apiLogin, apiRegister } from "@/lib/api";

interface Props {
  onAuth: (name: string) => void;
}

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim() || !password.trim()) {
      setError("Заполни все поля");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Введи своё имя");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Введи корректный номер телефона");
      return;
    }
    if (password.length < 6) {
      setError("Пароль минимум 6 символов");
      return;
    }

    setLoading(true);
    try {
      let user;
      if (mode === "register") {
        user = await apiRegister(name.trim(), phone.trim(), password);
      } else {
        user = await apiLogin(phone.trim(), password);
      }
      onAuth(user.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center chat-bg relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full blur-[100px] opacity-15"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full blur-[100px] opacity-15"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-8"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-16 left-16 w-14 h-14 rounded-2xl glass flex items-center justify-center animate-float opacity-40"
        style={{ animationDelay: "0s" }}>
        <Icon name="MessageCircle" size={22} className="text-purple-400" />
      </div>
      <div className="absolute top-32 right-20 w-10 h-10 rounded-xl glass flex items-center justify-center animate-float opacity-30"
        style={{ animationDelay: "1s" }}>
        <Icon name="Video" size={16} className="text-blue-400" />
      </div>
      <div className="absolute bottom-24 left-24 w-12 h-12 rounded-2xl glass flex items-center justify-center animate-float opacity-30"
        style={{ animationDelay: "0.5s" }}>
        <Icon name="Users" size={18} className="text-pink-400" />
      </div>
      <div className="absolute bottom-36 right-16 w-10 h-10 rounded-xl glass flex items-center justify-center animate-float opacity-25"
        style={{ animationDelay: "1.5s" }}>
        <Icon name="Smile" size={16} className="text-cyan-400" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md mx-4 animate-fade-in">
        <div className="glass-strong rounded-3xl p-8" style={{ border: "1px solid rgba(168,85,247,0.15)" }}>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-neon-purple"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
              <span className="text-white font-black text-3xl tracking-tighter">T</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">tema</h1>
            <p className="text-white/35 text-sm">
              {mode === "login" ? "Рады видеть тебя снова!" : "Присоединяйся к нам!"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: "rgba(255,255,255,0.04)" }}>
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-600 transition-all ${
                  mode === m ? "text-white shadow-neon-purple" : "text-white/35 hover:text-white/55"
                }`}
                style={mode === m ? { background: "linear-gradient(135deg, #a855f7, #ec4899)" } : {}}
              >
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="animate-fade-in">
                <label className="block text-xs text-white/40 mb-1.5 pl-1">Как тебя зовут?</label>
                <div className="relative">
                  <Icon name="User" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Твоё имя"
                    className="w-full bg-white/5 border border-white/8 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-white/40 mb-1.5 pl-1">Номер телефона</label>
              <div className="relative">
                <Icon name="Phone" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d+\s\-()]/g, "");
                    setPhone(val);
                  }}
                  placeholder="+7 (999) 999-99-99"
                  className="w-full bg-white/5 border border-white/8 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 pl-1">Пароль</label>
              <div className="relative">
                <Icon name="Lock" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full bg-white/5 border border-white/8 rounded-2xl pl-11 pr-11 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  <Icon name={showPass ? "EyeOff" : "Eye"} size={16} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl animate-fade-in"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-700 text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 mt-2 flex items-center justify-center gap-2 shadow-neon-purple"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{mode === "login" ? "Входим..." : "Создаём аккаунт..."}</span>
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Войти" : "Создать аккаунт"}</span>
                  <Icon name="ArrowRight" size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-xs text-white/20">или</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-2">
            <button className="glass flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm text-white/50 hover:text-white/80 hover:bg-white/8 transition-all">
              <span className="text-base">🇬</span>
              Google
            </button>
            <button className="glass flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm text-white/50 hover:text-white/80 hover:bg-white/8 transition-all">
              <span className="text-base">🍎</span>
              Apple
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-white/18 mt-6 leading-relaxed">
            Входя в систему, вы соглашаетесь с{" "}
            <span className="text-purple-400/60 cursor-pointer hover:text-purple-400 transition-colors">условиями использования</span>
            {" "}и{" "}
            <span className="text-purple-400/60 cursor-pointer hover:text-purple-400 transition-colors">политикой конфиденциальности</span>
          </p>
        </div>
      </div>
    </div>
  );
}