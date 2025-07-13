import os
import uuid
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

# Dados fixos do bot
BOT_ID = "acbf5504-742d-4241-93ca-816cf95ed2b9"
BOTPRESS_API_BASE = f"https://api.botpress.cloud/v1/bots/{BOT_ID}"
BOT_TOKEN = "bp_pat_UXlgxksWgkEa2y52pgfIXjYTLXfm1jFltn3e"

HEADERS = {
    "Authorization": f"Bearer {BOT_TOKEN}",
    "Content-Type": "application/json"
}

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def ping():
    return "Servidor online!"

@app.route("/message", methods=["POST"])
def message():
    msg = request.form.get("message", "")
    if not msg:
        return jsonify({"response": "Mensagem não fornecida"}), 400

    try:
        user_id = "user-123"
        conv_id = str(uuid.uuid4())  # conversa nova por requisição

        # Envia a mensagem
        payload = {
            "userId": user_id,
            "type": "text",
            "text": msg,
            "conversationId": conv_id,
            "tags": [],
            "payload": {}
        }

        send_url = f"{BOTPRESS_API_BASE}/conversations"
        send_res = requests.post(send_url, headers=HEADERS, json=payload)
        if send_res.status_code != 200:
            return jsonify({"response": f"Erro ao enviar: {send_res.text}"}), send_res.status_code

        # Aguarda um tempo para a resposta estar pronta (ajuste se precisar)
        time.sleep(2)

        # Busca as mensagens da conversa
        get_url = f"{BOTPRESS_API_BASE}/conversations/{conv_id}/messages"
        get_res = requests.get(get_url, headers=HEADERS)
        if get_res.status_code != 200:
            return jsonify({"response": f"Erro ao buscar resposta: {get_res.text}"}), get_res.status_code

        mensagens = get_res.json().get("messages", [])
        respostas = [m["payload"]["text"] for m in mensagens if m.get("role") == "bot"]
        resposta_final = respostas[-1] if respostas else "Sem resposta do bot."

        return jsonify({"response": resposta_final})

    except Exception as e:
        return jsonify({"response": f"Erro: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
