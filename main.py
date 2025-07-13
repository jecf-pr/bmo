from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import traceback

app = Flask(__name__)
CORS(app)

BOT_ID = 'acbf5504-742d-4241-93ca-816cf95ed2b9'
BOT_TOKEN = 'bp_pat_UXlgxksWgkEa2y52pgfIXjYTLXfm1jFltn3e'
BOTPRESS_API_URL = f'https://api.botpress.cloud/v1/bots/{BOT_ID}/conversations'

HEADERS = {
    'Authorization': f'Bearer {BOT_TOKEN}',
    'Content-Type': 'application/json'
}

def criar_conversa():
    try:
        response = requests.post(BOTPRESS_API_URL, headers=HEADERS)
        print("Criar conversa status:", response.status_code)
        print("Criar conversa body:", response.text)
        if response.status_code == 200:
            return response.json()['id']
        return None
    except Exception as e:
        print("Erro criar conversa:", e)
        return None

def enviar_mensagem(conversation_id, mensagem):
    try:
        url = f'{BOTPRESS_API_URL}/{conversation_id}/messages'
        payload = {"type": "text", "text": mensagem}

        response = requests.post(url, headers=HEADERS, json=payload)
        print("Enviar msg status:", response.status_code)
        print("Enviar msg body:", response.text)
        if response.status_code != 200:
            return None

        resposta = requests.get(url, headers=HEADERS)
        mensagens = resposta.json().get('messages', [])
        respostas = [msg['payload']['text'] for msg in mensagens if msg['role'] == 'bot']
        return respostas[-1] if respostas else "Sem resposta do bot."
    except Exception as e:
        print("Erro enviar mensagem:", e)
        return None

@app.route('/')
def index():
    return "Servidor rodando!"

@app.route('/mensagem', methods=['POST'])
def mensagem():
    try:
        texto_usuario = request.form.get('message')
        print("Mensagem recebida:", texto_usuario)

        if not texto_usuario:
            return jsonify({'erro': 'Campo "message" não enviado.'}), 400

        conversa_id = criar_conversa()
        if not conversa_id:
            return jsonify({'erro': 'Erro ao criar conversa.'}), 500

        resposta_bot = enviar_mensagem(conversa_id, texto_usuario)
        if not resposta_bot:
            return jsonify({'erro': 'Erro ao obter resposta do bot.'}), 500

        return jsonify({'response': resposta_bot})

    except Exception as e:
        print("Erro interno:")
        traceback.print_exc()
        return jsonify({'erro': 'Erro interno no servidor', 'detalhes': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
