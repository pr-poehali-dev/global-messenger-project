"""
Авторизация и регистрация пользователей Tema.
POST /register — регистрация по номеру телефона
POST /login — вход по номеру телефона
GET /me — получить текущего пользователя по токену
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = "t_p81522588_global_messenger_pro"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_token(user_id: int) -> str:
    return hashlib.sha256(f"{user_id}{secrets.token_hex(16)}".encode()).hexdigest()

def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
    }

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    body = json.loads(event.get("body") or "{}")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    conn = get_conn()
    cur = conn.cursor()

    # Регистрация
    if action == "register" and method == "POST":
        name = body.get("name", "").strip()
        phone = body.get("phone", "").strip()
        password = body.get("password", "")

        if not name or not phone or not password:
            conn.close()
            return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Заполни все поля"})}

        pw_hash = hash_password(password)
        try:
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (name, phone, password_hash) VALUES (%s, %s, %s) RETURNING id",
                (name, phone, pw_hash)
            )
            user_id = cur.fetchone()[0]
            token = make_token(user_id)
            cur.execute(f"UPDATE {SCHEMA}.users SET password_hash = %s WHERE id = %s", (pw_hash + ":" + token, user_id))
            conn.commit()
            conn.close()
            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"token": token, "user": {"id": user_id, "name": name, "phone": phone}})
            }
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            conn.close()
            return {"statusCode": 409, "headers": cors_headers(), "body": json.dumps({"error": "Этот номер уже зарегистрирован"})}

    # Вход
    if action == "login" and method == "POST":
        phone = body.get("phone", "").strip()
        password = body.get("password", "")

        cur.execute(f"SELECT id, name, phone, password_hash FROM {SCHEMA}.users WHERE phone = %s", (phone,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Номер не найден"})}

        user_id, name, phone_db, stored = row
        base_hash = stored.split(":")[0]
        if base_hash != hash_password(password):
            conn.close()
            return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Неверный пароль"})}

        token = make_token(user_id)
        cur.execute(f"UPDATE {SCHEMA}.users SET password_hash = %s WHERE id = %s", (base_hash + ":" + token, user_id))
        conn.commit()
        conn.close()
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"token": token, "user": {"id": user_id, "name": name, "phone": phone_db}})
        }

    # Получить текущего пользователя
    if action == "me" and method == "GET":
        auth = event.get("headers", {}).get("X-Authorization", "")
        token = auth.replace("Bearer ", "").strip()
        cur.execute(f"SELECT id, name, phone, password_hash FROM {SCHEMA}.users WHERE password_hash LIKE %s", (f"%:{token}",))
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Не авторизован"})}
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"user": {"id": row[0], "name": row[1], "phone": row[2]}})
        }

    conn.close()
    return {"statusCode": 404, "headers": cors_headers(), "body": json.dumps({"error": "Not found"})}