import pickle
from pathlib import Path

import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request, send_from_directory
from tensorflow.keras.preprocessing.sequence import pad_sequences


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "textcnn_model.keras"
TOKENIZER_PATH = BASE_DIR / "tokenizer.pkl"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
if not TOKENIZER_PATH.exists():
    raise FileNotFoundError(f"Tokenizer file not found: {TOKENIZER_PATH}")

model = tf.keras.models.load_model(MODEL_PATH)

with TOKENIZER_PATH.open("rb") as tokenizer_file:
    tokenizer = pickle.load(tokenizer_file)

input_shape = model.input_shape
if isinstance(input_shape, list):
    input_shape = input_shape[0]
MAX_LEN = int(input_shape[1]) if len(input_shape) > 1 and input_shape[1] else 300

app = Flask(__name__, static_folder=".", static_url_path="")


def predict_text(text: str) -> dict:
    sequences = tokenizer.texts_to_sequences([text])
    padded = pad_sequences(sequences, maxlen=MAX_LEN, padding="post", truncating="post")
    prediction = model.predict(padded, verbose=0)

    # Supports outputs like [[0.91]] or [[0.12, 0.88]]
    pred_array = np.array(prediction)
    if pred_array.ndim == 2 and pred_array.shape[1] == 1:
        real_score = float(pred_array[0][0])
    elif pred_array.ndim == 2 and pred_array.shape[1] >= 2:
        real_score = float(pred_array[0][-1])
    else:
        real_score = float(pred_array.ravel()[0])

    confidence = max(real_score, 1 - real_score) * 100
    label = "REAL" if real_score >= 0.5 else "FAKE"
    return {"prediction": label, "confidence": round(confidence, 2)}


@app.route("/")
def serve_index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("text", "")).strip()

    if not text:
        return jsonify({"error": "Text is required"}), 400

    result = predict_text(text)
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
