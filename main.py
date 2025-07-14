from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

# Sua URL do ngrok
NGROK_URL = "https://ab44e1ab9faf.ngrok-free.app"

@app.route("/message", methods=["POST"])
def proxy_generate():
    data = request.json  # aqui recebemos JSON da chamada externa

    try:
        # Converta os dados para formato x-www-form-urlencoded (dict para form data)
        # Se data for um dict, pode passar direto no data= do requests
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        # requests.post com data= espera dict ou string urlencoded
        resp = requests.post(f"{NGROK_URL}/generate", data=data, headers=headers)

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
