import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserRound, Mail, CalendarDays, ShieldCheck, Heart, LogOut, Sparkles } from "lucide-react";
import "./ProfilePage.css";
export default function ProfilePage() {
 const navigate=useNavigate();
 const user=useMemo(()=>{try{return JSON.parse(localStorage.getItem("mindora-user")||"{}")}catch{return{}}},[]);
 const name=user.name||user.displayName||((user.authProvider==="guest"||user.isGuest)?"Guest explorer":"Mindora member");
 const email=user.email||"No email added";
 const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join("")||"M";
 const joined=user.createdAt?new Date(user.createdAt).toLocaleDateString("en-IN",{month:"long",year:"numeric"}):"Your journey starts here";
 function logout(){localStorage.removeItem("mindora-token");localStorage.removeItem("mindora-user");navigate("/login",{replace:true})}
 return <main className="profile-page"><header className="profile-page-top"><Link to="/dashboard" className="profile-back"><ArrowLeft size={16}/> Dashboard</Link><Link to="/dashboard" className="profile-wordmark"><img src="/favicon.svg" alt=""/> mindora</Link></header>
 <section className="profile-hero"><div className="profile-orbit profile-orbit-a"/><div className="profile-orbit profile-orbit-b"/><span className="profile-eyebrow"><Sparkles size={14}/> YOUR SPACE, YOUR STORY</span><div className="profile-big-avatar">{initials}</div><h1 className="profile-moving-title">Hello, {name.split(" ")[0]}.</h1><p>This is your little corner of Mindora. A space to check in, grow gently, and be yourself.</p><span className="profile-member-pill"><ShieldCheck size={14}/> {user.authProvider==="otp"?"Email verified account":user.authProvider==="google"?"Google account":user.authProvider==="guest"||user.isGuest?"Guest space":"Mindora member"}</span></section>
 <section className="profile-details-grid"><article className="profile-detail-card"><span className="profile-detail-icon"><UserRound size={19}/></span><span className="profile-detail-label">YOUR NAME</span><strong>{name}</strong><small>As shown on your account</small></article><article className="profile-detail-card"><span className="profile-detail-icon peach"><Mail size={19}/></span><span className="profile-detail-label">EMAIL ADDRESS</span><strong className="profile-email">{email}</strong><small>Connected account email</small></article><article className="profile-detail-card"><span className="profile-detail-icon yellow"><CalendarDays size={19}/></span><span className="profile-detail-label">YOUR JOURNEY</span><strong>{joined}</strong><small>One gentle step at a time</small></article></section>
 <section className="profile-bottom-card"><div><Heart size={20}/><div><strong>Take care of your space</strong><p>These details are read from the account saved on this device. Full account-wide profile syncing requires a backend profile endpoint.</p></div></div><button onClick={logout}><LogOut size={16}/> Log out</button></section></main>
}