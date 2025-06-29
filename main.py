from flask import Flask, request, jsonify
from flask_cors import CORS
from gensim.models import Word2Vec
import torch
import torch.nn as nn
import os
import pickle
from collections import deque

HISTORY_PATH = 'database/user_history.pkl'
MODEL_PATH = 'model/word2vec.model'
LSTM_PATH = 'model/textgen_lstm.pt'

app = Flask(__name__)
CORS(app)

history = deque(maxlen=500)

# Carrega histórico salvo, ou usa default
if os.path.exists(HISTORY_PATH):
    with open(HISTORY_PATH, 'rb') as f:
        history = pickle.load(f)
else:
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

# Carregando modelos uma vez só
word2vec_model = None
lstm_model = None

class LSTMGenerator(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(LSTMGenerator, self).__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim)
        self.fc = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out[-1])
        return out

def load_models():
    global word2vec_model, lstm_model
    if os.path.exists(MODEL_PATH):
        word2vec_model = Word2Vec.load(MODEL_PATH)
    else:
        word2vec_model = None
    if os.path.exists(LSTM_PATH):
        lstm_model = LSTMGenerator(100, 128, 100)
        lstm_model.load_state_dict(torch.load(LSTM_PATH, map_location=torch.device('cpu')))
        lstm_model.eval()
    else:
        lstm_model = None

def text_to_vec(word):
    if word2vec_model and word in word2vec_model.wv:
        return torch.tensor(word2vec_model.wv[word]).view(1, 1, -1)
    return None

def vec_to_word(vec):
    if not word2vec_model:
        return None
    try:
        return word2vec_model.wv.similar_by_vector(vec.view(-1).detach().numpy(), topn=1)[0][0]
    except Exception:
        return None

def generate_sentence(start_word='ansiedade', max_words=20):
    if not lstm_model or not word2vec_model:
        return "Respire fundo e tente novamente."

    sentence = [start_word]
    for _ in range(max_words):
        vec_input = text_to_vec(sentence[-1])
        if vec_input is None:
            break
        out_vec = lstm_model(vec_input)
        next_word = vec_to_word(out_vec[0])
        if not next_word or next_word in sentence:
            break
        sentence.append(next_word)
    return ' '.join(sentence)

def save_history():
    os.makedirs(os.path.dirname(HISTORY_PATH), exist_ok=True)
    with open(HISTORY_PATH, 'wb') as f:
        pickle.dump(history, f)

@app.route('/message', methods=['POST'])
def respond():
    msg = request.form.get('message', '').strip()
    if not msg:
        return jsonify({"response": "Por favor, envie uma mensagem válida."})

    history.append(msg)
    save_history()

    sentence = generate_sentence(start_word=msg.split()[0])
    resposta = f"Vamos conversar sobre isso... {sentence}"

    return jsonify({"response": resposta})

@app.route('/')
def home():
    return "BMO está online. Envie POST para /message"

if __name__ == '__main__':
    load_models()
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
