import os
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests

# Caminhos dos arquivos
TEXT_FILE = "conteudo"
INDEX_FILE = "model/vectorizer.pkl"
TEXTOS_FILE = "model/textos.pkl"

# Hugging Face
HUGGINGFACE_API_TOKEN = os.environ.get("HF_API_KEY")  # Defina no Render!
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

def gerar_resposta(prompt):
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 150,
            "temperature": 0.7
        }
    }

    try:
        response = requests.post(
            HUGGINGFACE_MODEL_URL,
            headers=HEADERS,
            json=payload,
            timeout=30
        )
        if response.status_code != 200:
            return f"Erro HTTP {response.status_code}: {response.text}"

        resposta = response.json()

        if isinstance(resposta, list) and "generated_text" in resposta[0]:
            return resposta[0]["generated_text"].strip()

        return "Erro: formato inesperado de resposta"

    except Exception as e:
        return f"Erro de requisição: {str(e)}"

@app.route("/", methods=["POST"])
def message():
    pergunta = ""
    if request.is_json:
        data = request.get_json()
        pergunta = data.get("message", "")
    else:
        pergunta = request.form.get("message", "")

    if not pergunta:
        return jsonify({"erro": "Pergunta não fornecida"}), 400

    try:
        contexto = buscar_contexto(pergunta)
        prompt = f"{contexto}\n\nPergunta: {pergunta}\nResposta:"
        resposta = gerar_resposta(prompt)
        return jsonify({"response": resposta})
    except Exception as e:
        return jsonify({"response": f"Erro: {str(e)}"}), 500

if __name__ == "__main__":
    if not os.path.exists(INDEX_FILE):
        print("Gerando índice...")
        indexar_textos()
    else:
        print("Índice já existe.")
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
