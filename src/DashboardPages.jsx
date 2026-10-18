import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import ScrapbookEditor, { deleteScrapbookPage } from "./ScrapbookEditor";
import { Link } from "react-router-dom";
import { ArrowLeft, BookHeart, CalendarDays, Feather, Heart, Leaf, LockKeyhole, Plus, Save, Sparkles, Trash2, Wind, BarChart3, Sprout, CloudRain, HeartHandshake, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import "./DashboardPages.css";

function useThemeClass() {
  const [dark] = useState(() => {
    try { return localStorage.getItem("mindora-theme") === "dark"; } catch { return false; }
  });
  return dark ? "mindora-section-page dark-theme" : "mindora-section-page";
}

function PageHeader({ eyebrow, title, subtitle, icon: Icon }) {
  return <header className="section-page-header">
    <Link className="section-back" to="/dashboard"><ArrowLeft size={16}/> Dashboard</Link>
    <div className="section-page-brand"><span className="section-brand-mark"><img src="/favicon.svg" alt="" /></span><span className="section-brand-name">mindora</span></div>
    <div className="section-page-title">
      <span className="section-page-eyebrow">{Icon && <Icon size={14}/>} {eyebrow}</span>
      <h1>{title}</h1><p>{subtitle}</p>
    </div>
  </header>;
}

function loadEntries() {
  try { return JSON.parse(localStorage.getItem("mindora-journal-entries") || "[]"); } catch { return []; }
}

const prompts = [
  "What felt heavier than usual today, and what helped you carry it?",
  "What is one small thing you did today that you are proud of?",
  "If your feelings could speak kindly to you, what might they say?",
  "What are you ready to give yourself permission to let go of?",
  "Where did you find a little bit of peace today?"
];

export function JournalPage() {
  const theme = useThemeClass();
  const hi = localStorage.getItem("mindora-language") === "hi";
  const [entries, setEntries] = useState(loadEntries);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [activePrompt, setActivePrompt] = useState(0);
  const [savedNotice, setSavedNotice] = useState(false);
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [pageFlying, setPageFlying] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [pageId, setPageId] = useState(null);
  useEffect(() => { try { localStorage.setItem("mindora-journal-entries", JSON.stringify(entries)); } catch {} }, [entries]);

  function openFreshPage() {
    setViewEntry(null);
    setPageId("draft-" + Date.now());
    setTitle("");
    setText("");
    setDiaryOpen(true);
    setPageFlying(true);
    window.setTimeout(() => setPageFlying(false), 850);
  }
  function openSavedPage(entry) {
    setViewEntry(entry);
    setPageId(String(entry.id));
    setTitle(entry.title || "");
    setText(entry.text || "");
    setDiaryOpen(true);
    setPageFlying(true);
    window.setTimeout(() => setPageFlying(false), 850);
  }
  function saveEntry() {
    const body = text.trim();
    if (!body) return;
    if (viewEntry) {
      const updated = { ...viewEntry, title: title.trim() || "A page from today", text: body, preview: body.length > 90 ? body.slice(0,90)+"…" : body };
      setEntries(previous => previous.map(entry => entry.id === viewEntry.id ? updated : entry));
    } else {
      const entry = { id: Date.now(), title: title.trim() || "A page from today", text: body, preview: body.length > 90 ? body.slice(0,90)+"…" : body, date: new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}), timestamp: Date.now() };
      setEntries(previous => [entry, ...previous]);
      if (pageId) { try { const all = JSON.parse(localStorage.getItem("mindora-scrapbook-layouts") || "{}"); all[String(entry.id)] = all[String(pageId)] || []; delete all[String(pageId)]; localStorage.setItem("mindora-scrapbook-layouts", JSON.stringify(all)); } catch {} }
    }
    setPageFlying(true);
    setSavedNotice(true);
    window.setTimeout(() => { setPageFlying(false); setDiaryOpen(false); setViewEntry(null); setTitle(""); setText(""); }, 850);
    window.setTimeout(() => setSavedNotice(false), 3000);
  }
  function deleteEntry(id) { setEntries(previous => previous.filter(entry => entry.id !== id)); deleteScrapbookPage(id); }
  return <main className={theme}>
    <PageHeader eyebrow={hi ? "आपके निजी पन्ने" : "YOUR PRIVATE PAGES"} title={hi ? <>मन की बातें <em>लिखने की जगह।</em></> : <>A little space to <em>let it out.</em></>} subtitle={hi ? "उन बातों के लिए एक डायरी जिन्हें आप याद रखना, छोड़ देना या समझना चाहते हैं।" : "A diary for the things you want to remember, release, or simply understand."} icon={BookHeart}/>

    <section className={`journal-diary-scene ${diaryOpen ? "diary-is-open" : ""}`}>
      <div className="journal-diary-cover">
        <div className="journal-cover-spine" />
        <div className="journal-cover-decoration">✳</div>
        <div className="journal-cover-content">
          <span className="journal-cover-kicker">{hi ? "माइंडोरा · आपके निजी पन्ने" : "MINDORA · YOUR PRIVATE PAGES"}</span>
          <BookHeart size={38} strokeWidth={1.3}/>
          <h2>{hi ? <>प्रिय, <em>आप।</em></> : <>Dear, <em>you.</em></>}</h2>
          <p>{hi ? <>हर उस बात के लिए छोटी-सी जगह<br/>जो आप हमेशा कह नहीं पाते।</> : <>A little place for everything<br/>you don't always say out loud.</>}</p>
          <span className="journal-cover-rule" />
          <span className="journal-cover-small">{hi ? "एक दिन · एक पन्ना · आपकी कहानी" : "ONE DAY · ONE PAGE · YOUR STORY"}</span>
          <button className="journal-open-button" onClick={openFreshPage}><BookHeart size={16}/> {hi ? (entries.length ? "नया पन्ना लिखें" : "अपनी डायरी खोलें") : (entries.length ? "Write a new page" : "Open your diary")} <ArrowUpRight size={16}/></button>
        </div>
      </div>

      {diaryOpen && <section className={`journal-loose-page ${pageFlying ? "page-in-motion" : ""}`} aria-label="Diary writing page">
        <div className="journal-page-top"><span><Feather size={14}/> {hi ? "अपने साथ एक पल" : "A MOMENT WITH YOURSELF"}</span><span>{new Date().toLocaleDateString(hi ? "hi-IN" : "en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span></div>
        <div className="journal-page-body">
          <span className="journal-page-number">{hi ? "आज का पन्ना" : "TODAY'S PAGE"}</span>
          <h2>{hi ? "प्रिय, आप..." : "Dear, you..."}</h2>
          <p>{hi ? "इसे लिखने का कोई सही तरीका नहीं है। अपने विचारों से शुरुआत करें।" : "There is no right way to write this. Start wherever your thoughts are."}</p>
          <div className="journal-writing-scrapbook">
            <div className="journal-writing-column">
              <label className="diary-title-label">{hi ? "इस पन्ने को एक नाम दें" : "GIVE THIS PAGE A TITLE"}<input value={title} onChange={e=>setTitle(e.target.value)} placeholder={hi ? "एक विचार जिसे मैं याद रखना चाहता/चाहती हूँ..." : "A thought I want to remember..."} /></label>
              <textarea autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder={hi ? "आज मेरे मन में बहुत-सी बातें हैं...\n\nजो मैं कहना चाहता/चाहती हूँ...\n\nइस समय मुझे ज़रूरत है..." : "Today, my mind has been full of...\n\nWhat I wish I could say is...\n\nWhat I need right now is..."} />
              <div className="diary-editor-footer"><span><LockKeyhole size={14}/> {hi ? "इस डिवाइस पर निजी रूप से सेव है" : "Saved privately on this device"}</span><span>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span></div>
            </div>
            {pageId && <ScrapbookEditor key={pageId} pageId={pageId} hi={hi} />}
          </div>
          <div className="journal-page-actions">
            <button className="journal-close-button" onClick={()=>{setDiaryOpen(false);setViewEntry(null);}}>{hi ? "पन्ना वापस रखें" : "Put page back"}</button>
            <button className="diary-save-button" onClick={saveEntry} disabled={!text.trim()}><Save size={16}/> {hi ? (viewEntry ? "बदलाव सेव करें" : "पन्ने को डायरी में रखें") : (viewEntry ? "Save changes" : "Tuck page into diary")} <ArrowUpRight size={16}/></button>
          </div>
        </div>
      </section>}
    </section>

    {savedNotice && <p className="diary-success journal-saved-message"><Heart size={14}/> {hi ? "आपकी बातें डायरी में सुरक्षित रख दी गई हैं।" : "Your words have been tucked safely into your journal."}</p>}

    <div className="journal-lower-grid">
      <aside className="diary-prompt-card"><span className="diary-side-icon"><Sparkles size={19}/></span><span className="diary-side-kicker">{hi ? "एक कोमल-सा सवाल" : "A GENTLE PROMPT"}</span><p>“{hi ? ["आज क्या सामान्य से ज़्यादा भारी लगा, और उसे संभालने में किस चीज़ ने मदद की?","आज ऐसी कौन-सी छोटी-सी बात है जिसके लिए आप आभारी हैं?","आप चाहते हैं कि कोई आपके बारे में कौन-सी बात समझे?","आज आपको थोड़ा-सा सुकून कहाँ मिला?"][activePrompt] : prompts[activePrompt]}”</p><button onClick={()=>setActivePrompt(i=>(i+1)%prompts.length)}>{hi ? "एक और सवाल" : "Another prompt"} <ArrowUpRight size={14}/></button><div className="diary-flower">✿</div></aside>
      <aside className="diary-reminder"><Heart size={17}/><p>{hi ? "आज हर भावना को समझना ज़रूरी नहीं है। कुछ बातों को बस ठहरने की जगह चाहिए।" : "You don't have to make sense of every feeling today. Some things just need a place to land."}</p><span>{hi ? "— आपके लिए एक याद दिलाना" : "— a reminder for you"}</span></aside>
    </div>

    <section className="diary-entries">
      <div className="diary-entries-head"><div><span className="section-page-eyebrow">{hi ? "आपकी कहानी, आपके शब्दों में" : "YOUR STORY, IN YOUR WORDS"}</span><h2>{hi ? "आपके सहेजे हुए पन्ने" : "Pages you've kept"}</h2><p>{hi ? "आपके सहेजे हुए पन्ने, आपकी डायरी में सुरक्षित।" : "Your saved pages, resting safely inside your diary."}</p></div><span className="diary-count">{entries.length} {hi ? "पन्ने" : entries.length===1?"page":"pages"}</span></div>
      {!entries.length ? <div className="diary-empty"><BookHeart size={27}/><h3>{hi ? "आपकी कहानी यहाँ से शुरू होती है।" : "Your story starts here."}</h3><p>{hi ? "अपना पहला पन्ना लिखें और उसे किसी और दिन के लिए सहेज लें।" : "Write your first page and tuck it safely away for another day."}</p></div> : <div className="diary-entry-grid">{entries.map(entry=><article className="diary-saved-card journal-page-card" key={entry.id}><div className="diary-saved-meta"><CalendarDays size={14}/>{entry.date}<button aria-label="Delete journal entry" onClick={()=>deleteEntry(entry.id)}><Trash2 size={15}/></button></div><h3>{entry.title || (hi ? "आज का एक पन्ना" : "A page from today")}</h3><p>{entry.text}</p><div className="journal-saved-actions"><span className="diary-entry-flourish">with kindness, always ✳</span><button onClick={()=>openSavedPage(entry)}><Feather size={14}/> Open page</button></div></article>)}</div>}
    </section>
    <footer className="section-page-footer"><Heart size={13}/> {hi ? "यह आपकी जगह है। आपकी गति है। आपकी कहानी है।" : "This is your space. Your pace. Your story."} <span>{hi ? "माइंडोरा · आपके सुकून भरे दिनों के लिए" : "Mindora · made for your softer days"}</span></footer>
  </main>;
}

export function InsightsPage() {
  const theme=useThemeClass();
  const hi = localStorage.getItem("mindora-language") === "hi";
  const t = (en, hindi) => hi ? hindi : en;
  const [history]=useState(()=>{try{return JSON.parse(localStorage.getItem("mindora-mood-history")||"[]")}catch{return[]}});
  const data=history.slice(0,7).reverse().map(item=>({day:item.date,mood:item.value,label:item.label}));
  const average=history.length?(history.reduce((sum,item)=>sum+item.value,0)/history.length).toFixed(1):"—";
  return <main className={theme}><PageHeader eyebrow="GENTLE SELF-AWARENESS" title={hi ? <>आप कैसे <em>आगे बढ़ रहे हैं</em>, जानें।</> : <>Notice how you're <em>growing.</em></>} subtitle={t("Your feelings are information, not a report card.", "आपकी भावनाएँ आपको समझने का ज़रिया हैं, कोई परीक्षा नहीं।")} icon={BarChart3}/><div className="insight-stat-grid"><article><span>{t("CHECK-INS SAVED", "सेव किए गए चेक-इन")}</span><strong>{history.length}</strong><p>{t("Every check-in counts.", "हर चेक-इन मायने रखता है।")}</p></article><article><span>{t("AVERAGE MOOD", "औसत मूड")}</span><strong>{average}{average!=="—"&&<small>/10</small>}</strong><p>{t("A pattern, never a judgement.", "एक पैटर्न, कोई फैसला नहीं।")}</p></article><article><span>{t("LATEST CHECK-IN", "सबसे नया चेक-इन")}</span><strong>{history[0]?.emoji||"♡"} {history[0]?.label||"Not yet"}</strong><p>{history[0]?.date||"Your first check-in is waiting."}</p></article></div><section className="insight-chart-card"><span className="section-page-eyebrow">{t("YOUR RECENT RHYTHM", "आपका हालिया मूड पैटर्न")}</span><h2>{t("Mood, over time", "समय के साथ मूड")}</h2><p>{t("Look for patterns gently. One day never tells the whole story.", "पैटर्न को प्यार से समझें। एक दिन पूरी कहानी नहीं बताता।")}</p>{data.length?<div className="insight-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="mindoraMoodFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#779875" stopOpacity={0.35}/><stop offset="100%" stopColor="#779875" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#dfe7dc"/><XAxis dataKey="day" tick={{fill:"#7d8b79",fontSize:11}}/><YAxis domain={[0,10]} tick={{fill:"#7d8b79",fontSize:11}}/><Tooltip/><Area type="monotone" dataKey="mood" stroke="#628766" fill="url(#mindoraMoodFill)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div>:<div className="diary-empty"><BarChart3 size={27}/><h3>{t("Your insights will grow with you.", "आपकी समझ आपके साथ बढ़ेगी।")}</h3><p>{t("Save a mood check-in on your dashboard and your personal rhythm will appear here.", "डैशबोर्ड पर अपना मूड सेव करें, आपका निजी पैटर्न यहाँ दिखाई देगा।")}</p><Link to="/dashboard">{t("Go to daily check-in", "आज के चेक-इन पर जाएँ")}<ArrowUpRight size={15}/></Link></div>}</section><div className="insight-kind-note"><Sparkles size={18}/><p><strong>{t("A gentle reminder", "एक प्यारी-सी याद")}</strong><br/>{t("The goal isn't to feel good every day. It's to understand yourself with a little more kindness.", "मकसद हर दिन अच्छा महसूस करना नहीं, बल्कि खुद को थोड़ी और दयालुता से समझना है.")}</p></div></main>;
}

const mindfulTools=[
 {title:"Calm Corner",description:"A quiet reset when the day feels like too much.",icon:Wind,href:"/calm-corner",tone:"sage"},
 {title:"Inner Garden",description:"Small acts of care, one little step at a time.",icon:Sprout,href:"/inner-garden",tone:"moss"},
 {title:"Little Comfort Box",description:"Find a kind reminder for the feeling you're carrying.",icon:HeartHandshake,href:"/comfort-box",tone:"peach"},
  {title:"Mood Soundscape",description:"Let gentle rain create a little breathing room.",icon:CloudRain,href:"/soundscape",tone:"blue"},
];
export function MindfulMomentsPage(){
 const theme=useThemeClass();
 return <main className={theme}><PageHeader eyebrow="SMALL PAUSES, SOFTER DAYS" title={<>Find your own kind of <em>calm.</em></>} subtitle="Choose what you need in this moment. Nothing here needs to be earned." icon={Wind}/><div className="mindful-intro-card"><div><span className="section-page-eyebrow">A NOTE TO YOURSELF</span><h2>You are allowed to pause.</h2><p>Rest is not falling behind. Take the smallest step that feels kind to you.</p></div><span className="mindful-big-spark">✳</span></div><div className="mindful-tool-grid">{mindfulTools.map(tool=>{const Icon=tool.icon;return <Link to={tool.href} className="mindful-tool-card" key={tool.title}><span className={"mindful-tool-icon "+tool.tone}><Icon size={22}/></span><span className="mindful-tool-title">{tool.title}<ArrowUpRight size={15}/></span><p>{tool.description}</p><span className="mindful-tool-open">Explore gently →</span></Link>})}</div><footer className="section-page-footer"><Heart size={13}/> No pressure. No perfect days. Just you.</footer></main>;
}


const heatmapMoodColors = [
  { label: "Low", color: "#f6a6a6", text: "#783d46" },
  { label: "Meh", color: "#c7b8f4", text: "#4c3d78" },
  { label: "Okay", color: "#f7d889", text: "#785b19" },
  { label: "Good", color: "#a8dfbd", text: "#245d43" },
  { label: "Great", color: "#75d9d1", text: "#155c60" },
];

export function MoodHeatmapPage() {
  const theme = useThemeClass();
  const [language] = useState(() => localStorage.getItem("mindora-language") || "en");
  const t = (en, hi) => language === "hi" ? hi : en;
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mindora-mood-history") || "[]"); }
    catch { return []; }
  });
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [heatmapError, setHeatmapError] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("mindora-token");
    if (!token) return;
    let cancelled = false;
    async function loadHeatmap() {
      setLoadingHeatmap(true);
      setHeatmapError("");
      try {
        const year = new Date().getFullYear();
        const result = await apiRequest("/api/mood/heatmap?year=" + year, { token });
        const map = result.data || {};
        const labelByMood = { terrible: "Low", bad: "Meh", neutral: "Okay", good: "Good", rad: "Great" };
        const emojiByMood = { terrible: "😔", bad: "😕", neutral: "😐", good: "🙂", rad: "😁" };
        const valueByMood = { terrible: 2, bad: 4, neutral: 6, good: 8, rad: 10 };
        const remoteHistory = Object.entries(map).map(([isoDate, item]) => {
          const mood = String(item.mood || "neutral").toLowerCase();
          const date = new Date(isoDate + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
          return { id: "api-" + isoDate, isoDate, date, label: labelByMood[mood] || "Okay", emoji: emojiByMood[mood] || "😐", value: valueByMood[mood] || 6, intensity: item.intensity };
        }).sort((a, b) => b.isoDate.localeCompare(a.isoDate));
        if (!cancelled) setHistory(remoteHistory);
      } catch (error) {
        if (!cancelled) setHeatmapError(error.message || "Could not load saved moods from the backend.");
      } finally {
        if (!cancelled) setLoadingHeatmap(false);
      }
    }
    loadHeatmap();
    return () => { cancelled = true; };
  }, []);
  const [selectedDay, setSelectedDay] = useState(null);
  const today = new Date();
  const days = Array.from({ length: 84 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (83 - index));
    const key = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const record = history.find(item => item.date === key);
    const moodIndex = record ? Math.max(0, Math.min(4, Math.round((Number(record.value) - 2) / 2))) : -1;
    return { date, key, record, moodIndex };
  });
  const moodCounts = heatmapMoodColors.map((mood, index) => ({
    ...mood,
    count: history.filter(item => Math.max(0, Math.min(4, Math.round((Number(item.value) - 2) / 2))) === index).length,
  }));
  const loggedDays = days.filter(day => day.record).length;
  const average = history.length ? (history.reduce((sum, item) => sum + Number(item.value || 0), 0) / history.length).toFixed(1) : "—";
  const bestMood = history.length ? history.reduce((best, item) => Number(item.value) > Number(best.value) ? item : best, history[0]) : null;
  const monthLabels = [];
  days.forEach((day, index) => {
    if (index === 0 || day.date.getDate() === 1) monthLabels.push({ label: day.date.toLocaleDateString("en-US", { month: "short" }), index });
  });
  return <main className={theme + " mood-heatmap-page"}>
    <PageHeader eyebrow="YOUR MOOD, IN COLOUR" title={<>Every feeling leaves a <em>little colour.</em></>} subtitle="A gentle look at your emotional rhythm. No grades, no judgement — just you, noticing." icon={Sparkles}/>
    <section className="mood-hero-card">
      <div className="mood-hero-orb mood-orb-one"/><div className="mood-hero-orb mood-orb-two"/><div className="mood-hero-orb mood-orb-three"/>
      <div className="mood-hero-copy"><span className="mood-hero-kicker"><Sparkles size={14}/> YOUR PERSONAL MOOD MAP</span><h2>Your days, in <em>full colour.</em></h2><p>Each little square is a day in your story. Choose any coloured day to remember how you felt.</p></div>
      <div className="mood-hero-stat"><strong>{loggedDays}</strong><span>days checked in<br/>over the last 12 weeks</span></div>
    </section>
    <section className="mood-heatmap-card">
      <div className="mood-card-heading"><div><span className="section-page-eyebrow">THE LAST 12 WEEKS</span><h2>Your mood calendar</h2><p>Tap a day to see your check-in.</p>{loadingHeatmap && <p>Syncing your saved moods...</p>}{heatmapError && <p role="status">Could not sync from backend: {heatmapError}</p>}</div><span className="mood-total-pill"><span/> {history.length} check-ins saved</span></div>
      <div className="mood-heatmap-scroll"><div className="mood-month-row">{monthLabels.map((month,i)=><span key={month.index} style={{gridColumn: `${Math.floor(month.index / 7) + 1} / span ${Math.max(1, Math.ceil((84-month.index)/7))}`}}>{month.label}</span>)}</div>
        <div className="mood-heatmap-layout"><div className="mood-weekdays"><span>Mon</span><span>Wed</span><span>Fri</span></div><div className="mood-heatmap-grid">{days.map((day,index)=>{const color=day.record?heatmapMoodColors[day.moodIndex]:null;return <button key={day.key+index} type="button" className={`mood-heat-cell ${color?"has-mood":"no-mood"} ${selectedDay?.key===day.key?"selected":""}`} style={color?{"--cell-color":color.color,"--cell-text":color.text}:undefined} title={day.record?`${day.key}: ${day.record.label}`:`${day.key}: no check-in`} aria-label={day.record?`${day.key}, mood ${day.record.label}`:`${day.key}, no mood recorded`} onClick={()=>setSelectedDay(day)}>{day.record?day.record.emoji:""}</button>})}</div></div>
      </div>
      <div className="mood-heatmap-legend"><span className="mood-legend-label">{t("Less", "कम")}</span>{heatmapMoodColors.map(m=><span className="mood-legend-item" key={m.label}><i style={{background:m.color}}/>{m.label}</span>)}<span className="mood-legend-label">{t("More", "ज़्यादा")}</span><span className="mood-legend-item"><i className="mood-empty-swatch"/>{t("No check-in", "चेक-इन नहीं")}</span></div>
      {selectedDay&&<div className="mood-selected-day" key={selectedDay.key}><div className="mood-selected-emoji" style={selectedDay.record?{"background":heatmapMoodColors[selectedDay.moodIndex].color}:undefined}>{selectedDay.record?.emoji||"♡"}</div><div><span>{selectedDay.key}</span><strong>{selectedDay.record?selectedDay.record.label:"A day without a check-in"}</strong><p>{selectedDay.record?"You showed up for yourself. That counts.":"No mood was saved for this date. That’s okay, too."}</p></div><button type="button" onClick={()=>setSelectedDay(null)} aria-label="Close selected day"><Heart size={16}/></button></div>}
    </section>
    <section className="mood-insight-grid">
      <article className="mood-insight-card mood-average-card"><span className="mood-insight-icon">✦</span><span className="mood-insight-label">{t("AVERAGE MOOD", "औसत मूड")}</span><strong>{average}<small>{average!=="—"?"/10":""}</small></strong><p>{t("A snapshot, not a score.", "एक झलक, कोई अंक नहीं।")}</p><div className="mood-mini-spectrum"><i/><i/><i/><i/><i/></div></article>
      <article className="mood-insight-card mood-best-card"><span className="mood-insight-icon">☀</span><span className="mood-insight-label">{t("A BRIGHT SPOT", "एक खुशनुमा पल")}</span><strong>{bestMood?bestMood.emoji+" "+bestMood.label:t("Waiting for you", "आपका इंतज़ार है")}</strong><p>{bestMood?bestMood.date:t("Your first check-in will appear here.", "आपका पहला चेक-इन यहाँ दिखेगा।")}</p><div className="mood-floating-dots"><i/><i/><i/><i/></div></article>
      <article className="mood-insight-card mood-frequency-card"><span className="mood-insight-icon">✿</span><span className="mood-insight-label">{t("YOUR MOOD MIX", "आपके मूड का मेल")}</span><div className="mood-frequency-bars">{moodCounts.map(m=><div key={m.label} title={`${m.label}: ${m.count}`}><span>{m.label}</span><div><i style={{width:`${history.length?Math.max(m.count?5:0,m.count/history.length*100):0}%`,background:m.color}}/></div><b>{m.count}</b></div>)}</div></article>
    </section>
    <footer className="section-page-footer"><Heart size={13}/> Every colour belongs. Every kind of day counts. <span>Mindora · made for your softer days</span></footer>
  </main>;
}
