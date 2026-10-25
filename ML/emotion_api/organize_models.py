"""Arrange the downloaded model files into the folder layout the API expects.

Usage:  python organize_models.py <folder_with_downloaded_files> <output_models_folder>

It looks INSIDE the files (not at file names) to decide what belongs to sentiment (4 labels)
and what belongs to emotion (28 labels), so the confusing "_1" file names do not matter.
"""
import glob
import json
import os
import shutil
import struct
import sys


def n_outputs(safetensors_path):
    with open(safetensors_path, "rb") as f:
        size = struct.unpack("<Q", f.read(8))[0]
        header = json.loads(f.read(size))
    for key, info in header.items():
        if key.endswith("classifier.out_proj.weight"):
            return info["shape"][0]
    raise SystemExit("No classifier layer found in " + safetensors_path)


def main(src, dst):
    task_of = {4: "sentiment", 28: "emotion"}
    found = {"sentiment": {}, "emotion": {}}

    for p in glob.glob(os.path.join(src, "model*.safetensors")):
        n = n_outputs(p)
        if n in task_of:
            found[task_of[n]]["model.safetensors"] = p
    for p in glob.glob(os.path.join(src, "config*.json")):
        n = len(json.load(open(p))["id2label"])
        if n in task_of:
            found[task_of[n]]["config.json"] = p
    for p in glob.glob(os.path.join(src, "labels*.json")):
        n = len(json.load(open(p)))
        if n in task_of:
            found[task_of[n]]["labels.json"] = p

    def first(pattern):
        files = sorted(glob.glob(os.path.join(src, pattern)))
        return files[0] if files else None
    for task in found:  # both models share the same RoBERTa tokenizer
        found[task]["tokenizer.json"] = first("tokenizer.json") or first("tokenizer_*.json")
        found[task]["tokenizer_config.json"] = first("tokenizer_config.json") or first("tokenizer_config_*.json")

    needed = ["model.safetensors", "config.json", "labels.json", "tokenizer.json", "tokenizer_config.json"]
    for task in found:
        missing = [n for n in needed if not found[task].get(n)]
        if missing:
            raise SystemExit("%s: missing %s" % (task, missing))

    for task, files in found.items():
        os.makedirs(os.path.join(dst, task), exist_ok=True)
        for name, path in files.items():
            shutil.copy2(path, os.path.join(dst, task, name))
            print("%-9s %-22s <- %s" % (task, name, os.path.basename(path)))
    settings = os.path.join(src, "settings.json")
    if not os.path.exists(settings):
        raise SystemExit("settings.json not found in " + src)
    shutil.copy2(settings, os.path.join(dst, "settings.json"))
    print("\nDone. Models folder:", dst)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
