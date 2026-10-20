import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, BarChart3, Wind, ShieldCheck, Sparkles, Gamepad2, Settings, ChevronDown, Leaf } from "lucide-react";
import "./App.css";

const mainItems = [
 {label:"Overview",href:"/dashboard",icon:LayoutDashboard},
 {label:"Journal",href:"/journal",icon:BookOpen},
 {label:"Insights",href:"/insights",icon:BarChart3},
 {label:"Mindful moments",href:"/mindful-moments",icon:Wind,children:[["Calm Corner","/calm-corner"],["Inner Garden","/inner-garden"],["Little Comfort Box","/comfort-box"],["Mood Soundscape","/soundscape"]]},
 {label:"Incognito check-in",href:"/incognito-checkin",icon:ShieldCheck},
 {label:"Mood heatmap",href:"/mood-heatmap",icon:Sparkles},
 {label:"Play & Unwind",href:"/games",icon:Gamepad2,children:[["Color Pop","/games?game=color-pop"],["Let It Burn","/games?game=let-it-burn"]]}
];

export default function SharedSidebarLayout({children}) {
 const location=useLocation();
 const [expanded,setExpanded]=useState({
  "Mindful moments":location.pathname.startsWith("/calm")||location.pathname.startsWith("/inner")||location.pathname==="/comfort-box"||location.pathname==="/soundscape"||location.pathname==="/mindful-moments",
  "Play & Unwind":location.pathname==="/games"
 });
 const active=(item)=>location.pathname===item.href || (item.children&&item.label==="Mindful moments"&&(location.pathname.startsWith("/calm")||location.pathname.startsWith("/inner")||location.pathname==="/comfort-box"||location.pathname==="/soundscape"||location.pathname==="/mindful-moments")) || (item.label==="Play & Unwind"&&location.pathname==="/games");
 return <div className="shared-dashboard-layout">
  <aside className="shared-dashboard-sidebar">
   <Link to="/dashboard" className="shared-sidebar-brand"><span className="shared-brand-mark">✿</span><strong>mindora</strong></Link>
   <div className="shared-sidebar-label">YOUR SPACE</div>
   <nav className="shared-sidebar-nav">
    {mainItems.map(item=>{const Icon=item.icon;const selected=active(item);return <div key={item.label} className="shared-nav-group">
      <div className={"shared-nav-row "+(selected?"is-active":"")}>
       <Link to={item.href} className="shared-nav-link"><Icon size={20}/><span>{item.label}</span></Link>
       {item.children&&<button className="shared-nav-expand" aria-label={"Toggle "+item.label+" submenu"} onClick={()=>setExpanded(v=>({...v,[item.label]:!v[item.label]}))}><ChevronDown size={16} className={expanded[item.label]?"turned":""}/></button>}
      </div>
      {item.children&&expanded[item.label]&&<div className="shared-nav-submenu">{item.children.map(([label,href])=><Link key={label} to={href} className={"shared-sub-link "+(location.pathname===href.split("?")[0]&&location.search===((href.includes("?")?"?"+href.split("?")[1]:""))?"sub-active":"")}>{label}</Link>)}</div>}
    </div>})}
   </nav>
   <div className="shared-sidebar-spacer"/>
   <div className="shared-sidebar-quote"><span><Sparkles size={20}/></span><p>You don’t have to have it all figured out today.</p><small>A gentle reminder</small></div>
   <Link to="/profile" className={"shared-settings-link "+(location.pathname==="/profile"?"is-active":"")}><Settings size={20}/>Settings</Link>
  </aside>
  <main className="shared-dashboard-content">{children}</main>
 </div>
}
