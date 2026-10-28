import { useEffect, useState } from "react";
import { Plus, X, Pin, Trash2, Heart, Sparkles, ArrowLeft, StickyNote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./StickyNoteWall.css";

const STORAGE_KEY = "mindora-sticky-wall-v1";
const noteColors = ["butter", "rose", "sage", "peach", "lilac", "sky"];

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
    <div className="sticky-wall-page">
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
