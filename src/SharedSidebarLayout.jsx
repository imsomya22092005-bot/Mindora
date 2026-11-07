import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, BarChart3, Wind, Gamepad2, Settings, ChevronDown, Sparkles, Menu, X, HeartHandshake, StickyNote, Moon, Sun, UserRound, LogOut } from "lucide-react";
import "./App.css";

const mainItems = [
 {label:"Overview",href:"/dashboard",icon:LayoutDashboard},
 {label:"Journal",href:"/journal",icon:BookOpen},
 {label:"Little Notes",href:"/sticky-wall",icon:StickyNote},
 {label:"Insights",href:"/insights",icon:BarChart3},
 {label:"Mindful moments",href:"/mindful-moments",icon:Wind,children:[["Calm Corner","/calm-corner"],["Inner Garden","/inner-garden"],["Little Comfort Box","/comfort-box"],["Mood Soundscape","/soundscape"]]},
 {label:"AI wellbeing",href:"/mindora-ai",icon:HeartHandshake},
 {label:"Wellbeing Check-in",href:"/wellbeing-checkin",icon:HeartHandshake},
 {label:"Sleep Check",href:"/sleep-check",icon:Wind},
 {label:"Academic Stress Predictor",href:"/academic-stress",icon:Sparkles},
 {label:"Play & Unwind",href:"/games",icon:Gamepad2,children:[["Color Pop","/games?game=color-pop"],["Starweave","/games?game=starweave"],["Let It Burn","/games?game=let-it-burn"],["Picture Puzzle","/games?game=picture-puzzle"]]}
];

export default function SharedSidebarLayout({children}) {
 const location=useLocation();
 const navigate=useNavigate();
 const [mobileMenuOpen,setMobileMenuOpen]=useState(false);
 const [settingsOpen,setSettingsOpen]=useState(false);
 const [paletteMode,setPaletteMode]=useState(() => { try { return localStorage.getItem("mindora-palette-mode") || "mood"; } catch { return "mood"; } });
 const [darkMode,setDarkMode]=useState(() => { try { return localStorage.getItem("mindora-theme")==="dark"; } catch { return false; } });
 useEffect(() => {
  document.documentElement.dataset.mindoraTheme = darkMode ? "dark" : "light";
  try { localStorage.setItem("mindora-theme", darkMode ? "dark" : "light"); } catch {}
  window.dispatchEvent(new CustomEvent("mindora:theme-change", { detail: { theme: darkMode ? "dark" : "light" } }));
 }, [darkMode]);
 useEffect(() => {
  document.documentElement.dataset.mindoraPalette = paletteMode;
  try { localStorage.setItem("mindora-palette-mode", paletteMode); } catch {}
  window.dispatchEvent(new CustomEvent("mindora:palette-change", { detail: { palette: paletteMode } }));
 }, [paletteMode]);
 const handleLogout=()=>{
  try { localStorage.removeItem("mindora-token"); localStorage.removeItem("mindora-user"); } catch {}
  setSettingsOpen(false);
  navigate("/login",{replace:true});
 };
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
 const [expanded,setExpanded]=useState({
  "Mindful moments":location.pathname.startsWith("/calm")||location.pathname.startsWith("/inner")||location.pathname==="/comfort-box"||location.pathname==="/soundscape"||location.pathname==="/mindful-moments",
  "Play & Unwind":location.pathname==="/games",
  "AI wellbeing":location.pathname==="/mindora-ai"||location.pathname==="/wellbeing-checkin"||location.pathname==="/sleep-check"||location.pathname==="/academic-stress"
 });
 const active=(item)=>location.pathname===item.href || (item.children&&item.label==="Mindful moments"&&(location.pathname.startsWith("/calm")||location.pathname.startsWith("/inner")||location.pathname==="/comfort-box"||location.pathname==="/soundscape"||location.pathname==="/mindful-moments")) || (item.label==="Play & Unwind"&&location.pathname==="/games");
 return <div className="shared-dashboard-layout" data-mood={savedMoodTheme}>
  <aside className={"shared-dashboard-sidebar "+(mobileMenuOpen?"mobile-menu-open":"")}>
   <div className="shared-sidebar-mobile-head">
    <Link to="/dashboard" className="shared-sidebar-brand" onClick={()=>setMobileMenuOpen(false)}><span className="shared-brand-mark">✿</span><strong>mindora</strong></Link>
    <button type="button" className="shared-sidebar-hamburger" onClick={()=>setMobileMenuOpen(v=>!v)} aria-label={mobileMenuOpen?"Close navigation menu":"Open navigation menu"} aria-expanded={mobileMenuOpen}>{mobileMenuOpen?<X size={23}/>:<Menu size={23}/>}</button>
   </div>
   <div className="shared-sidebar-label">YOUR SPACE</div>
   <nav className="shared-sidebar-nav">
    {mainItems.map(item=>{const Icon=item.icon;const selected=active(item);return <div key={item.label} className="shared-nav-group">
      <div className={"shared-nav-row "+(selected?"is-active":"")}>
       <Link to={item.href} className="shared-nav-link" onClick={()=>setMobileMenuOpen(false)}><Icon size={20}/><span>{item.label}</span></Link>
       {item.children&&<button className="shared-nav-expand" aria-label={"Toggle "+item.label+" submenu"} onClick={()=>setExpanded(v=>({...v,[item.label]:!v[item.label]}))}><ChevronDown size={16} className={expanded[item.label]?"turned":""}/></button>}
      </div>
      {item.children&&expanded[item.label]&&<div className="shared-nav-submenu">{item.children.map(([label,href])=><Link key={label} to={href} onClick={()=>setMobileMenuOpen(false)} className={"shared-sub-link "+(location.pathname===href.split("?")[0]&&location.search===((href.includes("?")?"?"+href.split("?")[1]:""))?"sub-active":"")}>{label}</Link>)}</div>}
    </div>})}
   </nav>
   <div className="shared-sidebar-spacer"/>
   <div className="shared-sidebar-quote"><span><Sparkles size={20}/></span><p>You don’t have to have it all figured out today.</p><small>A gentle reminder</small></div>
   <div className="shared-settings-wrap">
    <button type="button" onClick={()=>setSettingsOpen(v=>!v)} aria-expanded={settingsOpen} className={"shared-settings-link "+(settingsOpen?"is-active":"")}><Settings size={20}/>Settings</button>
    {settingsOpen&&<div className="settings-popover shared-settings-popover">
     <div className="settings-popover-heading"><strong>Settings</strong><button type="button" aria-label="Close settings" onClick={()=>setSettingsOpen(false)}><X size={16}/></button></div>
     <button type="button" className="theme-setting" onClick={()=>setDarkMode(v=>!v)}>{darkMode?<Sun size={17}/>:<Moon size={17}/>} {darkMode?"Switch to light mode":"Switch to dark mode"}</button>
     <button type="button" className="theme-setting" onClick={()=>setPaletteMode(v=>v==="default"?"mood":"default")}>{paletteMode==="default"?<Sparkles size={17}/>:<Sun size={17}/>} {paletteMode==="default"?"Use mood colours":"Use default theme"}</button>
     <button type="button" className="theme-setting" onClick={()=>{setSettingsOpen(false);setMobileMenuOpen(false);navigate("/profile");}}><UserRound size={17}/> My profile</button>
     <button type="button" className="theme-setting logout-setting" onClick={handleLogout}><LogOut size={17}/> Log out</button>
    </div>}
   </div>
  </aside>
  <main className="shared-dashboard-content">{children}</main>
 </div>
}
