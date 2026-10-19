import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Gamepad2, Sparkles, RotateCcw, Play, Pause, Target, Star, Lock, Volume2, VolumeX, Trophy, Clock3 } from "lucide-react";
import { useLanguage } from "./language";
import "./GamesZone.css";

const games = [
  { id: "color-pop", title: "Color Pop", hi: "कलर पॉप", description: "Pop only the colour you are asked to find.", hiDescription: "दिए गए रंग के बबल्स ही पॉप करें।", emoji: "🌈", tone: "rainbow", ready: true },
  { id: "starweave", title: "Starweave", hi: "स्टारवीव", description: "Connect stars and create your own constellations.", hiDescription: "तारों को जोड़कर अपनी आकृतियाँ बनाएँ।", emoji: "🌌", tone: "night" },
  { id: "let-it-burn", title: "Let It Burn", hi: "लेट इट बर्न", description: "Write a thought and release it symbolically.", hiDescription: "अपने विचार लिखें और उन्हें प्रतीकात्मक रूप से छोड़ें।", emoji: "🕯️", tone: "paper" },
  { id: "light-jar", title: "The Little Light Jar", hi: "छोटी रोशनी का जार", description: "Collect little moments of hope.", hiDescription: "उम्मीद के छोटे-छोटे पल इकट्ठा करें।", emoji: "✨", tone: "glow" },
  { id: "rainy-window", title: "Rainy Window", hi: "बारिश वाली खिड़की", description: "Watch the rain and take a quiet pause.", hiDescription: "बारिश को देखें और एक शांत पल लें।", emoji: "🌧️", tone: "rain" },
];

const palette = [
  { name: "Pink", hi: "गुलाबी", color: "#ff8297" },
  { name: "Yellow", hi: "पीला", color: "#f5c85e" },
  { name: "Blue", hi: "नीला", color: "#68b9f5" },
  { name: "Green", hi: "हरा", color: "#61c9a8" },
  { name: "Orange", hi: "नारंगी", color: "#ffad70" },
  { name: "Purple", hi: "बैंगनी", color: "#b29aff" },
];

const levels = {
  Easy: { time: 30, target: 10, speed: 0.65, hi: "आसान" },
  Medium: { time: 30, target: 20, speed: 1.0, hi: "मध्यम" },
  Hard: { time: 25, target: 25, speed: 1.4, hi: "मुश्किल" },
};

function playSound(type, enabled) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.connect(gain);
    gain.connect(audio.destination);
    const now = audio.currentTime;
    oscillator.type = type === "correct" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(type === "correct" ? 720 : 210, now);
    oscillator.frequency.exponentialRampToValueAtTime(type === "correct" ? 360 : 145, now + (type === "correct" ? 0.12 : 0.09));
    gain.gain.setValueAtTime(type === "correct" ? 0.12 : 0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (type === "correct" ? 0.14 : 0.11));
    oscillator.start(now);
    oscillator.stop(now + 0.15);
    oscillator.onended = () => audio.close();
  } catch {
    // Audio is optional; the game should still work if sound is unavailable.
  }
}

function makeTargets(width, height, speed = 1) {
  // Start with a balanced set so every colour is available in useful quantity.
  // Then shuffle it so the colours are not arranged in a predictable order.
  const colourSet = Array.from({ length: 4 }, () => palette).flat();
  for (let i = colourSet.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colourSet[i], colourSet[j]] = [colourSet[j], colourSet[i]];
  }

  return colourSet.map((bubble) => ({
    x: 35 + Math.random() * Math.max(40, width - 70),
    y: 35 + Math.random() * Math.max(70, height * 0.64),
    r: 17 + Math.random() * 13,
    color: bubble.color,
    colorName: bubble.name,
    dx: (Math.random() - 0.5) * speed * 1.5,
    dy: (Math.random() - 0.5) * speed * 1.2,
    phase: Math.random() * 6,
  }));
}

export default function GamesZone() {
  const navigate = useNavigate();
  const [language] = useLanguage();
  const hi = language === "hi";
  const [activeGame, setActiveGame] = useState(null);
  const [difficulty, setDifficulty] = useState("Easy");
  const [targetColour, setTargetColour] = useState(palette[0]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [shots, setShots] = useState(0);
  const [remaining, setRemaining] = useState(30);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const canvasRef = useRef(null);
  const gameRef = useRef({
    targets: [], shot: null, pointer: { x: 300, y: 250 }, raf: 0,
    score: 0, correct: 0, wrong: 0, shots: 0, remaining: 30,
    endAt: 0, soundOn: true, difficulty: "Easy", targetColour: "Pink", finished: false,
  });

  useEffect(() => { gameRef.current.soundOn = soundOn; }, [soundOn]);

  useEffect(() => {
    if (activeGame !== "color-pop" || !playing) return;
    const state = gameRef.current;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
      state.remaining = seconds;
      setRemaining(seconds);
      if (seconds <= 0) {
        state.finished = true;
        setPlaying(false);
        setFinished(true);
        setWon(state.correct >= levels[state.difficulty].target);
      }
    };
    tick();
    const timer = window.setInterval(tick, 100);
    return () => window.clearInterval(timer);
  }, [activeGame, playing]);

  useEffect(() => {
    if (activeGame !== "color-pop" || !playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = gameRef.current;
    let frame = 0;
    const selectedLevel = levels[state.difficulty];
    // gameRef stores the target colour as a name string; resolve it to the palette object.
    const targetColor = palette.find((colour) => colour.name === state.targetColour) || palette[0];
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!state.targets.length) state.targets = makeTargets(rect.width, rect.height, selectedLevel.speed);
    };
    resize();
    // Seed the bubbles immediately as well as in resize, so the first frame
    // never starts with an empty target list.
    if (!state.targets.length) {
      const rect = canvas.getBoundingClientRect();
      state.targets = makeTargets(rect.width || 600, rect.height || 360, selectedLevel.speed);
    }
    window.addEventListener("resize", resize);

    const draw = () => {
      if (state.finished) return;
      const w = canvas.clientWidth || canvas.getBoundingClientRect().width || 600;
      const h = canvas.clientHeight || canvas.getBoundingClientRect().height || 360;
      // Safety fallback: make sure targets exist even if the first resize happened
      // before the canvas finished laying out in the browser.
      if (!state.targets.length) {
        state.targets = makeTargets(w, h, selectedLevel.speed);
      }
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#fff0e9"); bg.addColorStop(.34, "#f7edff"); bg.addColorStop(.68, "#e5f8f2"); bg.addColorStop(1, "#fff5ce");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 24; i++) {
        const x = (i * 83 + frame * .13) % Math.max(w, 1);
        const y = (i * 47) % Math.max(h, 1);
        ctx.fillStyle = "rgba(255,255,255,.8)";
        ctx.beginPath(); ctx.arc(x, y, (i % 3) + 1, 0, Math.PI * 2); ctx.fill();
      }
      state.targets.forEach((t) => {
        t.x += t.dx; t.y += t.dy; t.phase += .035;
        if (t.x < t.r || t.x > w - t.r) t.dx *= -1;
        if (t.y < t.r || t.y > h * .72) t.dy *= -1;
        const r = t.r + Math.sin(t.phase) * 1.5;
        ctx.shadowColor = t.color; ctx.shadowBlur = 13;
        const grad = ctx.createRadialGradient(t.x-r*.35,t.y-r*.4,2,t.x,t.y,r);
        grad.addColorStop(0, "#ffffff"); grad.addColorStop(.22, t.color); grad.addColorStop(1, t.color);
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(t.x,t.y,r,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0; ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.95)";
        ctx.beginPath(); ctx.ellipse(t.x-r*.28,t.y-r*.36,r*.19,r*.11,-.5,0,Math.PI*2); ctx.fill();
      });
      const shooterX = w / 2, shooterY = h - 31;
      ctx.strokeStyle = "rgba(82,100,130,.42)"; ctx.lineWidth = 2; ctx.setLineDash([5,6]);
      ctx.beginPath(); ctx.moveTo(shooterX, shooterY); ctx.lineTo(state.pointer.x, state.pointer.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.shadowColor = targetColor.color; ctx.shadowBlur = 15; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(shooterX, shooterY, 18, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = targetColor.color; ctx.beginPath(); ctx.arc(shooterX, shooterY, 11, 0, Math.PI*2); ctx.fill();

      if (state.shot) {
        const b = state.shot; b.x += b.vx; b.y += b.vy;
        ctx.shadowColor = b.color; ctx.shadowBlur = 13; ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.x,b.y,8,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
        const hit = state.targets.findIndex(t => Math.hypot(t.x-b.x,t.y-b.y) < t.r + 8);
        if (hit >= 0) {
          const t = state.targets[hit];
          state.targets.splice(hit, 1);
          state.shots++; setShots(state.shots);
          if (t.colorName === targetColor.name) {
            state.score += 10; state.correct++; setScore(state.score); setCorrect(state.correct);
            playSound("correct", state.soundOn);
          } else {
            state.score = Math.max(0, state.score - 5); state.wrong++; setScore(state.score); setWrong(state.wrong);
            playSound("wrong", state.soundOn);
          }
          const rect = canvas.getBoundingClientRect();
          const nextBubble = palette[state.shots % palette.length];
          state.targets.push({
            x: 35 + Math.random() * Math.max(40, rect.width - 70),
            y: 35 + Math.random() * Math.max(70, rect.height * 0.64),
            r: 17 + Math.random() * 13,
            color: nextBubble.color,
            colorName: nextBubble.name,
            dx: (Math.random() - 0.5) * selectedLevel.speed * 1.5,
            dy: (Math.random() - 0.5) * selectedLevel.speed * 1.2,
            phase: Math.random() * 6,
          });
          state.shot = null;
          if (state.correct >= selectedLevel.target) {
            state.finished = true;
            state.remaining = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
            setRemaining(state.remaining);
            setPlaying(false); setFinished(true); setWon(true);
            return;
          }
        } else if (b.y < -20 || b.x < -20 || b.x > w+20 || b.y > h+20) state.shot = null;
      }
      frame++; state.raf = requestAnimationFrame(draw);
    };

    const shoot = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      state.pointer = { x, y };
      if (!state.shot && !state.finished) {
        const sx = rect.width / 2, sy = rect.height - 31;
        const dx = x - sx, dy = y - sy, len = Math.max(1, Math.hypot(dx, dy));
        state.shot = { x: sx, y: sy, vx: dx / len * 7, vy: dy / len * 7, color: targetColor.color };
      }
    };
    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      state.pointer = { x: e.clientX-r.left, y: e.clientY-r.top };
    };
    draw();
    canvas.addEventListener("pointerdown", shoot);
    canvas.addEventListener("pointermove", move);
    return () => {
      cancelAnimationFrame(state.raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", shoot);
      canvas.removeEventListener("pointermove", move);
    };
  }, [activeGame, playing, targetColour]);

  function startColorPop(level = difficulty) {
    const chosen = levels[level] ? level : "Easy";
    const target = palette[Math.floor(Math.random() * palette.length)];
    const state = {
      targets: [], shot: null, pointer: { x: 300, y: 250 }, raf: 0,
      score: 0, correct: 0, wrong: 0, shots: 0, remaining: levels[chosen].time,
      endAt: Date.now() + levels[chosen].time * 1000, soundOn, difficulty: chosen,
      targetColour: target.name, finished: false,
    };
    gameRef.current = state;
    setDifficulty(chosen); setTargetColour(target); setScore(0); setCorrect(0); setWrong(0); setShots(0);
    setRemaining(levels[chosen].time); setFinished(false); setWon(false); setActiveGame("color-pop"); setPlaying(true);
  }

  function togglePause() {
    const state = gameRef.current;
    if (playing) {
      state.remaining = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
      setRemaining(state.remaining);
      setPlaying(false);
    } else if (!finished) {
      state.endAt = Date.now() + state.remaining * 1000;
      state.finished = false;
      setPlaying(true);
    }
  }

  function chooseGame(id) {
    if (id === "color-pop") { setActiveGame("color-pop"); setPlaying(false); setFinished(false); return; }
    setActiveGame(id); setPlaying(false);
  }

  const targetDetails = palette.find((p) => p.name === targetColour.name) || targetColour;
  const progress = Math.min(100, (correct / (levels[difficulty]?.target || 10)) * 100);

  return <main className="games-page">
    <header className="games-header">
      <button className="games-back" onClick={() => activeGame ? (setActiveGame(null), setPlaying(false), setFinished(false)) : navigate("/dashboard")}><ArrowLeft size={17}/>{hi ? "वापस" : "Back"}</button>
      <div className="games-brand"><span><Gamepad2 size={20}/></span><div><small>MINDORA · YOUR SPACE</small><h1>{hi ? "खेलें और सुकून पाएँ" : "Play & Unwind"}</h1></div></div>
      <p>{hi ? "थोड़ा खेलें। साँस लें। अपने लिए एक पल निकालें।" : "A little play, a little pause, a moment just for you."}</p>
    </header>

    {activeGame === "color-pop" && !playing && !finished ? <section className="colorpop-shell">
      <div className="colorpop-top"><div><span className="colorpop-kicker">MINDORA ARCADE · 01</span><h2>Color Pop <span>✦</span></h2><p>{hi ? "सिर्फ़ वही रंग पॉप करें जो ऊपर बताया गया है।" : "Pop only the colour you are asked to find."}</p></div></div>
      <div className="colorpop-levels">
        {Object.entries(levels).map(([name, info]) => <button key={name} className={"colorpop-level "+(difficulty===name?"selected":"")} onClick={() => setDifficulty(name)}><strong>{hi?info.hi:name}</strong><span><Clock3 size={14}/>{info.time}s</span><span><Target size={14}/>{info.target} {hi?"सही बबल्स":"correct bubbles"}</span></button>)}
      </div>
      <div className="colorpop-preview"><span className="colorpop-preview-bubble">🫧</span><div><strong>{hi?"कैसे खेलें":"How to play"}</strong><p>{hi?"लक्ष्य रंग के बबल पर निशाना लगाएँ। सही पर +10, गलत पर −5 अंक।":"Aim at the target-colour bubbles. Correct: +10 points. Wrong colour: −5 points."}</p></div></div>
      <div className="colorpop-controls"><button onClick={() => setSoundOn(v=>!v)}>{soundOn?<Volume2 size={16}/>:<VolumeX size={16}/>} {soundOn?(hi?"साउंड चालू":"Sound on"):(hi?"साउंड बंद":"Sound off")}</button><button className="colorpop-soft" onClick={() => startColorPop(difficulty)}><Play size={16} fill="currentColor"/>{hi?"खेल शुरू करें":"Start game"}</button></div>
    </section> : null}

    {activeGame === "color-pop" && playing ? <section className="colorpop-shell">
      <div className="colorpop-top"><div><span className="colorpop-kicker">{hi ? `मिंडोरा आर्केड · ${levels[difficulty].hi}` : `MINDORA ARCADE · ${difficulty.toUpperCase()}`}</span><h2>Color Pop <span>✦</span></h2><p>{hi?"इस रंग के बबल्स पॉप करें:":"Pop this colour:"} <strong className="colorpop-target-label"><i style={{background:targetDetails.color}}/>{hi?targetDetails.hi:targetDetails.name}</strong></p></div>
        <div className="colorpop-stats"><span><Star size={16}/>{hi?"स्कोर":"Score"} <b>{score}</b></span><span><Clock3 size={16}/>{hi?"समय":"Time"} <b>{remaining}s</b></span></div>
      </div>
      <div className="colorpop-progress-row"><span>{hi?"सही बबल्स":"Correct bubbles"} <b>{correct}/{levels[difficulty].target}</b></span><span>{hi?"गलत":"Wrong"} <b>{wrong}</b></span></div>
      <div className="colorpop-progress"><span style={{width:progress+"%"}}/></div>
      <div className="colorpop-canvas-wrap"><canvas ref={canvasRef} aria-label="Color Pop game. Shoot only the target-colour bubbles using mouse or touch."/><div className="colorpop-hint">{hi?"लक्ष्य रंग पर टैप या क्लिक करें":"Aim and click or tap the target-colour bubbles"}</div></div>
      <div className="colorpop-controls"><button onClick={togglePause}><Pause size={16}/>{hi?"रोकें":"Pause"}</button><button onClick={() => startColorPop(difficulty)}><RotateCcw size={16}/>{hi?"फिर से शुरू":"Restart"}</button><button onClick={() => setSoundOn(v=>!v)}>{soundOn?<Volume2 size={16}/>:<VolumeX size={16}/>} {soundOn?(hi?"साउंड चालू":"Sound on"):(hi?"साउंड बंद":"Sound off")}</button></div>
    </section> : null}

    {activeGame === "color-pop" && !playing && finished ? <section className="colorpop-shell colorpop-results">
      <span className="colorpop-result-icon">{won?"🏆":"🫧"}</span><span className="colorpop-kicker">{hi?"राउंड पूरा":"ROUND COMPLETE"}</span>
      <h2>{won?(hi?"शानदार! लक्ष्य पूरा हुआ।":"Lovely work! Target complete."):(hi?"अच्छी कोशिश!":"Nice try!")}</h2>
      <p>{won?(hi?"आपने समय रहते लक्ष्य पूरा कर लिया।":"You reached your target before time ran out."):(hi?"फिर से कोशिश करें — हर राउंड अभ्यास है।":"Give it another try. Every round is practice.")}</p>
      <div className="colorpop-result-stats"><div><span>{hi?"स्कोर":"Score"}</span><strong>{score}</strong></div><div><span>{hi?"सही बबल्स":"Correct"}</span><strong>{correct}/{levels[difficulty].target}</strong></div><div><span>{hi?"गलत बबल्स":"Wrong"}</span><strong>{wrong}</strong></div></div>
      <div className="colorpop-controls"><button onClick={() => {setFinished(false);setActiveGame("color-pop");}}>{hi?"लेवल चुनें":"Change level"}</button><button className="colorpop-soft" onClick={() => startColorPop(difficulty)}><RotateCcw size={16}/>{hi?"फिर खेलें":"Play again"}</button></div>
    </section> : null}

    {activeGame && activeGame !== "color-pop" ? <section className="game-coming-card"><span className="coming-emoji">{games.find(g=>g.id===activeGame)?.emoji}</span><span className="colorpop-kicker">{hi?"जल्द आ रहा है":"COMING SOON"}</span><h2>{hi?games.find(g=>g.id===activeGame)?.hi:games.find(g=>g.id===activeGame)?.title}</h2><p>{hi?games.find(g=>g.id===activeGame)?.hiDescription:games.find(g=>g.id===activeGame)?.description}</p><button onClick={()=>setActiveGame(null)}>{hi?"गेम चुनें":"Choose another game"}</button></section> : null}

    {!activeGame ? <>
      <section className="games-welcome"><span className="games-welcome-spark">✦</span><div><span className="colorpop-kicker">{hi?"आपकी छोटी-सी ब्रेक":"YOUR LITTLE BREAK"}</span><h2>{hi?"आज आप क्या खेलना चाहेंगे?":"What feels good to play today?"}</h2><p>{hi?"कोई दबाव नहीं, बस अपने लिए एक छोटा-सा पल।":"No pressure, just a little moment for yourself."}</p></div></section>
      <section className="games-grid">{games.map((g)=><button key={g.id} className={"game-card game-"+g.tone+(g.ready?" game-ready":"")} onClick={()=>chooseGame(g.id)}><span className="game-card-art"><span className="game-card-emoji">{g.emoji}</span>{g.ready?<span className="game-play-pill"><Play size={13} fill="currentColor"/> {hi?"खेलें":"Play now"}</span>:<span className="game-soon-pill"><Lock size={12}/> {hi?"जल्द":"Coming soon"}</span>}</span><span className="game-card-copy"><strong>{hi?g.hi:g.title}</strong><span>{hi?g.hiDescription:g.description}</span></span><ArrowRight size={17} className="game-card-arrow"/></button>)}</section>
    </> : null}
    <footer className="games-footer"><Sparkles size={15}/>{hi?"यह जगह सिर्फ़ आपके लिए है — अपनी गति से खेलें।":"This space is yours. Play at your own pace."}</footer>
  </main>;
}
