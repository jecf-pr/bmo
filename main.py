import os
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

TEXT_FILE = "conteudo"  # Arquivo de texto com o conteúdo
INDEX_FILE = "model/faiss_index.pkl"
EMBEDDINGS_FILE = "model/embeddings.npy"
METADATA_FILE = "model/metadata.pkl"
MODEL_NAME = "all-MiniLM-L6-v2"
PROMPT_TEMPLATE = "Responda como um professor de filosofia que entende muito do assunto e usa uma linguagem clara e envolvente. Use como base o seguinte: \n\n{contexto}\n\nPergunta: {pergunta}"

app = Flask(__name__)
CORS(app)
model = SentenceTransformer(MODEL_NAME)

def indexar_textos():
    if not os.path.exists(TEXT_FILE):
        raise FileNotFoundError(f"O arquivo '{TEXT_FILE}' não foi encontrado.")

    if os.path.isdir(TEXT_FILE):
        raise Exception(f"O caminho '{TEXT_FILE}' é uma pasta, mas esperava um arquivo.")

    with open(TEXT_FILE, 'r', encoding='utf-8') as f:
        conteudo = f.read()

    textos = [t.strip() for t in conteudo.split("\n\n") if t.strip()]
    fontes = [f"Trecho {i+1}" for i in range(len(textos))]

    if not textos:
        raise ValueError("Nenhum texto encontrado dentro do arquivo para indexar.")

    embeddings = model.encode(textos, convert_to_numpy=True)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    os.makedirs("model", exist_ok=True)
    with open(INDEX_FILE, 'wb') as f:
        pickle.dump(index, f)
    np.save(EMBEDDINGS_FILE, embeddings)
    with open(METADATA_FILE, 'wb') as f:
        pickle.dump(textos, f)

    print("Indexação concluída.")

def buscar_contexto(pergunta, top_k=1):
    if not os.path.exists(INDEX_FILE):
        indexar_textos()

    with open(INDEX_FILE, 'rb') as f:
        index = pickle.load(f)
    with open(METADATA_FILE, 'rb') as f:
        textos = pickle.load(f)

    pergunta_emb = model.encode([pergunta])
    D, I = index.search(pergunta_emb, top_k)

    return textos[I[0][0]]

@app.route("/message", methods=["POST"])
def message():
    pergunta = request.form.get("message", "")
    if not pergunta:
        return jsonify({"erro": "Pergunta não fornecida"}), 400

    try:
        contexto = buscar_contexto(pergunta)
        prompt_final = PROMPT_TEMPLATE.format(contexto=contexto, pergunta=pergunta)
        return jsonify({"response": prompt_final})
    except Exception as e:
        return jsonify({"response": f"Erro ao processar: {str(e)}"}), 500

if __name__ == "__main__":
    if not os.path.exists(INDEX_FILE):
        indexar_textos()
    app.run(host="0.0.0.0", port=10000)
