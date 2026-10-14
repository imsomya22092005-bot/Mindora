
import "./LandingPage.css";

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
  return (
    <main className="mindora-landing">
      <header className="landing-navbar">
        <a className="landing-brand" href="#home" aria-label="Mindora home">
          <span className="brand-symbol">〰</span>
          <span>Mindora</span>
        </a>

        <nav className="landing-nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </nav>

        <div className="landing-auth">
          <a className="landing-login" href="/login">
            Log in
          </a>
          <a className="landing-signup" href="/signup">
            Get started <span>↗</span>
          </a>
        </div>
      </header>

      <section className="landing-hero" id="home">
        <div className="hero-image" />

        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-eyebrow">
            YOUR SPACE. YOUR PACE.
          </span>

          <h1>
            Find calm.
            <br />
            Restore balance.
            <br />
            <span>Feel like yourself again.</span>
          </h1>

          <p>
            A little space to understand your emotions, express your
            thoughts, and reconnect with yourself — one day at a time.
          </p>

          <div className="hero-actions">
            <a href="/signup" className="hero-primary-button">
              Begin your journey <span>↗</span>
            </a>

            <a href="#how-it-works" className="hero-secondary-button">
              Discover Mindora <span>→</span>
            </a>
          </div>

          <div className="hero-note">
            <span className="hero-note-icon">✳</span>
            No pressure. No perfect days. Just you.
          </div>
        </div>

        <div className="hero-floating-card">
          <span className="floating-card-label">
            A MOMENT FOR YOU
          </span>
          <div className="floating-card-icon">☀</div>
          <p>Take a breath.</p>
          <span className="floating-card-subtitle">
            You can begin again, anytime.
          </span>
        </div>

        <div className="hero-image-caption">
          MAKE SPACE FOR YOURSELF
        </div>
      </section>

      <section className="landing-intro" id="about">
        <span className="section-eyebrow">A GENTLER WAY FORWARD</span>
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

      <section className="landing-features" id="features">
        <div className="features-heading">
          <div>
            <span className="section-eyebrow">YOUR DAILY RITUALS</span>
            <h2>Small steps. Meaningful moments.</h2>
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
                Explore <span>↗</span>
              </a>
            </article>
          ))}
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
          <a href="/login">Log in</a>
        </div>

        <span className="footer-copyright">
          © {new Date().getFullYear()} Mindora
        </span>
      </footer>
    </main>
  );
}