import os

import streamlit as st

import chatbot
from emotion_onnx import EmotionModel

HERE = os.path.dirname(os.path.abspath(__file__))

st.set_page_config(page_title="Wellness Chat Bot", page_icon="💬")


@st.cache_resource(show_spinner="Loading emotion model...")
def load_emotion_model():
    return EmotionModel(os.path.join(HERE, "model"))


def get_api_key():
    try:
        return st.secrets["GEMINI_API_KEY"]
    except Exception:  # secrets file nahi hai to env var dekho
        return os.environ.get("GEMINI_API_KEY")


@st.cache_resource(show_spinner=False)
def load_llm(key):
    return chatbot.GeminiResponder(api_key=key)


api_key = get_api_key()
if not api_key:
    st.error("GEMINI_API_KEY set nahi hai. Streamlit Secrets (ya env var) me daalo. Steps README.md me hain.")
    st.stop()

emotion_model = load_emotion_model()
llm = load_llm(api_key)

if "state" not in st.session_state:
    st.session_state.state = chatbot.new_state()
    st.session_state.messages = [{
        "role": "assistant",
        "content": "Hi! I'm glad you're here. How are you feeling today? You can write in English or Hinglish."}]

with st.sidebar:
    st.header("About")
    st.write("A supportive chat companion. It is an AI, **not a therapist or doctor**.")
    st.write("Your messages are sent to Google Gemini to write replies. Please don't share passwords or "
             "other personal identifiers.")
    st.write("In India, free 24x7 support: **Tele-MANAS 14416**. Emergency: **112**.")
    show_emotion = st.toggle("Show detected emotion (demo)", value=False)
    if st.button("New chat"):
        for k in ("state", "messages"):
            st.session_state.pop(k, None)
        st.rerun()

st.title("💬 Wellness Chat Bot")

for m in st.session_state.messages:
    with st.chat_message(m["role"]):
        st.write(m["content"])
        if show_emotion and m.get("caption"):
            st.caption(m["caption"])

if prompt := st.chat_input("Type how you feel..."):
    prompt = prompt.strip()[:1000]
    if prompt:
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.write(prompt)
        with st.chat_message("assistant"):
            with st.spinner("..."):
                out = chatbot.chat(prompt, st.session_state.state, emotion_model.analyze, llm)
            st.write(out["reply"])
            a = out["analysis"]
            caption = None
            if out["crisis"]:
                caption = "safety rule triggered (model/Gemini skipped)"
            elif a:
                caption = "emotion: %s (%.0f%%) | sentiment: %s | source: %s" % (
                    a["emotion"], a["confidence"] * 100, a["sentiment"], a["source"])
            if show_emotion and caption:
                st.caption(caption)
        st.session_state.messages.append({"role": "assistant", "content": out["reply"], "caption": caption})
