const AUTH_URL = "https://functions.poehali.dev/6aa4db59-8440-47e8-9784-a3a46378c40d";
const CHATS_URL = "https://functions.poehali.dev/ef19125d-af55-42e5-9f2c-08dd8ddc4f06";

function getToken() {
  return localStorage.getItem("tema_token") || "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`,
  };
}

export async function apiRegister(name: string, phone: string, password: string) {
  const res = await fetch(`${AUTH_URL}?action=register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка регистрации");
  localStorage.setItem("tema_token", data.token);
  localStorage.setItem("tema_user", JSON.stringify(data.user));
  return data.user;
}

export async function apiLogin(phone: string, password: string) {
  const res = await fetch(`${AUTH_URL}?action=login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка входа");
  localStorage.setItem("tema_token", data.token);
  localStorage.setItem("tema_user", JSON.stringify(data.user));
  return data.user;
}

export function apiLogout() {
  localStorage.removeItem("tema_token");
  localStorage.removeItem("tema_user");
}

export function getSavedUser() {
  const u = localStorage.getItem("tema_user");
  return u ? JSON.parse(u) : null;
}

export async function apiGetChats() {
  const res = await fetch(`${CHATS_URL}?action=list`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.chats;
}

export async function apiGetMessages(chatId: number) {
  const res = await fetch(`${CHATS_URL}?action=messages&chat_id=${chatId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.messages;
}

export async function apiSendMessage(chatId: number, text: string) {
  const res = await fetch(`${CHATS_URL}?action=send`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function apiCreateChat(type: "personal" | "group", name: string, memberIds: number[] = []) {
  const res = await fetch(`${CHATS_URL}?action=create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ type, name, member_ids: memberIds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}
