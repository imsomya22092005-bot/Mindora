import { useEffect, useRef, useState } from "react";
import { apiRequest } from "./api";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, ArrowRight, Mail, UserRound, X, ShieldCheck } from "lucide-react";
import "./AuthPage.css";
import { useLanguage } from "./language";

export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useLanguage();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mindora-theme") === "dark");
  const hi = language === "hi";
  useEffect(() => { localStorage.setItem("mindora-theme", darkMode ? "dark" : "light"); }, [darkMode]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const googleButtonRef = useRef(null);

  async function handleGoogleCredential(response) {
    setError("");
    setSuccess("");
    if (!response?.credential) {
      setError("Google did not return a credential. Please try again.");
      return;
    }
    setBusy(true);
    try {
      const result = await apiRequest("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken: response.credential }),
      });
      localStorage.setItem("mindora-token", result.token);
      localStorage.setItem("mindora-user", JSON.stringify(result.user));
      setSuccess("Signed in with Google. Opening your space…");
      window.setTimeout(() => navigate(location.state?.from || "/dashboard"), 450);
    } catch (requestError) {
      setError(requestError.message || "Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleButtonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: isRegister ? "signup_with" : "signin_with",
        shape: "rectangular",
        width: Math.min(420, googleButtonRef.current.clientWidth || 320),
        logo_alignment: "left",
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const onLoad = () => renderGoogleButton();
    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", onLoad);
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", onLoad);
    }
    return () => script?.removeEventListener("load", onLoad);
  }, [isRegister]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) { setError("Please enter your email address."); return; }
    if (isRegister && !name.trim()) { setError("Please enter your name."); return; }
    setBusy(true);
    try {
      if (!otpSent) {
        await apiRequest("/api/auth/otp/send", {
          method: "POST",
          body: JSON.stringify({ email: normalizedEmail }),
        });
        setOtpSent(true);
        setSuccess("Verification code sent. Check your email and enter the OTP below.");
      } else {
        if (!/^\d{4,8}$/.test(otp.trim())) {
          setError("Enter the verification code from your email.");
          return;
        }
        const result = await apiRequest("/api/auth/otp/verify", {
          method: "POST",
          body: JSON.stringify({ email: normalizedEmail, otp: otp.trim(), name: name.trim() || undefined }),
        });
        localStorage.setItem("mindora-token", result.token);
        localStorage.setItem("mindora-user", JSON.stringify(result.user));
        setSuccess("Verified successfully. Opening your space…");
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
    setSuccess("");
    setBusy(true);
    try {
      const result = await apiRequest("/api/auth/guest", { method: "POST", body: JSON.stringify({}) });
      localStorage.setItem("mindora-token", result.token);
      localStorage.setItem("mindora-user", JSON.stringify(result.user));
      setSuccess("Your guest space is ready. Opening dashboard…");
      window.setTimeout(() => navigate("/dashboard"), 450);
    } catch (requestError) {
      setError(requestError.message || "Guest login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`auth-page ${darkMode ? "auth-dark" : ""}`}>
      <section className="auth-visual">
        <Link className="auth-brand" to="/" aria-label="Mindora home">
          <span className="auth-brand-mark"><img src="/favicon.svg" alt="" /></span>
          <span>mindora</span>
        </Link>
        <div className="auth-visual-copy">
          <span className="auth-eyebrow"><Heart size={14} /> {hi ? "आपके लिए एक छोटी-सी जगह" : "A LITTLE SPACE FOR YOU"}</span>
          <h1>{hi ? "आप हमेशा" : "You can always"}<br /><em>{hi ? "नई शुरुआत कर सकते हैं।" : "begin again."}</em></h1>
          <p>{hi ? "खुद का हाल जानने, भावनाएँ समझने और हर पल को सहजता से जीने की एक जगह।" : "A softer place to check in with yourself, make sense of your feelings, and take things one moment at a time."}</p>
          <div className="auth-quote">
            <span>“</span>
            <p>{hi ? "आज सब कुछ समझ लेना ज़रूरी नहीं है।" : "You don't have to have it all figured out today."}</p>
            <small>{hi ? "माइंडोरा की एक प्यारी याद" : "A gentle reminder from Mindora"}</small>
          </div>
        </div>
        <div className="auth-orbit auth-orbit-one" />
        <div className="auth-orbit auth-orbit-two" />
        <div className="auth-visual-footer"><span>✳</span> {hi ? "आपकी गति। आपकी जगह। आपकी यात्रा।" : "Your pace. Your space. Your journey."}</div>
      </section>

      <section className="auth-form-side"><div className="auth-preference-controls"><select aria-label="Language" value={language} onChange={event => {setLanguage(event.target.value);localStorage.setItem("mindora-language",event.target.value);}}><option value="en">English</option><option value="hi">हिन्दी</option></select><button type="button" onClick={()=>setDarkMode(v=>!v)} aria-label="Toggle theme">{darkMode?"☀":"☾"}</button></div>
        <Link to="/" className="auth-close-home" aria-label="Skip login and return to landing page" title="Back to landing page"><X size={20} /></Link>
        <Link className="auth-mobile-brand" to="/"><img src="/favicon.svg" alt="" /> mindora</Link>
        <div className="auth-form-wrap">
          <h2>{isRegister ? (hi ? "अपनी जगह बनाएँ" : "Create your space") : (hi ? "वापसी पर स्वागत है" : "Welcome back")}</h2>
          <p className="auth-subtitle">{isRegister ? (hi ? "हर दिन खुद के लिए थोड़ी जगह बनाएँ।" : "Make a little room for yourself, every day.") : (hi ? "एक गहरी साँस लें। आपकी जगह यहीं है।" : "Take a breath. Your space is right here.")}</p>

          <div className="auth-tabs" role="tablist" aria-label="Account options">
            <Link role="tab" aria-selected={!isRegister} className={!isRegister ? "active" : ""} to="/login">{hi ? "लॉग इन" : "Log in"}</Link>
            <Link role="tab" aria-selected={isRegister} className={isRegister ? "active" : ""} to="/signup">{hi ? "खाता बनाएँ" : "Create account"}</Link>
          </div>

          <div className="auth-google-area">
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div ref={googleButtonRef} className="auth-google-button" aria-label={isRegister ? (hi ? "Google से साइन अप करें" : "Sign up with Google") : (hi ? "Google से लॉग इन करें" : "Sign in with Google")} />
            ) : (
              <button className="auth-google-fallback" type="button" onClick={() => setError("Google sign-in is not configured for this deployment yet.")}>
                <span className="auth-google-g" aria-hidden="true">G</span>
                {isRegister ? (hi ? "Google से साइन अप करें" : "Sign up with Google") : (hi ? "Google से लॉग इन करें" : "Sign in with Google")}
              </button>
            )}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="auth-field">
                <span>{hi ? "आपका नाम" : "Your name"}</span>
                <div className="auth-input-wrap"><UserRound size={17} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={hi ? "हम आपको किस नाम से बुलाएँ?" : "How should we call you?"} required /></div>
              </label>
            )}
            <label className="auth-field">
              <span>{hi ? "ईमेल पता" : "Email address"}</span>
              <div className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
            </label>
            {error && <p className="auth-message auth-error" role="alert">{error}</p>}
            {success && <p className="auth-message auth-success" role="status">{success}</p>}
            {otpSent && <label className="auth-field">
              <span>{hi ? "ईमेल सत्यापन कोड" : "Email verification code"}</span>
              <div className="auth-input-wrap"><ShieldCheck size={17} /><input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Enter OTP from your email" required /></div>
            </label>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? (hi ? "कृपया प्रतीक्षा करें…" : "Please wait…") : otpSent ? (hi ? "सत्यापित करें और आगे बढ़ें" : "Verify & continue") : (hi ? "सत्यापन कोड भेजें" : "Send verification code")} <ArrowRight size={17} /></button>
            {otpSent && <button className="auth-google-fallback" type="button" disabled={busy} onClick={() => { setOtpSent(false); setOtp(""); setSuccess(""); }}>{hi ? "ईमेल बदलें / कोड दोबारा भेजें" : "Change email / resend code"}</button>}
            <button className="auth-google-fallback" type="button" disabled={busy} onClick={handleGuestLogin}>{hi ? "अतिथि के रूप में आगे बढ़ें" : "Continue as guest"}</button>
          </form>

          <p className="auth-switch">{isRegister ? (hi ? "पहले से खाता है?" : "Already have an account?") : (hi ? "Mindora पर नए हैं?" : "New to Mindora?")} <Link to={isRegister ? "/login" : "/signup"}>{isRegister ? (hi ? "लॉग इन" : "Log in") : (hi ? "खाता बनाएँ" : "Create an account")}</Link></p>
          <p className="auth-privacy"><Heart size={13} /> {hi ? "आपका सुकून ज़रूरी है। हर दिन एक कदम आगे बढ़ें।" : "Your wellbeing matters. Take it one day at a time."}</p>
        </div>
        <Link to="/" className="auth-back-home">{hi ? "← माइंडोरा के होम पेज पर वापस जाएँ" : "← Back to Mindora home"}</Link>
      </section>
    </main>
  );
}
