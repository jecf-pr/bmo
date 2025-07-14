from flask import Flask, request, jsonify
import requests
import os
from flask_cors import CORS  # <--- importa flask-cors

app = Flask(__name__)
CORS(app)  # <--- habilita CORS para todas as origens (pode restringir depois)

# Sua URL do ngrok
NGROK_URL = "https://ab44e1ab9faf.ngrok-free.app"

@app.route("/message", methods=["POST"])
def proxy_generate():
    data = request.json
    try:
        # Faz a requisição para a IA local via ngrok
        resp = requests.post(f"{NGROK_URL}/generate", json=data)

        try:
            return jsonify(resp.json()), resp.status_code
        except Exception:
            return jsonify({
                "error": "Resposta inválida da IA local.",
                "status_code": resp.status_code,
                "conteudo_bruto": resp.text
            }), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
