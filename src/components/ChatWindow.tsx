import { useEffect, useRef, useState } from "react";
import { Chat, Message } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  chat: Chat;
  messages: Message[];
  onSend: (text: string) => void;
  onVideoCall: () => void;
}

const AVATAR_GRADIENTS = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-purple-500",
  "from-cyan-500 to-blue-500",
  "from-pink-500 to-orange-500",
  "from-emerald-500 to-cyan-500",
];

function getGradient(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export default function ChatWindow({ chat, messages, onSend, onVideoCall }: Props) {
  const [input, setInput] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setShowTyping(false);
  }, [chat.id]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
    setShowTyping(true);
    setTimeout(() => setShowTyping(false), 2500);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 glass border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${getGradient(chat.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative`}>
            {chat.type === "group" ? <Icon name="Users" size={17} className="text-white" /> : chat.avatar}
            {chat.online && chat.type === "personal" && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#080b14] rounded-full" />
            )}
          </div>
          <div>
            <div className="font-700 text-white text-sm">{chat.name}</div>
            <div className="text-xs">
              {chat.type === "group" ? (
                <span className="text-white/40">{chat.members} участников</span>
              ) : chat.online ? (
                <span className="text-emerald-400">в сети</span>
              ) : (
                <span className="text-white/30">не в сети</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onVideoCall}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 text-white shadow-neon-purple"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
            title={chat.type === "group" ? "Видеоконференция" : "Видеозвонок"}
          >
            <Icon name="Video" size={16} />
          </button>
          <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <Icon name="Phone" size={16} />
          </button>
          <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <Icon name="MoreVertical" size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        {/* Date separator */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[11px] text-white/25 px-2">Сегодня</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {messages.map((msg, i) => {
          const isFirst = i === 0 || messages[i - 1].mine !== msg.mine;
          return (
            <div key={msg.id} className={`flex ${msg.mine ? "justify-end" : "justify-start"} animate-message-in`}
              style={{ animationDelay: `${i * 0.03}s` }}>
              {!msg.mine && (
                <div className="flex items-end gap-2 max-w-[72%]">
                  {isFirst ? (
                    <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${getGradient(msg.avatar || "x")} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 mb-0.5`}>
                      {msg.avatar}
                    </div>
                  ) : (
                    <div className="w-7 flex-shrink-0" />
                  )}
                  <div>
                    {isFirst && msg.senderName && (
                      <div className="text-[11px] text-white/40 mb-1 pl-1">{msg.senderName}</div>
                    )}
                    <div className="glass rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-white/90 leading-relaxed">
                      {msg.text}
                      <span className="ml-2 text-[10px] text-white/25 inline-block">{msg.time}</span>
                    </div>
                  </div>
                </div>
              )}

              {msg.mine && (
                <div className="max-w-[72%]">
                  <div className="px-4 py-2.5 rounded-2xl rounded-br-sm text-sm text-white leading-relaxed shadow-neon-purple"
                    style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
                    {msg.text}
                    <span className="ml-2 text-[10px] text-white/50 inline-block">{msg.time} ✓✓</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {showTyping && (
          <div className="flex items-end gap-2 animate-fade-in">
            <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${getGradient(chat.name)} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0`}>
              {chat.avatar.slice(0, 2)}
            </div>
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 glass border-t border-white/5 flex-shrink-0">
        <div className="flex items-end gap-2.5">
          <button className="w-9 h-9 flex-shrink-0 rounded-xl glass flex items-center justify-center text-white/35 hover:text-white/60 hover:bg-white/8 transition-all">
            <Icon name="Paperclip" size={17} />
          </button>
          <button className="w-9 h-9 flex-shrink-0 rounded-xl glass flex items-center justify-center text-white/35 hover:text-white/60 hover:bg-white/8 transition-all">
            <Icon name="ImagePlus" size={17} />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Написать сообщение..."
              rows={1}
              className="w-full bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5 text-sm text-white/90 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/8 transition-all resize-none leading-relaxed"
              style={{ maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 shadow-neon-purple"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            <Icon name="Send" size={17} />
          </button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-white/15">Enter — отправить · Shift+Enter — новая строка</span>
        </div>
      </div>
    </div>
  );
}
