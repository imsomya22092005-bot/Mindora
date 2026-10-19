import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Gamepad2, Sparkles, RotateCcw, Play, Pause, Target, Star, Lock } from "lucide-react";
import { useLanguage } from "./language";
import "./GamesZone.css";

const games = [
  { id: "color-pop", title: "Color Pop", hi: "कलर पॉप", description: "Aim, shoot and pop colourful targets.", hiDescription: "रंगीन निशानों पर निशाना लगाएँ और उन्हें पॉप करें।", emoji: "🌈", tone: "rainbow", ready: true },
  { id: "starweave", title: "Starweave", hi: "स्टारवीव", description: "Connect stars and create your own constellations.", hiDescription: "तारों को जोड़कर अपनी आकृतियाँ बनाएँ।", emoji: "🌌", tone: "night" },
  { id: "let-it-burn", title: "Let It Burn", hi: "लेट इट बर्न", description: "Write a thought and release it symbolically.", hiDescription: "अपने विचार लिखें और उन्हें प्रतीकात्मक रूप से छोड़ें।", emoji: "🕯️", tone: "paper" },
  { id: "light-jar", title: "The Little Light Jar", hi: "छोटी रोशनी का जार", description: "Collect little moments of hope.", hiDescription: "उम्मीद के छोटे-छोटे पल इकट्ठा करें।", emoji: "✨", tone: "glow" },
  { id: "rainy-window", title: "Rainy Window", hi: "बारिश वाली खिड़की", description: "Watch the rain and take a quiet pause.", hiDescription: "बारिश को देखें और एक शांत पल लें।", emoji: "🌧️", tone: "rain" },
];

export default function GamesZone() {
  const navigate = useNavigate();
  const [language] = useLanguage();
  const hi = language === "hi";
  const [activeGame, setActiveGame] = useState(null);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef(null);
  const gameRef = useRef({ targets: [], shot: null, pointer: { x: 300, y: 250 }, raf: 0, score: 0, shots: 0 });

  useEffect(() => {
    if (activeGame !== "color-pop" || !playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = gameRef.current;
    let frame = 0;
    const palette = ["#ff8f9c", "#ffc36b", "#ffe58a", "#8bdcc6", "#87c8ff", "#c3a4ff"];
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!state.targets.length) {
        state.targets = Array.from({ length: 8 }, (_, i) => ({
          x: 55 + Math.random() * Math.max(80, rect.width - 110),
          y: 45 + Math.random() * Math.max(80, rect.height * .58),
          r: 15 + Math.random() * 13,
          color: palette[i % palette.length],
          dx: (Math.random() - .5) * 0.8,
          dy: (Math.random() - .5) * 0.6,
          phase: Math.random() * 6,
        }));
      }
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#fff1e9"); bg.addColorStop(.35, "#f7edff"); bg.addColorStop(.68, "#e8f8f5"); bg.addColorStop(1, "#fff5ce");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 22; i++) {
        const x = (i * 83 + frame * .13) % Math.max(w, 1);
        const y = (i * 47) % Math.max(h, 1);
        ctx.fillStyle = "rgba(255,255,255,.8)";
        ctx.beginPath(); ctx.arc(x, y, (i % 3) + 1, 0, Math.PI * 2); ctx.fill();
      }
      state.targets.forEach(t => {
        t.x += t.dx; t.y += t.dy; t.phase += .035;
        if (t.x < t.r || t.x > w - t.r) t.dx *= -1;
        if (t.y < t.r || t.y > h * .72) t.dy *= -1;
        const r = t.r + Math.sin(t.phase) * 1.5;
        ctx.shadowColor = t.color; ctx.shadowBlur = 15;
        const grad = ctx.createRadialGradient(t.x-r*.35,t.y-r*.4,2,t.x,t.y,r);
        grad.addColorStop(0,"#ffffff"); grad.addColorStop(.22,t.color); grad.addColorStop(1,t.color);
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(t.x,t.y,r,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0; ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 2; ctx.stroke();
      });
      const shooterX = w / 2, shooterY = h - 32;
      ctx.strokeStyle = "rgba(82,100,130,.45)"; ctx.lineWidth = 2; ctx.setLineDash([5,6]);
      ctx.beginPath(); ctx.moveTo(shooterX, shooterY); ctx.lineTo(state.pointer.x, state.pointer.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.shadowColor = "#7aaee8"; ctx.shadowBlur = 15; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(shooterX, shooterY, 17, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "#80b9ed"; ctx.beginPath(); ctx.arc(shooterX, shooterY, 10, 0, Math.PI*2); ctx.fill();
      if (state.shot) {
        const b = state.shot; b.x += b.vx; b.y += b.vy;
        ctx.shadowColor = b.color; ctx.shadowBlur = 14; ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x,b.y,9,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
        const hit = state.targets.findIndex(t => Math.hypot(t.x-b.x,t.y-b.y) < t.r + 9);
        if (hit >= 0) {
          const t = state.targets[hit]; state.targets.splice(hit,1);
          state.score += 10; setScore(state.score);
          for(let k=0;k<5;k++) state.targets.push({x:25+Math.random()*Math.max(60,w-50),y:30+Math.random()*Math.max(60,h*.6),r:15+Math.random()*12,color:palette[Math.floor(Math.random()*palette.length)],dx:(Math.random()-.5)*.8,dy:(Math.random()-.5)*.6,phase:Math.random()*6});
          state.shot = null;
        } else if (b.y < -20 || b.x < -20 || b.x > w+20) state.shot = null;
      }
      frame++; state.raf = requestAnimationFrame(draw);
    };
    draw();
    const shoot = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      state.pointer = {x,y};
      if (!state.shot) {
        const sx = rect.width/2, sy = rect.height-32;
        const dx=x-sx, dy=y-sy, len=Math.max(1,Math.hypot(dx,dy));
        state.shot={x:sx,y:sy,vx:dx/len*7,vy:dy/len*7,color:palette[Math.floor(Math.random()*palette.length)]};
        state.shots++; setShots(state.shots);
      }
    };
    const move = (e) => { const r=canvas.getBoundingClientRect(); state.pointer={x:e.clientX-r.left,y:e.clientY-r.top}; };
    canvas.addEventListener("pointerdown", shoot);
    canvas.addEventListener("pointermove", move);
    return () => { cancelAnimationFrame(state.raf); window.removeEventListener("resize", resize); canvas.removeEventListener("pointerdown", shoot); canvas.removeEventListener("pointermove", move); };
  }, [activeGame, playing]);

  function startColorPop() {
    gameRef.current = { targets: [], shot: null, pointer: { x: 300, y: 250 }, raf: 0, score: 0, shots: 0 };
    setScore(0); setShots(0); setPlaying(true); setActiveGame("color-pop");
  }
  function chooseGame(id) {
    if (id === "color-pop") { startColorPop(); return; }
    setActiveGame(id);
  }

  return <main className="games-page">
    <header className="games-header">
      <button className="games-back" onClick={() => activeGame === "color-pop" || activeGame ? setActiveGame(null) : navigate("/dashboard")}><ArrowLeft size={17}/>{hi ? "वापस" : "Back"}</button>
      <div className="games-brand"><span><Gamepad2 size={20}/></span><div><small>MINDORA · YOUR SPACE</small><h1>{hi ? "खेलें और सुकून पाएँ" : "Play & Unwind"}</h1></div></div>
      <p>{hi ? "थोड़ा खेलें। साँस लें। अपने लिए एक पल निकालें।" : "A little play, a little pause, a moment just for you."}</p>
    </header>
    {activeGame === "color-pop" ? <section className="colorpop-shell">
      <div className="colorpop-top"><div><span className="colorpop-kicker">MINDORA ARCADE · 01</span><h2>Color Pop <span>✦</span></h2><p>{hi ? "रंगीन बॉल्स पर निशाना लगाएँ। हर हिट पर 10 अंक!" : "Aim at the colourful balls. Every hit earns 10 points!"}</p></div><div className="colorpop-stats"><span><Star size={16}/>{hi ? "स्कोर" : "Score"} <b>{score}</b></span><span><Target size={16}/>{hi ? "शॉट" : "Shots"} <b>{shots}</b></span></div></div>
      <div className="colorpop-canvas-wrap"><canvas ref={canvasRef} aria-label="Color Pop shooting game. Tap or click a target to shoot."/><div className="colorpop-hint">{hi ? "बॉल को निशाना बनाकर टैप या क्लिक करें" : "Aim at a target and tap or click to shoot"}</div></div>
      <div className="colorpop-controls"><button onClick={() => setPlaying(v=>!v)}><Pause size={16}/>{playing ? (hi ? "रोकें" : "Pause") : (hi ? "जारी रखें" : "Resume")}</button><button onClick={startColorPop}><RotateCcw size={16}/>{hi ? "फिर से खेलें" : "Restart"}</button><button className="colorpop-soft" onClick={() => setActiveGame(null)}>{hi ? "गेम चुनें" : "Choose a game"}<ArrowRight size={15}/></button></div>
    </section> : activeGame ? <section className="game-coming-card"><span className="coming-emoji">{games.find(g=>g.id===activeGame)?.emoji}</span><span className="colorpop-kicker">{hi ? "जल्द आ रहा है" : "COMING SOON"}</span><h2>{hi ? games.find(g=>g.id===activeGame)?.hi : games.find(g=>g.id===activeGame)?.title}</h2><p>{hi ? games.find(g=>g.id===activeGame)?.hiDescription : games.find(g=>g.id===activeGame)?.description}</p><button onClick={()=>setActiveGame(null)}>{hi ? "गेम चुनें" : "Choose another game"}</button></section> : <>
      <section className="games-welcome"><span className="games-welcome-spark">✦</span><div><span className="colorpop-kicker">{hi ? "आपकी छोटी-सी ब्रेक" : "YOUR LITTLE BREAK"}</span><h2>{hi ? "आज आप क्या खेलना चाहेंगे?" : "What feels good to play today?"}</h2><p>{hi ? "कोई दबाव नहीं, कोई सही या गलत तरीका नहीं।" : "No pressure, no right or wrong way to play."}</p></div></section>
      <section className="games-grid">{games.map((g,i)=><button key={g.id} className={"game-card game-"+g.tone+(g.ready?" game-ready":"")} onClick={()=>chooseGame(g.id)}><span className="game-card-art"><span className="game-card-emoji">{g.emoji}</span>{g.ready?<span className="game-play-pill"><Play size={13} fill="currentColor"/> {hi?"खेलें":"Play now"}</span>:<span className="game-soon-pill"><Lock size={12}/> {hi?"जल्द":"Coming soon"}</span>}</span><span className="game-card-copy"><strong>{hi?g.hi:g.title}</strong><span>{hi?g.hiDescription:g.description}</span></span><ArrowRight size={17} className="game-card-arrow"/></button>)}</section>
    </>}
    <footer className="games-footer"><Sparkles size={15}/>{hi ? "यह जगह सिर्फ़ आपके लिए है — अपनी गति से खेलें।" : "This space is yours. Play at your own pace."}</footer>
  </main>;
}
