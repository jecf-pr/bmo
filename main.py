from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
from sentence_transformers import SentenceTransformer, util

obj = {}
with open("filosofia_index.pkl", "wb") as f:
    pickle.dump(obj, f)


with open(INDEX_FILE, 'rb') as f:
    base = pickle.load(f)

app = Flask(__name__)
CORS(app)

@app.route("/message", methods=["POST"])
def responder():
    try:
        data = request.get_json(force=True)
        pergunta = data.get("message", "")
        if not pergunta.strip():
            return jsonify({"response": "Pergunta vazia"})

        emb_user = model.encode(pergunta)
        melhores = sorted(
            base,
            key=lambda x: util.cos_sim(emb_user, x['embedding']),
            reverse=True
        )

        resposta = melhores[0]['texto']
        return jsonify({"response": resposta})

    except Exception as e:
        return jsonify({"response": f"Erro: {str(e)}"}), 500

@app.route("/")
def home():
    return "Servidor BMO pronto 🧠"

if __name__ == '__main__':
    app.run(port=3000)
