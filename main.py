from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

# Sua URL pública do ngrok
NGROK_URL = "https://6dc051dc78f0.ngrok-free.app"

@app.route("/generate", methods=["POST"])
def proxy_generate():
    data = request.json
    try:
        # Repassa a requisição para sua IA local via ngrok
        resp = requests.post(f"{NGROK_URL}/generate", json=data)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Render define a porta via env
    app.run(host="0.0.0.0", port=port)

