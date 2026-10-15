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
  return (
    <main className="wellness-page">
      <header className="wellness-topbar">
        <Link to="/" className="wellness-back">
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <span className="wellness-brand">
          <Sprout size={22} /> Mindora
        </span>
      </header>

      <section className="wellness-heading">
        <div className="wellness-heading-icon">{icon}</div>
        <p className="wellness-eyebrow">YOUR LITTLE SPACE OF PEACE</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <section className="wellness-content">{children}</section>

      <footer className="wellness-footer">
        Take a breath. You are doing better than you think. <Heart size={15} />
      </footer>
    </main>
  );
}

export function CalmCorner() {
  const [breathing, setBreathing] = useState(false);
  const [grounding, setGrounding] = useState(0);

  const prompts = [
    "Notice 5 things you can see around you.",
    "Notice 4 things you can physically feel.",
    "Notice 3 things you can hear.",
    "Notice 2 things you can smell.",
    "Notice 1 thing you appreciate right now.",
  ];

  return (
    <Shell
      title="Calm Corner"
      subtitle="Pause for a moment. There's nowhere else you need to be."
      icon={<Wind size={28} />}
    >
      <div className="calm-card">
        <p className="wellness-eyebrow">BREATHE WITH ME</p>

        <div className={`breathing-orb ${breathing ? "breathing-active" : ""}`}>
          <div className="breathing-inner">
            <Wind size={30} />
            <span>{breathing ? "Breathe slowly" : "Find your rhythm"}</span>
          </div>
        </div>

        <p className="wellness-muted">
          Follow the circle and take slow, comfortable breaths.
        </p>

        <button
          className="wellness-button"
          onClick={() => setBreathing(!breathing)}
        >
          {breathing ? "Pause breathing" : "Begin breathing"}
        </button>
      </div>

      <div className="wellness-panel">
        <p className="wellness-eyebrow">GROUND YOURSELF</p>
        <h2>Come back to the present</h2>
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
          Next gentle prompt
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
    try {
      return JSON.parse(
        localStorage.getItem("mindora-garden-progress")
      ) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "mindora-garden-progress",
      JSON.stringify(completed)
    );
  }, [completed]);

  function toggleAction(index) {
    setCompleted((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index]
    );
  }

  return (
    <Shell
      title="Your Inner Garden"
      subtitle="Small acts of care help beautiful things grow."
      icon={<Sprout size={28} />}
    >
      <div className="garden-summary">
        <div className="garden-illustration">
          <span>☁️</span>
          <span>🌿</span>
          <span>🌷</span>
          <span>🌱</span>
          <span>🌼</span>
        </div>

        <h2>
          {completed.length === 0
            ? "Your garden is waiting"
            : "Look how you're growing!"}
        </h2>

        <p>
          {completed.length} of {careActions.length} little acts of care completed.
        </p>

        <div className="progress-track">
          <div
            style={{
              width: `${(completed.length / careActions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="wellness-panel">
        <p className="wellness-eyebrow">TODAY'S CARE LIST</p>
        <h2>Choose one thing for yourself</h2>

        <div className="care-list">
          {careActions.map((action, index) => (
            <button
              key={action.title}
              className={`care-item ${
                completed.includes(index) ? "care-done" : ""
              }`}
              onClick={() => toggleAction(index)}
            >
              <span className="care-emoji">{action.emoji}</span>
              <span>{action.title}</span>
              <span className="care-check">
                {completed.includes(index) ? "✓" : "+"}
              </span>
            </button>
          ))}
        </div>

        <button
          className="wellness-button secondary"
          onClick={() => setCompleted([])}
        >
          Reset today's garden
        </button>
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
    { id: "birds", name: "Birdsong", emoji: "🐦", desc: "Morning birds chirping", url: "https://actions.google.com/sounds/v1/ambiences/birds_in_forest.ogg" },
    { id: "rain", name: "Gentle Rain", emoji: "🌧️", desc: "Soft rainfall", url: sound.url },
    { id: "ocean", name: "Ocean Waves", emoji: "🌊", desc: "Waves rolling ashore", url: "https://actions.google.com/sounds/v1/water/ocean_waves.ogg" },
    { id: "forest", name: "Forest Ambience", emoji: "🌲", desc: "Peaceful forest sounds", url: "https://actions.google.com/sounds/v1/ambiences/forest_ambience.ogg" },
    { id: "stream", name: "Flowing Stream", emoji: "💧", desc: "Water bubbling over stones", url: "https://actions.google.com/sounds/v1/water/river.ogg" },
    { id: "wind", name: "Wind in the Trees", emoji: "🍃", desc: "Breeze through leaves", url: "https://actions.google.com/sounds/v1/weather/wind_in_trees.ogg" },
    { id: "night", name: "Night Crickets", emoji: "🌙", desc: "Quiet evening crickets", url: "https://actions.google.com/sounds/v1/ambiences/crickets_chirping.ogg" },
    { id: "fire", name: "Crackling Fireplace", emoji: "🔥", desc: "Warm, cosy crackles", url: "https://actions.google.com/sounds/v1/ambiences/fireplace.ogg" },
    { id: "thunder", name: "Distant Thunder", emoji: "⛈️", desc: "A distant, gentle storm", url: "https://actions.google.com/sounds/v1/weather/thunderstorm.ogg" },
  ];
  const sound = sounds.find((item) => item.id === selected) || sounds[1];

  useEffect(() => {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg"
    );

    audio.loop = true;
    audio.volume = volume / 100;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [selected]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      setError("");
      await audio.play();
      setPlaying(true);
    } catch {
      setError(
        "Rain audio could not load. Check your internet connection and try again."
      );
    }
  }

  function stopAudio() {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPlaying(false);
  }

  return (
    <Shell
      title="Mood-Based Soundscape"
      subtitle="Let the sound of rain give your thoughts a little room."
      icon={<CloudRain size={28} />}
    >
      <div className="rain-card">
        <div className="soundscape-options">{sounds.map((item) => <button type="button" key={item.id} className={selected === item.id ? "soundscape-option soundscape-option-active" : "soundscape-option"} onClick={() => { setSelected(item.id); setPlaying(false); setError(""); }}><span className="soundscape-option-emoji">{item.emoji}</span><span className="soundscape-option-copy"><strong>{item.name}</strong><small>{item.desc}</small></span></button>)}</div>
        <div className="rain-scene">
          <span className="rain-cloud">{sound.emoji}</span>
          <span className="rain-drop drop-one">╱</span>
          <span className="rain-drop drop-two">╱</span>
          <span className="rain-drop drop-three">╱</span>
          <span className="rain-drop drop-four">╱</span>
          <span className="rain-hill">🌿</span>
        </div>

        <p className="wellness-eyebrow">YOUR CURRENT SOUNDSCAPE</p>
        <h2>{sound.name}</h2>
        <p>{sound.desc} for reading, resting, or simply being.</p>

        <div className="audio-controls">
          <button
            className="audio-play"
            onClick={togglePlayback}
            aria-label={playing ? "Pause sound" : "Play sound"}
          >
            {playing ? <Pause size={23} /> : <Play size={23} />}
          </button>

          <button
            className="audio-stop"
            onClick={stopAudio}
            aria-label="Stop rain"
          >
            <Square size={18} />
          </button>

          <span>{playing ? "{sound.name} is playing" : "Ready when you are"}</span>
        </div>

        <label className="volume-control">
          Volume <span>{volume}%</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </label>

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