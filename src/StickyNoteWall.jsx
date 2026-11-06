import { useEffect, useState } from "react";
import { Plus, X, Pin, Trash2, Heart, Sparkles, ArrowLeft, StickyNote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./StickyNoteWall.css";

const STORAGE_KEY = "mindora-sticky-wall-v1";
const noteColors = ["butter", "rose", "sage", "peach", "lilac", "sky"];

const wallPalettes = {
  low: {
    light: { page:"#F2E8D9", surface:"#EBDCC6", board:"#DCCCE9", ink:"#1F382E", muted:"#53685A", accent:"#8B6DB2", line:"#D4C2A9", button:"#8B6DB2", buttonText:"#FFFFFF", paper:"#F8F3EA", paperAlt:"#E5D6C5", pin:"#8B6DB2" },
    dark: { page:"#111C17", surface:"#17251F", board:"#26392E", ink:"#F3EBDD", muted:"#D0D8D0", accent:"#B9A5D6", line:"#34483D", button:"#B9A5D6", buttonText:"#17251F", paper:"#20352B", paperAlt:"#1D2D24", pin:"#D4BDEB" }
  },
  meh: {
    light: { page:"#F2E8E6", surface:"#E4D0CC", board:"#D9BDB7", ink:"#432D3B", muted:"#725B64", accent:"#A65D68", line:"#C9ADA7", button:"#A65D68", buttonText:"#FFFFFF", paper:"#F8EFEC", paperAlt:"#EADBD7", pin:"#A65D68" },
    dark: { page:"#1D141B", surface:"#2B1D27", board:"#40283A", ink:"#F5E9E7", muted:"#D9C3CF", accent:"#E49A9D", line:"#49303D", button:"#E49A9D", buttonText:"#1D141B", paper:"#32182C", paperAlt:"#2C1727", pin:"#F0B19B" }
  },
  okay: {
    light: { page:"#E4F0E9", surface:"#B8DCCB", board:"#9FC9B7", ink:"#164E4A", muted:"#426C63", accent:"#17645F", line:"#9FC9B7", button:"#17645F", buttonText:"#FFFFFF", paper:"#F1F8F3", paperAlt:"#D4E9DE", pin:"#356B61" },
    dark: { page:"#0B2221", surface:"#102E2C", board:"#204743", ink:"#E4F1E9", muted:"#C2DAD0", accent:"#F5A477", line:"#28514B", button:"#F5A477", buttonText:"#102E2C", paper:"#173A36", paperAlt:"#20413D", pin:"#FFD0AE" }
  },
  good: {
    light: { page:"#FBF3D9", surface:"#F2D98D", board:"#E8C875", ink:"#49352C", muted:"#725B48", accent:"#B66A55", line:"#E2C778", button:"#49352C", buttonText:"#FFFFFF", paper:"#FFF9E7", paperAlt:"#F5E6B8", pin:"#81533D" },
    dark: { page:"#1D1511", surface:"#2C211B", board:"#49362A", ink:"#F8EEDB", muted:"#DCCDBB", accent:"#E6AD79", line:"#584033", button:"#E6AD79", buttonText:"#1D1511", paper:"#3A2A21", paperAlt:"#362820", pin:"#F0C394" }
  },
  great: {
    light: { page:"#F4F3EB", surface:"#FAF8F3", board:"#DDE1D0", ink:"#08090B", muted:"#45483B", accent:"#CDF22B", line:"#D9DDC9", button:"#08090B", buttonText:"#FAF8F3", paper:"#FFFFFF", paperAlt:"#E9EBDD", pin:"#535747" },
    dark: { page:"#08090B", surface:"#151713", board:"#24291A", ink:"#FAF8F3", muted:"#D8D9D2", accent:"#CDF22B", line:"#34372B", button:"#CDF22B", buttonText:"#08090B", paper:"#20231A", paperAlt:"#171A13", pin:"#CDF22B" }
  }
};

function readNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function StickyNoteWall() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(readNotes);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("mindora-theme") === "dark"; } catch { return false; }
  });
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setIsDark(root.dataset.mindoraTheme === "dark"));
    observer.observe(root, { attributes: true, attributeFilter: ["data-mindora-theme"] });
    setIsDark(root.dataset.mindoraTheme === "dark");
    return () => observer.disconnect();
  }, []);
  const [savedMoodTheme, setSavedMoodTheme] = useState(() => {
    try { return (localStorage.getItem("mindora-saved-mood") || "default").toLowerCase(); }
    catch { return "default"; }
  });

  useEffect(() => {
    const syncMood = (event) => {
      const nextMood = event?.detail?.mood;
      if (nextMood) setSavedMoodTheme(nextMood);
      else {
        try { setSavedMoodTheme((localStorage.getItem("mindora-saved-mood") || "default").toLowerCase()); }
        catch { setSavedMoodTheme("default"); }
      }
    };
    window.addEventListener("mindora:mood-saved", syncMood);
    window.addEventListener("storage", syncMood);
    return () => {
      window.removeEventListener("mindora:mood-saved", syncMood);
      window.removeEventListener("storage", syncMood);
    };
  }, []);
  const activePalette = wallPalettes[savedMoodTheme]?.[isDark ? "dark" : "light"] || wallPalettes.okay[isDark ? "dark" : "light"];
  const wallStyle = Object.fromEntries(Object.entries(activePalette).map(([key, value]) => [`--ln-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`, value]));
  const [composerOpen, setComposerOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("butter");

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch {}
  }, [notes]);

  function addNote(event) {
    event.preventDefault();
    const text = noteText.trim();
    if (!text) return;
    setNotes((current) => [{
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: noteTitle.trim(),
      text,
      color: selectedColor,
      createdAt: new Date().toISOString(),
      rotation: Math.round(Math.random() * 4 - 2),
    }, ...current]);
    setNoteTitle("");
    setNoteText("");
    setSelectedColor(noteColors[Math.floor(Math.random() * noteColors.length)]);
    setComposerOpen(false);
  }

  function deleteNote(id) {
    setNotes((current) => current.filter((note) => note.id !== id));
  }

  return (
    <div className="sticky-wall-page" data-mood={savedMoodTheme} style={wallStyle}>
      <header className="sticky-wall-header">
        <button className="sticky-wall-back" onClick={() => navigate("/dashboard")} aria-label="Back to dashboard"><ArrowLeft size={17} /></button>
        <div className="sticky-wall-heading">
          <span className="sticky-wall-eyebrow"><Sparkles size={14} /> A LITTLE SPACE FOR YOUR THOUGHTS</span>
          <h1>Little <em>Notes.</em></h1>
          <p>Save a thought, a tiny win, a reminder, or something you want to let go of.</p>
        </div>
        <button className="sticky-wall-add" onClick={() => setComposerOpen(true)}><Plus size={18} /> Add a note</button>
      </header>

      <section className="sticky-wall-board" aria-label="Little Notes wall">
        <div className="sticky-wall-decor sticky-wall-decor-flower" aria-hidden="true">✿</div>
        <div className="sticky-wall-decor sticky-wall-decor-sparkle" aria-hidden="true">✦</div>
        <div className="sticky-wall-decor sticky-wall-decor-heart" aria-hidden="true">♡</div>
        <div className="sticky-wall-decor sticky-wall-decor-sun" aria-hidden="true">☼</div>
        <div className="sticky-wall-washi sticky-wall-washi-left" aria-hidden="true" />
        <div className="sticky-wall-washi sticky-wall-washi-right" aria-hidden="true" />
        <div className="sticky-wall-string" />
        {notes.length === 0 ? (
          <div className="sticky-wall-empty">
            <div className="sticky-wall-empty-icon"><StickyNote size={29} /></div>
            <span className="sticky-wall-empty-kicker">YOUR WALL, YOUR WORDS</span>
            <h2>Let’s make the first note yours.</h2>
            <p>The wall is waiting. Add a little reminder, a goal for today, or a kind thing you want to tell yourself.</p>
            <button onClick={() => setComposerOpen(true)}><Plus size={17} /> Write your first note</button>
          </div>
        ) : (
          <div className="sticky-wall-notes">
            {notes.map((note, index) => (
              <article key={note.id} className={`sticky-note sticky-note-${note.color}`} style={{ "--note-rotation": `${note.rotation}deg`, "--note-delay": `${Math.min(index * 45, 360)}ms` }}>
                <span className="sticky-note-pin"><Pin size={15} fill="currentColor" /></span>
                <button className="sticky-note-delete" onClick={() => deleteNote(note.id)} aria-label="Delete note"><Trash2 size={14} /></button>
                {note.title && <h3>{note.title}</h3>}
                <p>{note.text}</p>
                <footer><Heart size={12} /> <span>{new Date(note.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></footer>
              </article>
            ))}
            <button className="sticky-wall-add-tile" onClick={() => setComposerOpen(true)}><Plus size={22} /><span>Add another thought</span></button>
          </div>
        )}
        <div className="sticky-wall-board-caption">a gentle reminder: you’re allowed to start small ♡</div>
      </section>

      {composerOpen && (
        <div className="sticky-wall-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setComposerOpen(false); }}>
          <form className="sticky-wall-composer" onSubmit={addNote}>
            <button type="button" className="sticky-wall-modal-close" onClick={() => setComposerOpen(false)} aria-label="Close"><X size={19} /></button>
            <span className="sticky-wall-eyebrow"><Sparkles size={14} /> PIN SOMETHING MEANINGFUL</span>
            <h2>What would you like to remember?</h2>
            <label htmlFor="sticky-note-title">A little heading <span>optional</span></label>
            <input id="sticky-note-title" value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} maxLength={55} placeholder="e.g. Today, I choose me" />
            <label htmlFor="sticky-note-text">Your words</label>
            <textarea id="sticky-note-text" value={noteText} onChange={(event) => setNoteText(event.target.value)} maxLength={400} rows={5} placeholder="A thought, a promise, a tiny goal..." required autoFocus />
            <div className="sticky-wall-color-label">Choose your paper</div>
            <div className="sticky-wall-color-picker">
              {noteColors.map((color) => <button key={color} type="button" className={`sticky-wall-color-swatch swatch-${color} ${selectedColor === color ? "is-selected" : ""}`} onClick={() => setSelectedColor(color)} aria-label={`${color} note`} aria-pressed={selectedColor === color} />)}
            </div>
            <button className="sticky-wall-pin-button" type="submit"><Pin size={16} /> Pin it to my wall</button>
          </form>
        </div>
      )}
    </div>
  );
}
