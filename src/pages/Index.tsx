import { useState } from "react";
import AuthPage from "@/components/AuthPage";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import VideoCall from "@/components/VideoCall";

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

const CHATS: Chat[] = [
  { id: 1, name: "Алина Морозова", avatar: "АМ", lastMessage: "Окей, увидимся завтра!", time: "14:32", unread: 2, online: true, type: "personal" },
  { id: 2, name: "Дизайн команда", avatar: "ДК", lastMessage: "Макеты готовы, смотри 👀", time: "13:10", unread: 5, online: false, type: "group", members: 8 },
  { id: 3, name: "Максим Волков", avatar: "МВ", lastMessage: "Отличная идея!", time: "12:44", unread: 0, online: true, type: "personal" },
  { id: 4, name: "Запуск продукта", avatar: "ЗП", lastMessage: "Дедлайн — пятница", time: "11:00", unread: 12, online: false, type: "group", members: 15 },
  { id: 5, name: "Соня Иванова", avatar: "СИ", lastMessage: "Пришлёшь файл?", time: "вчера", unread: 0, online: false, type: "personal" },
  { id: 6, name: "Dev Team", avatar: "DT", lastMessage: "Деплой прошёл успешно 🚀", time: "вчера", unread: 3, online: false, type: "group", members: 6 },
  { id: 7, name: "Кирилл Новиков", avatar: "КН", lastMessage: "Созвонимся?", time: "вчера", unread: 0, online: true, type: "personal" },
];

const MESSAGES: Message[] = [
  { id: 1, chatId: 1, text: "Привет! Как дела с проектом?", time: "14:20", mine: false, avatar: "АМ" },
  { id: 2, chatId: 1, text: "Всё идёт по плану, почти готово!", time: "14:21", mine: true },
  { id: 3, chatId: 1, text: "Классно! Когда покажешь?", time: "14:22", mine: false, avatar: "АМ" },
  { id: 4, chatId: 1, text: "Завтра утром пришлю первую версию 🔥", time: "14:28", mine: true },
  { id: 5, chatId: 1, text: "Окей, увидимся завтра!", time: "14:32", mine: false, avatar: "АМ" },
  { id: 6, chatId: 2, text: "Всем привет! Сегодня созвон в 15:00", time: "10:00", mine: false, avatar: "ДК", senderName: "Артём" },
  { id: 7, chatId: 2, text: "Буду!", time: "10:05", mine: true },
  { id: 8, chatId: 2, text: "Я тоже подключусь", time: "10:08", mine: false, avatar: "СИ", senderName: "Соня" },
  { id: 9, chatId: 2, text: "Макеты готовы, смотри 👀", time: "13:10", mine: false, avatar: "МВ", senderName: "Максим" },
  { id: 10, chatId: 3, text: "Привет, слушай, есть идея!", time: "12:30", mine: false, avatar: "МВ" },
  { id: 11, chatId: 3, text: "Давай, рассказывай!", time: "12:35", mine: true },
  { id: 12, chatId: 3, text: "Отличная идея!", time: "12:44", mine: true },
];

export default function Index() {
  const [user, setUser] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [videoCallActive, setVideoCallActive] = useState(false);
  const [videoCallChat, setVideoCallChat] = useState<Chat | null>(null);

  if (!user) {
    return <AuthPage onAuth={(name) => setUser(name)} />;
  }

  const activeChat = CHATS.find((c) => c.id === activeChatId)!;
  const chatMessages = messages.filter((m) => m.chatId === activeChatId);

  const sendMessage = (text: string) => {
    const newMsg: Message = {
      id: Date.now(),
      chatId: activeChatId,
      text,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      mine: true,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const startVideoCall = () => {
    setVideoCallChat(activeChat);
    setVideoCallActive(true);
  };

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
        <Sidebar chats={CHATS} activeChatId={activeChatId} onSelectChat={setActiveChatId} userName={user} onLogout={() => setUser(null)} />
        <ChatWindow chat={activeChat} messages={chatMessages} onSend={sendMessage} onVideoCall={startVideoCall} />
      </div>

      {videoCallActive && videoCallChat && (
        <VideoCall chat={videoCallChat} onClose={() => setVideoCallActive(false)} />
      )}
    </div>
  );
}
