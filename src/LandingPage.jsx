
import { useEffect, useState } from "react";
import "./LandingPage.css";

const features = [
  {
    number: "01",
    icon: "♡",
    title: hi ? "अपने मूड को समझें" : "Understand your mood",
    description:
      "Check in with yourself and make space for every emotion.",
  },
  {
    number: "02",
    icon: "✎",
    title: hi ? "लिखकर मन हल्का करें" : "Write it out",
    description:
      "Put your thoughts into words with your personal journal.",
  },
  {
    number: "03",
    icon: "◎",
    title: hi ? "अपना सुकून पाएँ" : "Find your calm",
    description:
      "Take a mindful pause with simple guided breathing exercises.",
  },
];

export default function LandingPage() {
  const [language, setLanguage] = useState(() => localStorage.getItem("mindora-language") || "en");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mindora-theme") === "dark");
  const hi = language === "hi";
  useEffect(() => { localStorage.setItem("mindora-theme", darkMode ? "dark" : "light"); }, [darkMode]);
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
          <a href="/dashboard">Home</a>
          <a href="#why-mindora">Why Mindora</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#preview">Preview</a>
        </nav>

        <div className="landing-auth">
          <div className="landing-preference-controls"><select aria-label="Language" value={language} onChange={event => { setLanguage(event.target.value); localStorage.setItem("mindora-language", event.target.value); }}><option value="en">English</option><option value="hi">हिन्दी</option></select><button type="button" className="landing-theme-toggle" onClick={() => setDarkMode(value => !value)} aria-label="Toggle theme">{darkMode ? "☀" : "☾"}</button></div>
          <a className="landing-login" href="/login">
            Log in
          </a>
          <a className="landing-signup" href="/signup">
            {hi ? "शुरू करें" : "Get started"} <span>↗</span>
          </a>
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
            A little space to understand your emotions, express your
            thoughts, and reconnect with yourself — one day at a time.
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
        <h2>
          Your wellbeing isn't a destination.
          <br />
          <span>It's a journey worth taking.</span>
        </h2>
        <p>
          Mindora gives you simple tools to pause, reflect, and build
          a more mindful relationship with yourself.
        </p>
      </section>


      <section className="landing-why" id="why-mindora">
        <div className="landing-why-heading">
          <span className="section-eyebrow">{hi ? "एक ऐसी जगह जो आपको समझे" : "A SPACE THAT MEETS YOU WHERE YOU ARE"}</span>
          <h2>Not another thing to keep up with.<br /><em>A little support, when you need it.</em></h2>
          <p>Some days feel clear. Others feel like a lot. Mindora gives you gentle, practical ways to check in with yourself — without pressure to have it all figured out.</p>
        </div>
        <div className="landing-why-grid">
          <article><span className="why-number">01 / PAUSE</span><span className="why-symbol">◌</span><h3>Make room to breathe</h3><p>Step away from the noise and take a moment that belongs just to you.</p></article>
          <article><span className="why-number">02 / UNDERSTAND</span><span className="why-symbol">↗</span><h3>Put feelings into words</h3><p>Notice what you're feeling and reflect on it, without judging yourself.</p></article>
          <article><span className="why-number">03 / GROW</span><span className="why-symbol">✳</span><h3>Build your own rhythm</h3><p>Find small rituals that fit real life — not a perfect version of it.</p></article>
        </div>
      </section>

      <section className="landing-features" id="features">
        <div className="features-heading">
          <div>
            <span className="section-eyebrow">{hi ? "आपके रोज़ के छोटे कदम" : "YOUR DAILY RITUALS"}</span>
            <h2>{hi ? "छोटे कदम। मायने भरे पल।" : "Small steps. Meaningful moments."}</h2>
          </div>
          <p>Make a little room for yourself every day.</p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article className="landing-feature-card" key={feature.number}>
              <div className="feature-card-top">
                <span className="feature-icon">{feature.icon}</span>
                <span className="feature-number">{feature.number}</span>
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
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
          <p>From a quick mood check-in to a page in your journal, Mindora keeps your everyday wellbeing tools in one calm, welcoming place.</p>
          <a href="/signup" className="landing-dark-button">{hi ? "अपनी जगह देखें" : "Explore your space"} <span>↗</span></a>
        </div>
        <div className="preview-window" aria-label="Illustrative preview of the Mindora experience">
          <div className="preview-window-top"><span className="preview-dots"><i></i><i></i><i></i></span><span>your mindful space</span><span>✳</span></div>
          <div className="preview-welcome"><span>YOUR PERSONAL SPACE</span><h3>Hello, there.</h3><p>How are you feeling today?</p></div>
          <div className="preview-moods"><span>☁<small>Low</small></span><span>☾<small>Meh</small></span><span>◡<small>Okay</small></span><span>☀<small>Good</small></span><span>✳<small>Great</small></span></div>
          <div className="preview-lower">
            <div><span className="preview-mini-icon">✎</span><b>Your journal</b><small>A page just for your thoughts</small></div>
            <div><span className="preview-mini-icon">❋</span><b>Take a pause</b><small>A softer moment, whenever</small></div>
          </div>
          <span className="preview-note">A gentle reminder: you can start again.</span>
        </div>
      </section>

      <section className="landing-how" id="how-it-works">
        <div className="how-copy">
          <span className="section-eyebrow">START WHERE YOU ARE</span>
          <h2>
            You don't have to
            <br />
            figure it all out
            <br />
            <span>today.</span>
          </h2>
          <p>
            Check in with your mood, write down what's on your mind,
            or take a breathing break. Choose what feels right for you.
          </p>
          <a href="/signup" className="landing-dark-button">
            Get started with Mindora <span>↗</span>
          </a>
        </div>

        <div className="how-visual">
          <div className="how-orbit orbit-one" />
          <div className="how-orbit orbit-two" />
          <div className="how-center">
            <span>✳</span>
            <p>One moment</p>
            <p>at a time.</p>
          </div>
          <span className="orbit-label orbit-label-one">Breathe</span>
          <span className="orbit-label orbit-label-two">Reflect</span>
          <span className="orbit-label orbit-label-three">Reconnect</span>
        </div>
      </section>


      <section className="landing-difference">
        <span className="section-eyebrow">A DIFFERENT KIND OF WELLBEING SPACE</span>
        <h2>Made for real life.<br /><em>Not perfect days.</em></h2>
        <div className="difference-points">
          <p><span>✓</span> No pressure to feel a certain way</p>
          <p><span>✓</span> Small steps, at your own pace</p>
          <p><span>✓</span> Space for every kind of day</p>
        </div>
        <p className="difference-footnote">Mindora isn't about fixing who you are. It's about making a little more room to understand yourself.</p>
      </section>

      <section className="landing-cta">
        <span className="section-eyebrow">THIS IS YOUR REMINDER</span>
        <h2>You deserve a moment of peace.</h2>
        <p>Start with one small step. Let the rest unfold.</p>
        <a href="/signup" className="landing-cta-button">
          Start your journey <span>↗</span>
        </a>
      </section>

      <footer className="landing-footer">
        <a className="landing-brand footer-brand" href="#home">
          <span className="brand-symbol">〰</span>
          <span>Mindora</span>
        </a>

        <p>A little more mindful. A little more you.</p>

        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
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