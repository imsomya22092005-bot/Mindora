import { useEffect, useState } from "react";
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
    <div className="section-page-brand"><span className="section-brand-mark"><Leaf size={20}/></span><span>mindora</span></div>
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
  const [entries, setEntries] = useState(loadEntries);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [activePrompt, setActivePrompt] = useState(0);
  const [savedNotice, setSavedNotice] = useState(false);
  useEffect(() => { try { localStorage.setItem("mindora-journal-entries", JSON.stringify(entries)); } catch {} }, [entries]);
  function saveEntry() {
    const body = text.trim();
    if (!body) return;
    const entry = { id: Date.now(), title: title.trim() || "A page from today", text: body, preview: body.length > 90 ? body.slice(0,90)+"…" : body, date: new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}), timestamp: Date.now() };
    setEntries(previous => [entry, ...previous]);
    setText(""); setTitle(""); setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2600);
  }
  function deleteEntry(id) { setEntries(previous => previous.filter(entry => entry.id !== id)); }
  return <main className={theme}>
    <PageHeader eyebrow="YOUR PRIVATE PAGES" title={<>A little space to <em>let it out.</em></>} subtitle="A journal that asks for nothing but honesty. Come as you are." icon={BookHeart}/>
    <div className="diary-layout">
      <section className="diary-editor">
        <div className="diary-paper-top"><span><Feather size={15}/> THE DAILY JOURNAL</span><span>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</span></div>
        <div className="diary-writing">
          <div className="diary-chapter"><span>✳</span> A MOMENT WITH YOURSELF</div>
          <h2>Dear, you...</h2>
          <p className="diary-intro">There is no right way to write this. Start wherever your thoughts are.</p>
          <label className="diary-title-label">GIVE THIS PAGE A TITLE <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="A thought I want to remember..." /></label>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={"Today, my mind has been full of...\n\nWhat I wish I could say is...\n\nWhat I need right now is..."} />
          <div className="diary-editor-footer"><span><LockKeyhole size={14}/> Saved privately on this device</span><span>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span></div>
          <button className="diary-save-button" onClick={saveEntry} disabled={!text.trim()}><Save size={16}/> Save this page <ArrowUpRight size={16}/></button>
          {savedNotice && <p className="diary-success"><Heart size={14}/> Your words have been tucked safely into your journal.</p>}
        </div>
      </section>
      <aside className="diary-side">
        <div className="diary-prompt-card"><span className="diary-side-icon"><Sparkles size={19}/></span><span className="diary-side-kicker">A GENTLE PROMPT</span><p>“{prompts[activePrompt]}”</p><button onClick={()=>setActivePrompt(i=>(i+1)%prompts.length)}>Another prompt <ArrowUpRight size={14}/></button><div className="diary-flower">✿</div></div>
        <div className="diary-reminder"><Heart size={17}/><p>You don't have to make sense of every feeling today. Some things just need a place to land.</p><span>— a reminder for you</span></div>
      </aside>
    </div>
    <section className="diary-entries">
      <div className="diary-entries-head"><div><span className="section-page-eyebrow">YOUR STORY, IN YOUR WORDS</span><h2>Pages you've kept</h2><p>Little pieces of your life, held with care.</p></div><span className="diary-count">{entries.length} {entries.length===1?"page":"pages"}</span></div>
      {!entries.length ? <div className="diary-empty"><BookHeart size={27}/><h3>Your story starts here.</h3><p>When you save your first page, it will find a home here.</p></div> : <div className="diary-entry-grid">{entries.map(entry=><article className="diary-saved-card" key={entry.id}><div className="diary-saved-meta"><CalendarDays size={14}/>{entry.date}<button aria-label="Delete journal entry" onClick={()=>deleteEntry(entry.id)}><Trash2 size={15}/></button></div><h3>{entry.title || "A page from today"}</h3><p>{entry.text}</p><span className="diary-entry-flourish">with kindness, always ✳</span></article>)}</div>}
    </section>
    <footer className="section-page-footer"><Heart size={13}/> This is your space. Your pace. Your story. <span>Mindora · made for your softer days</span></footer>
  </main>;
}

export function InsightsPage() {
  const theme=useThemeClass();
  const [history]=useState(()=>{try{return JSON.parse(localStorage.getItem("mindora-mood-history")||"[]")}catch{return[]}});
  const data=history.slice(0,7).reverse().map(item=>({day:item.date,mood:item.value,label:item.label}));
  const average=history.length?(history.reduce((sum,item)=>sum+item.value,0)/history.length).toFixed(1):"—";
  return <main className={theme}><PageHeader eyebrow="GENTLE SELF-AWARENESS" title={<>Notice how you're <em>growing.</em></>} subtitle="Your feelings are information, not a report card." icon={BarChart3}/><div className="insight-stat-grid"><article><span>CHECK-INS SAVED</span><strong>{history.length}</strong><p>Every check-in counts.</p></article><article><span>AVERAGE MOOD</span><strong>{average}{average!=="—"&&<small>/10</small>}</strong><p>A pattern, never a judgement.</p></article><article><span>LATEST CHECK-IN</span><strong>{history[0]?.emoji||"♡"} {history[0]?.label||"Not yet"}</strong><p>{history[0]?.date||"Your first check-in is waiting."}</p></article></div><section className="insight-chart-card"><span className="section-page-eyebrow">YOUR RECENT RHYTHM</span><h2>Mood, over time</h2><p>Look for patterns gently. One day never tells the whole story.</p>{data.length?<div className="insight-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="mindoraMoodFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#779875" stopOpacity={0.35}/><stop offset="100%" stopColor="#779875" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#dfe7dc"/><XAxis dataKey="day" tick={{fill:"#7d8b79",fontSize:11}}/><YAxis domain={[0,10]} tick={{fill:"#7d8b79",fontSize:11}}/><Tooltip/><Area type="monotone" dataKey="mood" stroke="#628766" fill="url(#mindoraMoodFill)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div>:<div className="diary-empty"><BarChart3 size={27}/><h3>Your insights will grow with you.</h3><p>Save a mood check-in on your dashboard and your personal rhythm will appear here.</p><Link to="/dashboard">Go to daily check-in <ArrowUpRight size={15}/></Link></div>}</section><div className="insight-kind-note"><Sparkles size={18}/><p><strong>A gentle reminder</strong><br/>The goal isn't to feel good every day. It's to understand yourself with a little more kindness.</p></div></main>;
}

const mindfulTools=[
 {title:"Calm Corner",description:"A quiet reset when the day feels like too much.",icon:Wind,href:"/calm-corner",tone:"sage"},
 {title:"Inner Garden",description:"Small acts of care, one little step at a time.",icon:Sprout,href:"/inner-garden",tone:"moss"},
 {title:"Little Comfort Box",description:"Find a kind reminder for the feeling you're carrying.",icon:HeartHandshake,href:"/comfort-box",tone:"peach"},
 {title:"Mood Soundscape",description:"Let gentle rain create a little breathing room.",icon:CloudRain,href:"/soundscape",tone:"blue"},
 {title:"Let It Out",description:"Write freely when you need to get something off your chest.",icon:BookHeart,href:"/let-it-out",tone:"rose"}
];
export function MindfulMomentsPage(){
 const theme=useThemeClass();
 return <main className={theme}><PageHeader eyebrow="SMALL PAUSES, SOFTER DAYS" title={<>Find your own kind of <em>calm.</em></>} subtitle="Choose what you need in this moment. Nothing here needs to be earned." icon={Wind}/><div className="mindful-intro-card"><div><span className="section-page-eyebrow">A NOTE TO YOURSELF</span><h2>You are allowed to pause.</h2><p>Rest is not falling behind. Take the smallest step that feels kind to you.</p></div><span className="mindful-big-spark">✳</span></div><div className="mindful-tool-grid">{mindfulTools.map(tool=>{const Icon=tool.icon;return <Link to={tool.href} className="mindful-tool-card" key={tool.title}><span className={"mindful-tool-icon "+tool.tone}><Icon size={22}/></span><span className="mindful-tool-title">{tool.title}<ArrowUpRight size={15}/></span><p>{tool.description}</p><span className="mindful-tool-open">Explore gently →</span></Link>})}</div><footer className="section-page-footer"><Heart size={13}/> No pressure. No perfect days. Just you.</footer></main>;
}
