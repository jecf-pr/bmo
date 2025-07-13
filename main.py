from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# CONFIGURAÇÕES DO BOTPRESS
BOTPRESS_URL = "https://api.botpress.cloud/v1/chat/messages"
BOT_ID = "acbf5504-742d-4241-93ca-816cf95ed2b9"
CLIENT_ID = "3d43f9e1-cf6f-4a1c-b254-3d7906744d47"
BOT_TOKEN = "bp_pat_UXlgxksWgkEa2y52pgfIXjYTLXfm1jFltn3e"
USER_ID = "usuario-render-testando"  # Pode gerar ID dinâmico se quiser

# ENVIA A MENSAGEM PARA O BOTPRESS
def enviar_para_botpress(mensagem):
    headers = {
        "Authorization": f"Bearer {BOT_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "botId": BOT_ID,
        "clientId": CLIENT_ID,
        "userId": USER_ID,
        "type": "text",
        "text": mensagem
    }

    try:
        response = requests.post(BOTPRESS_URL, json=payload, headers=headers)
        data = response.json()

        # Verifica se a resposta veio corretamente
        mensagens = data.get("messages", [])
        textos = [m["payload"]["text"] for m in mensagens if m.get("type") == "text"]

        return "\n".join(textos) if textos else "Nenhuma resposta recebida."
    except Exception as e:
        return f"Erro na requisição: {e}"

# ENDPOINT PRINCIPAL
@app.route("/message", methods=["POST"])
def message():
    pergunta = request.form.get("message", "")
    if not pergunta:
        return jsonify({"erro": "Mensagem não enviada"}), 400

    resposta = enviar_para_botpress(pergunta)
    return jsonify({"response": resposta})

# TESTE DE VIDA
@app.route("/", methods=["GET"])
def ping():
    return "API do chatbot está online!"

# INICIA SERVIDOR
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
