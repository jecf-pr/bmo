import os
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests

# Configurações e paths
TEXT_FILE = "conteudo"
INDEX_FILE = "model/vectorizer.pkl"
TEXTOS_FILE = "model/textos.pkl"

# Token via variável de ambiente no Render
HUGGINGFACE_API_TOKEN = os.environ.get("HF_API_KEY")
HUGGINGFACE_MODEL_URL = "https://api-inference.huggingface.co/models/google/flan-t5-small"

HEADERS = {
    "Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"
}

app = Flask(__name__)
CORS(app)

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

    print("✅ Indexação concluída.")

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

def gerar_resposta(prompt):
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 150,
            "temperature": 0.7
        }
    }

    # Debug
    print("📡 Enviando para:", HUGGINGFACE_MODEL_URL)
    print("🔐 Token presente?", "Sim" if HUGGINGFACE_API_TOKEN else "Não")
    print("📤 Prompt:", prompt)

    try:
        response = requests.post(
            HUGGINGFACE_MODEL_URL,
            headers=HEADERS,
            json=payload,
            timeout=30
        )

        print("📥 Código HTTP:", response.status_code)
        print("📥 Conteúdo bruto:", response.text)

        if response.status_code != 200:
            return f"Erro HTTP {response.status_code}: {response.text}"

        resposta = response.json()

        if isinstance(resposta, dict) and "error" in resposta:
            return f"Erro da Hugging Face: {resposta['error']}"

        if isinstance(resposta, list) and len(resposta) > 0 and "generated_text" in resposta[0]:
            return resposta[0]["generated_text"].strip()

        return "⚠️ Erro: formato inesperado de resposta."

    except Exception as e:
        print("🔥 Exceção ao chamar HuggingFace:", str(e))
        return f"Erro de requisição: {str(e)}"

@app.route("/", methods=["GET"])
def ping():
    return "✅ Chatbot online!"

@app.route("/message", methods=["POST"])
def message():
    pergunta = request.form.get("message", "")
    if not pergunta:
        return jsonify({"erro": "Pergunta não fornecida"}), 400

    try:
        contexto = buscar_contexto(pergunta)
        prompt = f"{contexto}\n\nPergunta: {pergunta}\nResposta:"
        resposta = gerar_resposta(prompt)
        return jsonify({"response": resposta})
    except Exception as e:
        print("❌ Erro no /message:", str(e))
        return jsonify({"response": f"Erro: {str(e)}"}), 500

if __name__ == "__main__":
    if not os.path.exists(INDEX_FILE):
        indexar_textos()
    app.run(host="0.0.0.0", port=10000)
