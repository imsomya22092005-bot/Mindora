import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Sparkles } from "lucide-react";
import "./WelcomeTour.css";

const tourCards = [
  { id: "welcome", type: "welcome", eyebrow: "A LITTLE HELLO", title: "Knock knock... ♡", copy: "Someone saved a little space for you!", detail: "Come in, there's a whole world waiting to be explored.", art: ["🚪", "🌼", "🦋"], palette: "peach", action: "Open the little door" },
  { id: "mood", eyebrow: "YOUR DAILY CHECK-IN", title: "Your feelings belong here.", copy: "A little space to meet yourself exactly where you are.", detail: "Mood Tracker", art: ["☀️", "☁️", "🙂"], palette: "sunshine" },
  { id: "journal", eyebrow: "A PAGE JUST FOR YOU", title: "Dear, you... 💌", copy: "Let your thoughts land somewhere soft.", detail: "Journal", art: ["📖", "🖋️", "🌷"], palette: "paper" },
  { id: "notes", eyebrow: "LITTLE THOUGHTS", title: "Save the little things.", copy: "A tiny wall for thoughts, reminders and happy bits.", detail: "Little Notes", art: ["🎀", "📌", "💭"], palette: "scrapbook" },
  { id: "insights", eyebrow: "LOOK HOW FAR", title: "Every little step counts.", copy: "Notice the patterns, the progress and the small wins.", detail: "Insights", art: ["🌱", "✨", "🌿"], palette: "garden" },
  { id: "mindful", eyebrow: "TAKE A BREATHER", title: "A little pause, just for you.", copy: "Find a gentle moment when the day feels too loud.", detail: "Mindful Moments", art: ["☁️", "🕯️", "🌙"], palette: "cloud" },
  { id: "companion", eyebrow: "YOU'RE NOT ALONE", title: "Let's talk it through.", copy: "A gentle companion to help you make sense of your thoughts.", detail: "Emotion Companion", art: ["💬", "🤍", "✨"], palette: "rose" },
  { id: "coping", eyebrow: "A LITTLE SUPPORT", title: "One step at a time.", copy: "Explore small coping ideas for the moment you're in.", detail: "Coping Suggestions", art: ["🫶", "🌼", "🧸"], palette: "peach" },
  { id: "sleep", eyebrow: "REST MATTERS", title: "Make room for rest.", copy: "Check in with your sleep and give your nights some care.", detail: "Sleep Check", art: ["🌙", "⭐", "☁️"], palette: "night" },
  { id: "stress", eyebrow: "STUDY WITH CARE", title: "You are more than a deadline.", copy: "Understand academic stress and the factors around it.", detail: "Academic Stress Predictor", art: ["📚", "✏️", "🌻"], palette: "study" },
  { id: "wellbeing", eyebrow: "CHECK IN WITH YOU", title: "How have you been, really?", copy: "Take a moment to understand how things have been feeling.", detail: "Wellbeing Check-in", art: ["💗", "🌷", "🫧"], palette: "rose" },
  { id: "calm", eyebrow: "FIND YOUR CALM", title: "Let the noise settle.", copy: "Breathe, ground yourself and find a softer moment.", detail: "Calm Corner", art: ["🕯️", "🪷", "🌙"], palette: "lavender" },
  { id: "soundscape", eyebrow: "SOUNDS FOR YOUR MOOD", title: "A little world of sound.", copy: "Choose gentle sounds to accompany the moment.", detail: "Mood Soundscape", art: ["🎧", "🌧️", "🎶"], palette: "blue" },
  { id: "garden", eyebrow: "GROW AT YOUR PACE", title: "Good things take time to bloom.", copy: "Care for your little garden, one small step at a time.", detail: "Inner Garden", art: ["🌷", "🪴", "🦋"], palette: "garden" },
  { id: "comfort", eyebrow: "A LITTLE COMFORT", title: "A kind reminder, whenever you need.", copy: "Find a tiny note of comfort for the feeling you're carrying.", detail: "Little Comfort Box", art: ["🎁", "💌", "🤍"], palette: "peach" },
  { id: "color-pop", eyebrow: "PLAY A LITTLE", title: "A colourful little break.", copy: "Take a playful pause and let your mind wander.", detail: "Color Pop", art: ["🎨", "🟡", "🩷"], palette: "rainbow" },
  { id: "let-it-burn", eyebrow: "LET IT GO", title: "Some things can be released.", copy: "A quiet candle moment to leave a little weight behind.", detail: "Let It Burn", art: ["🕯️", "🔥", "✨"], palette: "ember" },
  { id: "goodbye", type: "goodbye", eyebrow: "YOUR LITTLE SPACE AWAITS", title: "The door is open! ✨", copy: "Your Mindora journey starts now.", detail: "Take your time. There's no rush here.", art: ["🚪", "🌷", "🦋"], palette: "peach", action: "Step inside" },
];

function wrapOffset(index, active, length) {
  let offset = index - active;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

export default function WelcomeTour({ onFinish }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerStart = useRef(null);
  const total = tourCards.length;

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % total);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [paused, total]);

  const move = (direction) => setActive((current) => (current + direction + total) % total);
  const current = tourCards[active];
  const isFinal = active === total - 1;

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };
  const handlePointerUp = (event) => {
    if (!pointerStart.current) return;
    const delta = event.clientX - pointerStart.current.x;
    pointerStart.current = null;
    if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
  };

  return (
    <section className="welcome-tour" aria-label="Welcome to Mindora" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="welcome-tour-heading">
        <span className="welcome-tour-kicker"><Sparkles size={13} /> A LITTLE TOUR OF YOUR SPACE</span>
        <h2>There's a little something for every you.</h2>
        <p>Take a peek around. You can skip this whenever you'd like.</p>
      </div>

      <div className="welcome-tour-stage" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { pointerStart.current = null; }}>
        <div className="welcome-tour-orbit welcome-tour-orbit-one" aria-hidden="true" />
        <div className="welcome-tour-orbit welcome-tour-orbit-two" aria-hidden="true" />
        {tourCards.map((card, index) => {
          const offset = wrapOffset(index, active, total);
          if (Math.abs(offset) > 2) return null;
          return (
            <article
              key={card.id}
              className={`welcome-tour-card welcome-tour-card--${card.palette} ${offset === 0 ? "is-active" : "is-side"}`}
              style={{ "--card-offset": offset, "--card-depth": Math.abs(offset), "--offset-x": `${offset * 210}px`, "--offset-x-mobile": `${offset * 150}px`, "--offset-x-small": `${offset * 125}px`, "--rotate-y": `${offset * -23}deg`, "--rotate-z": `${offset * -2}deg`, "--card-scale": 1 - Math.abs(offset) * 0.105, "--card-opacity": 1 - Math.abs(offset) * 0.27, "--card-z": 10 - Math.abs(offset) }}
              aria-hidden={offset !== 0}
              onClick={() => { if (offset !== 0) setActive(index); }}
            >
              <div className="welcome-tour-card-inner">
                <span className="welcome-tour-card-kicker">{card.eyebrow}</span>
                <div className="welcome-tour-art" aria-hidden="true">
                  <span className="welcome-tour-art-orb" />
                  <span className="welcome-tour-art-main">{card.art[0]}</span>
                  <span className="welcome-tour-art-float welcome-tour-art-float-one">{card.art[1]}</span>
                  <span className="welcome-tour-art-float welcome-tour-art-float-two">{card.art[2]}</span>
                  <span className="welcome-tour-art-spark">✦</span>
                </div>
                <div className="welcome-tour-card-copy">
                  <span className="welcome-tour-brand">MINDORA <Heart size={10} fill="currentColor" /></span>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                  {card.detail && <span className="welcome-tour-page-name">{card.detail}</span>}
                </div>
                {offset === 0 && (
                  <button className="welcome-tour-card-action" type="button" onClick={() => isFinal ? onFinish() : move(1)}>
                    {card.action || "Next little stop"} <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="welcome-tour-controls">
        <button className="welcome-tour-skip" type="button" onClick={onFinish}><X size={14} /> Skip tour</button>
        <div className="welcome-tour-pagination">
          <button type="button" aria-label="Previous card" onClick={() => move(-1)}><ChevronLeft size={18} /></button>
          <span>{String(active + 1).padStart(2, "0")} <i>/</i> {String(total).padStart(2, "0")}</span>
          <button type="button" aria-label="Next card" onClick={() => move(1)}><ChevronRight size={18} /></button>
        </div>
        <span className="welcome-tour-hint">Drag to explore <span>✧</span></span>
      </div>
      <div className="welcome-tour-progress" aria-hidden="true"><span style={{ width: `${((active + 1) / total) * 100}%` }} /></div>
    </section>
  );
}
