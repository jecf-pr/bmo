import os
import time
import requests
from flask import Flask, request, jsonify
import jwt  # pip install pyjwt

app = Flask(__name__)
from flask_cors import CORS; CORS(app)

BOT_TOKEN = "bp_pat_UXlgxksWgkEa2y52pgfIXjYTLXfm1jFltn3e"
BOT_ID = "acbf5504-742d-4241-93ca-816cf95ed2b9"
INTEGRATION_KEY = os.environ.get("BOTPRESS_ENCRYPTION_KEY", "secret_integration_key")

HEADERS = {"Authorization": f"Bearer {BOT_TOKEN}", "Content-Type": "application/json"}

def sign_user_key(user_id):
    return jwt.encode({"id": user_id, "iat": int(time.time())},
                      INTEGRATION_KEY, algorithm="HS256")

def criar_conversa(user_id):
    key = sign_user_key(user_id)
    resp = requests.post(
        f"https://chat.botpress.cloud/{BOT_ID}/conversations",
        headers={**HEADERS, "x-user-key": key},
        json={"integrationName": "webchat"}
    )
    resp.raise_for_status()
    return resp.json()["conversationId"]

def enviar_msg(user_id, conversation_id, text):
    key = sign_user_key(user_id)
    resp = requests.post(
        f"https://chat.botpress.cloud/{BOT_ID}/conversations/{conversation_id}/messages",
        headers={**HEADERS, "x-user-key": key},
        json={"type": "text", "text": text}
    )
    resp.raise_for_status()
    # buscar histórico
    r2 = requests.get(
        f"https://chat.botpress.cloud/{BOT_ID}/conversations/{conversation_id}/messages",
        headers={**HEADERS, "x-user-key": key}
    )
    return [m["payload"]["text"] for m in r2.json().get("messages", []) if m["type"] == "text"]

@app.route("/message", methods=["POST"])
def message():
    pergunta = request.form.get("message", "")
    user = request.form.get("userId", "render-user")
    if not pergunta:
        return jsonify({"error": "Pergunta não enviada"}), 400

    try:
        conv_id = criar_conversa(user)
        respostas = enviar_msg(user, conv_id, pergunta)
        return jsonify({"response": "\n".join(respostas)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET"])
def home(): return "✅ Chat Integration API OK"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

