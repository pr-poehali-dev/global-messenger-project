"""
Управление чатами и сообщениями Tema.
GET /chats — список чатов пользователя
POST /chats — создать чат
GET /chats/{id}/messages — сообщения чата
POST /chats/{id}/messages — отправить сообщение
"""
import json
import os
import psycopg2

SCHEMA = "t_p81522588_global_messenger_pro"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
    }

def get_user_by_token(cur, token: str):
    cur.execute(f"SELECT id, name FROM {SCHEMA}.users WHERE password_hash LIKE %s", (f"%:{token}",))
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    body = json.loads(event.get("body") or "{}")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    auth = event.get("headers", {}).get("X-Authorization", "")
    token = auth.replace("Bearer ", "").strip()

    conn = get_conn()
    cur = conn.cursor()

    user = get_user_by_token(cur, token)
    if not user:
        conn.close()
        return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Не авторизован"})}

    user_id, user_name = user

    # GET chats — список чатов
    if action == "list" and method == "GET":
        cur.execute(f"""
            SELECT c.id, c.type, c.name,
                   (SELECT text FROM {SCHEMA}.messages m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_msg,
                   (SELECT created_at FROM {SCHEMA}.messages m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_time,
                   (SELECT COUNT(*) FROM {SCHEMA}.chat_members cm2 WHERE cm2.chat_id = c.id) as members_count
            FROM {SCHEMA}.chats c
            JOIN {SCHEMA}.chat_members cm ON cm.chat_id = c.id
            WHERE cm.user_id = %s
            ORDER BY last_time DESC NULLS LAST
        """, (user_id,))
        rows = cur.fetchall()
        chats = []
        for r in rows:
            chats.append({
                "id": r[0],
                "type": r[1],
                "name": r[2],
                "lastMessage": r[3] or "",
                "time": r[4].strftime("%H:%M") if r[4] else "",
                "members": r[5],
                "unread": 0,
                "online": False,
                "avatar": (r[2] or "")[:2].upper(),
            })
        conn.close()
        return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"chats": chats})}

    # POST create — создать чат
    if action == "create" and method == "POST":
        chat_type = body.get("type", "personal")
        chat_name = body.get("name", "")
        member_ids = body.get("member_ids", [])

        cur.execute(f"INSERT INTO {SCHEMA}.chats (type, name) VALUES (%s, %s) RETURNING id", (chat_type, chat_name))
        chat_id = cur.fetchone()[0]
        cur.execute(f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id) VALUES (%s, %s)", (chat_id, user_id))
        for mid in member_ids:
            if mid != user_id:
                cur.execute(f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id) VALUES (%s, %s)", (chat_id, mid))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"id": chat_id})}

    # GET messages — сообщения чата
    if action == "messages" and method == "GET":
        chat_id = params.get("chat_id")
        if not chat_id:
            conn.close()
            return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "chat_id required"})}

        cur.execute(f"""
            SELECT m.id, m.text, m.created_at, m.user_id, u.name
            FROM {SCHEMA}.messages m
            JOIN {SCHEMA}.users u ON u.id = m.user_id
            WHERE m.chat_id = %s
            ORDER BY m.created_at ASC
            LIMIT 100
        """, (int(chat_id),))
        rows = cur.fetchall()
        messages = [{
            "id": r[0],
            "text": r[1],
            "time": r[2].strftime("%H:%M"),
            "mine": r[3] == user_id,
            "senderName": r[4],
            "avatar": r[4][:2].upper(),
        } for r in rows]
        conn.close()
        return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"messages": messages})}

    # POST send — отправить сообщение
    if action == "send" and method == "POST":
        chat_id = body.get("chat_id")
        text = body.get("text", "").strip()
        if not chat_id or not text:
            conn.close()
            return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "chat_id и text обязательны"})}

        cur.execute(
            f"INSERT INTO {SCHEMA}.messages (chat_id, user_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (int(chat_id), user_id, text)
        )
        msg_id, created_at = cur.fetchone()
        conn.commit()
        conn.close()
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"id": msg_id, "time": created_at.strftime("%H:%M")})
        }

    conn.close()
    return {"statusCode": 404, "headers": cors_headers(), "body": json.dumps({"error": "Not found"})}