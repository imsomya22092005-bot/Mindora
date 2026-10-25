"""Loads the two saved models and predicts sentiment + emotion."""
import json
import os
import threading

SENTIMENT_LABELS = {"ambiguous", "negative", "neutral", "positive"}


class Analyzer:
    def __init__(self, model_dir):
        import torch  # imported here so the rest of the project can be tested without torch
        from transformers import AutoModelForSequenceClassification, AutoTokenizer
        self._torch = torch
        self._AutoTok = AutoTokenizer
        self._AutoModel = AutoModelForSequenceClassification

        settings = json.load(open(os.path.join(model_dir, "settings.json")))
        self.max_len = settings["max_len"]
        self.conf_limit = settings.get("confidence_limit", {}).get("Emotion", 0.30)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.sent_model, self.sent_tok, self.sent_labels = self._load(model_dir, "sentiment")
        self.emo_model, self.emo_tok, self.emo_labels = self._load(model_dir, "emotion")

        if set(self.sent_labels) != SENTIMENT_LABELS:
            raise RuntimeError("sentiment/labels.json does not look like sentiment labels. "
                               "Files may be mixed up (see README, 'Model files').")
        if len(self.emo_labels) != 28:
            raise RuntimeError("emotion/labels.json should have 28 labels. Files may be mixed up.")

        self._lock = threading.Lock()
        self.analyze("warm up")  # first call is slow, do it at startup

    def _load(self, model_dir, name):
        folder = os.path.join(model_dir, name)
        tok = self._AutoTok.from_pretrained(folder)
        model = self._AutoModel.from_pretrained(folder).to(self.device).eval()
        labels = json.load(open(os.path.join(folder, "labels.json")))
        if model.config.num_labels != len(labels):
            raise RuntimeError("%s: model has %d outputs but labels.json has %d labels. "
                               "Files are mixed up (see README, 'Model files')."
                               % (name, model.config.num_labels, len(labels)))
        return model, tok, labels

    def _probs(self, model, tok, text):
        torch = self._torch
        enc = tok(text, return_tensors="pt", truncation=True, max_length=self.max_len).to(self.device)
        with torch.no_grad():
            logits = model(**enc).logits
        return torch.softmax(logits.float(), dim=1)[0].cpu().numpy()

    def analyze(self, text):
        import numpy as np
        with self._lock:
            sp = self._probs(self.sent_model, self.sent_tok, text)
            ep = self._probs(self.emo_model, self.emo_tok, text)
        top2 = np.argsort(-ep)[:2]
        return {
            "sentiment": self.sent_labels[int(sp.argmax())],
            "emotion": self.emo_labels[int(ep.argmax())],
            "emotion_conf": float(ep.max()),
            "top2": [self.emo_labels[int(i)] for i in top2],
        }
