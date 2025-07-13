import os
import pickle
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Configurações
TEXT_FILE = "conteudo"
INDEX_FILE = "model/vectorizer.pkl"
TEXTOS_FILE = "model/textos.pkl"

BOT_ID = "acbf5504-742d-4241-93ca-816cf95ed2b9"
CLIENT_ID = "3d43f9e1-cf6f-4a1c-b254-3d7906744d47"
BOT_TOKEN = os.environ.get("BOTPRESS_TOKEN")

app = Flask(__name__)
CORS(app)

# ===================== TEXTOS ============================
def indexar_textos():
    if not os.path.exists(TEXT_FILE):
        raise FileNotFoundError("Arquivo de conteúdo não encontrado.")

    with open(TEXT_FILE, "r", encoding="utf-8") as f:
        textos = [t.strip() for t in f.read().split("\n\n") if t.strip()]

    vectorizer = TfidfVectorizer().fit(textos)
    os.makedirs("model", exist_ok=True)

    with open(INDEX_FILE, "wb") as f:
        pickle.dump(vectorizer, f)
    with open(TEXTOS_FILE, "wb") as f:
        pickle.dump(textos, f)

    print("Indexação concluída.")

def buscar_contexto(pergunta):
    with open(INDEX_FILE, "rb") as f:
        vectorizer = pickle.load(f)
    with open(TEXTOS_FILE, "rb") as f:
        textos = pickle.load(f)

    pergunta_vec = vectorizer.transform([pergunta])
    textos_vec = vectorizer.transform(textos)
    scores = cosine_similarity(pergunta_vec, textos_vec)[0]
    idx = scores.argmax()
    return textos[idx]

# ===================== BOTPRESS ============================
def criar_conversa():
    url = f"https://api.botpress.cloud/v1/bots/{BOT_ID}/conversations"
    headers = {
        "Authorization": f"Bearer {BOT_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "clientId": CLIENT_ID
    }
    res = requests.post(url, json=payload, headers=headers)
    res.raise_for_status()
    return res.json()["conversationId"]

def enviar_mensagem(conversation_id, texto):
    url = f"https://api.botpress.cloud/v1/bots/{BOT_ID}/conversations/{conversation_id}/messages"
    headers = {
        "Authorization": f"Bearer {BOT_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "type": "text",
        "role": "user",
        "content": texto
    }
    res = requests.post(url, json=payload, headers=headers)
    res.raise_for_status()

def obter_resposta(conversation_id):
    url = f"https://api.botpress.cloud/v1/bots/{BOT_ID}/conversations/{conversation_id}/messages"
    headers = {
        "Authorization": f"Bearer {BOT_TOKEN}"
    }
    res = requests.get(url, headers=headers)
    res.raise_for_status()
    mensagens = res.json()["messages"]

    for msg in reversed(mensagens):
        if msg["role"] == "bot":
            return msg["content"]
    return "Nenhuma resposta do bot."

def conversar_com_botpress(pergunta):
    conversation_id = criar_conversa()
    enviar_mensagem(conversation_id, pergunta)
    return obter_resposta(conversation_id)

# ===================== FLASK ============================
@app.route("/", methods=["GET"])
def ping():
    return "Chatbot online com Botpress!"

@app.route("/message", methods=["POST"])
def message():
    pergunta = request.form.get("message", "")
    if not pergunta:
        return jsonify({"erro": "Pergunta não fornecida"}), 400

    try:
        contexto = buscar_contexto(pergunta)
        pergunta_com_contexto = f"{contexto}\n\n{pergunta}"
        resposta = conversar_com_botpress(pergunta_com_contexto)
        return jsonify({"response": resposta})
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"response": f"Erro: {str(e)}"}), 500

if __name__ == "__main__":
    if not os.path.exists(INDEX_FILE):
        indexar_textos()
    app.run(host="0.0.0.0", port=10000)
