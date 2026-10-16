import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck, Heart, Sparkles, RotateCcw } from "lucide-react";
import "./DashboardPages.css";

const questions = [
  { id: "stress", question: "How has your stress felt lately?", options: ["Manageable", "Up and down", "Overwhelming"] },
  { id: "energy", question: "How has your energy been?", options: ["Mostly steady", "Up and down", "Very low"] },
  { id: "sleep", question: "How has your sleep been?", options: ["Restful", "Sometimes disturbed", "Often disturbed"] },
  { id: "workload", question: "How manageable does your workload feel?", options: ["Manageable", "Difficult sometimes", "Too much right now"] },
  { id: "focus", question: "How easy is it to concentrate?", options: ["Mostly easy", "Sometimes difficult", "Very difficult"] },
  { id: "connection", question: "Have you had enough time for yourself or people you trust?", options: ["Yes, mostly", "A little", "Not really"] },
];

export default function IncognitoCheckinPage() {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const answered = questions.every(({ id }) => answers[id]);
  const strainCount = Object.values(answers).filter((value) => ["Overwhelming", "Very low", "Often disturbed", "Too much right now", "Very difficult", "Not really"].includes(value)).length;
  const reset = () => { setAnswers({}); setShowResult(false); };
  return <main className="mindora-section-page"><header className="section-page-header"><Link className="section-back" to="/dashboard"><ArrowLeft size={16}/> Dashboard</Link><div className="section-page-brand"><span className="section-brand-mark"><img src="/favicon.svg" alt=""/></span><span>mindora</span></div><div className="section-page-title"><span className="section-page-eyebrow"><ShieldCheck size={14}/> A PRIVATE MOMENT</span><h1>A little check-in, <em>just for you.</em></h1><p>No judgement and no pressure. Pause for a moment and notice how things have been feeling lately.</p></div></header>
  <section className="incognito-checkin-card"><div className="incognito-privacy-note"><ShieldCheck size={19}/><div><strong>Your private reflection</strong><p>Your answers stay in this page and are not saved to your journal or dashboard history.</p></div></div>
  {!showResult ? <><div className="incognito-progress"><span>{Object.keys(answers).length} of {questions.length} answered</span><div><span style={{width: `${Object.keys(answers).length / questions.length * 100}%`}}/></div></div>{questions.map((item,index)=><fieldset className="incognito-question" key={item.id}><legend><span>{String(index+1).padStart(2,"0")}</span>{item.question}</legend><div className="incognito-options">{item.options.map(option=><button type="button" key={option} className={answers[item.id]===option?"selected":""} onClick={()=>setAnswers(current=>({...current,[item.id]:option}))}>{option}</button>)}</div></fieldset>)}<button className="incognito-submit" disabled={!answered} onClick={()=>setShowResult(true)}>Reflect on my answers <ArrowRight size={16}/></button></> : <div className="incognito-result"><span className="incognito-result-icon"><Heart size={24}/></span><span className="section-page-eyebrow">A GENTLE REFLECTION</span><h2>{strainCount>=3?"It sounds like you may be carrying a lot.":"Give yourself credit for checking in."}</h2><p>{strainCount>=3?"Some answers suggest things may feel demanding right now. This isn't a diagnosis—just an invitation to pause and notice what support you might need.":"Your answers are a snapshot of how things feel right now. Keep noticing what helps you feel supported, rested, and connected."}</p><div className="incognito-suggestion"><Sparkles size={18}/><div><strong>One small step for today</strong><p>{strainCount>=3?"Choose one thing that can wait, take a short break, or share how you feel with someone you trust.":"Protect a little time for something restorative, even if it's only a few quiet minutes."}</p></div></div><p className="incognito-disclaimer">This self-reflection is not a clinical burnout assessment or medical advice. If distress persists or affects daily life, consider talking with a qualified professional.</p><button className="incognito-submit" onClick={reset}><RotateCcw size={15}/> Start again</button></div>}</section><footer className="section-page-footer"><Heart size={13}/> Your pace. Your space.<span>Mindora · made for your softer days</span></footer></main>;
}
