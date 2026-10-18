import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Heart,
  Sprout,
  CloudRain,
  BookHeart,
  Wind,
  Play,
  Pause,
  Square,
  Trash2,
  Save,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./WellnessPages.css";

function Shell({ title, subtitle, icon, children }) {
  const hi = localStorage.getItem("mindora-language") === "hi";
  return (
    <main className="wellness-page">
      <header className="wellness-topbar">
        <Link to="/dashboard" className="wellness-back">
          <ArrowLeft size={18} /> {hi ? "डैशबोर्ड पर वापस जाएँ" : "Back to Dashboard"}
        </Link>
        <span className="wellness-brand">
          <Sprout size={22} /> Mindora
        </span>
      </header>

      <section className="wellness-heading">
        <div className="wellness-heading-icon">{icon}</div>
        <p className="wellness-eyebrow">{hi ? "आपके सुकून की छोटी-सी जगह" : "YOUR LITTLE SPACE OF PEACE"}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <section className="wellness-content">{children}</section>

      <footer className="wellness-footer">
        {hi ? "एक गहरी साँस लें। आप जितना सोचते हैं, उससे बेहतर कर रहे हैं।" : "Take a breath. You are doing better than you think."} <Heart size={15} />
      </footer>
    </main>
  );
}

export function CalmCorner() {
  const [breathing, setBreathing] = useState(false);
  const [grounding, setGrounding] = useState(0);

  const prompts = hi ? [
    "अपने आसपास ऐसी 5 चीज़ें देखें जिन्हें आप देख सकते हैं।",
    "ऐसी 4 चीज़ों पर ध्यान दें जिन्हें आप छूकर महसूस कर सकते हैं।",
    "ऐसी 3 आवाज़ों पर ध्यान दें जिन्हें आप सुन सकते हैं।",
    "ऐसी 2 खुशबुओं पर ध्यान दें जिन्हें आप महसूस कर सकते हैं।",
    "इस पल ऐसी 1 बात सोचें जिसकी आप कद्र करते हैं।",
  ] : [
    "Notice 5 things you can see around you.",
    "Notice 4 things you can physically feel.",
    "Notice 3 things you can hear.",
    "Notice 2 things you can smell.",
    "Notice 1 thing you appreciate right now.",
  ];

  return (
    <Shell
      title={hi ? "सुकून का कोना" : "Calm Corner"}
      subtitle={hi ? "एक पल ठहरें। आपको कहीं और जाने की जल्दी नहीं है।" : "Pause for a moment. There's nowhere else you need to be."}
      icon={<Wind size={28} />}
    >
      <div className="calm-card">
        <p className="wellness-eyebrow">{hi ? "मेरे साथ साँस लें" : "BREATHE WITH ME"}</p>

        <div className={`breathing-orb ${breathing ? "breathing-active" : ""}`}>
          <div className="breathing-inner">
            <Wind size={30} />
            <span>{breathing ? (hi ? "धीरे-धीरे साँस लें" : "Breathe slowly") : (hi ? "अपनी साँसों की लय पाएँ" : "Find your rhythm")}</span>
          </div>
        </div>

        <p className="wellness-muted">
          {hi ? "गोले के साथ अपनी साँसों को धीरे और आराम से लें।" : "Follow the circle and take slow, comfortable breaths."}
        </p>

        <button
          className="wellness-button"
          onClick={() => setBreathing(!breathing)}
        >
          {breathing ? (hi ? "साँसों का अभ्यास रोकें" : "Pause breathing") : (hi ? "साँसों का अभ्यास शुरू करें" : "Begin breathing")}
        </button>
      </div>

      <div className="wellness-panel">
        <p className="wellness-eyebrow">{hi ? "खुद को वर्तमान में लाएँ" : "GROUND YOURSELF"}</p>
        <h2>{hi ? "इस पल में लौटें" : "Come back to the present"}</h2>
        <p>{prompts[grounding]}</p>

        <div className="grounding-dots">
          {prompts.map((_, index) => (
            <span
              key={index}
              className={index <= grounding ? "dot-active" : ""}
            />
          ))}
        </div>

        <button
          className="wellness-button secondary"
          onClick={() => setGrounding((grounding + 1) % prompts.length)}
        >
          {hi ? "अगला सहज सुझाव" : "Next gentle prompt"}
        </button>
      </div>
    </Shell>
  );
}

const careActions = [
  { title: "Drink a glass of water", emoji: "💧" },
  { title: "Step outside for fresh air", emoji: "🌤️" },
  { title: "Stretch for two minutes", emoji: "🌱" },
  { title: "Listen to a favourite song", emoji: "🎵" },
  { title: "Write one kind thought", emoji: "💌" },
  { title: "Take a screen break", emoji: "🍃" },
];

export function InnerGarden() {
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mindora-garden-progress")) || []; }
    catch { return []; }
  });
  useEffect(() => { localStorage.setItem("mindora-garden-progress", JSON.stringify(completed)); }, [completed]);
  function toggleAction(index) {
    setCompleted((previous) => previous.includes(index) ? previous.filter((item) => item !== index) : [...previous, index]);
  }
  return (
    <Shell title="Your Inner Garden" subtitle="Small acts of care help beautiful things grow." icon={<Sprout size={28} />}>
      <div className="garden-summary">
        <div className="garden-landscape" aria-label="Six little plants, one for each act of care">
          <span className="garden-sun">☀</span><span className="garden-cloud garden-cloud-one">☁</span><span className="garden-cloud garden-cloud-two">☁</span>
          <div className="garden-plants">{careActions.map((action, index) => (
            <div className={"garden-plant " + (completed.includes(index) ? "garden-plant-growing garden-plant-bloomed" : "")} key={action.title} title={action.title}>
              <span className="garden-flower">✿</span><span className="garden-flower-core">♥</span><span className="garden-stem" /><span className="garden-leaf garden-leaf-left" /><span className="garden-leaf garden-leaf-right" />
              <span className="garden-plant-number">{index + 1}</span>
            </div>
          ))}</div>
          <div className="garden-ground"><span>✿</span><span>·</span><span>✿</span><span>·</span><span>✿</span><span>·</span><span>✿</span></div><span className="garden-butterfly">🦋</span>
        </div>
        <h2>{completed.length === 0 ? "Your garden is waiting" : completed.length === careActions.length ? "Your garden is in full bloom!" : "Look how you're growing!"}</h2>
        <p>{completed.length} of {careActions.length} little acts of care completed.</p>
        <div className="progress-track"><div style={{ width: `${(completed.length / careActions.length) * 100}%` }} /></div>
        <p className="garden-growth-note">{completed.length === 0 ? "Choose a little act of care and watch a new flower bloom." : completed.length === careActions.length ? "Every little act of care helped your garden bloom." : "Each kind thing you do helps another little flower grow."}</p>
      </div>
      <div className="wellness-panel">
        <p className="wellness-eyebrow">TODAY'S CARE LIST</p><h2>Choose one thing for yourself</h2>
        <div className="care-list">{careActions.map((action, index) => (
          <button type="button" key={action.title} className={"care-item " + (completed.includes(index) ? "care-done" : "")} onClick={() => toggleAction(index)}>
            <span className="care-emoji">{action.emoji}</span><span>{action.title}</span><span className="care-check">{completed.includes(index) ? "✓" : "+"}</span>
          </button>
        ))}</div>
        <button className="wellness-button secondary" onClick={() => setCompleted([])}>Reset today's garden</button>
      </div>
    </Shell>
  );
}

const comfortMessages = {
  Anxious: [
    "You don't have to solve everything right now. Just take the next small step.",
    "A thought is not a prediction. Let this moment be just this moment.",
    "Slow down. You are allowed to take your time.",
  ],
  Sad: [
    "You don't need to turn every difficult day into a lesson.",
    "It's okay to feel this way. You deserve gentleness, especially now.",
    "You can have a hard day and still be making progress.",
  ],
  Tired: [
    "Rest is part of the journey, not a reward you have to earn.",
    "You are allowed to do less today.",
    "You don't have to be productive to be worthy.",
  ],
  Happy: [
    "Let yourself enjoy this moment without needing to explain it.",
    "You deserve the good things that find their way to you.",
    "Save a little memory of this feeling for a cloudy day.",
  ],
  Overwhelmed: [
    "One thing at a time. You only need to do the next thing.",
    "You can pause before you respond to the world.",
    "Make the next step smaller. Smaller is still progress.",
  ],
  Lonely: [
    "You matter, even on days when connection feels far away.",
    "You deserve relationships where you can be your whole self.",
    "Be a friend to yourself while you find your people.",
  ],
};

export function LittleComfortBox() {
  const [mood, setMood] = useState("Anxious");
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = comfortMessages[mood];

  return (
    <Shell
      title="Little Comfort Box"
      subtitle="A gentle reminder, just for the way you're feeling today."
      icon={<Heart size={28} />}
    >
      <div className="wellness-panel">
        <p className="wellness-eyebrow">HOW ARE YOU FEELING?</p>

        <div className="mood-options">
          {Object.keys(comfortMessages).map((item) => (
            <button
              key={item}
              className={`mood-chip ${
                mood === item ? "mood-selected" : ""
              }`}
              onClick={() => {
                setMood(item);
                setMessageIndex(0);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="comfort-note">
        <Sparkles size={25} />
        <p className="wellness-eyebrow">A NOTE FOR YOU</p>
        <blockquote>“{messages[messageIndex]}”</blockquote>
        <span className="note-flower">✿</span>

        <button
          className="wellness-button"
          onClick={() =>
            setMessageIndex((messageIndex + 1) % messages.length)
          }
        >
          Another little reminder
        </button>
      </div>
    </Shell>
  );
}

export function MoodSoundscape() {
  const [selected, setSelected] = useState("rain");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [error, setError] = useState("");
  const audioRef = useRef(null);
  const sounds = [
    { id: "birds", name: "Birdsong", emoji: "🐦", desc: "Morning birds chirping" },
    { id: "rain", name: "Gentle Rain", emoji: "🌧️", desc: "Soft rainfall" },
    { id: "ocean", name: "Ocean Waves", emoji: "🌊", desc: "Waves rolling ashore" },
    { id: "forest", name: "Forest Ambience", emoji: "🌲", desc: "Peaceful forest sounds" },
    { id: "stream", name: "Flowing Stream", emoji: "💧", desc: "Water bubbling over stones" },
    { id: "wind", name: "Wind in the Trees", emoji: "🍃", desc: "Breeze through leaves" },
    { id: "night", name: "Night Crickets", emoji: "🌙", desc: "Quiet evening crickets" },
    { id: "fire", name: "Crackling Fireplace", emoji: "🔥", desc: "Warm, cosy crackles" },
    { id: "thunder", name: "Distant Thunder", emoji: "⛈️", desc: "A distant, gentle storm" },
  ];
  const sound = sounds.find((item) => item.id === selected) || sounds[1];

  function stopAudio() {
    const engine = audioRef.current;
    if (engine) {
      engine.nodes.forEach((node) => { try { node.stop?.(); node.disconnect?.(); } catch {} });
      engine.context.close().catch(() => {});
      audioRef.current = null;
    }
    setPlaying(false);
  }

  function startSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setError("Audio playback is not supported in this browser. Please try an updated browser.");
      return;
    }
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = volume / 100 * 0.22;
    master.connect(context.destination);
    const nodes = [];
    const addTone = (frequency, type, gainValue, detune = 0) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.detune.value = detune;
      gain.gain.value = gainValue;
      oscillator.connect(gain); gain.connect(master); oscillator.start();
      nodes.push(oscillator, gain);
      return { oscillator, gain };
    };
    const noise = (filterType, frequency, gainValue) => {
      const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
      const filter = context.createBiquadFilter(); filter.type = filterType; filter.frequency.value = frequency;
      const gain = context.createGain(); gain.gain.value = gainValue;
      source.connect(filter); filter.connect(gain); gain.connect(master); source.start();
      nodes.push(source, filter, gain);
      return { source, filter, gain };
    };
    if (selected === "birds") {
      [1800, 2300, 1450].forEach((freq, i) => {
        const tone = addTone(freq, "sine", 0.0001);
        tone.gain.gain.setValueAtTime(0.0001, context.currentTime + i * 0.7);
        tone.gain.gain.linearRampToValueAtTime(0.25, context.currentTime + i * 0.7 + 0.08);
        tone.gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + i * 0.7 + 0.35);
        tone.oscillator.frequency.setValueAtTime(freq, context.currentTime + i * 0.7);
        tone.oscillator.frequency.linearRampToValueAtTime(freq * 1.35, context.currentTime + i * 0.7 + 0.18);
      });
    } else if (selected === "rain" || selected === "stream" || selected === "ocean" || selected === "forest" || selected === "wind") {
      const profile = {
        rain: ["lowpass", 1400, 0.65], stream: ["highpass", 450, 0.28],
        ocean: ["lowpass", 500, 0.85], forest: ["lowpass", 1900, 0.22],
        wind: ["lowpass", 380, 0.8],
      }[selected];
      const bed = noise(profile[0], profile[1], profile[2]);
      if (selected === "ocean" || selected === "wind") {
        const lfo = context.createOscillator(); const depth = context.createGain();
        lfo.frequency.value = selected === "ocean" ? 0.12 : 0.06; depth.gain.value = 0.22;
        lfo.connect(depth); depth.connect(bed.gain.gain); lfo.start(); nodes.push(lfo, depth);
      }
      if (selected === "forest") {
        [210, 270, 340].forEach((freq) => addTone(freq, "sine", 0.025, Math.random() * 8));
      }
    } else if (selected === "night") {
      [2400, 2750, 2200].forEach((freq, i) => {
        const tone = addTone(freq, "sine", 0.0001);
        const pulse = context.createOscillator(); const pulseGain = context.createGain();
        pulse.frequency.value = 3 + i; pulseGain.gain.value = 0.045;
        pulse.connect(pulseGain); pulseGain.connect(tone.gain.gain); pulse.start(); nodes.push(pulse, pulseGain);
      });
    } else if (selected === "fire") {
      noise("lowpass", 900, 0.42);
      const crackle = context.createOscillator(); crackle.type = "square"; crackle.frequency.value = 17;
      const crackleGain = context.createGain(); crackleGain.gain.value = 0.012;
      crackle.connect(crackleGain); crackleGain.connect(master); crackle.start(); nodes.push(crackle, crackleGain);
    } else if (selected === "thunder") {
      const rumble = noise("lowpass", 100, 0.8);
      const lfo = context.createOscillator(); const depth = context.createGain();
      lfo.frequency.value = 0.18; depth.gain.value = 0.3;
      lfo.connect(depth); depth.connect(rumble.gain.gain); lfo.start(); nodes.push(lfo, depth);
    }
    audioRef.current = { context, master, nodes };
    context.resume().then(() => setPlaying(true)).catch(() => {
      setError("Tap play again to allow audio playback in your browser.");
      stopAudio();
    });
    setError("");
  }

  function togglePlayback() {
    if (playing) { stopAudio(); return; }
    startSound();
  }

  useEffect(() => {
    if (audioRef.current) audioRef.current.master.gain.value = volume / 100 * 0.22;
  }, [volume]);

  useEffect(() => () => {
    const engine = audioRef.current;
    if (engine) {
      engine.nodes.forEach((node) => { try { node.stop?.(); node.disconnect?.(); } catch {} });
      engine.context.close().catch(() => {});
      audioRef.current = null;
    }
  }, [selected]);

  return (
    <Shell
      title="Mood-Based Soundscape"
      subtitle="Choose a sound to soften the noise of the day and make a little room to breathe."
      icon={<CloudRain size={28} />}
    >
      <div className="rain-card">
        <div className="soundscape-options">{sounds.map((item) => <button type="button" key={item.id} className={selected === item.id ? "soundscape-option soundscape-option-active" : "soundscape-option"} onClick={() => { stopAudio(); setSelected(item.id); setError(""); }}><span className="soundscape-option-emoji">{item.emoji}</span><span className="soundscape-option-copy"><strong>{item.name}</strong><small>{item.desc}</small></span></button>)}</div>
        <div className="rain-scene">
          <span className="rain-cloud">{sound.emoji}</span>
          <span className="rain-drop drop-one">╱</span><span className="rain-drop drop-two">╱</span><span className="rain-drop drop-three">╱</span><span className="rain-drop drop-four">╱</span>
          <span className="rain-hill">🌿</span>
        </div>
        <p className="wellness-eyebrow">YOUR CURRENT SOUNDSCAPE</p>
        <h2>{sound.name}</h2>
        <p>{sound.desc} for reading, resting, or simply being.</p>
        <div className="audio-controls">
          <button className="audio-play" onClick={togglePlayback} aria-label={playing ? "Stop sound" : "Play sound"}>{playing ? <Pause size={23} /> : <Play size={23} />}</button>
          <button className="audio-stop" onClick={stopAudio} aria-label="Stop sound"><Square size={18} /></button>
          <span>{playing ? `${sound.name} is playing` : "Ready when you are"}</span>
        </div>
        <label className="volume-control">Volume <span>{volume}%</span><input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
        {error && <p className="audio-error">{error}</p>}
      </div>
    </Shell>
  );
}

export function LetItOutJournal() {
  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("mindora-let-it-out-entries")
      ) || [];
    } catch {
      return [];
    }
  });

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      "mindora-let-it-out-entries",
      JSON.stringify(entries)
    );
  }, [entries]);

  function saveEntry() {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (editingId !== null) {
      setEntries((previous) =>
        previous.map((entry) =>
          entry.id === editingId
            ? { ...entry, text: trimmed }
            : entry
        )
      );

      setEditingId(null);
    } else {
      setEntries((previous) => [
        {
          id: Date.now(),
          text: trimmed,
          date: new Date().toLocaleString(),
        },
        ...previous,
      ]);
    }

    setText("");
  }

  function editEntry(entry) {
    setText(entry.text);
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteEntry(id) {
    setEntries((previous) =>
      previous.filter((entry) => entry.id !== id)
    );

    if (editingId === id) {
      setEditingId(null);
      setText("");
    }
  }

  return (
    <Shell
      title="Let It Out"
      subtitle="No perfect words needed. This page is just for you."
      icon={<BookHeart size={28} />}
    >
      <div className="journal-editor">
        <p className="wellness-eyebrow">A MOMENT WITH YOURSELF</p>
        <h2>What's on your mind?</h2>
        <p className="wellness-muted">
          Write freely. You don't have to make sense of everything today.
        </p>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Today, I'm feeling..."
          rows={7}
        />

        <button className="wellness-button" onClick={saveEntry}>
          <Save size={17} />
          {editingId !== null ? "Update entry" : "Save to my journal"}
        </button>

        {editingId !== null && (
          <button
            className="wellness-button secondary"
            onClick={() => {
              setEditingId(null);
              setText("");
            }}
          >
            Cancel edit
          </button>
        )}

        <p className="journal-privacy">
          <Heart size={14} /> Your entries are saved in this browser on this device.
        </p>
      </div>

      <div className="wellness-panel">
        <p className="wellness-eyebrow">YOUR JOURNAL</p>
        <h2>
          {entries.length ? "Your written moments" : "A fresh page awaits"}
        </h2>

        {entries.length === 0 ? (
          <p className="wellness-muted">
            Your saved entries will appear here.
          </p>
        ) : (
          <div className="journal-list">
            {entries.map((entry) => (
              <article className="journal-entry" key={entry.id}>
                <time>{entry.date}</time>
                <p>{entry.text}</p>

                <div className="journal-actions">
                  <button onClick={() => editEntry(entry)}>
                    Edit
                  </button>
                  <button onClick={() => deleteEntry(entry.id)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}