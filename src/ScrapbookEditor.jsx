import { useEffect, useRef, useState } from "react";
import { LockKeyhole, Plus } from "lucide-react";

const DB_NAME = "mindora-memory-scrapbook";
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains("photos")) request.result.createObjectStore("photos", { keyPath: "id" }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Could not open photo storage."));
  });
}
async function storePhoto(id, blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => { const tx = db.transaction("photos", "readwrite"); tx.objectStore("photos").put({ id, blob }); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => { db.close(); reject(new Error("Photo could not be saved. Browser storage may be full.")); }; });
}
async function fetchPhoto(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => { const tx = db.transaction("photos", "readonly"); const req = tx.objectStore("photos").get(id); req.onsuccess = () => { db.close(); resolve(req.result?.blob || null); }; req.onerror = () => { db.close(); reject(new Error("Could not load photo.")); }; });
}
export async function deleteScrapbookPage(pageId) {
  const layouts = readLayouts();
  const items = layouts[String(pageId)] || [];
  for (const item of items) if (item.type === "photo") { try { await erasePhoto(item.id); } catch {} }
  delete layouts[String(pageId)];
  writeLayouts(layouts);
}
async function erasePhoto(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => { const tx = db.transaction("photos", "readwrite"); tx.objectStore("photos").delete(id); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => { db.close(); reject(new Error("Could not delete photo.")); }; });
}
function readLayouts() { try { return JSON.parse(localStorage.getItem("mindora-scrapbook-layouts") || "{}"); } catch { return {}; } }
function writeLayouts(value) { try { localStorage.setItem("mindora-scrapbook-layouts", JSON.stringify(value)); return true; } catch { return false; } }

export default function ScrapbookEditor({ pageId, hi = false }) {
  const [items, setItems] = useState([]);
  const [urls, setUrls] = useState({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const canvas = useRef(null);
  const input = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    let live = true;
    const stored = readLayouts()[String(pageId)] || [];
    setItems(stored); setSelected(null); setNotice("");
    (async () => {
      const next = {};
      try {
        for (const item of stored) if (item.type === "photo") { const blob = await fetchPhoto(item.id); if (blob) next[item.id] = URL.createObjectURL(blob); }
        if (live) setUrls(next); else Object.values(next).forEach(URL.revokeObjectURL);
      } catch (error) { if (live) setNotice(error.message); }
    })();
    return () => { live = false; setUrls(old => { Object.values(old).forEach(URL.revokeObjectURL); return {}; }); };
  }, [pageId]);

  function persist(next) {
    setItems(next);
    const all = readLayouts(); all[String(pageId)] = next;
    if (!writeLayouts(all)) setNotice("Layout could not save; browser storage may be full.");
  }
  async function addPhoto(event) {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setNotice((hi ? "कृपया तस्वीर वाली फ़ाइल चुनें।" : "Please choose an image file.")); return; }
    if (file.size > 5 * 1024 * 1024) { setNotice((hi ? "कृपया 5 MB से छोटी तस्वीर चुनें।" : "Please choose a photo under 5 MB.")); return; }
    setBusy(true); setNotice("");
    const id = "memory-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    try {
      await storePhoto(id, file);
      setUrls(old => ({ ...old, [id]: URL.createObjectURL(file) }));
      const item = { id, type: "photo", x: 5 + (items.length % 3) * 9, y: 5 + (items.length % 3) * 8, size: "medium", rotation: items.length % 2 ? 3 : -3, caption: (hi ? "एक प्यारी-सी याद" : "A little memory") };
      persist([...items, item]); setSelected(id);
    } catch (error) { setNotice(error.message || "Could not save this photo."); }
    finally { setBusy(false); }
  }
  function addDecor(type) {
    const item = { id: type + "-" + Date.now(), type, x: 12 + (items.length % 4) * 16, y: 15 + (items.length % 3) * 18, rotation: type === "tape" ? -5 : 0 };
    persist([...items, item]); setSelected(item.id);
  }
  function startDrag(event, item) {
    if (event.target.closest("button,input")) return;
    event.preventDefault(); setSelected(item.id);
    const rect = canvas.current.getBoundingClientRect();
    drag.current = { id: item.id, sx: event.clientX, sy: event.clientY, x: item.x, y: item.y, w: rect.width, h: rect.height };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function moveDrag(event) {
    if (!drag.current) return;
    const d = drag.current;
    setItems(old => old.map(item => item.id === d.id ? { ...item, x: Math.max(0, Math.min(82, d.x + (event.clientX-d.sx)/d.w*100)), y: Math.max(0, Math.min(75, d.y + (event.clientY-d.sy)/d.h*100)) } : item));
  }
  function endDrag() {
    if (!drag.current) return;
    drag.current = null;
    const all = readLayouts(); all[String(pageId)] = items; writeLayouts(all);
  }
  function updateItem(id, patch) { persist(items.map(item => item.id === id ? { ...item, ...patch } : item)); }
  async function removeItem(item) {
    persist(items.filter(entry => entry.id !== item.id));
    if (item.type === "photo") {
      try { await erasePhoto(item.id); } catch {}
      if (urls[item.id]) URL.revokeObjectURL(urls[item.id]);
      setUrls(old => { const next = { ...old }; delete next[item.id]; return next; });
    }
    setSelected(null);
  }
  return <section className="scrapbook-editor" aria-label={hi ? "यादों की स्क्रैपबुक" : "Memory scrapbook"}>
    <div className="scrapbook-tools"><div><span className="scrapbook-kicker">{hi ? "आपकी यादों का कोना" : "YOUR MEMORY CORNER"}</span><h3>{hi ? "ज़िंदगी के छोटे-छोटे पल जोड़ें" : "Add little pieces of life"}</h3><p>{hi ? "तस्वीरों और सजावट को इस पन्ने पर कहीं भी खींचकर रखें।" : "Drag photos and decorations anywhere on this page."}</p></div><input ref={input} className="scrapbook-file-input" type="file" accept="image/*" onChange={addPhoto}/><button type="button" className="scrapbook-tool-button primary" disabled={busy} onClick={() => input.current?.click()}><Plus size={15}/>{busy ? (hi ? "सेव हो रहा है…" : "Saving…") : (hi ? "तस्वीर जोड़ें" : "Add photo")}</button></div>
    <div className="scrapbook-decoration-tools"><button type="button" onClick={() => addDecor("flower")}>✿ {hi ? "फूल" : "Flower"}</button><button type="button" onClick={() => addDecor("heart")}>♡ {hi ? "दिल" : "Heart"}</button><button type="button" onClick={() => addDecor("tape")}>▰ {hi ? "टेप" : "Tape"}</button></div>
    <div className="scrapbook-canvas" ref={canvas} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
      {!items.length && <div className="scrapbook-canvas-empty"><span>＋</span></div>}
      {items.map(item => <div key={item.id} className={"scrapbook-item scrapbook-item-" + item.type + (selected === item.id ? " is-selected" : "")} style={{ left: item.x + "%", top: item.y + "%", transform: "rotate(" + (item.rotation || 0) + "deg)" }} onPointerDown={event => startDrag(event, item)}>
        {item.type === "photo" ? <div className={"scrapbook-polaroid size-" + item.size}>{urls[item.id] ? <img draggable="false" src={urls[item.id]} alt={item.caption || "Personal memory"}/> : <div className="scrapbook-photo-missing">तस्वीर उपलब्ध नहीं है</div>}<input aria-label="Photo caption" value={item.caption || ""} maxLength={80} placeholder={hi ? "तस्वीर के बारे में लिखें…" : "Write a caption…"} onPointerDown={event => event.stopPropagation()} onChange={event => updateItem(item.id, { caption: event.target.value })}/><div className="scrapbook-photo-controls"><button type="button" aria-label="Smaller photo" onPointerDown={event => event.stopPropagation()} onClick={() => updateItem(item.id, { size: "small" })}>−</button><button type="button" aria-label="Larger photo" onPointerDown={event => event.stopPropagation()} onClick={() => updateItem(item.id, { size: item.size === "small" ? "medium" : "large" })}>+</button><button type="button" aria-label="Rotate photo" onPointerDown={event => event.stopPropagation()} onClick={() => updateItem(item.id, { rotation: (item.rotation || 0) + 4 })}>↻</button><button type="button" aria-label="Remove photo" onPointerDown={event => event.stopPropagation()} onClick={() => removeItem(item)}>×</button></div></div> : <><div className={"scrapbook-sticker sticker-" + item.type}>{item.type === "flower" ? "✿" : item.type === "heart" ? "♡" : <span>WASHI</span>}</div>{selected === item.id && <button type="button" className="scrapbook-remove-decor" aria-label="Remove decoration" onPointerDown={event => event.stopPropagation()} onClick={() => removeItem(item)}>×</button>}</>}
      </div>)}
    </div>
    {notice && <p className="scrapbook-notice" role="status">{notice}</p>}
  </section>;
}
