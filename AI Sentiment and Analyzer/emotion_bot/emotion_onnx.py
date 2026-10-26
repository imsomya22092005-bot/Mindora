import json
import os

import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer


def _softmax(x):
    x = x - x.max(axis=-1, keepdims=True)
    e = np.exp(x)
    return e / e.sum(axis=-1, keepdims=True)


class EmotionModel:
    def __init__(self, folder):
        with open(os.path.join(folder, "labels.json")) as f:
            labels = json.load(f)
        with open(os.path.join(folder, "settings.json")) as f:
            settings = json.load(f)
        self.emo_labels = labels["emotion"]
        self.sent_labels = labels["sentiment"]
        self.max_len = int(settings.get("max_len", 64))

        self.tok = Tokenizer.from_file(os.path.join(folder, "tokenizer.json"))
        self.tok.enable_truncation(max_length=self.max_len)
        self.tok.enable_padding(pad_id=self.tok.token_to_id("[PAD]") or 0, pad_token="[PAD]")

        opts = ort.SessionOptions()
        opts.intra_op_num_threads = 2
        opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        self.sess = ort.InferenceSession(os.path.join(folder, "model_int8.onnx"), opts,
                                         providers=["CPUExecutionProvider"])

    def _run(self, texts):
        enc = self.tok.encode_batch(texts)
        ids = np.array([e.ids for e in enc], dtype=np.int64)
        mask = np.array([e.attention_mask for e in enc], dtype=np.int64)
        emo, sent = self.sess.run(None, {"input_ids": ids, "attention_mask": mask})
        return _softmax(emo), _softmax(sent)

    def analyze(self, text):
        emo, sent = self._run([text])
        emo, sent = emo[0], sent[0]
        order = np.argsort(-emo)
        return {
            "sentiment": self.sent_labels[int(sent.argmax())],
            "sentiment_conf": float(sent.max()),
            "emotion": self.emo_labels[int(order[0])],
            "emotion_conf": float(emo[order[0]]),
            "top2": [self.emo_labels[int(order[0])], self.emo_labels[int(order[1])]],
        }
