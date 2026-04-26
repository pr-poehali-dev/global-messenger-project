import { useState, useEffect } from "react";
import { Chat } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  chat: Chat;
  onClose: () => void;
}

const GROUP_PARTICIPANTS = [
  { name: "Артём", avatar: "АР", grad: "from-purple-500 to-pink-500" },
  { name: "Соня", avatar: "СО", grad: "from-blue-500 to-purple-500" },
  { name: "Максим", avatar: "МА", grad: "from-cyan-500 to-blue-500" },
  { name: "Катя", avatar: "КА", grad: "from-pink-500 to-orange-500" },
];

export default function VideoCall({ chat, onClose }: Props) {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [screenShare, setScreenShare] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const isGroup = chat.type === "group";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(5, 7, 15, 0.92)", backdropFilter: "blur(20px)" }}>

      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-15"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-15"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
      </div>

      <div className="relative w-full max-w-4xl mx-4 animate-scale-in">
        {/* Main video area */}
        <div className="rounded-3xl overflow-hidden relative" style={{ background: "#0d1120", border: "1px solid rgba(255,255,255,0.07)" }}>

          {isGroup ? (
            /* Group grid */
            <div className="grid grid-cols-2 gap-2 p-3" style={{ minHeight: "460px" }}>
              {GROUP_PARTICIPANTS.map((p, i) => (
                <div key={i} className={`relative rounded-2xl overflow-hidden flex items-center justify-center ${i === 0 ? "col-span-2 row-span-1" : ""}`}
                  style={{ background: "#141829", minHeight: i === 0 ? "220px" : "160px" }}>
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${p.grad} flex items-center justify-center text-white font-black text-2xl animate-float`}
                    style={{ animationDelay: `${i * 0.5}s` }}>
                    {p.avatar}
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <div className="glass px-2.5 py-1 rounded-lg text-xs text-white/80 font-500">{p.name}</div>
                    {i === 1 && (
                      <div className="glass px-2 py-1 rounded-lg">
                        <Icon name="MicOff" size={11} className="text-red-400" />
                      </div>
                    )}
                  </div>
                  {i === 0 && (
                    <div className="absolute top-3 right-3 glass px-2.5 py-1 rounded-lg text-[11px] text-emerald-400 font-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      говорит
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Personal call */
            <div className="relative flex items-center justify-center" style={{ minHeight: "420px", background: "#0d1120" }}>
              <div className="text-center animate-fade-in">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 animate-float shadow-neon-purple">
                  {chat.avatar}
                </div>
                <div className="text-white font-700 text-xl mb-1">{chat.name}</div>
                <div className="text-white/40 text-sm">Видеозвонок</div>
              </div>

              {/* Self preview */}
              <div className="absolute bottom-4 right-4 w-28 h-20 rounded-2xl overflow-hidden glass-strong flex items-center justify-center"
                style={{ border: "2px solid rgba(168,85,247,0.3)" }}>
                {videoOff ? (
                  <Icon name="VideoOff" size={20} className="text-white/30" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    ВЫ
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 text-[10px] text-white/50">Вы</div>
              </div>
            </div>
          )}

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4"
            style={{ background: "linear-gradient(to bottom, rgba(13,17,32,0.9), transparent)" }}>
            <div>
              <div className="text-white font-700 text-sm">{chat.name}</div>
              <div className="text-white/40 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                {formatTime(seconds)}
                {isGroup && <span className="text-white/25 ml-1">· {(chat.members || 4)} участников</span>}
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <Icon name="X" size={15} />
            </button>
          </div>

          {/* Controls */}
          <div className="px-6 py-5 flex items-center justify-center gap-3"
            style={{ background: "linear-gradient(to top, rgba(13,17,32,1), rgba(13,17,32,0.6))" }}>

            <button
              onClick={() => setMuted(!muted)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 ${muted ? "bg-red-500/20 text-red-400" : "glass text-white/60 hover:text-white"}`}
              style={!muted ? {} : { border: "1px solid rgba(239,68,68,0.3)" }}>
              <Icon name={muted ? "MicOff" : "Mic"} size={19} />
            </button>

            <button
              onClick={() => setVideoOff(!videoOff)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 ${videoOff ? "bg-red-500/20 text-red-400" : "glass text-white/60 hover:text-white"}`}
              style={!videoOff ? {} : { border: "1px solid rgba(239,68,68,0.3)" }}>
              <Icon name={videoOff ? "VideoOff" : "Video"} size={19} />
            </button>

            {isGroup && (
              <button
                onClick={() => setScreenShare(!screenShare)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 ${screenShare ? "text-white" : "glass text-white/60 hover:text-white"}`}
                style={screenShare ? { background: "linear-gradient(135deg, #3b82f6, #a855f7)" } : {}}>
                <Icon name="Monitor" size={19} />
              </button>
            )}

            <button className="glass w-12 h-12 rounded-2xl flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-105">
              <Icon name="MessageSquare" size={19} />
            </button>

            {isGroup && (
              <button className="glass w-12 h-12 rounded-2xl flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-105">
                <Icon name="Users" size={19} />
              </button>
            )}

            {/* End call */}
            <button
              onClick={onClose}
              className="w-14 h-12 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-105 ml-2"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 0 20px rgba(239,68,68,0.35)" }}>
              <Icon name="PhoneOff" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
