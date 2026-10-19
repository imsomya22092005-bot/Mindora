import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserRound, Mail, CalendarDays, ShieldCheck, Heart, LogOut, Sparkles } from "lucide-react";
import "./ProfilePage.css";
import { useLanguage } from "./language";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [language] = useLanguage();
  const hi = language === "hi";
  const t = (en, hindi) => hi ? hindi : en;
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("mindora-user") || "{}"); }
    catch { return {}; }
  }, []);
  const name = user.name || user.displayName || ((user.authProvider === "guest" || user.isGuest) ? t("Guest explorer", "अतिथि") : t("Mindora member", "माइंडोरा सदस्य"));
  const email = user.email || t("No email added", "ईमेल नहीं जोड़ा गया");
  const initials = name.split(/\\s+/).filter(Boolean).slice(0, 2).map(x => x[0].toUpperCase()).join("") || "M";
  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(hi ? "hi-IN" : "en-IN", { month: "long", year: "numeric" })
    : t("Your journey starts here", "आपकी यात्रा यहाँ से शुरू होती है");
  function logout() {
    localStorage.removeItem("mindora-token");
    localStorage.removeItem("mindora-user");
    navigate("/login", { replace: true });
  }
  return <main className="profile-page">
    <header className="profile-page-top">
      <Link to="/dashboard" className="profile-back"><ArrowLeft size={16}/> {t("Dashboard", "डैशबोर्ड")}</Link>
      <Link to="/dashboard" className="profile-wordmark"><img src="/favicon.svg" alt=""/> mindora</Link>
    </header>
    <section className="profile-hero">
      <div className="profile-orbit profile-orbit-a"/>
      <div className="profile-orbit profile-orbit-b"/>
      <span className="profile-eyebrow"><Sparkles size={14}/> {t("YOUR SPACE, YOUR STORY", "आपकी जगह, आपकी कहानी")}</span>
      <div className="profile-big-avatar">{initials}</div>
      <h1 className="profile-moving-title">{t("Hello", "नमस्ते")}, {name.split(" ")[0]}.</h1>
      <p>{t("This is your little corner of Mindora. A space to check in, grow gently, and be yourself.", "यह माइंडोरा में आपका अपना कोना है—जहाँ आप अपनी भावनाओं को समझ सकते हैं, धीरे-धीरे आगे बढ़ सकते हैं और खुद जैसे रह सकते हैं।")}</p>
      <span className="profile-member-pill"><ShieldCheck size={14}/> {user.authProvider === "otp" ? t("Email verified account", "ईमेल सत्यापित खाता") : user.authProvider === "google" ? t("Google account", "Google खाता") : user.authProvider === "guest" || user.isGuest ? t("Guest space", "अतिथि स्थान") : t("Mindora member", "माइंडोरा सदस्य")}</span>
    </section>
    <section className="profile-details-grid">
      <article className="profile-detail-card"><span className="profile-detail-icon"><UserRound size={19}/></span><span className="profile-detail-label">{t("YOUR NAME", "आपका नाम")}</span><strong>{name}</strong><small>{t("As shown on your account", "आपके खाते में दर्ज नाम")}</small></article>
      <article className="profile-detail-card"><span className="profile-detail-icon peach"><Mail size={19}/></span><span className="profile-detail-label">{t("EMAIL ADDRESS", "ईमेल पता")}</span><strong className="profile-email">{email}</strong><small>{t("Connected account email", "आपके खाते से जुड़ा ईमेल")}</small></article>
      <article className="profile-detail-card"><span className="profile-detail-icon yellow"><CalendarDays size={19}/></span><span className="profile-detail-label">{t("YOUR JOURNEY", "आपकी यात्रा")}</span><strong>{joined}</strong><small>{t("One gentle step at a time", "एक-एक सहज कदम के साथ")}</small></article>
    </section>
    <section className="profile-bottom-card">
      <div><Heart size={20}/><div><strong>{t("Take care of your space", "अपनी जगह का ख़याल रखें")}</strong><p>{t("These details are read from the account saved on this device. Full account-wide profile syncing requires a backend profile endpoint.", "ये विवरण इस डिवाइस पर सेव खाते से लिए गए हैं। सभी डिवाइस पर प्रोफ़ाइल सिंक करने के लिए बैकएंड सुविधा आवश्यक है।")}</p></div></div>
      <button onClick={logout}><LogOut size={16}/> {t("Log out", "लॉग आउट")}</button>
    </section>
  </main>;
}
