import os
import glob
import pickle
from sentence_transformers import SentenceTransformer

TXT_FOLDER = 'filosofia_txts'
INDEX_FILE = 'filosofia_index.pkl'

model = SentenceTransformer('all-MiniLM-L6-v2')

def processar_txts():
    dados = []
    for filepath in glob.glob(os.path.join(TXT_FOLDER, '*.txt')):
        with open(filepath, 'r', encoding='utf-8') as f:
            texto = f.read()
            paragrafos = [p.strip() for p in texto.split('\n') if p.strip()]
            for par in paragrafos:
                emb = model.encode(par)
                dados.append({'texto': par, 'embedding': emb})
    return dados

def salvar_index(dados):
    with open(INDEX_FILE, 'wb') as f:
        pickle.dump(dados, f)

dados = processar_txts()
salvar_index(dados)
print(f"✅ Indexado {len(dados)} parágrafos.")
