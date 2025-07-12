import os
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# === Configurações ===
TEXT_FILE = "conteudo"
INDEX_FILE = "model/faiss_index.pkl"
EMBEDDINGS_FILE = "model/embeddings.npy"
METADATA_FILE = "model/metadata.pkl"
MODEL_NAME = "all-MiniLM-L6-v2"
PERSONALIDADE_IA = (
    "Responda como um professor que entende do assunto tratado, de forma clara e concisa, "
    "mas com um tom leve, descontraído e adequado a um adolescente curioso. "
    "Evite termos técnicos desnecessários, mas seja preciso. "
    "Use analogias simples e, se possível, algum humor leve."
)

# === IA local Hugging Face ===
tokenizer = AutoTokenizer.from_pretrained("microsoft/phi-2")
model = AutoModelForCausalLM.from_pretrained("microsoft/phi-2")
pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)

# === Flask ===
app = Flask(__name__)
CORS(app)
model_embedding = SentenceTransformer(MODEL_NAME)

def indexar_textos():
    if not os.path.exists(TEXT_FILE):
        raise FileNotFoundError(f"O arquivo '{TEXT_FILE}' não foi encontrado.")

    with open(TEXT_FILE, 'r', encoding='utf-8') as f:
        conteudo = f.read()

    textos = [t.strip() for t in conteudo.split("\n\n") if t.strip()]
    if not textos:
        raise ValueError("Nenhum texto encontrado dentro do arquivo para indexar.")

    embeddings = model_embedding.encode(textos, convert_to_numpy=True)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    os.makedirs("model", exist_ok=True)
    with open(INDEX_FILE, 'wb') as f:
        pickle.dump(index, f)
    np.save(EMBEDDINGS_FILE, embeddings)
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
    prompt_final = f"{PERSONALIDADE_IA}\n\n{prompt}"
    resultado = pipe(prompt_final, max_new_tokens=500, do_sample=True, temperature=0.7)[0]["generated_text"]
    return resultado[len(prompt_final):].strip()

@app.route("/message", methods=["POST"])
def message():
    pergunta = request.form.get("message", "")
    if not pergunta:
        return jsonify({"erro": "Pergunta não fornecida"}), 400

    try:
        contexto = buscar_contexto(pergunta)
        prompt = f"Com base nos seguintes textos:\n\n{contexto}\n\nResponda a esta pergunta:\n{pergunta}"
        resposta = gerar_resposta(prompt)
        return jsonify({"response": resposta})
    except Exception as e:
        return jsonify({"response": f"Erro ao processar: {str(e)}"}), 500

if __name__ == "__main__":
    if not os.path.exists(INDEX_FILE):
        indexar_textos()
    app.run(host="0.0.0.0", port=10000)
