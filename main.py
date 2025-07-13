import os
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests

# Arquivos e variáveis
TEXT_FILE = "conteudo"
INDEX_FILE = "model/vectorizer.pkl"
TEXTOS_FILE = "model/textos.pkl"
HUGGINGFACE_API_TOKEN = os.environ.get("HF_API_KEY")
HUGGINGFACE_MODEL_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base"


HEADERS = {
    "Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"
}

# Inicializa Flask
app = Flask(__name__)
CORS(app)

# Indexa os textos, cria a pasta model/ e os arquivos .pkl
def indexar_textos():
    if not os.path.exists(TEXT_FILE):
        raise FileNotFoundError("Arquivo de conteúdo não encontrado.")

    with open(TEXT_FILE, "r", encoding="utf-8") as f:
        textos = [t.strip() for t in f.read().split("\n\n") if t.strip()]

    os.makedirs("model", exist_ok=True)

    vectorizer = TfidfVectorizer().fit(textos)

    with open(INDEX_FILE, "wb") as f:
        pickle.dump(vectorizer, f)
    with open(TEXTOS_FILE, "wb") as f:
        pickle.dump(textos, f)

    print("Indexação concluída.")

# Busca o trecho mais relevante com base na pergunta
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

# Chama a API da Hugging Face
def gerar_resposta(prompt):
    payload = {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 150, "temperature": 0.7}
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

# Rota principal
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

# Gera os arquivos no início do app, mesmo com gunicorn
if not os.path.exists(INDEX_FILE):
    try:
        indexar_textos()
    except Exception as e:
        print(f"[ERRO] Falha ao indexar textos: {str(e)}")
