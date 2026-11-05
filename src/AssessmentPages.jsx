import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, Moon, BookOpen, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import "./AssessmentPages.css";

const scale4 = ["Not at all", "Several days", "More than half the days", "Nearly every day"];
const phq = [
 "Little interest or pleasure in doing things?",
 "Feeling down, depressed, or hopeless?",
 "Trouble falling or staying asleep, or sleeping too much?",
 "Feeling tired or having little energy?",
 "Poor appetite or overeating?",
 "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
 "Trouble concentrating on things, such as reading or watching television?",
 "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around more than usual?",
 "Thoughts that you would be better off dead or of hurting yourself in some way?"
];
const gad = [
 "Feeling nervous, anxious, or on edge?",
 "Not being able to stop or control worrying?",
 "Worrying too much about different things?",
 "Trouble relaxing?",
 "Being so restless that it is hard to sit still?",
 "Becoming easily annoyed or irritable?",
 "Feeling afraid, as if something awful might happen?"
];
const isi = [
 {name:"isi_1",text:"How much difficulty did you have falling asleep?",opts:["None","Mild","Moderate","Severe","Very severe"],concern:"Difficulty falling asleep"},
 {name:"isi_2",text:"How much difficulty did you have staying asleep?",opts:["None","Mild","Moderate","Severe","Very severe"],concern:"Waking up during the night"},
 {name:"isi_3",text:"How much trouble did you have waking up too early?",opts:["None","Mild","Moderate","Severe","Very severe"],concern:"Waking up too early"},
 {name:"isi_4",text:"How satisfied are you with your current sleep?",opts:["Very satisfied","Satisfied","Neutral","Dissatisfied","Very dissatisfied"],concern:"Not feeling satisfied with your sleep"},
 {name:"isi_5",text:"How noticeable to others is your sleep problem?",opts:["Not at all","A little","Somewhat","Much","Very much"],concern:"Sleep problems others can notice"},
 {name:"isi_6",text:"How worried are you about your sleep?",opts:["Not at all","A little","Somewhat","Much","Very much"],concern:"Worry about your sleep"},
 {name:"isi_7",text:"How much does your sleep affect your daily life?",opts:["Not at all","A little","Somewhat","Much","Very much"],concern:"Sleep affecting your daily life"}
];
const academicGroups = [
 {title:"Study and school",items:[
  ["study_load","How heavy is your study load?",["0 - None","1 - Very light","2 - Light","3 - Moderate","4 - Heavy","5 - Very heavy"]],
  ["academic_performance","How do you rate your own academic performance?",["0","1","2","3","4","5"]],
  ["future_career_concerns","How worried are you about your career?",["0 - Not at all","1 - Very little","2 - A little","3 - Somewhat","4 - Quite a lot","5 - Very much"]],
  ["teacher_student_relationship","How is your relationship with your teachers?",["0","1","2","3","4","5"]]
 ]},
 {title:"Sleep and body",items:[
  ["sleep_quality","How well do you sleep?",["0","1","2","3","4","5"]],
  ["headache","How often do you get headaches?",["0 - Never","1 - Rarely","2 - Sometimes","3 - Often","4 - Very often","5 - Almost daily"]],
  ["breathing_problem","Do you have trouble breathing?",["0 - Never","1 - Rarely","2 - Sometimes","3 - Often","4 - Very often","5 - Almost daily"]],
  ["blood_pressure","What is your blood pressure usually?",["1 - Low","2 - Normal","3 - High"]]
 ]},
 {title:"Daily life and people",items:[
  ["social_support","How much support do you get from people around you?",["0 - None","1 - A little","2 - Good","3 - Strong"]],
  ["peer_pressure","How much pressure do you feel from your peers?",["0 - None","1 - Very little","2 - A little","3 - Some","4 - A lot","5 - Extreme"]],
  ["extracurricular_activities","How busy are you with clubs and activities?",["0 - Not at all","1","2","3","4","5 - Very busy"]],
  ["bullying","Have you faced bullying?",["0 - Never","1 - Rarely","2 - Sometimes","3 - Often","4 - Very often","5 - All the time"]]
 ]},
 {title:"Your surroundings",items:[
  ["noise_level","How noisy is the place where you live or study?",["0 - Silent","1 - Very quiet","2 - Quiet","3 - Some noise","4 - Noisy","5 - Very noisy"]],
  ["living_conditions","How comfortable is your living space?",["0","1","2","3","4","5"]],
  ["safety","How safe do you feel where you live?",["0","1","2","3","4","5"]],
  ["basic_needs","How well are your basic needs met (food, rest, money)?",["0","1","2","3","4","5"]]
 ]}
];
function Shell({eyebrow,title,subtitle,children,icon:Icon=Heart}) {
 const nav=useNavigate(); return <main className="assessment-page"><button className="assessment-back" onClick={()=>nav("/dashboard")}><ArrowLeft size={16}/>{"Back to dashboard"}</button><header className="assessment-heading"><span className="assessment-mark"><Icon size={22}/></span><div><span className="assessment-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div></header>{children}</main>;
}
function OptionList({options,value,onChange}) { return <div className="assessment-options">{options.map((o,i)=><button type="button" key={i} className={String(value)===String(i)?"is-selected":""} onClick={()=>onChange(i)}>{o}</button>)}</div>; }
export function WellbeingCheckinPage(){
 const [step,setStep]=useState(-1),[answers,setAnswers]=useState({}),[result,setResult]=useState(false),[safety,setSafety]=useState(false);
 const questions=useMemo(()=>[...phq.map((q,i)=>({q,group:"Mood check",n:i+1})),...gad.map((q,i)=>({q,group:"Worry check",n:i+1}))],[]);
 const setAnswer=(v)=>setAnswers(a=>({...a,[step]:v}));
 const phqScore=phq.reduce((s,_,i)=>s+(answers[i]??0),0),gadScore=gad.reduce((s,_,i)=>s+(answers[i+9]??0),0);
 const q9=(answers[8]??0)>0;
 const level=(s,kind)=>kind==="phq"?(s<=4?"Minimal":s<=9?"Mild":s<=14?"Moderate":s<=19?"Moderately severe":"Severe"):(s<=4?"Minimal":s<=9?"Mild":s<=14?"Moderate":"Severe");
 const reset=()=>{setAnswers({});setStep(-1);setResult(false);setSafety(false);};
 return <Shell eyebrow="A GENTLE SELF-CHECK" title="Wellbeing Check-in" subtitle="16 short questions about how you have been feeling over the last two weeks. This is a screening tool, not a diagnosis.">
 {step===-1&&!result?<section className="assessment-panel assessment-intro"><div className="assessment-mini-grid"><article><span>01</span><h3>Mood check</h3><p>9 questions about interest, mood, sleep and energy.</p><strong>PHQ-9</strong></article><article><span>02</span><h3>Worry check</h3><p>7 questions about nervousness, worry and restlessness.</p><strong>GAD-7</strong></article></div><p className="assessment-disclaimer">Only a qualified professional can diagnose or treat a mental health condition.</p><button className="assessment-primary" onClick={()=>setStep(0)}>Start check-in <ArrowRight size={17}/></button></section>:null}
 {step>=0&&!result&&!safety?<section className="assessment-panel"><div className="assessment-progress-line"><span>{questions[step].group} · Question {step+1} of 16</span><strong>{Math.round((step+1)/16*100)}%</strong></div><div className="assessment-progress"><span style={{width:((step+1)/16*100)+"%"}}/></div><p className="assessment-timeframe">Over the last 2 weeks, how often have you had this problem?</p><h2 className="assessment-question">{questions[step].q}</h2><OptionList options={scale4} value={answers[step]} onChange={setAnswer}/><div className="assessment-actions"><button className="assessment-secondary" onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}>Back</button><button className="assessment-primary" disabled={answers[step]===undefined} onClick={()=>{if(step===15){if(q9)setSafety(true);else setResult(true);}else setStep(s=>s+1);}}>{step===15?"See my summary":"Next"} <ArrowRight size={16}/></button></div></section>:null}
 {safety&&!result?<section className="assessment-panel"><div className="assessment-safety"><h3>You don’t have to handle this alone</h3><p>One of your answers suggests you may have had thoughts of hurting yourself. These thoughts can be difficult to carry. Talking to someone you trust or a qualified professional can help.</p><p>If you are in immediate danger, contact local emergency services now.</p></div><p className="assessment-disclaimer">You can continue to your summary whenever you feel ready.</p><div className="assessment-actions"><button className="assessment-secondary" onClick={()=>setSafety(false)}>Review answers</button><button className="assessment-primary" onClick={()=>{setSafety(false);setResult(true);}}>Continue to my summary <ArrowRight size={16}/></button></div></section>:null}
 {result?<section className="assessment-panel"><span className="assessment-success"><CheckCircle2 size={20}/> Your check-in summary</span><div className="assessment-result-grid"><article><span>Mood check · PHQ-9</span><strong>{phqScore} <small>/ 27</small></strong><b>{level(phqScore,"phq")}</b><p>Minimal 0–4 · Mild 5–9 · Moderate 10–14 · Moderately severe 15–19 · Severe 20–27</p></article><article><span>Worry check · GAD-7</span><strong>{gadScore} <small>/ 21</small></strong><b>{level(gadScore,"gad")}</b><p>Minimal 0–4 · Mild 5–9 · Moderate 10–14 · Severe 15–21</p></article></div><p className="assessment-disclaimer">These scores describe your answers, not a diagnosis. If the results worry you, consider speaking with a doctor, counsellor or someone you trust.</p>{q9?<div className="assessment-safety"><h3>You don’t have to handle this alone</h3><p>One of your answers suggests you may have had thoughts of hurting yourself. Talking to someone you trust or a qualified professional can help. If you are in immediate danger, contact local emergency services now.</p></div>:null}<div className="assessment-actions"><button className="assessment-secondary" onClick={reset}><RotateCcw size={15}/> Check in again later</button><button className="assessment-primary" onClick={()=>window.location.assign("/mindora-ai")}>See coping suggestions <ArrowRight size={16}/></button></div></section>:null}
 </Shell>;
}
export function SleepCheckPage(){
 const [answers,setAnswers]=useState({}),[profile,setProfile]=useState({age:"20",gender:"female",smoke:"never smokes",drink:"never drinks"}),[result,setResult]=useState(null);
 const complete=isi.every(q=>answers[q.name]!==undefined)&&profile.age>=16&&profile.age<=40;
 const submit=()=>{if(!complete)return;const vals=isi.map(q=>answers[q.name]);const total=vals.reduce((a,b)=>a+b,0);const score=Math.min(100,Math.round(total*4.2));const level=score>=60?"Needs attention":score>=40?"Disturbed":"Steady";const worst=vals.indexOf(Math.max(...vals));setResult({score,level,concern:vals[worst]===0?"None. All your answers are in the healthy range.":isi[worst].concern});};
 return <Shell eyebrow="REST & RECOVERY" title="How has your sleep been?" subtitle="Answer seven questions about the last two weeks and reflect on your sleep pattern." icon={Moon}><div className="assessment-panel"><h2>Your sleep</h2><p className="assessment-muted">Choose the answer that fits you best.</p>{isi.map((q,i)=><fieldset className="assessment-fieldset" key={q.name}><legend>{i+1}. {q.text}</legend><OptionList options={q.opts} value={answers[q.name]} onChange={v=>setAnswers(a=>({...a,[q.name]:v}))}/></fieldset>)}<h2>About you</h2><p className="assessment-muted">These details are part of the demo form.</p><div className="assessment-profile-grid"><label>Age<input type="number" min="16" max="40" value={profile.age} onChange={e=>setProfile(p=>({...p,age:e.target.value}))}/></label><label>Gender<select value={profile.gender} onChange={e=>setProfile(p=>({...p,gender:e.target.value}))}><option value="female">Female</option><option value="male">Male</option></select></label><label>Smoking<select value={profile.smoke} onChange={e=>setProfile(p=>({...p,smoke:e.target.value}))}><option value="never smokes">Never smokes</option><option value="occasional smoker (cumulative smoking <10 packs)">Occasional smoker</option><option value="current smoker (cumulative smoking >10 packs)">Current smoker</option><option value="former smoker (cumulative smoking >10 packs), but not in the past year">Former smoker</option></select></label><label>Drinking<select value={profile.drink} onChange={e=>setProfile(p=>({...p,drink:e.target.value}))}><option value="never drinks">Never drinks</option><option value="drinks occasionally (less than once a week)">Occasionally (less than once a week)</option><option value="current regular drinker (more than once a week)">Regularly (more than once a week)</option><option value="drank in the past (more than once a week), but not in the past year">In the past</option></select></label></div><div className="assessment-actions"><button className="assessment-secondary" onClick={()=>{setAnswers({});setResult(null);}}>Clear answers</button><button className="assessment-primary" disabled={!complete} onClick={submit}>Check my sleep pattern <ArrowRight size={16}/></button></div>{result?<div className="assessment-sleep-result"><span className="assessment-demo-flag">Demo calculation — not a real model prediction</span><h2>{result.level==="Steady"?"Your sleep pattern looks steady":result.level==="Disturbed"?"Your sleep seems a little disturbed":"Your sleep needs some attention"}</h2><strong>{result.score} <small>/ 100</small></strong><p><b>Biggest sleep concern:</b> {result.concern}</p><p>This is a wellness check, not a medical diagnosis. A real model result is not connected yet.</p></div>:null}</div></Shell>;
}
export function AcademicStressPage(){
 const [values,setValues]=useState({}),[result,setResult]=useState(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 const all=academicGroups.flatMap(g=>g.items),complete=all.every(([name])=>values[name]!==undefined);
 const submit=async e=>{e.preventDefault();if(!complete)return;setLoading(true);setError("");setResult(null);try{const response=await fetch("/api/predict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(all.map(([name])=>[name,Number(values[name])])))});if(!response.ok)throw new Error("The predictor service is not available right now.");const data=await response.json();if(!data.level)throw new Error("The predictor response was incomplete.");setResult(data);}catch(err){setError(err.message||"Could not connect to the predictor. Please try again later.");}finally{setLoading(false);}};
 return <Shell eyebrow="STUDY, SLEEP & SURROUNDINGS" title="Academic Stress Pattern Predictor" subtitle="Answer 16 short questions to see which patterns may be associated with your self-reported stress." icon={BookOpen}><form className="assessment-panel" onSubmit={submit}><p className="assessment-muted">Choose the option that fits best. The exact option values are sent to the predictor.</p>{academicGroups.map(group=><fieldset className="assessment-fieldset academic-group" key={group.title}><legend>{group.title}</legend><div className="assessment-profile-grid">{group.items.map(([name,label,opts])=><label key={name}>{label}<select required value={values[name]??""} onChange={e=>setValues(v=>({...v,[name]:e.target.value}))}><option value="" disabled>Choose</option>{opts.map((o,i)=><option value={name==="blood_pressure"?i+1:i} key={i}>{o}</option>)}</select></label>)}</div></fieldset>)}<div className="assessment-actions"><button type="button" className="assessment-secondary" onClick={()=>{setValues({});setResult(null);setError("");}}>Clear answers</button><button className="assessment-primary" disabled={!complete||loading}>{loading?"Checking…":"See my result"} <ArrowRight size={16}/></button></div>{error?<p className="assessment-error"><AlertCircle size={16}/>{error}</p>:null}{result?<div className="assessment-academic-result"><span className="assessment-success">Your pattern summary</span><h2>{String(result.level).toLowerCase()} stress</h2>{Array.isArray(result.factors)&&result.factors.length?<><b>Patterns associated with your answers</b><ul>{result.factors.map((f,i)=><li key={i}>{f}</li>)}</ul></>:null}<p>{result.message}</p><p className="assessment-disclaimer">{result.disclaimer}</p></div>:null}</form><p className="assessment-disclaimer assessment-outside-note">This student project shows associations, not causes. It is not a diagnosis and does not measure burnout.</p></Shell>;
}
