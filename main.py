import os
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

# === Configurações ===
TEXT_FILE = "conteudo"
INDEX_FILE = "model/faiss_index.pkl"
METADATA_FILE = "model/metadata.pkl"
MODEL_NAME_EMBEDDINGS = "all-MiniLM-L6-v2"

# Prompt com a personalidade da sua IA
PERSONALIDADE_IA = (
    "Explique de forma clara, direta e divertida, como se estivesse conversando com um adolescente curioso. "
    "Evite termos técnicos desnecessários. Use exemplos simples e um tom leve e descontraído.\n\n"
)

# === Carrega modelo FLAN-T5 pequeno ===
tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-small")
model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-small")
pipe = pipeline("text2text-generation", model=model, tokenizer=tokenizer)

# === Setup Flask ===
app = Flask(__name__)
CORS(app)
model_embedding = SentenceTransformer(MODEL_NAME_EMBEDDINGS)

def indexar_textos():
    if not os.path.exists(TEXT_FILE):
        raise FileNotFoundError(f"O arquivo '{TEXT_FILE}' não foi encontrado.")

    with open(TEXT_FILE, 'r', encoding='utf-8') as f:
        conteudo = f.read()

    textos = [t.strip() for t in conteudo.split("\n\n") if t.strip()]
    if not textos:
        raise ValueError("Nenhum texto válido encontrado no arquivo.")

    embeddings = model_embedding.encode(textos, convert_to_numpy=True)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    os.makedirs("model", exist_ok=True)
    with open(INDEX_FILE, 'wb') as f:
        pickle.dump(index, f)
    with open(METADATA_FILE, 'wb') as f:
        pickle.dump(textos, f)

    print("Indexação concluída.")

def buscar_contexto(pergunta, top_k=3):
    if not os.path.exists(INDEX_FILE):
        indexar_textos()

    with open(INDEX_FILE, 'rb') as f:
        index = pickle.load(f)
    with open(METADATA_FILE, 'rb') as f:
        textos = pickle.load(f)

    pergunta_emb = model_embedding.encode([pergunta])
    D, I = index.search(pergunta_emb, top_k)
    trechos = [textos[i] for i in I[0] if i < len(textos)]
    return "\n\n".join(trechos)

def gerar_resposta(prompt):
    prompt_final = PERSONALIDADE_IA + prompt
    resultado = pipe(prompt_final, max_new_tokens=300, temperature=0.7)[0]["generated_text"]
    return resultado.strip()

@app.route("/message", methods=["POST"])
def message():
    pergunta = request.form.get("message", "")
    if not pergunta:
        return jsonify({"erro": "Pergunta não fornecida"}), 400

    try:
        contexto = buscar_contexto(pergunta)
        prompt = f"Baseando-se nos seguintes textos:\n\n{contexto}\n\nResponda a esta pergunta:\n{pergunta}"
        resposta = gerar_resposta(prompt)
        return jsonify({"response": resposta})
    except Exception as e:
        return jsonify({"response": f"Erro: {str(e)}"}), 500

if __name__ == "__main__":
    if not os.path.exists(INDEX_FILE):
        indexar_textos()
    app.run(host="0.0.0.0", port=10000)

