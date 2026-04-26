import { useState } from "react";
import { Chat } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  chats: Chat[];
  activeChatId: number;
  onSelectChat: (id: number) => void;
  userName: string;
  onLogout: () => void;
  loading?: boolean;
}

const AVATAR_GRADIENTS = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-purple-500",
  "from-cyan-500 to-blue-500",
  "from-pink-500 to-orange-500",
  "from-emerald-500 to-cyan-500",
  "from-violet-500 to-blue-500",
  "from-rose-500 to-pink-500",
];

export default function Sidebar({ chats, activeChatId, onSelectChat, userName, onLogout, loading }: Props) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "personal" | "group">("all");

  const filtered = chats.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" || c.type === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <aside className="w-[320px] flex-shrink-0 flex flex-col h-full glass border-r border-white/5">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-neon-purple"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
            <span className="text-white font-black text-base tracking-tight">T</span>
          </div>
          <span className="font-black text-xl text-white tracking-tight">tema</span>
        </div>
        <button className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
          <Icon name="PenSquare" size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск чатов..."
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/80 placeholder-white/25 outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-3 flex gap-1.5">
        {(["all", "personal", "group"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-600 transition-all ${
              activeTab === tab
                ? "text-white shadow-neon-purple"
                : "text-white/40 hover:text-white/60"
            }`}
            style={activeTab === tab ? { background: "linear-gradient(135deg, #a855f7, #ec4899)" } : { background: "rgba(255,255,255,0.05)" }}
          >
            {tab === "all" ? "Все" : tab === "personal" ? "Личные" : "Группы"}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
        {loading && (
          <div className="flex flex-col gap-2 px-1 pt-2">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-2xl glass animate-pulse">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded-full w-3/4" />
                  <div className="h-2.5 bg-white/6 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && chats.length === 0 && (
          <div className="text-center pt-10 px-4">
            <p className="text-white/20 text-sm">Чатов пока нет</p>
            <p className="text-white/10 text-xs mt-1">Создай первый чат!</p>
          </div>
        )}
        {!loading && filtered.map((chat, i) => {
          const isActive = chat.id === activeChatId;
          const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left group ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              }`}
              style={isActive ? { boxShadow: "inset 0 0 0 1px rgba(168,85,247,0.2)" } : {}}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm`}>
                  {chat.type === "group" ? (
                    <Icon name="Users" size={18} className="text-white" />
                  ) : (
                    <span>{chat.avatar}</span>
                  )}
                </div>
                {chat.online && chat.type === "personal" && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#080b14] rounded-full" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`font-600 text-sm truncate ${isActive ? "text-white" : "text-white/80"}`}>
                    {chat.name}
                  </span>
                  <span className="text-[11px] text-white/30 flex-shrink-0 ml-1">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/35 truncate pr-2">{chat.lastMessage}</span>
                  {chat.unread > 0 && (
                    <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-700 text-white flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/5 transition-all group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-600 text-white/90 truncate">{userName}</div>
            <div className="text-xs text-emerald-400">● В сети</div>
          </div>
          <button
            onClick={onLogout}
            title="Выйти"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Icon name="LogOut" size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}