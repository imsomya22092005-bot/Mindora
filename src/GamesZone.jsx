import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Gamepad2, Sparkles, RotateCcw, Play, Pause, Target, Star, Lock, Volume2, VolumeX, Trophy, Clock3 } from "lucide-react";
import { useLanguage } from "./language";
import "./GamesZone.css";

const games = [
  { id: "color-pop", title: "Color Pop", hi: "कलर पॉप", description: "Pop only the colour you are asked to find.", hiDescription: "दिए गए रंग के बबल्स ही पॉप करें।", emoji: "🌈", tone: "rainbow", ready: true },
  { id: "starweave", title: "Starweave", hi: "स्टारवीव", description: "Connect stars and create your own constellations.", hiDescription: "तारों को जोड़कर अपनी आकृतियाँ बनाएँ।", emoji: "🌌", tone: "night" },
  { id: "let-it-burn", title: "Let It Burn", hi: "लेट इट बर्न", description: "Write it down, light the page, and let it go.", hiDescription: "लिखें, पन्ने को जलाएँ और मन हल्का करें।", emoji: "🕯️", tone: "paper", ready: true },
  { id: "fruit-merge", title: "Fruit Merge", hi: "फ्रूट मर्ज", description: "Drop matching fruits, merge them, and beat your best score.", hiDescription: "एक जैसे फल गिराएँ, उन्हें मिलाएँ और अपना स्कोर बढ़ाएँ।", emoji: "🍉", tone: "glow", ready: true },
  { id: "picture-puzzle", title: "Picture Puzzle", hi: "तस्वीर वाली पहेली", description: "Put the picture back together by moving the tiles.", hiDescription: "टाइल्स को सही जगह लगाकर तस्वीर पूरी करें।", emoji: "🧩", tone: "rain", ready: true },
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


function makePuzzleShuffle(size) {
 const total=size*size; const tiles=Array.from({length:total},(_,i)=>i); let blank=total-1; let previousBlank=-1;
 for(let step=0;step<Math.max(60,total*18);step++){const options=[blank-size,blank+size,...(blank%size?[blank-1]:[]),...(blank%size<size-1?[blank+1]:[])].filter(index=>index>=0&&index<total&&index!==previousBlank);const next=options[Math.floor(Math.random()*options.length)];[tiles[blank],tiles[next]]=[tiles[next],tiles[blank]];previousBlank=blank;blank=next;}
 return tiles;
}

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
  const colourSet = Array.from({ length: 5 }, () => palette).flat();
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
  const location = useLocation();
  const [language] = useLanguage();
  const hi = language === "hi";
  const [activeGame, setActiveGame] = useState(() => new URLSearchParams(window.location.search).get("game"));
  useEffect(() => {
    const requestedGame = new URLSearchParams(location.search).get("game");
    if (requestedGame && games.some((game) => game.id === requestedGame)) {
      setActiveGame(requestedGame);
      setPlaying(false);
      setFinished(false);
    } else if (!requestedGame) {
      setActiveGame(null);
    }
  }, [location.search]);
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
  const [burnThought, setBurnThought] = useState("");
  const [burning, setBurning] = useState(false);
  const [candleMoved, setCandleMoved] = useState(false);
  const [candleLitPaper, setCandleLitPaper] = useState(false);
  const [burnComplete, setBurnComplete] = useState(false);
  const [penColour, setPenColour] = useState("#45536c");
  const [puzzleImage, setPuzzleImage] = useState("");
  const [puzzleSize, setPuzzleSize] = useState(3);
  const [puzzleTiles, setPuzzleTiles] = useState([]);
  const [puzzleMoves, setPuzzleMoves] = useState(0);
  const [puzzleWon, setPuzzleWon] = useState(false);
  const [puzzleSelected, setPuzzleSelected] = useState(null);
  const [puzzleRemaining, setPuzzleRemaining] = useState(120);
  const [puzzleTimedOut, setPuzzleTimedOut] = useState(false);
  const canvasRef = useRef(null);
  const fruitCanvasRef = useRef(null);
  const fruitStateRef = useRef({ fruits: [], next: 0, score: 0, over: false, raf: 0, lastMerge: 0 });
  const [fruitScore, setFruitScore] = useState(0);
  const [fruitNext, setFruitNext] = useState(0);
  const [fruitOver, setFruitOver] = useState(false);
  const [fruitResetKey, setFruitResetKey] = useState(0);
  const gameRef = useRef({
    targets: [], shot: null, pointer: { x: 300, y: 250 }, raf: 0,
    score: 0, correct: 0, wrong: 0, shots: 0, remaining: 30,
    endAt: 0, soundOn: true, difficulty: "Easy", targetColour: "Pink", finished: false,
  });

  useEffect(() => { gameRef.current.soundOn = soundOn; }, [soundOn]);

  const puzzleTimeLimit = puzzleSize === 3 ? 120 : puzzleSize === 4 ? 180 : 240;
  useEffect(() => {
    if (activeGame !== "picture-puzzle" || !puzzleImage || !puzzleTiles.length || puzzleWon || puzzleTimedOut) return;
    const timer = window.setInterval(() => setPuzzleRemaining(value => {
      if (value <= 1) { window.clearInterval(timer); setPuzzleTimedOut(true); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [activeGame, puzzleImage, puzzleTiles.length, puzzleWon, puzzleTimedOut]);

  function startPicturePuzzle(image = puzzleImage, size = puzzleSize) {
    setPuzzleTiles(makePuzzleShuffle(size));
    setPuzzleMoves(0);
    setPuzzleWon(false);
    setPuzzleTimedOut(false);
    setPuzzleSelected(null);
    setPuzzleRemaining(size === 3 ? 120 : size === 4 ? 180 : 240);
  }

  function quitPicturePuzzle() {
    setActiveGame(null); setPlaying(false); setFinished(false);
    setPuzzleImage(""); setPuzzleTiles([]); setPuzzleMoves(0); setPuzzleWon(false);
    setPuzzleTimedOut(false); setPuzzleSelected(null);
    navigate("/games");
  }

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
          // Refill whichever colour currently has the fewest bubbles.
          // This keeps all six colours available throughout the round.
          const colourCounts = palette.map((colour) => ({
            colour,
            count: state.targets.filter((bubble) => bubble.colorName === colour.name).length,
          }));
          const lowestCount = Math.min(...colourCounts.map((item) => item.count));
          const leastAvailable = colourCounts.filter((item) => item.count === lowestCount);
          const nextBubble = leastAvailable[Math.floor(Math.random() * leastAvailable.length)].colour;
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


  const fruitTypes = [
    { emoji: "🍒", r: 14, points: 2 }, { emoji: "🍓", r: 19, points: 4 },
    { emoji: "🍇", r: 24, points: 8 }, { emoji: "🍊", r: 29, points: 16 },
    { emoji: "🍋", r: 34, points: 32 }, { emoji: "🍏", r: 39, points: 64 },
    { emoji: "🍑", r: 45, points: 128 }, { emoji: "🍍", r: 51, points: 256 },
    { emoji: "🍈", r: 58, points: 512 }, { emoji: "🍉", r: 66, points: 1024 },
  ];
  function resetFruitMerge() {
    fruitStateRef.current = { fruits: [], next: Math.floor(Math.random() * 4), score: 0, over: false, raf: 0, lastMerge: 0, dropX: 180 };
    setFruitScore(0); setFruitNext(fruitStateRef.current.next); setFruitOver(false); setFruitResetKey(k => k + 1);
  }
  useEffect(() => {
    if (activeGame !== "fruit-merge") return;
    const canvas = fruitCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = fruitStateRef.current;
    let width = 360, height = 520, last = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width || 360; height = rect.height || 520; state.dropX = Math.max(45, Math.min(width - 45, state.dropX || width / 2));
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); window.addEventListener("resize", resize);
    const draw = (now) => {
      const dt = Math.min((now - (last || now)) / 16.67, 2); last = now;
      ctx.clearRect(0, 0, width, height);
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#d9f2ff"); bg.addColorStop(.45, "#fff2dc"); bg.addColorStop(1, "#ffe1d7");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255,255,255,.55)";
      for (let i=0;i<16;i++) { ctx.beginPath(); ctx.arc((i*79)%width,(i*113)%height,2+(i%3),0,Math.PI*2);ctx.fill(); }
      const wall = 12, floor = height - 16;
      ctx.fillStyle = "#b9825b"; ctx.fillRect(wall, 0, 5, floor); ctx.fillRect(width-wall-5, 0, 5, floor); ctx.fillRect(wall, floor, width-wall*2, 8);
      ctx.strokeStyle = "rgba(170,75,55,.5)"; ctx.setLineDash([6,5]); ctx.beginPath(); ctx.moveTo(wall+5, 92); ctx.lineTo(width-wall-5, 92); ctx.stroke(); ctx.setLineDash([]);
      if (!state.over) { const previewX = Math.max(wall + fruitTypes[state.next].r + 5, Math.min(width - wall - fruitTypes[state.next].r - 5, state.dropX || width / 2)); ctx.strokeStyle = "rgba(100,105,120,.65)"; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(previewX, 24); ctx.lineTo(previewX, 78); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = .8; ctx.font = (fruitTypes[state.next].r * 1.55) + "px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(fruitTypes[state.next].emoji, previewX, 50); ctx.globalAlpha = 1; }
      if (!state.over) {
        state.fruits.forEach((a) => {
          if (!a.drop) { a.y += a.vy * dt; a.vy += .028 * dt; }
          if (a.x-a.r < wall+5) { a.x=wall+5+a.r; a.vx=0; }
          if (a.x+a.r > width-wall-5) { a.x=width-wall-5-a.r; a.vx=0; }
          if (a.y+a.r > floor) { a.y=floor-a.r; a.vy=0; a.drop=true; }
        });
        for (let i=0;i<state.fruits.length;i++) for(let j=i+1;j<state.fruits.length;j++) {
          const a=state.fruits[i], b=state.fruits[j], dx=b.x-a.x, dy=b.y-a.y, dist=Math.hypot(dx,dy), min=a.r+b.r;
          if (dist < min && dist > 0) {
            if (a.type===b.type && a.type < fruitTypes.length-1 && now-state.lastMerge>100) {
              const type=a.type+1, x=(a.x+b.x)/2, y=(a.y+b.y)/2;
              state.fruits.splice(j,1); state.fruits.splice(i,1);
              state.fruits.push({x,y,r:fruitTypes[type].r,type,vy:-2,vx:0,drop:false});
              state.score += fruitTypes[type].points; setFruitScore(state.score); state.lastMerge=now;
              i=-1; break;
            } else {
              const overlap=(min-dist)*.5, nx=dx/dist, ny=dy/dist;
              if (!a.drop) {a.y-=ny*overlap;}
              if (!b.drop) {b.y+=ny*overlap;}
              if (a.y+a.r >= floor-1 && b.y+b.r >= floor-1) {a.drop=true;b.drop=true;}
            }
          }
        }
        if (state.fruits.some(a=>a.y-a.r < 92 && a.drop)) { state.over=true; setFruitOver(true); }
      }
      state.fruits.forEach(a=>{
        const fruit=fruitTypes[a.type];
        ctx.save(); ctx.shadowColor="rgba(99,65,45,.2)";ctx.shadowBlur=8;ctx.shadowOffsetY=3;
        ctx.fillStyle="rgba(255,255,255,.68)";ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.font=(a.r*1.55)+"px serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(fruit.emoji,a.x,a.y+1);ctx.restore();
      });
      if (!state.over) state.raf=requestAnimationFrame(draw);
    };
    const moveFruitPosition = (e) => {
      const rect=canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      state.dropX=Math.max(wall+fruitTypes[state.next].r+5,Math.min(width-wall-fruitTypes[state.next].r-5,(e.clientX-rect.left)*scaleX));
    };
    const spawnFruit = () => {
      if (state.over) return;
      const type=state.next;
      state.fruits.push({x:state.dropX || width/2,y:28,r:fruitTypes[type].r,type,vy:0,vx:0,drop:false});
      state.next=Math.floor(Math.random()*4);setFruitNext(state.next);
    };
    canvas.addEventListener("pointermove",moveFruitPosition);
    const spawnTimer=window.setInterval(spawnFruit,2800);
    state.raf=requestAnimationFrame(draw);
    return ()=>{cancelAnimationFrame(state.raf);window.clearInterval(spawnTimer);window.removeEventListener("resize",resize);canvas.removeEventListener("pointermove",moveFruitPosition);};
  }, [activeGame, fruitResetKey]);

  function chooseGame(id) {
    if (id === "picture-puzzle") { setPuzzleTiles([]); setPuzzleMoves(0); setPuzzleWon(false); }
    if (id === "fruit-merge") resetFruitMerge();
    if (id === "color-pop") { setActiveGame("color-pop"); setPlaying(false); setFinished(false); return; }
    setActiveGame(id); setPlaying(false);
  }

  const targetDetails = palette.find((p) => p.name === targetColour.name) || targetColour;
  const progress = Math.min(100, (correct / (levels[difficulty]?.target || 10)) * 100);

  return <main className="games-page">
    <header className="games-header">
      {activeGame && <button className="games-back" onClick={() => { setActiveGame(null); setPlaying(false); setFinished(false); navigate("/games"); }}><ArrowLeft size={17}/>{hi ? "सभी गेम" : "All games"}</button>}
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

    {activeGame === "let-it-burn" ? <section className="burn-experience">
      <div className="burn-hero"><span className="burn-eyebrow">{hi?"आपके लिए एक शांत पल":"A QUIET RITUAL FOR YOU"}</span><h2>{hi?"जो मन में है, उसे लिखें।":"Some things are lighter when let go."}</h2><p>{hi?"बिना किसी डर या फैसले के, अपने मन की बात इस पन्ने पर उतारें।":"A gentle space to put your thoughts down, without judgement or pressure."}</p></div>
      <div className={"burn-scene"+(candleLitPaper?" paper-ignited":"")}><button className={"burn-candle"+(candleMoved?" candle-at-paper":"")+(candleLitPaper?" candle-used":"")} aria-label={hi?"मोमबत्ती को पन्ने तक ले जाएँ":"Move candle to the page"} onClick={()=>{if(!burning&&!burnComplete)setCandleMoved(v=>!v)}}><span/></button><div className={"burn-letter"+(burning?" burning":"")+(candleLitPaper?" catching-fire":"")}>
        <div className="burn-letter-top"><span>{hi?"आज का पन्ना":"A LETTER TO MYSELF"}</span><span>✧</span></div>
        <div className="burn-date">{hi?"अपने लिए, प्यार से":"WITH KINDNESS, ALWAYS"}</div>
        {burnComplete ? <div className="burn-after"><span>☀</span><h3>{hi?"अब इसे जाने दें।":"You can let it go now."}</h3><p>{hi?"हर विचार को हमेशा अपने साथ रखना ज़रूरी नहीं। धीरे से साँस लें।":"You don't have to carry every thought with you. Take one slow breath."}</p><button onClick={()=>{setBurnThought("");setBurnComplete(false);setBurning(false);setCandleMoved(false);setCandleLitPaper(false)}}>{hi?"नया पन्ना खोलें":"Begin with a fresh page"}</button></div> : <>
          <textarea value={burnThought} onChange={e=>setBurnThought(e.target.value)} disabled={burning} maxLength={600} placeholder={hi?"प्रिय मन, आज मैं यह बात छोड़ना चाहता/चाहती हूँ…":"Dear mind, today I’m ready to release…"} style={{color:penColour}} aria-label={hi?"अपनी बात लिखें":"Write your thoughts"}/>
          <div className="burn-letter-foot"><span>{hi?"यह पन्ना सेव नहीं किया जाएगा":"Your words aren't saved"}</span><span>{burnThought.length}/600</span></div>
        </>}
      {candleLitPaper&&<><span className="burn-fire-flare"/><span className="burn-smoke smoke-one"/><span className="burn-smoke smoke-two"/><span className="burn-smoke smoke-three"/></>}</div></div>
      {!burnComplete && <div className="burn-actions"><div className="burn-pen-row"><span>{hi?"अपनी स्याही चुनें":"CHOOSE YOUR INK"}</span>{[{c:"#45536c",label:hi?"नीली":"Blue"},{c:"#a45d70",label:hi?"गुलाबी":"Rose"},{c:"#607c66",label:hi?"हरी":"Sage"}].map(p=><button key={p.c} title={p.label} aria-label={p.label} className={penColour===p.c?"active":""} onClick={()=>setPenColour(p.c)}><i style={{background:p.c}}/></button>)}</div>
      {burning ? <div className="burn-confirm"><p>{hi?"पन्ना जल रहा है… धीरे से साँस लें।":"The page is burning away… take one slow breath."}</p></div> : <><button className="burn-button" disabled={!burnThought.trim()} onClick={()=>{if(!candleMoved){setCandleMoved(true);return;}setCandleLitPaper(true);setBurning(true);window.setTimeout(()=>{setBurnComplete(true);setBurning(false);setBurnThought("");setCandleLitPaper(false);setCandleMoved(false)},2600)}}>{!candleMoved?(hi?"मोमबत्ती को पन्ने तक ले जाएँ":"Move candle to the page"):(hi?"पन्ने में आग लगाएँ":"Light the page")} <span>✦</span></button><button className="burn-keep" onClick={()=>{setCandleMoved(false);setCandleLitPaper(false)}}>{hi?"मोमबत्ती वापस रखें":"Reset candle"}</button></>}
      <p className="burn-note">{hi?"यह एक डिजिटल प्रतीकात्मक अनुभव है — कोई वास्तविक आग नहीं।":"A symbolic digital ritual. No real fire, just a little room to breathe."}</p></div>}
    </section> : null}


    {activeGame === "fruit-merge" ? <section className="fruit-merge-shell">
      <div className="picture-puzzle-heading"><span className="picture-puzzle-icon">🍉</span><div><span className="colorpop-kicker">MINDORA ARCADE · FRUIT GAME</span><h2>{hi?"फलों को मिलाएँ":"Fruit Merge"} <span>✦</span></h2><p>{hi?"एक जैसे फल मिलाकर बड़े फल बनाएँ।":"Move the mouse to choose a spot. Fruits fall slowly and stay in their lane as much as possible."}</p></div></div>
      <div className="fruit-merge-stats"><span>{hi?"स्कोर":"Score"} <b>{fruitScore}</b></span><span>{hi?"अगला फल":"Next fruit"} <b>{fruitTypes[fruitNext]?.emoji || "🍒"}</b></span></div>
      <div className="fruit-merge-board"><canvas ref={fruitCanvasRef} aria-label="Fruit Merge game. Move your mouse over the jar to aim where the next fruit will drop."/><div className="fruit-merge-overlay">{fruitOver ? <div><span>🍉</span><h3>{hi?"जार भर गया!":"Jar is full!"}</h3><p>{hi?"फिर से खेलें और अपना स्कोर बढ़ाएँ।":"Try again and beat your high score."}</p><button onClick={resetFruitMerge}>{hi?"फिर खेलें":"Play again"}</button></div> : <span>{hi?"फल गिराने के लिए जार में टैप करें":"Move left or right to aim; a fruit drops every few seconds"}</span>}</div></div>
      <div className="picture-puzzle-actions"><button onClick={resetFruitMerge}>{hi?"नया गेम":"Restart game"}</button><button className="picture-puzzle-reset" onClick={()=>{setActiveGame(null);setPlaying(false);setFinished(false);navigate("/games")}}>{hi?"गेम छोड़ें":"Quit Game"}</button></div>
    </section> : null}

    {activeGame === "picture-puzzle" ? <section className="picture-puzzle-shell">
      <div className="picture-puzzle-heading"><span className="picture-puzzle-icon">🧩</span><div><span className="colorpop-kicker">MINDORA ARCADE · PICTURE GAME</span><h2>{hi ? "तस्वीर पूरी करें" : "Picture Puzzle"} <span>✦</span></h2></div></div>
      <div className="picture-puzzle-toolbar">
        <label className="picture-upload-button"><span>＋</span> {hi ? "तस्वीर बदलें" : "Choose picture"} <input type="file" accept="image/*" onChange={e => { const file=e.target.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{setPuzzleImage(String(reader.result));startPicturePuzzle(String(reader.result),puzzleSize)}; reader.readAsDataURL(file); e.target.value=""; }} /></label>
        <label className="picture-size-label">{hi ? "लेवल" : "Level"} <select value={puzzleSize} onChange={e=>{const size=Number(e.target.value);setPuzzleSize(size);if(puzzleImage)startPicturePuzzle(puzzleImage,size);else {setPuzzleRemaining(size===3?120:size===4?180:240);setPuzzleSelected(null)}}}><option value={3}>3 × 3 · {hi?"आसान":"Easy"}</option><option value={4}>4 × 4 · {hi?"मध्यम":"Medium"}</option><option value={5}>5 × 5 · {hi?"मुश्किल":"Hard"}</option></select></label>
        {puzzleImage ? <><span className={"picture-moves"+(puzzleRemaining<=15?" is-low-time":"")}>{hi?"समय":"Time"} <b>{Math.floor(puzzleRemaining/60)}:{String(puzzleRemaining%60).padStart(2,"0")}</b></span><span className="picture-moves">{hi ? "चालें" : "Moves"} <b>{puzzleMoves}</b></span></> : null}
        <button className="picture-puzzle-quit" onClick={quitPicturePuzzle}>{hi?"गेम छोड़ें":"Quit game"}</button>
      </div>
      {!puzzleImage ? <div className="picture-puzzle-empty"><span>🖼️</span><h3>{hi ? "अपनी पसंद की तस्वीर चुनें" : "Pick your favourite picture"}</h3><p>{hi ? "Doraemon, cartoon या कोई भी फोटो अपलोड करें। फोटो चुनते ही shuffled game शुरू होगी।" : "Upload a Doraemon, cartoon, or any photo. The shuffled game starts as soon as you choose it."}</p><label className="picture-upload-button"><span>＋</span> {hi ? "फोटो अपलोड करें" : "Upload a photo"}<input type="file" accept="image/*" onChange={e => { const file=e.target.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{setPuzzleImage(String(reader.result));startPicturePuzzle(String(reader.result),puzzleSize)}; reader.readAsDataURL(file); e.target.value=""; }} /></label></div> :
      <><div className={"picture-puzzle-board"+(puzzleTimedOut?" is-frozen":"")} style={{gridTemplateColumns:`repeat(${puzzleSize}, minmax(0,1fr))`}}>
        {(puzzleTiles.length ? puzzleTiles : Array.from({length:puzzleSize*puzzleSize},(_,i)=>i)).map((tile,index)=>{const blank=puzzleSize*puzzleSize-1;return <button key={tile} aria-label={tile===blank?"Empty space":`Tile ${tile+1}`} disabled={puzzleWon||puzzleTimedOut} className={"picture-puzzle-tile"+(tile===blank?" is-blank":"")+(puzzleSelected===index?" is-selected":"")} style={tile===blank?{}:{backgroundImage:`url("${puzzleImage}")`,backgroundSize:`${puzzleSize*100}% ${puzzleSize*100}%`,backgroundPosition:`${(tile%puzzleSize)/(puzzleSize-1)*100}% ${Math.floor(tile/puzzleSize)/(puzzleSize-1)*100}%`}} onClick={()=>{if(puzzleTimedOut||puzzleWon)return;if(puzzleSelected===null){setPuzzleSelected(index);return;}if(puzzleSelected===index){setPuzzleSelected(null);return;}const next=[...puzzleTiles];[next[index],next[puzzleSelected]]=[next[puzzleSelected],next[index]];setPuzzleTiles(next);setPuzzleMoves(v=>v+1);setPuzzleSelected(null);if(next.every((v,i)=>v===i))setPuzzleWon(true);}} />})}
      </div>
      {puzzleWon ? <div className="picture-puzzle-success"><span>🎉</span><strong>{hi ? "कमाल! तस्वीर पूरी हो गई!" : "You did it! Picture complete!"}</strong><p>{hi ? `${puzzleMoves} चालों में पूरा किया।` : `Completed in ${puzzleMoves} moves.`}</p></div> : puzzleTimedOut ? <div className="picture-puzzle-success is-timeout"><span>⏰</span><strong>{hi?"समय पूरा हो गया!":"Time's up!"}</strong><p>{hi?"फिर से शुरू करें और इस बार समय के अंदर तस्वीर पूरी करें।":"Restart and try to complete the picture before time runs out."}</p></div> : <p className="picture-puzzle-hint">{hi ? "किसी भी टाइल पर क्लिक करें, फिर जिस जगह ले जाना है उस टाइल पर क्लिक करें।" : "Click any tile, then click another tile to swap their places."}</p>}
      <div className="picture-puzzle-actions"><button onClick={()=>startPicturePuzzle()}>{hi ? "नया गेम शुरू करें" : "Restart / New game"}</button></div></>}
    </section> : null}
    {activeGame && activeGame !== "color-pop" && activeGame !== "let-it-burn" && activeGame !== "picture-puzzle" && activeGame !== "fruit-merge" ? <section className="game-coming-card"><span className="coming-emoji">{games.find(g=>g.id===activeGame)?.emoji}</span><span className="colorpop-kicker">{hi?"जल्द आ रहा है":"COMING SOON"}</span><h2>{hi?games.find(g=>g.id===activeGame)?.hi:games.find(g=>g.id===activeGame)?.title}</h2><p>{hi?games.find(g=>g.id===activeGame)?.hiDescription:games.find(g=>g.id===activeGame)?.description}</p><button onClick={()=>setActiveGame(null)}>{hi?"गेम चुनें":"Choose another game"}</button></section> : null}

    {!activeGame ? <>
      <section className="games-welcome"><span className="games-welcome-spark">✦</span><div><span className="colorpop-kicker">{hi?"आपकी छोटी-सी ब्रेक":"YOUR LITTLE BREAK"}</span><h2>{hi?"आज आप क्या खेलना चाहेंगे?":"What feels good to play today?"}</h2><p>{hi?"कोई दबाव नहीं, बस अपने लिए एक छोटा-सा पल।":"No pressure, just a little moment for yourself."}</p></div></section>
      <section className="games-grid">{games.map((g)=><button key={g.id} className={"game-card game-"+g.tone+(g.ready?" game-ready":"")} onClick={()=>chooseGame(g.id)}><span className="game-card-art"><span className="game-card-emoji">{g.emoji}</span>{g.ready?<span className="game-play-pill"><Play size={13} fill="currentColor"/> {hi?"खेलें":"Play now"}</span>:<span className="game-soon-pill"><Lock size={12}/> {hi?"जल्द":"Coming soon"}</span>}</span><span className="game-card-copy"><strong>{hi?g.hi:g.title}</strong><span>{hi?g.hiDescription:g.description}</span></span><ArrowRight size={17} className="game-card-arrow"/></button>)}</section>
    </> : null}
    <footer className="games-footer"><Sparkles size={15}/>{hi?"यह जगह सिर्फ़ आपके लिए है — अपनी गति से खेलें।":"This space is yours. Play at your own pace."}</footer>
  </main>;
}
