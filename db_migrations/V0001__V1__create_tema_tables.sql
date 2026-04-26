
CREATE TABLE IF NOT EXISTS t_p81522588_global_messenger_pro.users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p81522588_global_messenger_pro.chats (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('personal', 'group')),
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p81522588_global_messenger_pro.chat_members (
  chat_id INTEGER REFERENCES t_p81522588_global_messenger_pro.chats(id),
  user_id INTEGER REFERENCES t_p81522588_global_messenger_pro.users(id),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS t_p81522588_global_messenger_pro.messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER REFERENCES t_p81522588_global_messenger_pro.chats(id),
  user_id INTEGER REFERENCES t_p81522588_global_messenger_pro.users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON t_p81522588_global_messenger_pro.messages(chat_id, created_at);
