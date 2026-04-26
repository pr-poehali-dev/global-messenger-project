import { useState, useEffect, useCallback } from "react";
import AuthPage from "@/components/AuthPage";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import VideoCall from "@/components/VideoCall";
import { apiGetChats, apiGetMessages, apiSendMessage, apiLogout, getSavedUser } from "@/lib/api";

export type Chat = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  type: "personal" | "group";
  members?: number;
};

export type Message = {
  id: number;
  chatId: number;
  text: string;
  time: string;
  mine: boolean;
  avatar?: string;
  senderName?: string;
};

export default function Index() {
  const [user, setUser] = useState<{ id: number; name: string } | null>(getSavedUser);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [videoCallActive, setVideoCallActive] = useState(false);
  const [videoCallChat, setVideoCallChat] = useState<Chat | null>(null);

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const data = await apiGetChats();
      setChats(data);
      if (data.length > 0 && !activeChatId) setActiveChatId(data[0].id);
    } catch {
      // нет чатов или ошибка
    } finally {
      setLoadingChats(false);
    }
  }, [activeChatId]);

  const loadMessages = useCallback(async (chatId: number) => {
    setLoadingMsgs(true);
    try {
      const data = await apiGetMessages(chatId);
      const mapped: Message[] = data.map((m: Message & { chatId?: number }) => ({ ...m, chatId }));
      setMessages(mapped);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadChats();
  }, [user]);

  useEffect(() => {
    if (activeChatId) loadMessages(activeChatId);
  }, [activeChatId]);

  const handleSelectChat = (id: number) => {
    setActiveChatId(id);
  };

  const sendMessage = async (text: string) => {
    if (!activeChatId) return;
    const tempMsg: Message = {
      id: Date.now(),
      chatId: activeChatId,
      text,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      mine: true,
    };
    setMessages((prev) => [...prev, tempMsg]);
    try {
      await apiSendMessage(activeChatId, text);
    } catch {
      // сообщение уже показано локально
    }
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setChats([]);
    setMessages([]);
    setActiveChatId(null);
  };

  if (!user) {
    return <AuthPage onAuth={(name) => {
      const saved = getSavedUser();
      setUser(saved || { id: 0, name });
    }} />;
  }

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const chatMessages = messages.filter((m) => m.chatId === activeChatId);

  return (
    <div className="flex h-screen w-screen overflow-hidden chat-bg">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-10 blur-[80px]"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-10 blur-[80px]"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full opacity-5 blur-[60px]"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
      </div>

      <div className="relative z-10 flex w-full h-full">
        <Sidebar
          chats={chats}
          activeChatId={activeChatId ?? 0}
          onSelectChat={handleSelectChat}
          userName={user.name}
          onLogout={handleLogout}
          loading={loadingChats}
        />
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            messages={chatMessages}
            onSend={sendMessage}
            onVideoCall={() => { setVideoCallChat(activeChat); setVideoCallActive(true); }}
            loading={loadingMsgs}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-2"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
              <span className="text-white font-black text-3xl">T</span>
            </div>
            <p className="text-white/30 text-sm">
              {loadingChats ? "Загружаем чаты..." : "Выбери чат или создай новый"}
            </p>
          </div>
        )}
      </div>

      {videoCallActive && videoCallChat && (
        <VideoCall chat={videoCallChat} onClose={() => setVideoCallActive(false)} />
      )}
    </div>
  );
}
