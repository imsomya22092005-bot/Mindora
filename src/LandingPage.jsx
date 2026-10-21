
import { useEffect, useState } from "react";
import "./LandingPage.css";
import { useLanguage } from "./language";

const features = [
  {
    number: "01",
    icon: "♡",
    title: "Understand your mood",
    description:
      "Check in with yourself and make space for every emotion.",
  },
  {
    number: "02",
    icon: "✎",
    title: "Write it out",
    description:
      "Put your thoughts into words with your personal journal.",
  },
  {
    number: "03",
    icon: "◎",
    title: "Find your calm",
    description:
      "Take a mindful pause with simple guided breathing exercises.",
  },
];

export default function LandingPage() {
  const [language, setLanguage] = useLanguage();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mindora-theme") === "dark");
  const hi = language === "hi";
  useEffect(() => {
    const theme = darkMode ? "dark" : "light";
    localStorage.setItem("mindora-theme", theme);
    document.documentElement.dataset.mindoraTheme = theme;
    document.documentElement.dataset.mindoraLanguage = language;
    localStorage.setItem("mindora-language", language);
  }, [darkMode, language]);
  useEffect(() => {
    const root = document.querySelector(".mindora-landing");
    if (!root || !("IntersectionObserver" in window)) return;

    const animatedSections = root.querySelectorAll(
      ".landing-hero, .landing-intro, .landing-why, .landing-features, .landing-preview, .landing-how, .landing-difference, .landing-cta"
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("motion-active");
          void entry.target.offsetWidth;
          entry.target.classList.add("motion-active");
        } else {
          entry.target.classList.remove("motion-active");
        }
      });
    }, { threshold: 0.18 });

    animatedSections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <main className={`mindora-landing ${darkMode ? "landing-dark" : ""}`}>
      <header className="landing-navbar">
        <a className="landing-brand" href="#home" aria-label="Mindora home">
          <span className="brand-symbol"><img src="/favicon.svg" alt="" /></span>
          <span>Mindora</span>
        </a>

        <nav className="landing-nav-links">
          <a href="#why-mindora">{hi ? "माइंडोरा क्यों" : "Why Mindora"}</a>
          <a href="#features">{hi ? "सुविधाएँ" : "Features"}</a>
          <a href="#how-it-works">{hi ? "यह कैसे काम करता है" : "How it works"}</a>
          <a href="#preview">{hi ? "झलक" : "Preview"}</a>
        </nav>

        <div className="landing-auth">
          <a className="landing-login" href="/login">{hi ? "लॉग इन" : "Log in"}</a>
          <a className="landing-signup" href="/signup">
            {hi ? "शुरू करें" : "Get started"} <span>↗</span>
          </a>
        </div>
        <div className="landing-preference-controls" aria-label={hi ? "भाषा और थीम" : "Language and theme"}>
          <select aria-label={hi ? "भाषा चुनें" : "Choose language"} value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
          <button type="button" className="landing-theme-toggle" aria-label={darkMode ? (hi ? "लाइट मोड" : "Switch to light mode") : (hi ? "डार्क मोड" : "Switch to dark mode")} onClick={() => setDarkMode(v => !v)}>{darkMode ? "☀" : "☾"}</button>
        </div>
      </header>

      <section className="landing-hero" id="home">
        <div className="hero-image" />

        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-eyebrow">
            {hi ? "आपकी जगह। आपकी गति।" : "YOUR SPACE. YOUR PACE."}
          </span>

          <h1>
            <span className="hero-line"><span className="hero-line-inner">{hi ? "सुकून पाएँ।" : "Find calm."}</span></span>
            <br />
            <span className="hero-line"><span className="hero-line-inner">{hi ? "संतुलन लौटाएँ।" : "Restore balance."}</span></span>
            <br />
            <span className="hero-line"><span className="hero-line-inner"><span>{hi ? "फिर से खुद जैसा महसूस करें।" : "Feel like yourself again."}</span></span></span>
          </h1>

          <p>
            {hi ? "अपनी भावनाओं को समझने, विचारों को व्यक्त करने और खुद से जुड़ने के लिए\n            हर दिन एक छोटी-सी जगह।" : "A little space to understand your emotions, express your\n            thoughts, and reconnect with yourself — one day at a time."}
          </p>

          <div className="hero-actions">
            <a href="/signup" className="hero-primary-button">
              {hi ? "अपनी यात्रा शुरू करें" : "Begin your journey"} <span>↗</span>
            </a>

            <a href="#how-it-works" className="hero-secondary-button">
              {hi ? "माइंडोरा जानें" : "Discover Mindora"} <span>→</span>
            </a>
          </div>

          <div className="hero-note">
            <span className="hero-note-icon">✳</span>
            {hi ? "कोई दबाव नहीं। हर दिन परिपूर्ण होना ज़रूरी नहीं। बस आप।" : "No pressure. No perfect days. Just you."}
          </div>
        </div>

        <div className="hero-floating-card">
          <span className="floating-card-label">
            {hi ? "आपके लिए एक पल" : "A MOMENT FOR YOU"}
          </span>
          <div className="floating-card-icon">☀</div>
          <p>{hi ? "एक गहरी साँस लें।" : "Take a breath."}</p>
          <span className="floating-card-subtitle">
            You can begin again, anytime.
          </span>
        </div>

        <div className="hero-image-caption">
          {hi ? "खुद के लिए जगह बनाएँ" : "MAKE SPACE FOR YOURSELF"}
        </div>
      </section>

      <section className="landing-intro" id="about">
        <span className="section-eyebrow">{hi ? "आगे बढ़ने का एक सहज तरीका" : "A GENTLER WAY FORWARD"}</span>
        <h2>{hi ? "आपका सुकून कोई मंज़िल नहीं है।" : "Your wellbeing isn't a destination."}<br />
          <span>{hi ? "यह एक खूबसूरत यात्रा है।" : "It's a journey worth taking."}</span>
        </h2>
        <p>
          {hi ? "माइंडोरा आपको ठहरने, सोचने और खुद से बेहतर रिश्ता बनाने के आसान तरीके देता है।" : "Mindora gives you simple tools to pause, reflect, and build\n          a more mindful relationship with yourself."}
        </p>
      </section>


      <section className="landing-why" id="why-mindora">
        <div className="landing-why-heading">
          <span className="section-eyebrow">{hi ? "एक ऐसी जगह जो आपको समझे" : "A SPACE THAT MEETS YOU WHERE YOU ARE"}</span>
          <h2>{hi ? "कोई और दबाव नहीं।" : "Not another thing to keep up with."}<br /><em>{hi ? "जब ज़रूरत हो, थोड़ा सहारा।" : "A little support, when you need it."}</em></h2>
          <p>{hi ? "कुछ दिन आसान लगते हैं, कुछ भारी। माइंडोरा बिना किसी दबाव के खुद का हाल जानने के सरल तरीके देता है।" : "Some days feel clear. Others feel like a lot. Mindora gives you gentle, practical ways to check in with yourself — without pressure to have it all figured out."}</p>
        </div>
        <div className="landing-why-grid">
          <article><span className="why-number">01 / PAUSE</span><span className="why-symbol">◌</span><h3>{hi ? "साँस लेने के लिए जगह बनाएँ" : "Make room to breathe"}</h3><p>{hi ? "शोर से दूर होकर अपने लिए एक पल निकालें।" : "Step away from the noise and take a moment that belongs just to you."}</p></article>
          <article><span className="why-number">02 / UNDERSTAND</span><span className="why-symbol">↗</span><h3>{hi ? "भावनाओं को शब्द दें" : "Put feelings into words"}</h3><p>{hi ? "अपनी भावनाओं को पहचानें और बिना खुद को आँके उन पर विचार करें।" : "Notice what you're feeling and reflect on it, without judging yourself."}</p></article>
          <article><span className="why-number">03 / GROW</span><span className="why-symbol">✳</span><h3>{hi ? "अपनी लय बनाएँ" : "Build your own rhythm"}</h3><p>{hi ? "ऐसी छोटी आदतें अपनाएँ जो असल ज़िंदगी में आपके काम आएँ।" : "Find small rituals that fit real life — not a perfect version of it."}</p></article>
        </div>
      </section>

      <section className="landing-features" id="features">
        <div className="features-heading">
          <div>
            <span className="section-eyebrow">{hi ? "आपके रोज़ के छोटे कदम" : "YOUR DAILY RITUALS"}</span>
            <h2>{hi ? "छोटे कदम। मायने भरे पल।" : "Small steps. Meaningful moments."}</h2>
          </div>
          <p>{hi ? "हर दिन खुद के लिए थोड़ी जगह बनाएँ।" : "Make a little room for yourself every day."}</p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article className="landing-feature-card" key={feature.number}>
              <div className="feature-card-top">
                <span className="feature-icon">{feature.icon}</span>
                <span className="feature-number">{feature.number}</span>
              </div>

              <h3>{hi ? ({ "Understand your mood": "अपने मूड को समझें", "Write it out": "लिखकर मन हल्का करें", "Find your calm": "अपना सुकून पाएँ" }[feature.title] || feature.title) : feature.title}</h3>
              <p>{hi ? ({ "Check in with yourself and make space for every emotion.": "खुद का हाल जानें और हर भावना को जगह दें।", "Put your thoughts into words with your personal journal.": "अपनी डायरी में विचारों को शब्द दें।", "Take a mindful pause with simple guided breathing exercises.": "आसान साँस अभ्यास के साथ सुकून भरा विराम लें।" }[feature.description] || feature.description) : feature.description}</p>
              <a href="/signup" className="feature-link">
                {hi ? "देखें" : "Explore"} <span>↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>


      <section className="landing-preview" id="preview">
        <div className="preview-copy">
          <span className="section-eyebrow">{hi ? "एक झलक" : "A LOOK INSIDE"}</span>
          <h2>{hi ? "आपके लिए सोच-समझकर बनाई गई जगह।" : "Your space, thoughtfully made."}</h2>
          <p>{hi ? "मूड जाँचने से लेकर डायरी लिखने तक, माइंडोरा आपकी रोज़मर्रा की देखभाल के सभी साधन एक जगह देता है।" : "From a quick mood check-in to a page in your journal, Mindora keeps your everyday wellbeing tools in one calm, welcoming place."}</p>
          <a href="/signup" className="landing-dark-button">{hi ? "अपनी जगह देखें" : "Explore your space"} <span>↗</span></a>
        </div>
        <div className="preview-window" aria-label="Illustrative preview of the Mindora experience">
          <div className="preview-window-top"><span className="preview-dots"><i></i><i></i><i></i></span><span>{hi ? "आपकी सुकून भरी जगह" : "your mindful space"}</span><span>✳</span></div>
          <div className="preview-welcome"><span>{hi ? "आपकी निजी जगह" : "YOUR PERSONAL SPACE"}</span><h3>{hi ? "नमस्ते!" : "Hello, there."}</h3><p>{hi ? "आज आप कैसा महसूस कर रहे हैं?" : "How are you feeling today?"}</p></div>
          <div className="preview-moods"><span>☁<small>{hi ? "कम" : "Low"}</small></span><span>☾<small>{hi ? "ठीक-ठाक" : "Meh"}</small></span><span>◡<small>{hi ? "ठीक" : "Okay"}</small></span><span>☀<small>{hi ? "अच्छा" : "Good"}</small></span><span>✳<small>{hi ? "बहुत अच्छा" : "Great"}</small></span></div>
          <div className="preview-lower">
            <div><span className="preview-mini-icon">✎</span><b>{hi ? "आपकी डायरी" : "Your journal"}</b><small>{hi ? "आपके विचारों के लिए एक पन्ना" : "A page just for your thoughts"}</small></div>
            <div><span className="preview-mini-icon">❋</span><b>{hi ? "थोड़ा ठहरें" : "Take a pause"}</b><small>{hi ? "जब चाहें, सुकून का एक पल" : "A softer moment, whenever"}</small></div>
          </div>
          <span className="preview-note">{hi ? "एक प्यारी याद: आप फिर से शुरुआत कर सकते हैं।" : "A gentle reminder: you can start again."}</span>
        </div>
      </section>

      <section className="landing-how" id="how-it-works">
        <div className="how-copy">
          <span className="section-eyebrow">{hi ? "जहाँ हैं, वहीं से शुरू करें" : "START WHERE YOU ARE"}</span>
          <h2>{hi ? "आपको सब कुछ" : "You don't have to"}<br />{hi ? "अभी समझने की" : "figure it all out"}<br />
            <span>{hi ? "ज़रूरत नहीं।" : "today."}</span>
          </h2>
          <p>
            {hi ? "अपने मूड को समझें, मन की बात लिखें या साँसों का अभ्यास करें।\n            जो आपके लिए सही लगे, वही चुनें।" : "Check in with your mood, write down what's on your mind,\n            or take a breathing break. Choose what feels right for you."}
          </p>
          <a href="/signup" className="landing-dark-button">{hi ? "माइंडोरा के साथ शुरुआत करें" : "Get started with Mindora"}<span>↗</span>
          </a>
        </div>

        <div className="how-visual">
          <div className="how-orbit orbit-one" />
          <div className="how-orbit orbit-two" />
          <div className="how-center">
            <span>✳</span>
            <p>{hi ? "एक पल" : "One moment"}</p>
            <p>{hi ? "एक समय में।" : "at a time."}</p>
          </div>
          <span className="orbit-label orbit-label-one">{hi ? "साँस लें" : "Breathe"}</span>
          <span className="orbit-label orbit-label-two">{hi ? "विचार करें" : "Reflect"}</span>
          <span className="orbit-label orbit-label-three">{hi ? "खुद से जुड़ें" : "Reconnect"}</span>
        </div>
      </section>


      <section className="landing-difference">
        <span className="section-eyebrow">{hi ? "सुकून का एक अलग अनुभव" : "A DIFFERENT KIND OF WELLBEING SPACE"}</span>
        <h2>{hi ? "असल ज़िंदगी के लिए।" : "Made for real life."}<br /><em>{hi ? "परिपूर्ण दिनों के लिए नहीं।" : "Not perfect days."}</em></h2>
        <div className="difference-points">
          <p><span>✓</span>{hi ? "किसी तरह महसूस करने का दबाव नहीं" : "No pressure to feel a certain way"}</p>
          <p><span>✓</span>{hi ? "अपनी गति से छोटे कदम" : "Small steps, at your own pace"}</p>
          <p><span>✓</span>{hi ? "हर तरह के दिन के लिए जगह" : "Space for every kind of day"}</p>
        </div>
        <p className="difference-footnote">{hi ? "माइंडोरा आपको बदलने के लिए नहीं, बल्कि खुद को बेहतर समझने की जगह देने के लिए है।" : "Mindora isn't about fixing who you are. It's about making a little more room to understand yourself."}</p>
      </section>

      <section className="landing-cta">
        <span className="section-eyebrow">{hi ? "यह आपके लिए एक याद है" : "THIS IS YOUR REMINDER"}</span>
        <h2>{hi ? "आप सुकून के एक पल के हक़दार हैं।" : "You deserve a moment of peace."}</h2>
        <p>{hi ? "एक छोटे कदम से शुरुआत करें। बाकी धीरे-धीरे होगा।" : "Start with one small step. Let the rest unfold."}</p>
        <a href="/signup" className="landing-cta-button">{hi ? "अपनी यात्रा शुरू करें" : "Start your journey"}<span>↗</span>
        </a>
      </section>

      <footer className="landing-footer">
        <a className="landing-brand footer-brand" href="#home">
          <span className="brand-symbol">〰</span>
          <span>Mindora</span>
        </a>

        <p>{hi ? "थोड़ा और सजग। थोड़ा और आप।" : "A little more mindful. A little more you."}</p>

        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#about">{hi ? "हमारे बारे में" : "About"}</a>
          <a href="#why-mindora">Why Mindora</a>
          <a href="/login">{hi ? "लॉग इन" : "Log in"}</a>
        </div>

        <span className="footer-copyright">
          © {new Date().getFullYear()} Mindora
        </span>
      </footer>
    </main>
  );
}