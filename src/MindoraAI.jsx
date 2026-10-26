import { useState } from "react";
import { Bot, Send, Sparkles, Heart, Clock3, RefreshCw, ThumbsUp, ThumbsDown, Wind, MessageCircleHeart } from "lucide-react";
import { useLanguage } from "./language";
import { analyzeEmotion, sendWellnessChat, resetWellnessChat, getCopingRecommendations, sendCopingFeedback } from "./mlApi";
import "./MindoraAI.css";

const moods = [
  ["anxiety", "Anxious", "🌧️"], ["frustration", "Frustrated", "🌋"],
  ["loneliness", "Lonely", "🌙"], ["low_energy", "Low energy", "🪫"],
  ["overwhelmed", "Overwhelmed", "🌊"], ["restlessness", "Restless", "🌀"],
  ["sadness", "Sad", "🌧️"], ["stress", "Stressed", "🍃"]
];
const times = ["morning", "afternoon", "evening", "night"];
const getToken = () => localStorage.getItem("mindora-token") || localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("mindoraToken") || "";

export default function MindoraAI() {
  const [language] = useLanguage();
  const hi = language === "hi";
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([{ role: "assistant", content: hi ? "नमस्ते। यहाँ आप अपनी बात आराम से साझा कर सकते हैं। आज कैसा महसूस कर रहे हैं?" : "Hi, I’m here with you. You can share what’s on your mind, at your own pace." }]);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState("");
  const [mood, setMood] = useState("stress");
  const [intensity, setIntensity] = useState(3);
  const [timeOfDay, setTimeOfDay] = useState("evening");
  const [energy, setEnergy] = useState(3);
  const [recommendations, setRecommendations] = useState([]);
  const [recBusy, setRecBusy] = useState(false);
  const [recError, setRecError] = useState("");
  const [feedback, setFeedback] = useState({});

  async function submitChat(event) {
    event.preventDefault();
    const text = message.trim();
    if (!text || chatBusy) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setMessage("");
    setChatBusy(true);
    setChatError("");
    try {
      const result = await sendWellnessChat(text, getToken(), sessionId || undefined);
      const data = result?.data || result;
      const reply = data.reply || data.response || data.message || data.bot_response || data.assistant_response || "I’m listening. Could you tell me a little more about what you’re experiencing?";
      setSessionId(data.session_id || sessionId);
      setMessages(prev => [...prev, { role: "assistant", content: typeof reply === "string" ? reply : JSON.stringify(reply) }]);
    } catch (error) {
      setChatError(error.message || "Could not reach the wellbeing assistant.");
    } finally { setChatBusy(false); }
  }

  async function resetChat() {
    try { await resetWellnessChat(getToken(), sessionId || undefined); } catch {}
    setSessionId("");
    setMessages([{ role: "assistant", content: hi ? "नई शुरुआत। मैं सुनने के लिए यहाँ हूँ।" : "A fresh start. I’m here to listen whenever you’re ready." }]);
    setChatError("");
  }

  async function getRecommendations(event) {
    event.preventDefault();
    setRecBusy(true); setRecError(""); setRecommendations([]); setFeedback({});
    try {
      const result = await getCopingRecommendations({ mood, mood_intensity: intensity, time_of_day: timeOfDay, energy_level: energy, top_n: 3 }, getToken());
      const data = result?.data || result;
      setRecommendations(data.recommendations || data.activities || []);
      if (!(data.recommendations || data.activities || []).length) setRecError("No suggestions returned yet. Please try again.");
    } catch (error) { setRecError(error.message || "Could not load suggestions."); }
    finally { setRecBusy(false); }
  }

  async function rateActivity(item, rating) {
    const activityId = item.activity_id || item.id || item.title;
    setFeedback(prev => ({ ...prev, [activityId]: rating }));
    try {
      await sendCopingFeedback({ activity_id: String(activityId), action: "completed", rating }, getToken());
    } catch (error) {
      setRecError("Your rating could not be saved: " + error.message);
      setFeedback(prev => { const next = { ...prev }; delete next[activityId]; return next; });
    }
  }

  return <div className="mindora-ai-page">
    <header className="mai-header">
      <div><span className="mai-eyebrow"><Sparkles size={14}/> MINDORA WELLBEING STUDIO</span><h1>{hi ? "अपने मन को थोड़ा सुकून दें" : "A little space for your mind"}</h1><p>{hi ? "बिना किसी दबाव के, अपनी भावनाओं को समझें और अपने लिए सही अभ्यास खोजें।" : "Understand what you’re feeling and find a gentle next step, without pressure."}</p></div>
      <div className="mai-header-art"><span>✿</span><i>☁</i><b>✧</b></div>
    </header>
    <div className="mai-tabs" role="tablist">
      <button className={tab === "chat" ? "selected" : ""} onClick={() => setTab("chat")}><MessageCircleHeart size={17}/>{hi ? "भावनात्मक चैट" : "Emotion companion"}</button>
      <button className={tab === "coping" ? "selected" : ""} onClick={() => setTab("coping")}><Heart size={17}/>{hi ? "मेरे लिए सुझाव" : "Coping suggestions"}</button>
    </div>

    {tab === "chat" ? <section className="mai-chat-card">
      <div className="mai-card-heading"><div className="mai-icon"><Bot size={20}/></div><div><h2>{hi ? "आपका भावनात्मक साथी" : "Your emotional companion"}</h2><p>{hi ? "एक सुरक्षित, शांत जगह पर बात करें" : "A calm space to put feelings into words"}</p></div><button className="mai-reset" onClick={resetChat} title="Start a new conversation"><RefreshCw size={15}/><span>{hi ? "नई चैट" : "New chat"}</span></button></div>
      <div className="mai-message-list" aria-live="polite">{messages.map((item, index) => <div key={index} className={"mai-message " + item.role}><span className="mai-message-avatar">{item.role === "assistant" ? "✿" : "You"}</span><p>{item.content}</p></div>)}{chatBusy && <div className="mai-typing"><span/><span/><span/> {hi ? "सोच रहा है…" : "Thinking gently…"}</div>}</div>
      {chatError && <p className="mai-error" role="alert">{chatError}</p>}
      <form className="mai-chat-form" onSubmit={submitChat}><textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={hi ? "आपके मन में क्या चल रहा है?" : "What’s been on your mind?"} rows={2} maxLength={2000}/><button type="submit" disabled={!message.trim() || chatBusy} aria-label="Send message"><Send size={18}/></button></form>
      <p className="mai-privacy-note">A gentle companion, not a substitute for professional mental-health care.</p>
    </section> : <section className="mai-coping-grid">
      <form className="mai-checkin-card" onSubmit={getRecommendations}>
        <span className="mai-eyebrow"><Wind size={14}/> YOUR CHECK-IN</span><h2>{hi ? "अभी कैसा महसूस हो रहा है?" : "How are you feeling right now?"}</h2><p className="mai-muted">{hi ? "यहाँ कोई सही या गलत जवाब नहीं है।" : "There’s no right or wrong answer here."}</p>
        <label className="mai-label">{hi ? "अपना मूड चुनें" : "Choose a mood"}</label>
        <div className="mai-mood-grid">{moods.map(([value, label, emoji]) => <button type="button" key={value} className={"mai-mood-option " + (mood === value ? "chosen" : "")} onClick={() => setMood(value)}><span>{emoji}</span>{hi ? ({anxiety:"चिंता",frustration:"झुंझलाहट",loneliness:"अकेलापन",low_energy:"कम ऊर्जा",overwhelmed:"बहुत दबाव",restlessness:"बेचैनी",sadness:"उदासी",stress:"तनाव"}[value]) : label}</button>)}</div>
        <div className="mai-range-label"><label className="mai-label" htmlFor="mai-intensity">{hi ? "भावना की तीव्रता" : "How intense does it feel?"}</label><strong>{intensity}/5</strong></div><input id="mai-intensity" className="mai-range" type="range" min="1" max="5" value={intensity} onChange={e => setIntensity(Number(e.target.value))}/><div className="mai-range-ends"><span>{hi ? "थोड़ी" : "A little"}</span><span>{hi ? "बहुत ज़्यादा" : "A lot"}</span></div>
        <label className="mai-label" htmlFor="mai-time">{hi ? "आपके दिन का समय" : "Time of day"}</label><select id="mai-time" className="mai-select" value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)}>{times.map(t => <option key={t} value={t}>{t[0].toUpperCase()+t.slice(1)}</option>)}</select>
        <div className="mai-range-label"><label className="mai-label" htmlFor="mai-energy">{hi ? "अभी ऊर्जा कितनी है?" : "Your current energy"}</label><strong>{energy}/5</strong></div><input id="mai-energy" className="mai-range" type="range" min="1" max="5" value={energy} onChange={e => setEnergy(Number(e.target.value))}/><button className="mai-primary" type="submit" disabled={recBusy}>{recBusy ? "Finding gentle ideas…" : <><Sparkles size={17}/> {hi ? "मेरे सुझाव खोजें" : "Find my suggestions"}</>}</button>
        {recError && <p className="mai-error" role="alert">{recError}</p>}
      </form>
      <div className="mai-recommendations"><div className="mai-results-heading"><span className="mai-eyebrow">SMALL STEPS, JUST FOR YOU</span><h2>{hi ? "आपके लिए चुने गए अभ्यास" : "A few ideas for you"}</h2><p>{hi ? "एक छोटा कदम भी मायने रखता है।" : "Even one small step counts."}</p></div>
        {recommendations.length ? <div className="mai-activity-list">{recommendations.map((item, index) => {const id = item.activity_id || item.id || item.title; return <article className="mai-activity-card" key={id || index}><div className="mai-activity-number">0{index+1}</div><div className="mai-activity-copy"><span className="mai-category">{item.category || "WELLBEING"}</span><h3>{item.title || "A gentle pause"}</h3><p>{item.description || item.reason || "Take a moment for yourself."}</p><span className="mai-duration"><Clock3 size={14}/> {item.duration_min || item.duration || 5} min</span><div className="mai-rating-actions"><span>{hi ? "क्या यह मददगार था?" : "Was this helpful?"}</span><button type="button" disabled={Boolean(feedback[id])} className={feedback[id] === 5 ? "rated" : ""} onClick={() => rateActivity(item, 5)} aria-label="Helpful"><ThumbsUp size={15}/></button><button type="button" disabled={Boolean(feedback[id])} className={feedback[id] === 1 ? "rated" : ""} onClick={() => rateActivity(item, 1)} aria-label="Not helpful"><ThumbsDown size={15}/></button>{feedback[id] && <small>Thanks for sharing</small>}</div></div></article>})}</div> : <div className="mai-empty-state"><div className="mai-empty-art">✿</div><h3>{hi ? "धीरे-धीरे शुरू करें" : "Start with how you feel"}</h3><p>{hi ? "अपना मूड चुनें और हम आपके लिए कुछ छोटे अभ्यास खोजेंगे।" : "Choose your mood and we’ll look for a few small, manageable activities."}</p></div>}
      </div>
    </section>}
  </div>;
}
