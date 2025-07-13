import os
import pickle
import requests
import jwt
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Configurações
TEXT_FILE = "conteudo"
INDEX_FILE = "model/vectorizer.pkl"
TEXTOS_FILE = "model/textos.pkl"

# Botpress configs
BOTPRESS_URL = "https://api.botpress.cloud/v1/chat/messages"
BOT_ID = "acbf5504-742d-4241-93ca-816cf95ed2b9"
CLIENT_ID = "3d43f9e1-cf6f-4a1c-b254-3d7906744d47"
BOT_TOKEN = os.environ.get("BOTPRESS_TOKEN")  # crie a variável no Render!

app = Flask(__name__)
CORS(app)

# Indexar textos locais para buscar contexto
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

# Chamar o Botpress remoto com token e clientId
def enviar_para_botpress(pergunta):
    payload = {
        "botId": BOT_ID,
        "clientId": CLIENT_ID,
        "messages": [{"type": "text", "content": pergunta}]
    }

    headers = {
        "Authorization": f"Bearer {BOT_TOKEN}",
        "Content-Type": "application/json"
    }

    try:
        r = requests.post(BOTPRESS_URL, json=payload, headers=headers, timeout=30)
        if r.status_code != 200:
            return f"Erro HTTP {r.status_code}: {r.text}"

        resposta = r.json()
        messages = resposta.get("messages", [])
        if messages:
            return messages[-1]["content"]
        else:
            return "Erro: resposta vazia do Botpress."

    except Exception as e:
        return f"Erro ao acessar Botpress: {str(e)}"

@app.route("/", methods=["GET"])
def ping():
    return "Chatbot online!"

@app.route("/message", methods=["POST"])
def message():
    try:
        pergunta = request.form.get("message", "")
        print("PERGUNTA:", pergunta)

        if not pergunta:
            return jsonify({"erro": "Pergunta não fornecida"}), 400

        contexto = buscar_contexto(pergunta)
        print("CONTEXTO:", contexto)

        pergunta_com_contexto = f"{contexto}\n\n{pergunta}"
        resposta = enviar_para_botpress(pergunta_com_contexto)
        print("RESPOSTA:", resposta)

        return jsonify({"response": resposta})
    except Exception as e:
        import traceback
        print("ERRO AO PROCESSAR:", traceback.format_exc())
        return jsonify({"response": f"Erro: {str(e)}"}), 500

if __name__ == "__main__":
    if not os.path.exists(INDEX_FILE):
        indexar_textos()
    app.run(host="0.0.0.0", port=10000)
