from flask import Flask, request, jsonify
from flask_cors import CORS
from gensim.models import Word2Vec
import traceback
import torch
import torch.nn as nn
import torch.optim as optim
from collections import deque
import pickle
import os

HISTORY_PATH = 'database/user_history.pkl'
MODEL_PATH = 'model/word2vec.model'
LSTM_PATH = 'model/textgen_lstm.pt'

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

history = deque(maxlen=500)

# Frases iniciais padrão
history.extend([
    "Lembre-se: respirar fundo ajuda a acalmar a mente.",
    "A ansiedade não define quem você é.",
    "É saudável expressar emoções.",
    "Conversar pode ajudar a entender seus sentimentos.",
    "Os desafios fazem parte do crescimento pessoal.",
    "Você tem valor e merece cuidado.",
    "Buscar ajuda é um sinal de força, não de fraqueza.",
    "O autoconhecimento é um passo importante para a mudança."
])

# Carrega prompts iniciais, se houver
if os.path.exists('prompts_iniciais.txt'):
    with open('prompts_iniciais.txt', 'r') as f:
        linhas = [linha.strip() for linha in f if linha.strip()]
        history.extend(linhas)

def save_history():
    os.makedirs(os.path.dirname(HISTORY_PATH), exist_ok=True)
    with open(HISTORY_PATH, 'wb') as f:
        pickle.dump(history, f)

def load_history():
    if os.path.exists(HISTORY_PATH):
        with open(HISTORY_PATH, 'rb') as f:
            return pickle.load(f)
    return history

class LSTMGenerator(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(LSTMGenerator, self).__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim)
        self.fc = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out[-1])
        return out

def train_on_new_data():
    try:
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        os.makedirs(os.path.dirname(LSTM_PATH), exist_ok=True)

        sentences = [msg.split() for msg in history if msg.strip()]
        if not sentences:
            return

        model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=1)
        model.save(MODEL_PATH)

        lstm = LSTMGenerator(100, 128, 100)
        criterion = nn.MSELoss()
        optimizer = optim.Adam(lstm.parameters(), lr=0.001)

        for epoch in range(1):
            for sentence in sentences:
                for i in range(len(sentence) - 1):
                    try:
                        input_word = torch.tensor(model.wv[sentence[i]])
                        target_word = torch.tensor(model.wv[sentence[i + 1]])
                        input_word = input_word.view(1, 1, -1)
                        target_word = target_word.view(1, -1)

                        output = lstm(input_word)
                        loss = criterion(output, target_word)
                        optimizer.zero_grad()
                        loss.backward()
                        optimizer.step()
                    except Exception:
                        continue

        torch.save(lstm.state_dict(), LSTM_PATH)

    except Exception:
        print("Erro no treinamento:")
        print(traceback.format_exc())

def text_to_vec(word):
    model = Word2Vec.load(MODEL_PATH)
    if word in model.wv:
        return torch.tensor(model.wv[word]).view(1, 1, -1)
    return None

def vec_to_word(vec):
    model = Word2Vec.load(MODEL_PATH)
    try:
        return model.wv.similar_by_vector(vec.view(-1).detach().numpy(), topn=1)[0][0]
    except Exception:
        return None

def generate_sentence(start_word='ansiedade', max_words=20):
    if not os.path.exists(LSTM_PATH):
        return "Respire fundo e tente novamente."

    model = LSTMGenerator(100, 128, 100)
    model.load_state_dict(torch.load(LSTM_PATH))
    model.eval()

    sentence = [start_word]
    for _ in range(max_words):
        vec_input = text_to_vec(sentence[-1])
        if vec_input is None:
            break
        out_vec = model(vec_input)
        next_word = vec_to_word(out_vec[0])
        if not next_word or next_word in sentence:
            break
        sentence.append(next_word)
    return ' '.join(sentence)

@app.route('/message', methods=['POST'])
def respond():
    try:
        print("📥 Cabeçalhos recebidos:", request.headers)
        print("📦 Corpo bruto:", request.data)

        msg = ''

        # Tenta extrair do JSON (application/json)
        if request.is_json:
            data = request.get_json()
            msg = data.get('message', '').strip()

        # Tenta extrair do form (application/x-www-form-urlencoded)
        elif 'message' in request.form:
            msg = request.form.get('message', '').strip()

        print("🧠 Mensagem recebida:", msg)

        if not msg:
            return jsonify({"response": "Por favor, envie uma mensagem válida."})

        history.append(msg)
        sentence = generate_sentence(start_word=msg.split()[0])

        resposta = f"Vamos conversar sobre isso... {sentence}"

        train_on_new_data()
        save_history()

        return jsonify({"response": resposta})

    except Exception:
        print("💥 Erro ao responder:")
        print(traceback.format_exc())
        return jsonify({"response": "Desculpa, deu erro interno."}), 500

@app.route('/')
def home():
    return "BMO está online. Envie POST para /message"

if __name__ == '__main__':
    import os
    history = load_history()
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
