import { useState } from "react";
import { apiRequest } from "./api";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, ArrowRight, Mail, UserRound, X, ShieldCheck } from "lucide-react";
import "./AuthPage.css";

export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (isRegister && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setBusy(true);
    try {
      if (!otpSent) {
        const result = await apiRequest("/api/auth/otp/send", {
          method: "POST",
          body: JSON.stringify({ email: normalizedEmail }),
        });
        setOtpSent(true);
        setSuccess(result.message || "Verification code sent. Check your inbox.");
      } else {
        if (!/^\d{6}$/.test(otp.trim())) {
          setError("Enter the 6-digit verification code from your email.");
          return;
        }
        const result = await apiRequest("/api/auth/otp/verify", {
          method: "POST",
          body: JSON.stringify({ email: normalizedEmail, otp: otp.trim(), name: name.trim() }),
        });
        localStorage.setItem("mindora-token", result.token);
        localStorage.setItem("mindora-user", JSON.stringify(result.user));
        setSuccess("You're verified. Opening your space…");
        window.setTimeout(() => navigate(location.state?.from || "/dashboard"), 450);
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to Mindora. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGuestLogin() {
    setError("");
    setBusy(true);
    try {
      const result = await apiRequest("/api/auth/guest", {
        method: "POST",
        body: JSON.stringify({}),
      });
      localStorage.setItem("mindora-token", result.token);
      localStorage.setItem("mindora-user", JSON.stringify(result.user));
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message || "Guest access is unavailable right now.");
    } finally {
      setBusy(false);
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
            {isRegister && !otpSent && (
              <label className="auth-field">
                <span>Your name</span>
                <div className="auth-input-wrap"><UserRound size={17} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we call you?" required /></div>
              </label>
            )}
            <label className="auth-field">
              <span>Email address</span>
              <div className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required disabled={otpSent} /></div>
            </label>
            {otpSent && (
              <label className="auth-field">
                <span>6-digit verification code</span>
                <div className="auth-input-wrap"><ShieldCheck size={17} /><input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\\D/g, "").slice(0, 6))} placeholder="Enter code from your email" required maxLength={6} /></div>
              </label>
            )}
            {error && <p className="auth-message auth-error" role="alert">{error}</p>}
            {success && <p className="auth-message auth-success" role="status">{success}</p>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : otpSent ? "Verify and continue" : "Email me a verification code"} <ArrowRight size={17} /></button>
            {otpSent && <button className="auth-back-home" type="button" onClick={() => { setOtpSent(false); setOtp(""); setError(""); setSuccess(""); }}>Use a different email</button>}
          </form>
          <button className="auth-submit auth-guest-button" type="button" onClick={handleGuestLogin} disabled={busy}>Continue as a guest <ArrowRight size={17} /></button>>

          <p className="auth-switch">{isRegister ? "Already have an account?" : "New to Mindora?"} <Link to={isRegister ? "/login" : "/signup"}>{isRegister ? "Log in" : "Create an account"}</Link></p>
          <p className="auth-privacy"><Heart size={13} /> Your wellbeing matters. Take it one day at a time.</p>
        </div>
        <Link to="/" className="auth-back-home">← Back to Mindora home</Link>
      </section>
    </main>
  );
}
