"""
compress_model.py   (Google Colab me chalao, sirf EK baar)

880 MB  (roberta-base sentiment + distilroberta-base emotion)
   -->  ~35 MB (ek hi chhota model, dono kaam karta hai, int8 ONNX)

Kaise:
 1. Knowledge distillation: tumhare dono bade models "teacher" hain. Ek chhota student
    (all-MiniLM-L12-v2, 33M params) unse seekhta hai. Student me 2 heads hain:
    emotion (28 classes) aur sentiment (4 classes).
 2. Embedding table (sabse bhaari hissa) ko int8 me store karte hain (per-row scale).
 3. ONNX export + int8 dynamic quantization (baaki saare MatMul int8).
 4. Test set par teacher vs student vs final ONNX ka accuracy/F1 print hota hai,
    taaki pata chale kitna farak pada. Size 50 MB se upar gaya to script rok degi.

Chalane se pehle Colab me (GPU on):
    from google.colab import drive; drive.mount('/content/drive')
    # goemotions_combined.csv ko /content me upload karo (ya CSV_PATH env set karo)
    !pip install -q onnx onnxscript onnxruntime
    !python compress_model.py

Output: /content/deploy  (aur Drive me: emotion_analyzer/deploy_model)
        model_int8.onnx, tokenizer.json, labels.json, settings.json
"""
import copy
import gc
import json
import os
import shutil
import sys
import time

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import GroupShuffleSplit
from torch.utils.data import DataLoader
from transformers import (AutoModel, AutoModelForSequenceClassification, AutoTokenizer,
                          get_linear_schedule_with_warmup)

# ----------------------------------------------------------------- settings
CSV_PATH = os.environ.get("CSV_PATH", "goemotions_combined.csv")
TEACHER_DIR = os.environ.get("TEACHER_DIR", "/content/drive/MyDrive/emotion_analyzer")
OUT_DIR = os.environ.get("OUT_DIR", "/content/deploy")
TMP_DIR = "/content/tmp_onnx"
# Aur chhota chahiye (~23 MB)?  STUDENT_NAME=sentence-transformers/all-MiniLM-L6-v2
STUDENT_NAME = os.environ.get("STUDENT_NAME", "sentence-transformers/all-MiniLM-L12-v2")
MAX_LEN = 64
EPOCHS = 10
BATCH = 64
LR = 1e-4
TEMP = 2.0      # distillation temperature
ALPHA = 0.5     # 0.5 teacher se seekho + 0.5 asli labels se
SIZE_LIMIT_MB = 50

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
torch.manual_seed(42)
np.random.seed(42)
print("Device:", device, "| Student:", STUDENT_NAME)
if device.type != "cuda":
    print("WARNING: GPU nahi mila. Colab me Runtime > Change runtime type > T4 GPU chuno, warna bahut slow hoga.")


# ------------------------------------------------------------------ 1. data
def prepare_data():
    """main.ipynb ke cells 8-30 jaisa hi data + same splits (random_state=42)."""
    df = pd.read_csv(CSV_PATH)
    emotion_cols = df.columns[9:].tolist()
    df = df[df["example_very_unclear"] == False].copy()  # noqa: E712

    votes = df.groupby("id")[emotion_cols].sum()
    top_votes = votes.max(axis=1)
    num_top = votes.eq(top_votes, axis=0).sum(axis=1)
    keep = (top_votes >= 2) & (num_top == 1)

    comments = df.drop_duplicates("id").set_index("id")[["text", "link_id"]]
    data = comments.loc[keep[keep].index].copy()
    data["emotion"] = votes.loc[data.index].idxmax(axis=1)

    positive = ["admiration", "amusement", "approval", "caring", "desire", "excitement",
                "gratitude", "joy", "love", "optimism", "pride", "relief"]
    negative = ["anger", "annoyance", "disappointment", "disapproval", "disgust", "embarrassment",
                "fear", "grief", "nervousness", "remorse", "sadness"]
    ambiguous = ["confusion", "curiosity", "realization", "surprise"]
    sentiment_map = {e: "positive" for e in positive}
    sentiment_map.update({e: "negative" for e in negative})
    sentiment_map.update({e: "ambiguous" for e in ambiguous})
    sentiment_map["neutral"] = "neutral"
    data["sentiment"] = data["emotion"].map(sentiment_map)

    data["text"] = data["text"].str.strip()
    data = data.drop_duplicates("text")

    s1 = GroupShuffleSplit(n_splits=1, test_size=0.30, random_state=42)
    tr, tmp = next(s1.split(data, groups=data["link_id"]))
    train_df, temp_df = data.iloc[tr], data.iloc[tmp]
    s2 = GroupShuffleSplit(n_splits=1, test_size=0.50, random_state=42)
    va, te = next(s2.split(temp_df, groups=temp_df["link_id"]))
    val_df, test_df = temp_df.iloc[va], temp_df.iloc[te]
    print("Rows -> train %d | val %d | test %d  (notebook me: 33677 | 7215 | 7255)"
          % (len(train_df), len(val_df), len(test_df)))
    return train_df, val_df, test_df


# -------------------------------------------------------------- 2. teachers
@torch.no_grad()
def run_teachers(splits):
    """Dono bade models se logits nikaal lo (ek baar), phir unhe memory se hata do."""
    out = {}
    for task in ("emotion", "sentiment"):
        folder = os.path.join(TEACHER_DIR, task)
        if not os.path.isdir(folder):
            sys.exit("Teacher folder nahi mila: %s  (Drive mount kiya? TEACHER_DIR sahi hai?)" % folder)
        tok = AutoTokenizer.from_pretrained(folder)
        model = AutoModelForSequenceClassification.from_pretrained(folder).to(device).eval()
        labels = json.load(open(os.path.join(folder, "labels.json")))
        out[task] = {"labels": labels}
        for name, texts in splits.items():
            chunks = []
            for i in range(0, len(texts), 128):
                enc = tok(texts[i:i + 128], padding=True, truncation=True,
                          max_length=MAX_LEN, return_tensors="pt").to(device)
                with torch.autocast(device_type=device.type, dtype=torch.float16,
                                    enabled=(device.type == "cuda")):
                    logits = model(**enc).logits
                chunks.append(logits.float().cpu())
            out[task][name] = torch.cat(chunks).numpy()
        print("teacher done:", task, "(", os.path.basename(folder), ")")
        del model
        gc.collect()
        torch.cuda.empty_cache()
    return out


def metrics(y_true, y_pred):
    return (accuracy_score(y_true, y_pred) * 100,
            f1_score(y_true, y_pred, average="macro", zero_division=0) * 100)


# --------------------------------------------------------------- 3. student
class Student(nn.Module):
    """MiniLM encoder + mean pooling + 2 heads (emotion, sentiment)."""

    def __init__(self, name, n_emo, n_sent):
        super().__init__()
        self.enc = AutoModel.from_pretrained(name, attn_implementation="eager")
        h = self.enc.config.hidden_size
        self.drop = nn.Dropout(0.1)
        self.emo = nn.Linear(h, n_emo)
        self.sent = nn.Linear(h, n_sent)

    def forward(self, input_ids, attention_mask):
        hs = self.enc(input_ids=input_ids, attention_mask=attention_mask).last_hidden_state
        m = attention_mask.unsqueeze(-1).to(hs.dtype)
        pooled = (hs * m).sum(dim=1) / m.sum(dim=1).clamp(min=1e-6)
        pooled = self.drop(pooled)
        return self.emo(pooled), self.sent(pooled)


def make_loader(split, tok, shuffle, bs):
    def collate(idx):
        enc = tok([split["texts"][i] for i in idx], padding=True, truncation=True,
                  max_length=MAX_LEN, return_tensors="pt")
        batch = {"input_ids": enc["input_ids"], "attention_mask": enc["attention_mask"]}
        extra = {k: torch.as_tensor(split[k][idx]) for k in ("y_emo", "y_sent", "t_emo", "t_sent")}
        return batch, extra
    return DataLoader(list(range(len(split["texts"]))), batch_size=bs, shuffle=shuffle, collate_fn=collate)


def kd_loss(student_logits, teacher_logits, targets, weight):
    student_logits = student_logits.float()
    ce = F.cross_entropy(student_logits, targets, weight=weight)
    kl = F.kl_div(F.log_softmax(student_logits / TEMP, dim=-1),
                  F.softmax(teacher_logits / TEMP, dim=-1), reduction="batchmean") * (TEMP ** 2)
    return ALPHA * kl + (1 - ALPHA) * ce


@torch.no_grad()
def predict_torch(model, loader):
    model.eval()
    pe, ps = [], []
    for batch, _ in loader:
        batch = {k: v.to(device) for k, v in batch.items()}
        with torch.autocast(device_type=device.type, dtype=torch.float16, enabled=(device.type == "cuda")):
            le, ls = model(**batch)
        pe.append(le.argmax(1).cpu())
        ps.append(ls.argmax(1).cpu())
    return torch.cat(pe).numpy(), torch.cat(ps).numpy()


def train_student(splits, tok, n_emo, n_sent):
    model = Student(STUDENT_NAME, n_emo, n_sent).to(device)
    tr_loader = make_loader(splits["train"], tok, True, BATCH)
    va_loader = make_loader(splits["val"], tok, False, 256)

    def class_weights(y, k):  # notebook jaisa: sqrt inverse-frequency
        counts = np.bincount(y, minlength=k).clip(min=1)
        return torch.tensor((len(y) / (k * counts)) ** 0.5, dtype=torch.float, device=device)
    w_emo = class_weights(splits["train"]["y_emo"], n_emo)
    w_sent = class_weights(splits["train"]["y_sent"], n_sent)

    opt = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=0.01)
    total = len(tr_loader) * EPOCHS
    sched = get_linear_schedule_with_warmup(opt, int(0.1 * total), total)
    scaler = torch.amp.GradScaler("cuda", enabled=(device.type == "cuda"))

    best, best_state = -1.0, None
    for epoch in range(EPOCHS):
        t0 = time.time()
        model.train()
        run = 0.0
        for batch, ex in tr_loader:
            batch = {k: v.to(device) for k, v in batch.items()}
            ex = {k: v.to(device) for k, v in ex.items()}
            opt.zero_grad()
            with torch.autocast(device_type=device.type, dtype=torch.float16, enabled=(device.type == "cuda")):
                le, ls = model(**batch)
            loss = kd_loss(le, ex["t_emo"], ex["y_emo"], w_emo) + kd_loss(ls, ex["t_sent"], ex["y_sent"], w_sent)
            scaler.scale(loss).backward()
            scaler.unscale_(opt)
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            scaler.step(opt)
            scaler.update()
            sched.step()
            run += loss.item()
        pe, ps = predict_torch(model, va_loader)
        a_e, f_e = metrics(splits["val"]["y_emo"], pe)
        a_s, f_s = metrics(splits["val"]["y_sent"], ps)
        score = (f_e + f_s) / 2
        print("epoch %2d | loss %.3f | val emotion acc %.1f F1 %.1f | val sentiment acc %.1f F1 %.1f | %.0fs"
              % (epoch + 1, run / len(tr_loader), a_e, f_e, a_s, f_s, time.time() - t0), flush=True)
        if score > best:
            best = score
            best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
    model.load_state_dict(best_state)
    return model


# ------------------------------------------------- 4. int8 embedding + ONNX
class Int8Embedding(nn.Module):
    """Word-embedding table int8 me (per-row scale). Ye ~47 MB ko ~12 MB bana deta hai.
    NOTE: yaha kabhi self.q.float() mat likhna, warna ONNX constant-folding poori table fp32 bana dega."""

    def __init__(self, emb):
        super().__init__()
        w = emb.weight.detach().float().cpu()
        scale = w.abs().amax(dim=1, keepdim=True).clamp(min=1e-8) / 127.0
        self.register_buffer("q", torch.round(w / scale).clamp(-127, 127).to(torch.int8))
        self.register_buffer("scale", scale)

    def forward(self, ids):
        flat = ids.reshape(-1)
        e = torch.index_select(self.q, 0, flat).to(torch.float32) * torch.index_select(self.scale, 0, flat)
        return e.reshape(ids.shape[0], ids.shape[1], -1)


def export_onnx(student, tok, fp32_path):
    m = copy.deepcopy(student).cpu().eval()
    m.enc.embeddings.word_embeddings = Int8Embedding(m.enc.embeddings.word_embeddings)
    dummy = tok(["hello world", "this is a slightly longer test sentence"], padding=True,
                truncation=True, max_length=MAX_LEN, return_tensors="pt")
    args = (dummy["input_ids"], dummy["attention_mask"])
    kw = dict(input_names=["input_ids", "attention_mask"],
              output_names=["emotion_logits", "sentiment_logits"],
              dynamic_axes={"input_ids": {0: "batch", 1: "seq"}, "attention_mask": {0: "batch", 1: "seq"},
                            "emotion_logits": {0: "batch"}, "sentiment_logits": {0: "batch"}},
              opset_version=17, do_constant_folding=True)
    last_err = None
    for extra in ({"dynamo": False}, {}):       # pehle legacy exporter, na chale to naya
        try:
            with torch.no_grad():
                torch.onnx.export(m, args, fp32_path, **kw, **extra)
            print("ONNX export ok", extra or "(default exporter)")
            return
        except Exception as e:                   # noqa: BLE001
            last_err = e
            print("export attempt failed", extra, "->", repr(e)[:300])
    raise last_err


def quantize(fp32_path, int8_path):
    from onnxruntime.quantization import QuantType, quantize_dynamic
    # reduce_range=True: purane/non-VNNI CPU par bhi (jaise free hosting) same accuracy aaye
    quantize_dynamic(fp32_path, int8_path, weight_type=QuantType.QInt8,
                     op_types_to_quantize=["MatMul"], reduce_range=True)


def onnx_predict(session, tk, texts, bs=128):
    pe, ps = [], []
    for i in range(0, len(texts), bs):
        enc = tk.encode_batch(texts[i:i + bs])
        ids = np.array([e.ids for e in enc], dtype=np.int64)
        mask = np.array([e.attention_mask for e in enc], dtype=np.int64)
        le, ls = session.run(None, {"input_ids": ids, "attention_mask": mask})
        pe.append(le.argmax(1))
        ps.append(ls.argmax(1))
    return np.concatenate(pe), np.concatenate(ps)


def folder_size_mb(path):
    return sum(os.path.getsize(os.path.join(path, f)) for f in os.listdir(path)) / 1e6


# --------------------------------------------------------------------- main
def main():
    train_df, val_df, test_df = prepare_data()
    dfs = {"train": train_df, "val": val_df, "test": test_df}

    teach = run_teachers({k: d["text"].tolist() for k, d in dfs.items()})
    emo_labels, sent_labels = teach["emotion"]["labels"], teach["sentiment"]["labels"]
    e2i = {l: i for i, l in enumerate(emo_labels)}
    s2i = {l: i for i, l in enumerate(sent_labels)}

    splits = {}
    for k, d in dfs.items():
        y_emo, y_sent = d["emotion"].map(e2i), d["sentiment"].map(s2i)
        if y_emo.isna().any() or y_sent.isna().any():
            sys.exit("Kuch label teacher ki labels.json me nahi mile (%s split)" % k)
        splits[k] = {"texts": d["text"].tolist(),
                     "y_emo": y_emo.values.astype(np.int64), "y_sent": y_sent.values.astype(np.int64),
                     "t_emo": teach["emotion"][k].astype(np.float32),
                     "t_sent": teach["sentiment"][k].astype(np.float32)}

    tok = AutoTokenizer.from_pretrained(STUDENT_NAME)
    student = train_student(splits, tok, len(emo_labels), len(sent_labels))

    # ---- test set par teacher vs student(torch)
    rows = []
    t = splits["test"]
    for task, key in (("Emotion", "emo"), ("Sentiment", "sent")):
        pred = teach[task.lower()]["test"].argmax(1)
        a, f = metrics(t["y_" + key], pred)
        rows.append({"Task": task, "Model": "Teacher (bada)", "Accuracy %": a, "F1 macro %": f})
    pe, ps = predict_torch(student, make_loader(t, tok, False, 256))
    for task, key, p in (("Emotion", "emo", pe), ("Sentiment", "sent", ps)):
        a, f = metrics(t["y_" + key], p)
        rows.append({"Task": task, "Model": "Student fp32", "Accuracy %": a, "F1 macro %": f})

    # ---- export + quantize
    os.makedirs(TMP_DIR, exist_ok=True)
    if os.path.isdir(OUT_DIR):
        shutil.rmtree(OUT_DIR)
    os.makedirs(OUT_DIR)
    fp32_path = os.path.join(TMP_DIR, "model_fp32.onnx")
    int8_path = os.path.join(OUT_DIR, "model_int8.onnx")
    export_onnx(student, tok, fp32_path)
    quantize(fp32_path, int8_path)
    tok.backend_tokenizer.save(os.path.join(OUT_DIR, "tokenizer.json"))
    json.dump({"emotion": emo_labels, "sentiment": sent_labels}, open(os.path.join(OUT_DIR, "labels.json"), "w"))
    json.dump({"max_len": MAX_LEN, "student": STUDENT_NAME, "conf_limit": 0.30},
              open(os.path.join(OUT_DIR, "settings.json"), "w"), indent=1)

    # ---- final ONNX ko asli deploy wale tareeke (onnxruntime + tokenizers) se test karo
    import onnxruntime as ort
    from tokenizers import Tokenizer
    tk = Tokenizer.from_file(os.path.join(OUT_DIR, "tokenizer.json"))
    tk.enable_truncation(max_length=MAX_LEN)
    tk.enable_padding(pad_id=tk.token_to_id("[PAD]") or 0, pad_token="[PAD]")
    sess = ort.InferenceSession(int8_path, providers=["CPUExecutionProvider"])
    oe, os_ = onnx_predict(sess, tk, t["texts"])
    for task, key, p in (("Emotion", "emo", oe), ("Sentiment", "sent", os_)):
        a, f = metrics(t["y_" + key], p)
        rows.append({"Task": task, "Model": "FINAL int8 ONNX", "Accuracy %": a, "F1 macro %": f})
    print("\nTEST SET RESULT")
    print(pd.DataFrame(rows).sort_values(["Task", "Model"]).round(2).to_string(index=False))
    print("ONNX vs torch student: emotion agreement %.1f%% | sentiment agreement %.1f%%"
          % ((oe == pe).mean() * 100, (os_ == ps).mean() * 100))

    print("\nSample sentences:")
    for s in ["I am so happy today, thank you so much!", "I feel really sad and alone right now.",
              "This is so annoying, I hate waiting.", "I am scared about my exam tomorrow.",
              "Why is the sky blue?"]:
        a, b = onnx_predict(sess, tk, [s])
        print("  %-45s -> emotion: %-12s sentiment: %s" % (s, emo_labels[a[0]], sent_labels[b[0]]))

    size = folder_size_mb(OUT_DIR)
    print("\nFINAL deploy folder size: %.1f MB (limit %d MB)" % (size, SIZE_LIMIT_MB))
    for f in sorted(os.listdir(OUT_DIR)):
        print("   %-18s %6.1f MB" % (f, os.path.getsize(os.path.join(OUT_DIR, f)) / 1e6))
    if size > SIZE_LIMIT_MB:
        sys.exit("Size %d MB se zyada hai. STUDENT_NAME=sentence-transformers/all-MiniLM-L6-v2 se dobara chalao." % SIZE_LIMIT_MB)

    if os.path.isdir(TEACHER_DIR):
        dst = os.path.join(TEACHER_DIR, "deploy_model")
        shutil.rmtree(dst, ignore_errors=True)
        shutil.copytree(OUT_DIR, dst)
        print("Copy saved in Drive ->", dst)
    print("Ab is folder ki 4 files ko app ke `model/` folder me daal do.")


if __name__ == "__main__":
    main()
