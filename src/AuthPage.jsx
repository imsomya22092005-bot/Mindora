import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Leaf, ArrowRight, Eye, EyeOff, Mail, Lock, UserRound, X } from "lucide-react";
import "./AuthPage.css";

export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (isRegister && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem("mindora-demo-users") || "[]");
      if (isRegister) {
        if (users.some((user) => user.email === normalizedEmail)) {
          setError("An account with this email already exists. Please log in.");
          return;
        }
        users.push({ name: name.trim(), email: normalizedEmail, password });
        localStorage.setItem("mindora-demo-users", JSON.stringify(users));
        localStorage.setItem("mindora-user", JSON.stringify({ name: name.trim(), email: normalizedEmail }));
        setSuccess("Your account is ready. Opening your space…");
      } else {
        const user = users.find((item) => item.email === normalizedEmail && item.password === password);
        if (!user) {
          setError("We couldn't find a matching account. Check your details or create an account.");
          return;
        }
        localStorage.setItem("mindora-user", JSON.stringify({ name: user.name, email: user.email }));
        setSuccess("Welcome back. Opening your space…");
      }
      window.setTimeout(() => navigate(location.state?.from || "/dashboard"), 450);
    } catch {
      setError("Your browser couldn't save this demo account. Please check your browser storage settings.");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link className="auth-brand" to="/" aria-label="Mindora home">
          <span className="auth-brand-mark"><img src="/favicon.svg" alt="" /></span>
          <span>mindora</span>
        </Link>
        <div className="auth-visual-copy">
          <span className="auth-eyebrow"><Heart size={14} /> A LITTLE SPACE FOR YOU</span>
          <h1>You can always<br /><em>begin again.</em></h1>
          <p>A softer place to check in with yourself, make sense of your feelings, and take things one moment at a time.</p>
          <div className="auth-quote">
            <span>“</span>
            <p>You don't have to have it all figured out today.</p>
            <small>A gentle reminder from Mindora</small>
          </div>
        </div>
        <div className="auth-orbit auth-orbit-one" />
        <div className="auth-orbit auth-orbit-two" />
        <div className="auth-visual-footer"><span>✳</span> Your pace. Your space. Your journey.</div>
      </section>

      <section className="auth-form-side">
        <Link to="/" className="auth-close-home" aria-label="Skip login and return to landing page" title="Back to landing page"><X size={20} /></Link>
        <Link className="auth-mobile-brand" to="/"><img src="/favicon.svg" alt="" /> mindora</Link>
        <div className="auth-form-wrap">
          <h2>{isRegister ? "Create your space" : "Welcome back"}</h2>
          <p className="auth-subtitle">{isRegister ? "Make a little room for yourself, every day." : "Take a breath. Your space is right here."}</p>

          <div className="auth-tabs" role="tablist" aria-label="Account options">
            <Link role="tab" aria-selected={!isRegister} className={!isRegister ? "active" : ""} to="/login">Log in</Link>
            <Link role="tab" aria-selected={isRegister} className={isRegister ? "active" : ""} to="/signup">Create account</Link>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="auth-field">
                <span>Your name</span>
                <div className="auth-input-wrap"><UserRound size={17} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we call you?" required /></div>
              </label>
            )}
            <label className="auth-field">
              <span>Email address</span>
              <div className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
            </label>
            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap"><Lock size={17} /><input type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} required /><button className="auth-show-password" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
            </label>
            {isRegister && (
              <label className="auth-field">
                <span>Confirm password</span>
                <div className="auth-input-wrap"><Lock size={17} /><input type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" required /></div>
              </label>
            )}
            {error && <p className="auth-message auth-error" role="alert">{error}</p>}
            {success && <p className="auth-message auth-success" role="status">{success}</p>}
            <button className="auth-submit" type="submit">{isRegister ? "Create my account" : "Log in to Mindora"} <ArrowRight size={17} /></button>
          </form>

          <p className="auth-switch">{isRegister ? "Already have an account?" : "New to Mindora?"} <Link to={isRegister ? "/login" : "/signup"}>{isRegister ? "Log in" : "Create an account"}</Link></p>
          <p className="auth-privacy"><Heart size={13} /> Your wellbeing matters. Take it one day at a time.</p>
        </div>
        <Link to="/" className="auth-back-home">← Back to Mindora home</Link>
      </section>
    </main>
  );
}
