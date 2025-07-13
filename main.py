from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Configurações do Botpress
BOT_ID = 'acbf5504-742d-4241-93ca-816cf95ed2b9'
BOT_TOKEN = 'bp_pat_UXlgxksWgkEa2y52pgfIXjYTLXfm1jFltn3e'
BOTPRESS_API_URL = f'https://api.botpress.cloud/v1/bots/{BOT_ID}/conversations'

HEADERS = {
    'Authorization': f'Bearer {BOT_TOKEN}',
    'Content-Type': 'application/json'
}

# Criar uma conversa nova (uma vez por usuário, ou sempre que quiser reiniciar)
def criar_conversa():
    response = requests.post(BOTPRESS_API_URL, headers=HEADERS)
    if response.status_code == 200:
        return response.json()['id']
    else:
        print("Erro ao criar conversa:", response.text)
        return None

# Enviar mensagem e obter resposta
def enviar_mensagem(conversation_id, mensagem):
    url = f'{BOTPRESS_API_URL}/{conversation_id}/messages'
    payload = {
        "type": "text",
        "text": mensagem
    }

    response = requests.post(url, headers=HEADERS, json=payload)
    if response.status_code != 200:
        print("Erro ao enviar mensagem:", response.text)
        return None

    # Aguardar resposta (simples polling)
    resposta = requests.get(url, headers=HEADERS)
    mensagens = resposta.json()['messages']
    respostas = [msg['payload']['text'] for msg in mensagens if msg['role'] == 'bot']

    return respostas[-1] if respostas else "Sem resposta."

@app.route('/mensagem', methods=['POST'])
def mensagem():
    data = request.get_json()
    texto_usuario = data.get('mensagem')

    if not texto_usuario:
        return jsonify({'erro': 'Mensagem ausente'}), 400

    # Cria nova conversa a cada mensagem (pode ser modificado para manter uma por usuário)
    conversa_id = criar_conversa()
    if not conversa_id:
        return jsonify({'erro': 'Erro ao criar conversa'}), 500

    resposta_bot = enviar_mensagem(conversa_id, texto_usuario)
    if not resposta_bot:
        return jsonify({'erro': 'Erro ao obter resposta'}), 500

    return jsonify({'resposta': resposta_bot})

@app.route('/', methods=['GET'])
def index():
    return "Servidor do Botpress rodando!"

if __name__ == '__main__':
    app.run(debug=True)

